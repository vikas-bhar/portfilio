import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest, authenticate, getSession, saveDraft } from './admin-api';
import { defaultContent } from '../data/portfolio';

afterEach(() => {
  vi.unstubAllGlobals();
});
describe('same-origin admin API client', () => {
  it('rejects a static SPA HTML response rather than pretending the backend is configured', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<!doctype html><title>Static app</title>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
      ),
    );
    await expect(getSession()).rejects.toMatchObject({ status: 503 });
  });
  it.each([null, [], 'not an object', 42])(
    'rejects invalid JSON response shape %j',
    async (data) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(data))));
      await expect(getSession()).rejects.toMatchObject({ status: 503 });
    },
  );
  it('preserves server conflicts and validation paths for recovery', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: 'Changed in another tab.',
            issues: [{ path: 'profile.email', message: 'Invalid email.' }],
          }),
          { status: 409 },
        ),
      ),
    );
    try {
      await apiRequest('/api/admin/draft');
      throw new Error('Expected API failure');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        status: 409,
        issues: [{ path: 'profile.email', message: 'Invalid email.' }],
      });
    }
  });
  it('keeps the password in a POST body and uses same-origin credentials without caching', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          authenticated: true,
          setupRequired: false,
          storage: 'local',
          csrfToken: 'test-csrf',
        }),
      ),
    );
    vi.stubGlobal('fetch', fetcher);
    await authenticate('test-only password', 'test-only-setup-key');
    const [url, request] = fetcher.mock.calls[0]!;
    expect(url).toBe('/api/admin/setup');
    expect(url).not.toContain('password');
    expect(request).toMatchObject({
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      body: JSON.stringify({ password: 'test-only password' }),
    });
    expect(request.headers['X-Setup-Key']).toBe('test-only-setup-key');
  });
  it('sends the server-issued CSRF token and optimistic revisions when saving', async () => {
    const fetcher = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            authenticated: true,
            setupRequired: false,
            storage: 'local',
            csrfToken: 'session-csrf',
          }),
        ),
      ),
    );
    vi.stubGlobal('fetch', fetcher);
    await getSession();
    await saveDraft(defaultContent, 'published-one', 'draft-two');
    const [url, request] = fetcher.mock.calls[1]!;
    expect(url).toBe('/api/admin/draft');
    expect(request.headers['X-CSRF-Token']).toBe('session-csrf');
    expect(request.headers['X-Requested-With']).toBe('portfolio-admin');
    expect(JSON.parse(request.body)).toMatchObject({
      baseRevision: 'published-one',
      expectedRevision: 'draft-two',
    });
  });
});

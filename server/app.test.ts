import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { servePage } from './page';
import { startContentServer } from './app';
import { StorageError, type Store } from './store';
import { defaultContent } from '../src/data/portfolio';

// Runtime-page tests must also run in a clean checkout, before dist/ is built.
// Only the built template is substituted; HTTP routing and storage reads are real.
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...actual,
    readFile: (...args: Parameters<typeof actual.readFile>) =>
      String(args[0]).endsWith('/dist/index.html')
        ? Promise.resolve(
            '<!doctype html><html data-theme="dark"><head><title>Portfolio</title><meta name="description" content=""><link rel="canonical" href=""></head><body><div id="root"></div></body></html>',
          )
        : actual.readFile(...args),
  };
});

const running: Awaited<ReturnType<typeof startContentServer>>[] = [];
afterEach(async () => {
  await Promise.all(running.splice(0).map((app) => app.close()));
  vi.restoreAllMocks();
});
async function start(storage: Store) {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const app = await startContentServer({ port: 0, production: true, store: storage });
  running.push(app);
  const address = app.server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test listener.');
  return `http://127.0.0.1:${address.port}`;
}
function store(mode: Store['mode'] = 'vercel-blob', unavailable = false): Store {
  return {
    mode,
    async read<T>() {
      if (unavailable) throw new StorageError();
      return null as { value: T; etag: string } | null;
    },
    async write() {
      throw new Error('Page checks must not write content.');
    },
  };
}

describe('complete production HTTP host', () => {
  it('fails public content closed during a configured-storage outage while keeping admin recovery reachable', async () => {
    const base = await start(store('vercel-blob', true));
    const publicPage = await fetch(base + '/');
    expect(publicPage.status).toBe(503);
    expect(publicPage.headers.get('cache-control')).toContain('no-store');
    expect(await publicPage.text()).not.toContain(defaultContent.profile.name);
    expect((await fetch(base + '/api/site')).status).toBe(503);
    expect((await fetch(base + '/api/admin/session')).status).toBe(503);
    const admin = await fetch(base + '/admin');
    expect(admin.status).toBe(200);
    expect(await admin.text()).toContain('noindex, nofollow');
    expect(console.warn).toHaveBeenCalledWith(
      'Content storage is unavailable. The admin recovery screen remains reachable.',
    );
  });
  it('keeps factory content readable when production shared storage has never been configured', async () => {
    const base = await start(store('unconfigured', true));
    const response = await fetch(base + '/');
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(defaultContent.profile.name);
    expect(await (await fetch(base + '/api/admin/session')).json()).toMatchObject({
      authenticated: false,
      storage: 'unconfigured',
    });
  });
  it('rejects private and encoded dot paths without serving a setup key or SPA fallback', async () => {
    const base = await start(store());
    for (const path of [
      '/.portfolio-data/setup-key',
      '/%2eportfolio-data/setup-key',
      '/.git/config',
      '/.env',
      '/assets/%ZZ',
    ]) {
      const response = await fetch(base + path);
      expect(response.status, path).toBe(path.endsWith('%ZZ') ? 400 : 404);
      expect(await response.text()).not.toContain('portfolio-content');
    }
  });
  it('redirects the static index and legacy résumé URLs to the live runtime', async () => {
    const base = await start(store());
    for (const [path, destination] of [
      ['/index.html', '/'],
      ['/resume/Vikas_Bhardwaj_Resume.html', '/api/resume/html'],
      ['/Vikas_Bhardwaj_Resume.txt', '/api/resume/text'],
    ]) {
      const response = await fetch(base + path, { redirect: 'manual' });
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(destination);
    }
  });
  it('does not classify public tracking parameters as an admin or draft route', async () => {
    const base = await start(store());
    for (const path of ['/', '/?campaign=admin', '/?admin=1', '/?campaign=preview=draft']) {
      const response = await fetch(base + path);
      expect(response.status).toBe(200);
      expect(await response.text(), path).not.toContain('name="robots"');
    }
    for (const path of ['/admin', '/admin/projects', '/?preview=draft']) {
      const response = await fetch(base + path);
      expect(response.status).toBe(200);
      expect(await response.text(), path).toContain('noindex, nofollow');
    }
  });
  it('keeps the internal Vercel admin rewrite reachable without reading unavailable storage', async () => {
    const response = { setHeader: vi.fn(), end: vi.fn(), statusCode: 200 };
    await servePage(
      { url: '/api/page?admin=1' } as IncomingMessage,
      response as unknown as ServerResponse,
      store('vercel-blob', true),
    );
    expect(response.statusCode).toBe(200);
    expect(response.end).toHaveBeenCalledWith(expect.stringContaining('noindex, nofollow'));
  });
});

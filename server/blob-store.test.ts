import { afterEach, describe, expect, it, vi } from 'vitest';
const sdk = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock('@vercel/blob', () => ({
  get: sdk.get,
  put: sdk.put,
  BlobPreconditionFailedError: class extends Error {},
}));
import { BlobStore, ConflictError, createStore } from './store';
import { BlobPreconditionFailedError } from '@vercel/blob';

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});
describe('private shared Blob adapter contract', () => {
  it('reads uncached PRIVATE content with its ETag', async () => {
    sdk.get.mockResolvedValue({
      statusCode: 200,
      stream: new Blob([JSON.stringify({ revision: 'one' })]).stream(),
      blob: { size: 18, etag: 'origin-etag' },
    });
    const store = new BlobStore('test-token-not-a-real-secret', 'isolated/v1');
    expect(await store.read('published')).toEqual({
      value: { revision: 'one' },
      etag: 'origin-etag',
    });
    expect(sdk.get).toHaveBeenCalledWith('isolated/v1/published.json', {
      access: 'private',
      token: 'test-token-not-a-real-secret',
      useCache: false,
    });
  });
  it('does not overwrite first creation and uses ifMatch on subsequent writes', async () => {
    sdk.put.mockResolvedValue({});
    const store = new BlobStore('test-token-not-a-real-secret', 'isolated/v1');
    await store.write('draft', { revision: 'one' }, null);
    expect(sdk.put.mock.calls[0]![2]).toMatchObject({
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: false,
    });
    await store.write('draft', { revision: 'two' }, 'old-etag');
    expect(sdk.put.mock.calls[1]![2]).toMatchObject({
      access: 'private',
      allowOverwrite: true,
      ifMatch: 'old-etag',
    });
  });
  it('turns a storage precondition failure into a recoverable conflict', async () => {
    sdk.put.mockRejectedValueOnce(new BlobPreconditionFailedError());
    const store = new BlobStore('test-token-not-a-real-secret');
    await expect(store.write('published', {}, 'old-etag')).rejects.toBeInstanceOf(ConflictError);
  });
  it('separates production and preview namespaces by default', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'test-token-not-a-real-secret');
    vi.stubEnv('PORTFOLIO_BLOB_PREFIX', '');
    vi.stubEnv('VERCEL_ENV', 'preview');
    sdk.get.mockResolvedValue(null);
    await createStore().read('published');
    expect(sdk.get.mock.calls[0]![0]).toBe('portfolio-cms/preview/v1/published.json');
    vi.stubEnv('VERCEL_ENV', 'production');
    await createStore().read('published');
    expect(sdk.get.mock.calls[1]![0]).toBe('portfolio-cms/production/v1/published.json');
  });
});

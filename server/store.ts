import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename, unlink, stat } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';
import { get, put, BlobPreconditionFailedError } from '@vercel/blob';

export type StoreKey = 'published' | 'draft' | 'auth' | 'limits';
export interface StoredValue<T> {
  value: T;
  etag: string;
}
export interface Store {
  mode: 'local' | 'vercel-blob' | 'unconfigured';
  read<T>(key: StoreKey): Promise<StoredValue<T> | null>;
  write<T>(key: StoreKey, value: T, expectedEtag: string | null): Promise<void>;
}
export class ConflictError extends Error {
  constructor() {
    super('This content changed in another session. Reload the latest version before saving.');
    this.name = 'ConflictError';
  }
}
export class StorageError extends Error {
  constructor(message = 'Content storage is unavailable. No changes were published.') {
    super(message);
    this.name = 'StorageError';
  }
}

/** Owner files never live in public/ or dist/. Writes are locked, private, and atomic. */
export class FileStore implements Store {
  readonly mode = 'local' as const;
  readonly directory: string;
  constructor(directory = process.env.PORTFOLIO_DATA_DIR || '.portfolio-data') {
    this.directory = resolve(directory);
    const unsafe = [resolve('public'), resolve('dist'), resolve('.git')];
    if (
      this.directory === resolve('.') ||
      unsafe.some((path) => this.directory === path || this.directory.startsWith(path + sep))
    )
      throw new StorageError(
        'Choose a private data directory, not the repository root itself or a path inside public/, dist/, or .git/.',
      );
  }
  async read<T>(key: StoreKey): Promise<StoredValue<T> | null> {
    try {
      const raw = await readFile(join(this.directory, `${key}.json`), 'utf8');
      return { value: JSON.parse(raw) as T, etag: createHash('sha256').update(raw).digest('hex') };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw new StorageError();
    }
  }
  async write<T>(key: StoreKey, value: T, expectedEtag: string | null) {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const lockPath = join(this.directory, '.write-lock');
    let lock;
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        lock = await open(lockPath, 'wx', 0o600);
        break;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw new StorageError();
        const age = await stat(lockPath)
          .then((value) => Date.now() - value.mtimeMs)
          .catch(() => 0);
        if (age > 30_000) await unlink(lockPath).catch(() => undefined);
        await new Promise((done) => setTimeout(done, 25));
      }
    }
    if (!lock) throw new StorageError('The content store is busy. Please try again shortly.');
    const temporary = join(this.directory, `.${key}-${randomUUID()}.tmp`);
    try {
      const current = await this.read(key);
      if ((current?.etag ?? null) !== expectedEtag) throw new ConflictError();
      const file = await open(temporary, 'wx', 0o600);
      try {
        await file.writeFile(JSON.stringify(value));
        await file.sync();
      } finally {
        await file.close();
      }
      await rename(temporary, join(this.directory, `${key}.json`));
    } finally {
      await unlink(temporary).catch(() => undefined);
      await lock.close();
      await unlink(lockPath).catch(() => undefined);
    }
  }
}

/** All four records, including auth and drafts, must use a PRIVATE Blob store. */
export class BlobStore implements Store {
  readonly mode = 'vercel-blob' as const;
  constructor(
    private token: string,
    private prefix = 'portfolio-cms/v1',
  ) {}
  async read<T>(key: StoreKey): Promise<StoredValue<T> | null> {
    const result = await get(`${this.prefix}/${key}.json`, {
      access: 'private',
      token: this.token,
      useCache: false,
    });
    if (!result) return null;
    if (result.statusCode !== 200 || result.blob.size > 524_288) throw new StorageError();
    return {
      value: JSON.parse(await new Response(result.stream).text()) as T,
      etag: result.blob.etag,
    };
  }
  async write<T>(key: StoreKey, value: T, expectedEtag: string | null) {
    try {
      await put(`${this.prefix}/${key}.json`, JSON.stringify(value), {
        token: this.token,
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: expectedEtag !== null,
        ...(expectedEtag ? { ifMatch: expectedEtag } : {}),
        contentType: 'application/json',
        cacheControlMaxAge: 60,
      });
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError) throw new ConflictError();
      // A conditional first-create must never silently overwrite another setup/publish.
      if (expectedEtag === null && (await this.read(key).catch(() => null)))
        throw new ConflictError();
      throw new StorageError();
    }
  }
}

export function createStore(): Store {
  if (process.env.BLOB_READ_WRITE_TOKEN)
    return new BlobStore(
      process.env.BLOB_READ_WRITE_TOKEN,
      process.env.PORTFOLIO_BLOB_PREFIX ||
        `portfolio-cms/${process.env.VERCEL_ENV || 'development'}/v1`,
    );
  if (!process.env.VERCEL) return new FileStore();
  return {
    mode: 'unconfigured',
    async read() {
      throw new StorageError(
        'Attach a private Vercel Blob store before enabling admin publishing.',
      );
    },
    async write() {
      throw new StorageError('Shared content storage has not been configured.');
    },
  };
}

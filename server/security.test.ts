import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultContent } from '../src/data/portfolio';
import {
  issueSession,
  readSession,
  hashPassword,
  verifyPassword,
  consumeAttempt,
  randomSecret,
} from './auth';
import { renderMetadata } from './page';
import { FileStore, ConflictError, createStore } from './store';

const directories: string[] = [];
afterEach(async () => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});
async function temporary() {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-store-'));
  directories.push(directory);
  return directory;
}

describe('private storage and authentication primitives', () => {
  it('writes atomically with private permissions and prevents lost updates across instances', async () => {
    const directory = await temporary();
    const first = new FileStore(directory);
    const second = new FileStore(directory);
    await first.write('published', { revision: 'one' }, null);
    const saved = await first.read('published');
    expect(saved).not.toBeNull();
    const results = await Promise.allSettled([
      first.write('published', { revision: 'two' }, saved!.etag),
      second.write('published', { revision: 'three' }, saved!.etag),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected');
    expect(rejected?.status === 'rejected' && rejected.reason).toBeInstanceOf(ConflictError);
    expect((await stat(join(directory, 'published.json'))).mode & 0o777).toBe(0o600);
  });
  it('refuses a local data directory that would publish or corrupt private records', () => {
    for (const directory of ['public/cms', 'dist/cms', '.git/cms', '.'])
      expect(() => new FileStore(directory)).toThrow('private data directory');
  });
  it('produces independently salted, verifiable password hashes', async () => {
    const password = 'a unique ephemeral test password';
    const first = await hashPassword(password);
    const second = await hashPassword(password);
    expect(first).not.toBe(second);
    expect(await verifyPassword(password, first)).toBe(true);
    expect(await verifyPassword('not the password', first)).toBe(false);
  });
  it('expires sessions and detects signature changes', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-11T10:00:00Z'));
    const headers: Record<string, string> = {};
    const req = { headers: {}, socket: {} } as IncomingMessage;
    const res = {
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
    } as unknown as ServerResponse;
    const auth = {
      passwordHash: 'not-used-here',
      sessionSecret: randomSecret(),
      createdAt: new Date().toISOString(),
    };
    issueSession(res, req, auth);
    req.headers.cookie = headers['Set-Cookie']!.split(';')[0];
    expect(readSession(req, auth)).not.toBeNull();
    expect(readSession(req, { ...auth, sessionSecret: randomSecret() })).toBeNull();
    vi.setSystemTime(new Date('2026-11-11T18:01:00Z'));
    expect(readSession(req, auth)).toBeNull();
  });
  it('uses shared time-bounded rate limits, not process-local counters', async () => {
    const directory = await temporary();
    const req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } } as IncomingMessage;
    const first = new FileStore(directory);
    const second = new FileStore(directory);
    expect(await consumeAttempt(first, req, 'test', 2)).toBe(true);
    expect(await consumeAttempt(second, req, 'test', 2)).toBe(true);
    expect(await consumeAttempt(first, req, 'test', 2)).toBe(false);
  });
  it('does not choose filesystem storage on Vercel without a Blob token', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    expect(createStore().mode).toBe('unconfigured');
  });
});

describe('server-rendered published metadata', () => {
  it('updates metadata before JavaScript and safely bootstraps escaped JSON', async () => {
    const template = await readFile('index.html', 'utf8');
    const content = structuredClone(defaultContent);
    content.profile.name = 'Builder $& </script><script>alert(1)</script>';
    content.profile.headline = content.profile.name + ' — Product engineer';
    content.settings.metaDescription = 'A "safe" description <test>';
    content.profile.website = 'https://published-portfolio.example';
    content.settings.defaultTheme = 'light';
    const html = renderMetadata(template, content);
    expect(html).toContain('Builder $&amp; &lt;/script&gt;');
    expect(html).not.toContain('</script><script>alert(1)</script>');
    expect(html).toContain('content="A &quot;safe&quot; description &lt;test&gt;"');
    expect(html).toContain('rel="canonical" href="https://published-portfolio.example/"');
    expect(html).toContain('property="og:url" content="https://published-portfolio.example/"');
    expect(html).toContain('data-theme="light"');
    const json = html.match(
      /<script id="portfolio-content" type="application\/json">(.*?)<\/script>/,
    )![1]!;
    expect(JSON.parse(json).profile.name).toBe(content.profile.name);
    expect(json).not.toContain('<');
    expect(renderMetadata(template, content, true)).toContain(
      'name="robots" content="noindex, nofollow"',
    );
  });
  it('exports a Node-compatible API handler without a development-only dependency', async () => {
    const { createApiHandler } = await import('./api');
    const handler = createApiHandler(new FileStore(await temporary()), { setupKey: () => '' });
    const server = createServer(handler);
    expect(typeof server.listen).toBe('function');
    server.close();
  });
});

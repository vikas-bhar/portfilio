import { createServer, type Server } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApiHandler } from './api';
import { FileStore, StorageError, type Store } from './store';
import { defaultContent } from '../src/data/portfolio';
import type { ContentRecord, DraftRecord, AdminSession } from '../src/lib/site-schema';
import type { AuthRecord } from './auth';

const setupKey = 'test-only-ephemeral-owner-bootstrap-key-2026';
const password = 'test-only unique owner passphrase';
let directory: string;
let store: FileStore;
let server: Server;
let base: string;
let cookie: string;
let csrfToken: string;
async function start(storage: Store = store) {
  server = createServer(
    (req, res) => void createApiHandler(storage, { setupKey: () => setupKey })(req, res),
  );
  await new Promise<void>((done) => server.listen(0, '0.0.0.0', done));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server failed.');
  base = `http://127.0.0.1:${address.port}`;
}
async function request(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    authenticated?: boolean;
    rawBody?: string;
  } = {},
) {
  const method = options.method ?? 'GET';
  return fetch(`${base}${path}`, {
    method,
    headers: {
      ...(method === 'GET'
        ? {}
        : {
            'Content-Type': 'application/json',
            'X-Requested-With': 'portfolio-admin',
            Origin: base,
          }),
      ...(options.authenticated ? { Cookie: cookie, 'X-CSRF-Token': csrfToken } : {}),
      ...options.headers,
    },
    ...(options.body === undefined && options.rawBody === undefined
      ? {}
      : { body: options.rawBody ?? JSON.stringify(options.body) }),
  });
}
async function setup() {
  const result = await request('/api/admin/setup', {
    method: 'POST',
    body: { password },
    headers: { 'X-Setup-Key': setupKey },
  });
  expect(result.status).toBe(200);
  cookie = result.headers.get('set-cookie')!.split(';')[0]!;
  const session = (await result.json()) as AdminSession;
  csrfToken = session.csrfToken!;
  return result;
}
async function close() {
  if (server?.listening) await new Promise<void>((done) => server.close(() => done()));
}
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'portfolio-cms-'));
  store = new FileStore(directory);
  cookie = '';
  csrfToken = '';
  await start();
});
afterEach(async () => {
  await close();
  await rm(directory, { recursive: true, force: true });
});

describe('owner authentication and isolation', () => {
  it('serves published factory content without exposing drafts or auth', async () => {
    const response = await request('/api/site');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    const data = (await response.json()) as ContentRecord;
    expect(data.revision).toBe('initial');
    expect(data.content.projects).toHaveLength(11);
    expect(JSON.stringify(data)).not.toMatch(/passwordHash|sessionSecret|csrfToken/);
    expect((await request('/api/admin/content')).status).toBe(401);
    expect((await request('/api/admin/draft')).status).toBe(401);
  });
  it('requires the private setup key and enforces password length', async () => {
    expect((await request('/api/admin/setup', { method: 'POST', body: { password } })).status).toBe(
      403,
    );
    expect(
      (
        await request('/api/admin/setup', {
          method: 'POST',
          body: { password: 'short' },
          headers: { 'X-Setup-Key': setupKey },
        })
      ).status,
    ).toBe(400);
    expect(await store.read('auth')).toBeNull();
  });
  it('sets HttpOnly, SameSite cookies, stores only a salted hash, and disables setup reuse', async () => {
    const response = await setup();
    expect(response.headers.get('set-cookie')).toMatch(/Path=\/api;.*HttpOnly; SameSite=Strict/);
    const auth = (await store.read<AuthRecord>('auth'))!.value;
    expect(auth.passwordHash).toMatch(/^scrypt-v1:/);
    expect(auth.passwordHash).not.toContain(password);
    expect(await readFile(join(directory, 'auth.json'), 'utf8')).not.toContain(password);
    expect(
      (
        await request('/api/admin/setup', {
          method: 'POST',
          body: { password },
          headers: { 'X-Setup-Key': setupKey },
        })
      ).status,
    ).toBe(409);
    const session = (await (
      await request('/api/admin/session', { authenticated: true })
    ).json()) as AdminSession;
    expect(session.authenticated).toBe(true);
    expect(session.csrfToken).toBe(csrfToken);
  });
  it('sets Secure cookies for the HTTPS preview/deployment proxy', async () => {
    const response = await request('/api/admin/setup', {
      method: 'POST',
      body: { password },
      headers: { 'X-Setup-Key': setupKey, 'X-Forwarded-Proto': 'https' },
    });
    expect(response.headers.get('set-cookie')).toContain('; Secure');
  });
  it('does not accept a modified session cookie', async () => {
    await setup();
    cookie += 'tampered';
    const response = await request('/api/admin/content', { authenticated: true });
    expect(response.status).toBe(401);
  });
  it('checks password server-side and rate-limits attempts durably', async () => {
    await setup();
    for (let i = 0; i < 6; i++)
      expect(
        (
          await request('/api/admin/login', {
            method: 'POST',
            body: { password: 'incorrect passphrase' },
          })
        ).status,
      ).toBe(401);
    await close();
    await start(new FileStore(directory));
    expect((await request('/api/admin/login', { method: 'POST', body: { password } })).status).toBe(
      429,
    );
  });
  it('rejects cross-origin changes, missing CSRF, and requests without the admin header', async () => {
    await setup();
    const body = { content: defaultContent, baseRevision: 'initial', expectedRevision: 'initial' };
    expect(
      (
        await request('/api/admin/draft', {
          method: 'PUT',
          body,
          authenticated: true,
          headers: { Origin: 'https://attacker.example' },
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await request('/api/admin/draft', {
          method: 'PUT',
          body,
          authenticated: true,
          headers: { 'X-CSRF-Token': '' },
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await request('/api/admin/draft', {
          method: 'PUT',
          body,
          authenticated: true,
          headers: { 'X-Requested-With': '' },
        })
      ).status,
    ).toBe(403);
    expect(await store.read('draft')).toBeNull();
  });
  it('revokes server-side sessions when signing out, including a copied old cookie', async () => {
    await setup();
    expect(
      (await request('/api/admin/logout', { method: 'POST', authenticated: true })).status,
    ).toBe(200);
    expect((await request('/api/admin/content', { authenticated: true })).status).toBe(401);
    expect((await request('/api/admin/draft', { authenticated: true })).status).toBe(401);
  });
  it('changes passwords only after re-verification and invalidates previous sessions', async () => {
    await setup();
    expect(
      (
        await request('/api/admin/password', {
          method: 'POST',
          authenticated: true,
          body: { currentPassword: 'wrong', newPassword: 'a different unique test passphrase' },
        })
      ).status,
    ).toBe(401);
    const response = await request('/api/admin/password', {
      method: 'POST',
      authenticated: true,
      body: { currentPassword: password, newPassword: 'a different unique test passphrase' },
    });
    expect(response.status).toBe(200);
    expect((await request('/api/admin/content', { authenticated: true })).status).toBe(401);
    expect((await request('/api/admin/login', { method: 'POST', body: { password } })).status).toBe(
      401,
    );
    expect(
      (
        await request('/api/admin/login', {
          method: 'POST',
          body: { password: 'a different unique test passphrase' },
        })
      ).status,
    ).toBe(200);
  });
});

describe('public AI reading resources', () => {
  it.each([
    ['/api/llms', 'text/plain'],
    ['/api/llms/full', 'text/plain'],
    ['/api/llms/markdown', 'text/markdown'],
  ])('serves %s anonymously as current UTF-8 text with GET and HEAD', async (path, type) => {
    const response = await request(path!);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(`${type}; charset=utf-8`);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('content-disposition')).toBe('inline');
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('access-control-allow-credentials')).toBeNull();
    expect(response.headers.get('link')).toContain('</llms.txt>; rel="describedby"');
    expect(response.headers.get('set-cookie')).toBeNull();
    const body = await response.text();
    expect(body).toMatch(/^# Vikas Bhardwaj\n/);
    expect(body).not.toMatch(/passwordHash|sessionSecret|csrfToken|setup-key|portfolio-content/);
    const head = await request(path!, { method: 'HEAD' });
    expect(head.status).toBe(200);
    expect(head.headers.get('content-type')).toBe(`${type}; charset=utf-8`);
    expect(Number(head.headers.get('content-length'))).toBe(Buffer.byteLength(body, 'utf8'));
    expect(await head.text()).toBe('');
    const write = await request(path!, { method: 'POST', body: {} });
    expect(write.status).toBe(405);
    expect(write.headers.get('allow')).toBe('GET, HEAD');
    expect(await store.read('published')).toBeNull();
    const admin = await request('/api/admin/draft');
    expect(admin.status).toBe(401);
    expect(admin.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('does not export a draft even for an authenticated owner with preview parameters, then follows publishing', async () => {
    await setup();
    const content = structuredClone(defaultContent);
    content.profile.name = 'New Published Builder';
    content.profile.heroSummary = 'An unpublished marker before deliberate publication.';
    content.projects[0]!.visible = false;
    content.sections.find((section) => section.id === 'experience')!.visible = false;
    const saved = await request('/api/admin/draft', {
      method: 'PUT',
      authenticated: true,
      body: { content, baseRevision: 'initial', expectedRevision: 'initial' },
    });
    expect(saved.status).toBe(200);
    for (const path of ['/api/llms', '/api/llms/full', '/api/llms/markdown']) {
      for (const authenticated of [false, true]) {
        const response = await request(`${path}?preview=draft&admin=1`, { authenticated });
        expect(response.status).toBe(200);
        const body = await response.text();
        expect(body).toMatch(/^# Vikas Bhardwaj\n/);
        expect(body).not.toContain('New Published Builder');
        expect(body).not.toContain('An unpublished marker');
      }
    }
    const result = await request('/api/admin/publish', {
      method: 'POST',
      authenticated: true,
      body: { content, expectedRevision: 'initial' },
    });
    expect(result.status).toBe(200);
    const full = await (await request('/api/llms/full')).text();
    expect(full).toMatch(/^# New Published Builder\n/);
    expect(full).toContain(content.profile.heroSummary);
    expect(full).toContain('10 visible projects; 3 featured.');
    expect(full).not.toContain('### Kisan Sathi');
    expect(full).not.toContain('## Experience and milestones');
    expect(full).not.toContain('https://kisan-saathi-indol.vercel.app');
    expect(full).not.toMatch(/passwordHash|sessionSecret|csrfToken|baseRevision/);
  });

  it('keeps AI text available without résumé links when the owner disables résumé downloads', async () => {
    await setup();
    const content = structuredClone(defaultContent);
    content.settings.resumeEnabled = false;
    await request('/api/admin/publish', {
      method: 'POST',
      authenticated: true,
      body: { content, expectedRevision: 'initial' },
    });
    expect((await request('/api/resume/text')).status).toBe(404);
    for (const path of ['/api/llms', '/api/llms/full']) {
      const response = await request(path);
      expect(response.status).toBe(200);
      expect(await response.text()).not.toContain('/api/resume/');
    }
  });

  it('never derives document links from an untrusted Host or forwarded host', async () => {
    const response = await request('/api/llms/full', {
      headers: { Host: 'injected.example', 'X-Forwarded-Host': 'forwarded.example' },
    });
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain(defaultContent.profile.website);
    expect(body).toContain('](/llms-full.txt)');
    expect(body).not.toContain('injected.example');
    expect(body).not.toContain('forwarded.example');
    expect(response.headers.get('link')).not.toContain('.example');
  });

  it('fails with plain-text 503 on configured-storage errors rather than exporting stale factory content', async () => {
    await close();
    await start({
      mode: 'vercel-blob',
      async read() {
        throw new StorageError();
      },
      async write() {
        throw new Error('AI resources must never write.');
      },
    });
    for (const path of ['/api/llms', '/api/llms/full', '/api/llms/markdown']) {
      const response = await request(path);
      expect(response.status).toBe(503);
      expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
      expect(response.headers.get('cache-control')).toContain('no-store');
      expect(await response.text()).toBe(
        'Published portfolio text is temporarily unavailable. Please try again shortly.\n',
      );
    }
  });
});

describe('shared draft / preview / publish workflow', () => {
  it('persists private drafts without changing the public site, then publishes to all readers', async () => {
    await setup();
    const content = structuredClone(defaultContent);
    content.profile.name = 'Published Builder';
    content.projects[4]!.visible = false;
    const saved = await request('/api/admin/draft', {
      method: 'PUT',
      body: { content, baseRevision: 'initial', expectedRevision: 'initial' },
      authenticated: true,
    });
    expect(saved.status).toBe(200);
    const draft = (await saved.json()) as DraftRecord;
    expect(draft.revision).not.toBe('initial');
    expect(draft.content.profile.name).toBe('Published Builder');
    expect(
      ((await (await request('/api/site')).json()) as ContentRecord).content.profile.name,
    ).toBe('Vikas Bhardwaj');
    expect((await request('/api/admin/draft')).status).toBe(401);
    const preview = (await (
      await request('/api/admin/draft', { authenticated: true })
    ).json()) as DraftRecord;
    expect(preview.content.profile.name).toBe('Published Builder');
    const publishedResponse = await request('/api/admin/publish', {
      method: 'POST',
      body: { content, expectedRevision: 'initial' },
      authenticated: true,
    });
    expect(publishedResponse.status).toBe(200);
    const published = (await publishedResponse.json()) as ContentRecord;
    expect(published.content.profile.headline).toContain('Published Builder —');
    await close();
    await start(new FileStore(directory));
    const publicRecord = (await (await request('/api/site')).json()) as ContentRecord;
    expect(publicRecord.revision).toBe(published.revision);
    expect(publicRecord.content.profile.name).toBe('Published Builder');
  });
  it('detects outdated draft and publish revisions instead of overwriting another tab', async () => {
    await setup();
    const data = { content: defaultContent, baseRevision: 'initial', expectedRevision: 'initial' };
    expect(
      (await request('/api/admin/draft', { method: 'PUT', authenticated: true, body: data }))
        .status,
    ).toBe(200);
    expect(
      (await request('/api/admin/draft', { method: 'PUT', authenticated: true, body: data }))
        .status,
    ).toBe(409);
    expect(
      (await request('/api/admin/publish', { method: 'POST', authenticated: true, body: data }))
        .status,
    ).toBe(200);
    expect(
      (await request('/api/admin/publish', { method: 'POST', authenticated: true, body: data }))
        .status,
    ).toBe(409);
  });
  it('allows only one of two concurrent publishes with the same revision', async () => {
    await setup();
    const data = { content: defaultContent, expectedRevision: 'initial' };
    const results = await Promise.all([
      request('/api/admin/publish', { method: 'POST', authenticated: true, body: data }),
      request('/api/admin/publish', { method: 'POST', authenticated: true, body: data }),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([200, 409]);
  });
  it('validates dangerous links and bounds request sizes before saving', async () => {
    await setup();
    const content = structuredClone(defaultContent);
    content.profile.website = 'javascript:alert(1)';
    const bad = await request('/api/admin/draft', {
      method: 'PUT',
      authenticated: true,
      body: { content, baseRevision: 'initial', expectedRevision: 'initial' },
    });
    expect(bad.status).toBe(400);
    const data = (await bad.json()) as { issues: { path: string }[] };
    expect(data.issues.some((issue) => issue.path === 'profile.website')).toBe(true);
    expect(
      (
        await request('/api/admin/draft', {
          method: 'PUT',
          authenticated: true,
          body: { text: 'x'.repeat(262_145) },
        })
      ).status,
    ).toBe(413);
    expect(
      (
        await request('/api/admin/draft', {
          method: 'PUT',
          authenticated: true,
          rawBody: '{broken',
        })
      ).status,
    ).toBe(400);
    expect(await store.read('draft')).toBeNull();
  });
  it('serves published résumé content, authenticated draft exports, and real disabled states', async () => {
    await setup();
    const content = structuredClone(defaultContent);
    content.profile.name = 'Draft Builder';
    await request('/api/admin/draft', {
      method: 'PUT',
      authenticated: true,
      body: { content, baseRevision: 'initial', expectedRevision: 'initial' },
    });
    expect(await (await request('/api/resume/text')).text()).toContain('VIKAS BHARDWAJ');
    expect((await request('/api/resume/html?preview=draft')).status).toBe(401);
    const draftHtml = await (
      await request('/api/resume/html?preview=draft', { authenticated: true })
    ).text();
    expect(draftHtml).toContain('Draft Builder');
    expect(draftHtml).toContain('PRIVATE DRAFT — not published');
    await request('/api/admin/publish', {
      method: 'POST',
      authenticated: true,
      body: { content, expectedRevision: 'initial' },
    });
    expect(await (await request('/api/resume/text')).text()).toContain('DRAFT BUILDER');
    const published = (await (await request('/api/site')).json()) as ContentRecord;
    content.settings.resumeEnabled = false;
    await request('/api/admin/publish', {
      method: 'POST',
      authenticated: true,
      body: { content, expectedRevision: published.revision },
    });
    expect((await request('/api/resume/text')).status).toBe(404);
  });
  it('fails closed when deployed storage is absent and never writes ephemeral production data', async () => {
    await close();
    const unavailable: Store = {
      mode: 'unconfigured',
      async read() {
        throw new StorageError();
      },
      async write() {
        throw new Error('must not write');
      },
    };
    await start(unavailable);
    expect((await request('/api/site')).status).toBe(200);
    const session = (await (await request('/api/admin/session')).json()) as AdminSession;
    expect(session.storage).toBe('unconfigured');
    expect(session.authenticated).toBe(false);
    expect(
      (
        await request('/api/admin/setup', {
          method: 'POST',
          body: { password },
          headers: { 'X-Setup-Key': setupKey },
        })
      ).status,
    ).toBe(503);
  });
});

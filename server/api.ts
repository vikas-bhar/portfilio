import type { IncomingMessage, ServerResponse } from 'node:http';
import { z, ZodError } from 'zod';
import { siteContentSchema, type DraftRecord } from '../src/lib/site-schema';
import { createResumeText, resumeFileStem } from '../src/lib/resume';
import { createResumeHtml } from '../src/lib/resume-html';
import { readPublished, publish, writeDraft } from './content';
import { ConflictError, StorageError, type Store } from './store';
import {
  clearSession,
  consumeAttempt,
  equalSecret,
  hashPassword,
  header,
  issueSession,
  randomSecret,
  readSession,
  verifyPassword,
  type AuthRecord,
} from './auth';

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
interface Options {
  setupKey: () => Promise<string> | string;
  loginLimit?: number;
}
const password = z
  .string()
  .min(14, 'Use at least 14 characters.')
  .max(128, 'Use no more than 128 characters.');
const publishSchema = z.object({
  content: siteContentSchema,
  expectedRevision: z.string().min(1).max(100),
});
const draftSchema = publishSchema.extend({ baseRevision: z.string().min(1).max(100) });

async function readJson(req: IncomingMessage, max = 262_144): Promise<unknown> {
  if (!header(req, 'content-type').toLowerCase().startsWith('application/json'))
    throw new HttpError(415, 'Send JSON content.');
  if (Number(header(req, 'content-length')) > max)
    throw new HttpError(413, 'This request is too large. Keep site content under 256 KB.');
  const existing = (req as IncomingMessage & { body?: unknown }).body;
  if (existing !== undefined) {
    if (Buffer.byteLength(typeof existing === 'string' ? existing : JSON.stringify(existing)) > max)
      throw new HttpError(413, 'This request is too large.');
    try {
      return typeof existing === 'string' ? JSON.parse(existing) : existing;
    } catch {
      throw new HttpError(400, 'Invalid JSON.');
    }
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > max) throw new HttpError(413, 'This request is too large.');
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Invalid JSON.');
  }
}
function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}
function checkWriteOrigin(req: IncomingMessage) {
  if (header(req, 'x-requested-with') !== 'portfolio-admin')
    throw new HttpError(403, 'This action must be made from the admin panel.');
  const origin = header(req, 'origin');
  if (!origin) return;
  const hosts = new Set([header(req, 'host'), header(req, 'x-forwarded-host')].filter(Boolean));
  try {
    if (!hosts.has(new URL(origin).host)) throw new Error();
  } catch {
    throw new HttpError(403, 'Cross-origin changes are not allowed.');
  }
}

export function createApiHandler(store: Store, options: Options) {
  return async function handleApi(req: IncomingMessage, res: ServerResponse) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    try {
      const path = new URL(req.url ?? '/', 'http://internal').pathname.replace(/\/$/, '');
      const method = req.method ?? 'GET';
      if (method === 'GET' && path === '/api/site')
        return json(res, 200, await readPublished(store));
      if (method === 'GET' && (path === '/api/resume/html' || path === '/api/resume/text')) {
        const preview =
          new URL(req.url ?? '/', 'http://internal').searchParams.get('preview') === 'draft';
        let record = await readPublished(store);
        if (preview) {
          const auth = (await store.read<AuthRecord>('auth'))?.value;
          if (!auth || !readSession(req, auth))
            throw new HttpError(401, 'Sign in to view a draft résumé.');
          const draft = await store.read<DraftRecord>('draft');
          if (!draft) throw new HttpError(404, 'Save a draft before previewing the résumé.');
          record = draft.value;
        }
        const { content } = record;
        if (!content.settings.resumeEnabled)
          throw new HttpError(404, 'The résumé is currently disabled.');
        const html = path.endsWith('/html');
        res.setHeader(
          'Content-Type',
          html ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8',
        );
        res.setHeader(
          'Content-Disposition',
          `${html ? 'inline' : 'attachment'}; filename="${resumeFileStem(content.profile.name)}.${html ? 'html' : 'txt'}"`,
        );
        return res.end(html ? createResumeHtml(content, preview) : createResumeText(content));
      }
      if (!path.startsWith('/api/admin/')) throw new HttpError(404, 'Endpoint not found.');
      if (method === 'GET' && path === '/api/admin/session' && store.mode === 'unconfigured')
        return json(res, 200, { authenticated: false, setupRequired: true, storage: store.mode });
      if (store.mode === 'unconfigured')
        throw new StorageError('Attach a PRIVATE Vercel Blob store before enabling publishing.');
      const storedAuth = await store.read<AuthRecord>('auth');
      const auth = storedAuth?.value;
      const session = auth ? readSession(req, auth) : null;
      if (method === 'GET' && path === '/api/admin/session')
        return json(res, 200, {
          authenticated: Boolean(session),
          setupRequired: !auth,
          storage: store.mode,
          ...(session ?? {}),
        });
      if (!['GET', 'POST', 'PUT'].includes(method)) {
        res.setHeader('Allow', 'GET, POST, PUT');
        throw new HttpError(405, 'Method not allowed.');
      }
      if (method !== 'GET') checkWriteOrigin(req);

      if (method === 'POST' && (path === '/api/admin/setup' || path === '/api/admin/login')) {
        const { password: submitted } = z
          .object({ password: z.string().min(1).max(128) })
          .parse(await readJson(req, 4096));
        if (
          !(await consumeAttempt(
            store,
            req,
            path.endsWith('/setup') ? 'setup' : 'login',
            options.loginLimit,
          ))
        )
          throw new HttpError(
            429,
            'Too many attempts. Please wait 15 minutes before trying again.',
          );
        if (path.endsWith('/setup')) {
          if (auth) throw new HttpError(409, 'Admin is already configured. Sign in instead.');
          const key = await options.setupKey();
          if (key.length < 32 || !equalSecret(header(req, 'x-setup-key'), key))
            throw new HttpError(
              403,
              'Use the private, one-time setup link supplied by the server owner.',
            );
          password.parse(submitted);
          const created: AuthRecord = {
            passwordHash: await hashPassword(submitted),
            sessionSecret: randomSecret(),
            createdAt: new Date().toISOString(),
          };
          await store.write('auth', created, null);
          return json(res, 200, {
            authenticated: true,
            setupRequired: false,
            storage: store.mode,
            ...issueSession(res, req, created),
          });
        }
        if (!auth || !(await verifyPassword(submitted, auth.passwordHash)))
          throw new HttpError(401, 'Incorrect password.');
        return json(res, 200, {
          authenticated: true,
          setupRequired: false,
          storage: store.mode,
          ...issueSession(res, req, auth),
        });
      }
      if (!auth || !session || !storedAuth)
        throw new HttpError(401, 'Your admin session has expired. Sign in again before saving.');
      if (method !== 'GET' && !equalSecret(header(req, 'x-csrf-token'), session.csrfToken))
        throw new HttpError(403, 'Security token missing or expired. Refresh your admin session.');
      if (method === 'GET' && path === '/api/admin/content')
        return json(res, 200, {
          published: await readPublished(store),
          draft: (await store.read<DraftRecord>('draft'))?.value ?? null,
        });
      if (method === 'GET' && path === '/api/admin/draft') {
        const draft = await store.read<DraftRecord>('draft');
        if (!draft)
          throw new HttpError(404, 'Save a draft in the admin panel before opening its preview.');
        return json(res, 200, draft.value);
      }
      if (method === 'PUT' && path === '/api/admin/draft') {
        const data = draftSchema.parse(await readJson(req));
        return json(
          res,
          200,
          await writeDraft(store, data.content, data.baseRevision, data.expectedRevision),
        );
      }
      if (method === 'POST' && path === '/api/admin/publish') {
        const data = publishSchema.parse(await readJson(req));
        return json(res, 200, await publish(store, data.content, data.expectedRevision));
      }
      if (method === 'POST' && path === '/api/admin/password') {
        const data = z
          .object({ currentPassword: z.string().min(1).max(128), newPassword: password })
          .parse(await readJson(req, 4096));
        if (!(await consumeAttempt(store, req, 'password', options.loginLimit)))
          throw new HttpError(429, 'Too many password attempts. Try again in 15 minutes.');
        if (!(await verifyPassword(data.currentPassword, auth.passwordHash)))
          throw new HttpError(401, 'The current password is incorrect.');
        await store.write(
          'auth',
          {
            ...auth,
            passwordHash: await hashPassword(data.newPassword),
            sessionSecret: randomSecret(),
          },
          storedAuth.etag,
        );
        clearSession(res, req);
        return json(res, 200, { ok: true });
      }
      if (method === 'POST' && path === '/api/admin/logout') {
        // Single-owner admin: rotating the server secret revokes existing cookies,
        // rather than pretending a deleted browser cookie revokes stolen sessions.
        await store.write('auth', { ...auth, sessionSecret: randomSecret() }, storedAuth.etag);
        clearSession(res, req);
        return json(res, 200, { ok: true });
      }
      throw new HttpError(404, 'Endpoint not found.');
    } catch (error) {
      if (res.writableEnded) return;
      if (error instanceof ZodError)
        return json(res, 400, {
          error: 'Please correct the highlighted content before saving.',
          issues: error.issues.slice(0, 30).map((issue) => ({
            path: (issue.path[0] === 'content' ? issue.path.slice(1) : issue.path).join('.'),
            message: issue.message,
          })),
        });
      if (error instanceof HttpError) return json(res, error.status, { error: error.message });
      if (error instanceof ConflictError) return json(res, 409, { error: error.message });
      if (error instanceof StorageError) return json(res, 503, { error: error.message });
      console.error('CMS request failed:', error instanceof Error ? error.name : 'unknown error');
      return json(res, 503, {
        error: 'The content service is unavailable. No changes were published.',
      });
    }
  };
}

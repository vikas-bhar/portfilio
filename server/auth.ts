import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Store } from './store';
import { ConflictError, StorageError } from './store';

export interface AuthRecord {
  passwordHash: string;
  sessionSecret: string;
  createdAt: string;
}
interface SessionPayload {
  expiresAt: number;
  csrfToken: string;
}
export const SESSION_SECONDS = 8 * 60 * 60;
const COOKIE = 'portfolio_admin';
export const randomSecret = () => randomBytes(32).toString('base64url');
export function equalSecret(a: string, b: string) {
  return timingSafeEqual(
    createHash('sha256').update(a).digest(),
    createHash('sha256').update(b).digest(),
  );
}
export function header(req: IncomingMessage, name: string) {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((done, reject) =>
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : done(key),
    ),
  );
}
export async function hashPassword(password: string) {
  const salt = randomSecret();
  return `scrypt-v1:${salt}:${(await derive(password, salt)).toString('base64url')}`;
}
export async function verifyPassword(password: string, encoded: string) {
  const [version, salt, digest] = encoded.split(':');
  if (version !== 'scrypt-v1' || !salt || !digest) return false;
  return equalSecret((await derive(password, salt)).toString('base64url'), digest);
}
export function issueSession(
  res: ServerResponse,
  req: IncomingMessage,
  auth: AuthRecord,
): SessionPayload {
  const payload = { expiresAt: Date.now() + SESSION_SECONDS * 1000, csrfToken: randomSecret() };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', auth.sessionSecret).update(data).digest('base64url');
  setCookie(res, req, `${data}.${signature}`, SESSION_SECONDS);
  return payload;
}
function setCookie(res: ServerResponse, req: IncomingMessage, token: string, maxAge: number) {
  const secure = Boolean(
    process.env.VERCEL ||
    header(req, 'x-forwarded-proto') === 'https' ||
    ('encrypted' in req.socket && req.socket.encrypted),
  );
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; Path=/api; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`,
  );
}
export function clearSession(res: ServerResponse, req: IncomingMessage) {
  setCookie(res, req, '', 0);
}
export function readSession(req: IncomingMessage, auth: AuthRecord): SessionPayload | null {
  const cookie = header(req, 'cookie')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!cookie || cookie.length > 2048) return null;
  const [data, signature, extra] = cookie.split('.');
  if (!data || !signature || extra) return null;
  const expected = createHmac('sha256', auth.sessionSecret).update(data).digest('base64url');
  if (!equalSecret(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload;
    if (
      typeof payload.expiresAt !== 'number' ||
      payload.expiresAt <= Date.now() ||
      payload.expiresAt > Date.now() + SESSION_SECONDS * 1000 ||
      typeof payload.csrfToken !== 'string' ||
      payload.csrfToken.length < 32
    )
      return null;
    return payload;
  } catch {
    return null;
  }
}

/** Durable shared counters, not a per-serverless-instance memory-only limiter. */
export async function consumeAttempt(
  store: Store,
  req: IncomingMessage,
  action: string,
  limit = 6,
) {
  const now = Date.now();
  const ip =
    header(req, 'x-forwarded-for').split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const id = `${action}:${createHash('sha256').update(ip).digest('hex').slice(0, 24)}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const entry = await store.read<{ entries: Record<string, { count: number; resetAt: number }> }>(
      'limits',
    );
    const entries = Object.fromEntries(
      Object.entries(entry?.value.entries ?? {}).filter(([, bucket]) => bucket.resetAt > now),
    );
    const keys = [id, `${action}:global`];
    if (keys.some((key, index) => (entries[key]?.count ?? 0) >= limit * (index ? 10 : 1)))
      return false;
    for (const key of keys)
      entries[key] = {
        count: (entries[key]?.count ?? 0) + 1,
        resetAt: entries[key]?.resetAt ?? now + 15 * 60_000,
      };
    try {
      await store.write('limits', { entries }, entry?.etag ?? null);
      return true;
    } catch (error) {
      if (!(error instanceof ConflictError)) throw new StorageError();
    }
  }
  return false;
}

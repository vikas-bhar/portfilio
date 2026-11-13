import type { AdminSession, ContentRecord, DraftRecord, SiteContent } from './site-schema';

let csrfToken = '';
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public issues: { path: string; message: string }[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; setupKey?: string } = {},
): Promise<T> {
  const method = options.method ?? 'GET';
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(method === 'GET'
        ? {}
        : { 'X-Requested-With': 'portfolio-admin', 'X-CSRF-Token': csrfToken }),
      ...(options.setupKey ? { 'X-Setup-Key': options.setupKey } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });
  const data = await response.json().catch(() => {
    throw new ApiError(
      'The content server is not available. Run npm run dev or check your deployment’s API routes; a static file server cannot provide admin publishing.',
      503,
    );
  });
  if (!data || typeof data !== 'object' || Array.isArray(data))
    throw new ApiError('The content server returned an invalid response.', 503);
  if (!response.ok)
    throw new ApiError(
      data.error ?? 'The request could not be completed.',
      response.status,
      data.issues ?? [],
    );
  return data as T;
}
export async function getSession() {
  const result = await apiRequest<AdminSession>('/api/admin/session');
  csrfToken = result.csrfToken ?? '';
  return result;
}
export async function authenticate(password: string, setupKey?: string) {
  const result = await apiRequest<AdminSession>(
    setupKey ? '/api/admin/setup' : '/api/admin/login',
    { method: 'POST', body: { password }, setupKey },
  );
  csrfToken = result.csrfToken ?? '';
  return result;
}
export async function signOut() {
  await apiRequest('/api/admin/logout', { method: 'POST' });
  csrfToken = '';
}
export function loadEditor() {
  return apiRequest<{ published: ContentRecord; draft: DraftRecord | null }>('/api/admin/content');
}
export function saveDraft(
  content: SiteContent,
  baseRevision: string,
  expectedDraftRevision: string,
) {
  return apiRequest<DraftRecord>('/api/admin/draft', {
    method: 'PUT',
    body: { content, baseRevision, expectedRevision: expectedDraftRevision },
  });
}
export function publishContent(content: SiteContent, expectedRevision: string) {
  return apiRequest<ContentRecord>('/api/admin/publish', {
    method: 'POST',
    body: { content, expectedRevision },
  });
}
export function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest('/api/admin/password', {
    method: 'POST',
    body: { currentPassword, newPassword },
  });
}

import { randomUUID } from 'node:crypto';
import { defaultContent } from '../src/data/portfolio';
import {
  siteContentSchema,
  type ContentRecord,
  type DraftRecord,
  type SiteContent,
} from '../src/lib/site-schema';
import { ConflictError, type Store } from './store';

export const initialRecord = (): ContentRecord => ({
  revision: 'initial',
  updatedAt: null,
  content: structuredClone(defaultContent),
});
export async function readPublished(store: Store): Promise<ContentRecord> {
  if (store.mode === 'unconfigured') return initialRecord();
  const stored = await store.read<ContentRecord>('published');
  return stored
    ? { ...stored.value, content: siteContentSchema.parse(stored.value.content) }
    : initialRecord();
}
export async function publish(store: Store, content: SiteContent, expectedRevision: string) {
  const stored = await store.read<ContentRecord>('published');
  if ((stored?.value.revision ?? 'initial') !== expectedRevision) throw new ConflictError();
  const record: ContentRecord = {
    revision: randomUUID(),
    updatedAt: new Date().toISOString(),
    content,
  };
  await store.write('published', record, stored?.etag ?? null);
  return record;
}
export async function writeDraft(
  store: Store,
  content: SiteContent,
  baseRevision: string,
  expectedRevision: string,
) {
  const stored = await store.read<DraftRecord>('draft');
  if ((stored?.value.revision ?? 'initial') !== expectedRevision) throw new ConflictError();
  const draft: DraftRecord = {
    revision: randomUUID(),
    updatedAt: new Date().toISOString(),
    baseRevision,
    content,
  };
  await store.write('draft', draft, stored?.etag ?? null);
  return draft;
}

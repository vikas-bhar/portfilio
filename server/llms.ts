import type { IncomingMessage, ServerResponse } from 'node:http';
import { createLlmsFull, createLlmsIndex, llmsPaths } from '../src/lib/llms';
import { readPublished } from './content';
import type { Store } from './store';

export type LlmsFormat = keyof typeof llmsPaths;
const routes = new Map<string, LlmsFormat>([
  [llmsPaths.index, 'index'],
  [llmsPaths.full, 'full'],
  [llmsPaths.markdown, 'markdown'],
  ['/api/llms', 'index'],
  ['/api/llms/full', 'full'],
  ['/api/llms/markdown', 'markdown'],
]);
export const llmsFormatForPath = (path: string) => routes.get(path.replace(/\/$/, ''));
export const llmsDiscoveryLinks =
  '</llms.txt>; rel="describedby"; type="text/plain", </index.md>; rel="alternate"; type="text/markdown"';

/** GET/HEAD only. A preview query or admin cookie can never select draft content. */
export async function serveLlms(
  req: IncomingMessage,
  res: ServerResponse,
  store: Store,
  format: LlmsFormat,
) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Link', llmsDiscoveryLinks);
  // Only these public reading resources allow anonymous browser-based readers.
  // Admin/API credentials and CORS policies are not changed.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Link');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Method not allowed. Use GET or HEAD.\n');
  }
  try {
    const { content } = await readPublished(store);
    const body = format === 'index' ? createLlmsIndex(content) : createLlmsFull(content);
    res.statusCode = 200;
    res.setHeader(
      'Content-Type',
      format === 'markdown' ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8',
    );
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'));
    return res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    // Never resurrect stale factory text when a configured store cannot be read.
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end(
      req.method === 'HEAD'
        ? undefined
        : 'Published portfolio text is temporarily unavailable. Please try again shortly.\n',
    );
  }
}

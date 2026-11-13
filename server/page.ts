import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { SiteContent } from '../src/lib/site-schema';
import { defaultContent } from '../src/data/portfolio';
import { readPublished } from './content';
import type { Store } from './store';

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );
export function renderMetadata(template: string, content: SiteContent, isPrivate = false) {
  const { profile, settings } = content;
  let result = template.replace(
    /<title>[\s\S]*?<\/title>/,
    () =>
      `<title>${escape(isPrivate ? `Private workspace — ${profile.name}` : profile.headline)}</title>`,
  );
  for (const [attribute, key, value] of [
    ['name', 'description', settings.metaDescription],
    ['property', 'og:title', profile.headline],
    ['property', 'og:description', settings.metaDescription],
    ['property', 'og:url', `${profile.website.replace(/\/$/, '')}/`],
    ['name', 'twitter:title', profile.headline],
    ['name', 'twitter:description', settings.metaDescription],
  ])
    result = result.replace(
      new RegExp(`<meta\\b(?=[^>]*\\b${attribute}="${key}")[^>]*>`, 'i'),
      () => `<meta ${attribute}="${key}" content="${escape(value!)}" />`,
    );
  result = result.replace(
    /<link\b(?=[^>]*\brel="canonical")[^>]*>/i,
    () => `<link rel="canonical" href="${escape(profile.website.replace(/\/$/, '') + '/')}" />`,
  );
  result = result
    .replace('data-theme="dark"', () => `data-theme="${settings.defaultTheme}"`)
    .replace(
      "const theme = localStorage.getItem('portfolio-theme');",
      () => `const theme = localStorage.getItem('portfolio-theme') || '${settings.defaultTheme}';`,
    );
  // Initial published content prevents a flash of the factory site. Escape '<'
  // so even a literal </script> in authenticated owner copy cannot escape JSON.
  const bootstrap = JSON.stringify(content)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  result = result.replace(
    '</head>',
    () =>
      `${isPrivate ? '<meta name="robots" content="noindex, nofollow" />' : ''}<script id="portfolio-content" type="application/json">${bootstrap}</script></head>`,
  );
  return result;
}
export async function servePage(req: IncomingMessage, res: ServerResponse, store: Store) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    const template = await readFile(resolve('dist/index.html'), 'utf8');
    const url = new URL(req.url ?? '/', 'http://internal');
    const isAdmin =
      url.pathname === '/admin' ||
      url.pathname.startsWith('/admin/') ||
      (url.pathname === '/api/page' && url.searchParams.get('admin') === '1');
    // Keep the admin sign-in/recovery screen reachable during a storage outage.
    // A public storage failure must not silently resurrect factory content.
    const content = isAdmin ? defaultContent : (await readPublished(store)).content;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(
      renderMetadata(template, content, isAdmin || url.searchParams.get('preview') === 'draft'),
    );
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('The portfolio content is temporarily unavailable. Please try again shortly.');
  }
}

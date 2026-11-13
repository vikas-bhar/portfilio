import { useEffect, useState, type ReactNode } from 'react';
import { defaultContent } from '../data/portfolio';
import { SiteContext } from '../context/site-context';
import { siteContentSchema, type ContentRecord } from '../lib/site-schema';

function initialContent() {
  try {
    const bootstrap = document.getElementById('portfolio-content');
    if (bootstrap?.textContent) return siteContentSchema.parse(JSON.parse(bootstrap.textContent));
  } catch {
    /* Validated API content will replace the factory fallback. */
  }
  return defaultContent;
}
export default function SiteProvider({ children }: { children: ReactNode }) {
  const previewMode = new URLSearchParams(window.location.search).get('preview') === 'draft';
  const [record, setRecord] = useState<ContentRecord>(() => ({
    content: initialContent(),
    revision: 'initial',
    updatedAt: null,
  }));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let sequence = 0;
    const load = async () => {
      const requestSequence = ++sequence;
      try {
        const response = await fetch(previewMode ? '/api/admin/draft' : '/api/site', {
          signal: controller.signal,
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!response.ok)
          throw new Error(
            previewMode
              ? 'Draft preview requires an active admin session and a saved draft. Sign in and save a draft first.'
              : 'Published content could not be refreshed.',
          );
        const data = (await response.json()) as ContentRecord;
        const content = siteContentSchema.parse(data.content);
        if (active && requestSequence === sequence) {
          setRecord({ ...data, content });
          setLoadError(null);
          setPreviewReady(true);
        }
      } catch (error) {
        if (active && requestSequence === sequence && !controller.signal.aborted) {
          setLoadError(
            error instanceof Error ? error.message : 'Content is temporarily unavailable.',
          );
          setPreviewReady(false);
        }
      }
    };
    void load();
    const refresh = () => {
      if (document.visibilityState !== 'hidden') void load();
    };
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const channel =
      typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('portfolio-content');
    if (channel) channel.onmessage = refresh;
    return () => {
      active = false;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      channel?.close();
    };
  }, [previewMode]);
  useEffect(() => {
    const { profile, settings } = record.content;
    document.title = previewMode ? `Draft preview — ${profile.name}` : profile.headline;
    document.documentElement.style.setProperty('--site-accent-dark', settings.accentDark);
    document.documentElement.style.setProperty('--site-accent-light', settings.accentLight);
    document.documentElement.dataset.animations = settings.animations ? 'on' : 'off';
    const update = (selector: string, value: string, attr = 'content') =>
      document.querySelector(selector)?.setAttribute(attr, value);
    update('meta[name="description"]', settings.metaDescription);
    update('meta[property="og:title"]', profile.headline);
    update('meta[property="og:description"]', settings.metaDescription);
    update('meta[property="og:url"]', `${profile.website.replace(/\/$/, '')}/`);
    update('meta[name="twitter:title"]', profile.headline);
    update('meta[name="twitter:description"]', settings.metaDescription);
    update('link[rel="canonical"]', `${profile.website.replace(/\/$/, '')}/`, 'href');
    if (previewMode) {
      let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.append(robots);
      }
      robots.content = 'noindex, nofollow';
    }
  }, [record.content, previewMode]);
  return (
    <SiteContext.Provider
      value={{ content: record.content, revision: record.revision, previewMode, loadError }}
    >
      {previewMode && !previewReady ? (
        <main className="preview-gate">
          <p className="eyebrow">PRIVATE DRAFT PREVIEW</p>
          <h1>{loadError ? 'Sign in to preview your draft.' : 'Loading your private draft…'}</h1>
          {loadError && <p role="alert">{loadError}</p>}
          <a href="/admin" className="button button-primary">
            Open admin
          </a>
          <a href="/" className="text-link">
            Back to public site
          </a>
        </main>
      ) : (
        children
      )}
    </SiteContext.Provider>
  );
}

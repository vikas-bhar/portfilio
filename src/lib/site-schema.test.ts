// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { defaultContent } from '../data/portfolio';
import { siteContentSchema } from './site-schema';
import { createResumeHtml } from './resume-html';
import { createResumeText, resumeFileStem } from './resume';
import { createMailtoLink } from './contact';
import { normalizeContent } from '../admin/helpers';

const copy = () => structuredClone(defaultContent);
describe('editable site content validation', () => {
  it('parses the complete eleven-project collection and derives the headline', () => {
    const content = copy();
    content.profile.name = 'New Builder';
    expect(siteContentSchema.parse(content).profile.headline).toBe(
      `New Builder — ${content.profile.role}`,
    );
  });
  it.each([
    'javascript:alert(1)',
    'data:text/html,bad',
    'http://example.com',
    'https://owner:password@example.com',
  ])('rejects unsafe URL %s', (url) => {
    const content = copy();
    content.profile.website = url;
    expect(siteContentSchema.safeParse(content).success).toBe(false);
  });
  it('requires an actual owner/repository source URL, not a profile', () => {
    const content = copy();
    content.projects[0]!.source = { availability: 'public', url: 'https://github.com/someone' };
    expect(siteContentSchema.safeParse(content).success).toBe(false);
    content.projects[0]!.source.url = 'https://github.com/someone/project';
    expect(siteContentSchema.safeParse(content).success).toBe(true);
  });
  it('permits a private source without forcing a fictional URL', () => {
    const content = copy();
    content.projects[0]!.source = { availability: 'private', reason: 'Source is private.' };
    expect(siteContentSchema.safeParse(content).success).toBe(true);
  });
  it('rejects duplicate project IDs', () => {
    const content = copy();
    content.projects[1]!.id = content.projects[0]!.id;
    expect(siteContentSchema.safeParse(content).success).toBe(false);
  });
  it('rejects duplicate or missing sections and keeps home first and visible', () => {
    for (const change of [
      (content: typeof defaultContent) => {
        content.sections[1]!.id = 'home';
      },
      (content: typeof defaultContent) => {
        content.sections[0]!.visible = false;
      },
      (content: typeof defaultContent) => {
        content.sections.reverse();
      },
    ]) {
      const content = copy();
      change(content);
      expect(siteContentSchema.safeParse(content).success).toBe(false);
    }
  });
  it('keeps a visible section heading accessible even when copy is edited', () => {
    const content = copy();
    content.copy.workTitle = '';
    content.copy.workAccent = '';
    expect(siteContentSchema.safeParse(content).success).toBe(false);
    content.sections.find((section) => section.id === 'project')!.visible = false;
    expect(siteContentSchema.safeParse(content).success).toBe(true);
  });
  it('protects readable theme accents', () => {
    const content = copy();
    content.settings.accentDark = '#101214';
    expect(siteContentSchema.safeParse(content).success).toBe(false);
    content.settings.accentDark = '#b4ecc5';
    content.settings.accentLight = '#efefea';
    expect(siteContentSchema.safeParse(content).success).toBe(false);
  });
  it('validates a simple project image separately from a verified screenshot', () => {
    const content = copy();
    content.projects[0]!.coverImage = {
      src: '/projects/kisan-sathi.svg',
      alt: 'An illustrated sprout.',
    };
    const result = siteContentSchema.parse(content);
    expect(result.projects[0]!.coverImage).toEqual(content.projects[0]!.coverImage);
    expect(result.projects[0]!.screenshot).toBeUndefined();
    for (const src of [
      'javascript:alert(1)',
      '/projects/../secret.svg',
      '/api/admin/draft',
      'data:image/svg+xml,bad',
    ]) {
      content.projects[0]!.coverImage!.src = src;
      expect(siteContentSchema.safeParse(content).success).toBe(false);
    }
    content.projects[0]!.coverImage = { src: 'https://example.com/illustration.png', alt: '' };
    expect(siteContentSchema.safeParse(content).success).toBe(false);
  });

  it('validates screenshot paths and real calendar dates', () => {
    const content = copy();
    content.projects[0]!.screenshot = {
      src: '/projects/../secret.png',
      alt: 'Real interface',
      width: 1440,
      height: 900,
      capturedOn: '2026-11-11',
    };
    expect(siteContentSchema.safeParse(content).success).toBe(false);
    content.projects[0]!.screenshot.src = '/projects/real-ui.webp';
    content.projects[0]!.screenshot.capturedOn = '2026-02-31';
    expect(siteContentSchema.safeParse(content).success).toBe(false);
  });
  it('normalizes line lists at save time rather than losing newlines while typing', () => {
    const content = copy();
    content.projects[0]!.tags = [' React ', '', 'TypeScript'];
    const result = normalizeContent(content);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.projects[0]!.tags).toEqual(['React', 'TypeScript']);
  });
});

describe('runtime résumé and contact content', () => {
  it('uses the edited profile and hides invisible projects in text and HTML', () => {
    const content = copy();
    content.profile.name = 'Edited Owner';
    content.profile.email = 'owner@example.com';
    content.projects[0]!.visible = false;
    const text = createResumeText(content);
    const html = createResumeHtml(content);
    expect(text).toContain('EDITED OWNER');
    expect(text).not.toContain('1. Kisan Sathi');
    expect(html).toContain('Edited Owner — Résumé');
    expect(html).not.toContain('<h3>Kisan Sathi</h3>');
    expect(html).toContain('mailto:owner@example.com');
    expect(html).toContain('href="/api/resume/text"');
  });
  it('escapes owner-supplied HTML rather than rendering scripts', () => {
    const content = copy();
    content.profile.name = '<script>alert("x")</script>';
    const html = createResumeHtml(content);
    expect(html).not.toContain(content.profile.name);
    expect(html).toContain('&lt;script&gt;');
  });
  it('marks draft exports and keeps their text link authenticated', () => {
    const html = createResumeHtml(copy(), true);
    expect(html).toContain('PRIVATE DRAFT — not published');
    expect(html).toContain('/api/resume/text?preview=draft');
  });
  it('builds safe filenames from editable names', () => {
    expect(resumeFileStem('Vikas Bhardwaj')).toBe('Vikas_Bhardwaj_Resume');
    expect(resumeFileStem('../../ /\r\n')).toBe('Portfolio_Resume');
  });
  it('uses an updated contact address for encoded email drafts', () => {
    const url = new URL(
      createMailtoLink(
        { firstName: 'Asha', lastName: '', email: 'asha@example.com', message: 'A custom inquiry' },
        { name: 'Edited Owner', email: 'owner@example.com' },
      ),
    );
    expect(url.pathname).toBe('owner@example.com');
    expect(url.searchParams.get('body')).toContain('Hi Edited,');
  });
});

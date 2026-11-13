// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { milestones, profile, projects, skillGroups } from '../data/portfolio';
import { createMailtoLink } from './contact';
import { createSourceRequestLink } from './projects';
import { createResumeText } from './resume';

const escape = (value: string) => value.replaceAll('&', '&amp;');

describe('canonical product-engineering content', () => {
  it('keeps the four priority flagships first and restores all older projects', () => {
    expect(projects.slice(0, 4).map((project) => project.id)).toEqual([
      'kisan-sathi',
      'aeo-pulse',
      'focuspulse',
      'rasa-direct-ordering',
    ]);
    expect(new Set(projects.map((project) => project.id)).size).toBe(11);
    expect(projects.filter((project) => project.featured)).toHaveLength(4);
    expect(projects.filter((project) => !project.featured).map((project) => project.id)).toEqual([
      'venus-ai',
      'sheet-craft',
      'prepstudy',
      'arora-tech',
      'ms-fast-food',
      'lsss-school',
      'rahat-hospital',
    ]);
    projects.forEach((project) => {
      expect(project.visible).toBe(true);
      expect(project.description).toBeTruthy();
      expect(project.tags.length).toBeGreaterThan(0);
      if (project.featured) {
        ['problem', 'architecture', 'impact', 'evidenceNote'].forEach((key) =>
          expect(project[key as keyof typeof project]).toBeTruthy(),
        );
        expect(project.stages).toHaveLength(3);
      }
    });
  });

  it('uses the owner-supplied vikas-bhar GitHub account in the profile and résumé', () => {
    expect(profile.github).toBe('https://github.com/vikas-bhar');
    expect(createResumeText()).toContain('GitHub: https://github.com/vikas-bhar');
    const html = readFileSync(
      new URL('../../public/resume/Vikas_Bhardwaj_Resume.html', import.meta.url),
      'utf8',
    );
    expect(html).toContain('href="https://github.com/vikas-bhar"');
    expect(html).not.toContain('github.com/bhardwajvikas316-star');
  });

  it('uses valid HTTPS URLs while distinguishing unavailable and private destinations', () => {
    [profile.github, profile.linkedin, profile.website].forEach((url) =>
      expect(new URL(url).protocol).toBe('https:'),
    );
    const demos: string[] = [];
    projects.forEach((project) => {
      if (project.demo.availability === 'verified') {
        expect(new URL(project.demo.url).protocol).toBe('https:');
        expect(project.demo.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        demos.push(project.demo.url);
      } else expect(project.demo.reason).toBeTruthy();
      if (project.source.availability !== 'unverified' && project.source.url)
        expect(new URL(project.source.url).hostname).toBe('github.com');
    });
    expect(new Set(demos).size).toBe(8);
    expect(projects.find((project) => project.id === 'focuspulse')?.demo.availability).toBe(
      'unavailable',
    );
    expect(projects.filter((project) => project.source.availability === 'private')).toHaveLength(3);
  });

  it('uses verified deployed stacks rather than incorrectly labeling every product Next.js', () => {
    expect(projects.find((project) => project.id === 'kisan-sathi')?.architecture).toContain(
      'Expo / React Native',
    );
    expect(projects.find((project) => project.id === 'aeo-pulse')?.architecture).toContain(
      'Express',
    );
    expect(projects.find((project) => project.id === 'rasa-direct-ordering')?.context).toContain(
      'not an official restaurant site',
    );
  });

  it('groups capabilities into four engineering pillars and includes all three milestones', () => {
    expect(skillGroups.map((group) => group.id)).toEqual(['frontend', 'ai', 'systems', 'cloud']);
    skillGroups.forEach((group) => expect(group.skills.length).toBeGreaterThan(0));
    expect(milestones).toHaveLength(3);
    expect(milestones[0].organization).toContain('Vision Start / Zenastra Industries');
    expect(milestones[1].description).toContain('Build with Gemini XPRIZE');
    expect(milestones[2].organization).toContain('GDG Jammu');
  });

  it('keeps downloadable text, all case-study narratives, and milestones in sync', () => {
    const file = readFileSync(
      new URL('../../public/resume/Vikas_Bhardwaj_Resume.txt', import.meta.url),
      'utf8',
    );
    expect(file).toBe(createResumeText());
    expect(file).toContain(profile.role);
    projects.forEach((project) => {
      [project.title, project.problem, project.architecture, project.impact].forEach((text) =>
        expect(file).toContain(text),
      );
      if (project.demo.availability === 'verified') expect(file).toContain(project.demo.url);
    });
    milestones.forEach((milestone) => expect(file).toContain(milestone.title));
    expect(file).not.toContain('undefined');
    expect(file).toContain('Venus AI');
  });

  it('keeps the printable HTML accurate, safe, and ready for browser PDF export', () => {
    const html = readFileSync(
      new URL('../../public/resume/Vikas_Bhardwaj_Resume.html', import.meta.url),
      'utf8',
    );
    projects.forEach((project) => {
      expect(html).toContain(escape(project.title));
      expect(html).toContain(escape(project.architecture));
      if (project.demo.availability === 'verified') expect(html).toContain(project.demo.url);
      if (project.source.availability === 'private')
        expect(html).not.toContain(`href="${project.source.url}"`);
    });
    milestones.forEach((milestone) => expect(html).toContain(escape(milestone.title)));
    expect(html).toContain('@media print');
    expect(html).toContain('window.print()');
    expect(html).not.toContain('GEMINI_API_KEY');
    expect(html).not.toContain('href="undefined"');
    expect(html).not.toMatch(/[ \t]+$/m);
  });

  it('updates page metadata and the web manifest to product-engineer positioning', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
    const manifest = JSON.parse(
      readFileSync(new URL('../../public/site.webmanifest', import.meta.url), 'utf8'),
    );
    expect(html).toContain(`<title>${escape(profile.headline)}</title>`);
    expect(html).toContain(`rel="canonical" href="${profile.website}/"`);
    expect(manifest.description).toContain('product engineering');
  });
});

describe('email draft encoding', () => {
  it('encodes newlines, Unicode, and reserved characters safely', () => {
    const url = new URL(
      createMailtoLink({
        firstName: '  Asha ',
        lastName: ' Sharma ',
        email: 'asha+work@example.com',
        message: 'Let’s build an AI & systems tool!\nCan we talk?',
      }),
    );
    expect(url.pathname).toBe(profile.email);
    expect(url.searchParams.get('subject')).toBe('Portfolio inquiry from Asha Sharma');
    expect(url.searchParams.get('body')).toContain('AI & systems tool!\nCan we talk?');
    expect(url.searchParams.get('body')).toContain('asha+work@example.com');
    expect([...url.searchParams.keys()]).toEqual(['subject', 'body']);
  });

  it('does not allow message content to add mail headers', () => {
    const url = new URL(
      createMailtoLink({
        firstName: 'Sam &bcc=other@example.com',
        lastName: '',
        email: 'sam@example.com',
        message: 'Hello &cc=other@example.com',
      }),
    );
    expect(url.searchParams.has('bcc')).toBe(false);
    expect(url.searchParams.has('cc')).toBe(false);
    expect(url.searchParams.get('body')).toContain('&cc=other@example.com');
  });

  it('provides a sensible subject for an empty optional name', () => {
    const url = new URL(
      createMailtoLink({
        firstName: '',
        lastName: '',
        email: 'hello@example.com',
        message: 'Hello Vikas',
      }),
    );
    expect(url.searchParams.get('subject')).toBe('Portfolio inquiry from a new collaborator');
  });

  it('creates a project-specific source request without injecting mail headers', () => {
    const url = new URL(createSourceRequestLink('AEO Pulse &cc=other@example.com #1'));
    expect(url.pathname).toBe(profile.email);
    expect(url.searchParams.get('subject')).toContain('AEO Pulse &cc=other@example.com #1');
    expect(url.searchParams.get('body')).toContain('walkthrough or source access');
    expect([...url.searchParams.keys()]).toEqual(['subject', 'body']);
  });
});

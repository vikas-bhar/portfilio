// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { defaultContent } from '../data/portfolio';
import { createLlmsFull, createLlmsIndex, llmsPaths } from './llms';

const content = () => structuredClone(defaultContent);
const readable = (markdown: string) => markdown.replace(/\\([\\`*_[\]<>#|])/g, '$1');

describe('LLM-readable public portfolio', () => {
  it('provides a concise Markdown index with a title, summary and file-list sections', () => {
    const index = createLlmsIndex(defaultContent);
    expect(index).toMatch(/^# Vikas Bhardwaj\n\n> Full-Stack/);
    expect(index.match(/^# /gm)).toHaveLength(1);
    expect(index).toContain(defaultContent.profile.summary);
    expect(index).toContain(`[Complete portfolio text](${llmsPaths.full})`);
    expect(index).toContain(`[Markdown page](${llmsPaths.markdown})`);
    for (const section of index.split(/^## .+\n/gm).slice(1)) {
      const lines = section.trim().split('\n');
      expect(lines.every((line) => /^- \[.+\]\(.+\): .+/.test(line))).toBe(true);
    }
    expect(index.length).toBeLessThan(4000);
    expect(index.endsWith('\n')).toBe(true);
  });

  it('covers every visible project, technology, narrative and evidence note without truncating', () => {
    const full = createLlmsFull(defaultContent);
    expect(full).toContain('11 visible projects; 4 featured.');
    for (const project of defaultContent.projects) {
      expect(full).toContain(`### ${project.title}`);
      for (const value of [
        project.description,
        project.context,
        project.problem,
        project.architecture,
        project.impact,
        project.evidenceNote,
        ...project.tags,
      ].filter(Boolean))
        expect(readable(full)).toContain(value);
    }
    expect(full).toContain('not an official restaurant site');
    expect(full).toContain('not an end-to-end product test');
    expect(full).toContain('No working-UI capture has been supplied.');
    expect(full).not.toContain('undefined');
    expect(full).not.toContain('null');
    expect(full).not.toMatch(/[ \t]+$/m);
  });

  it('includes profile, build approach, skill groups, About, focus areas and milestones', () => {
    const full = createLlmsFull(defaultContent);
    const { profile, copy } = defaultContent;
    for (const value of [
      profile.name,
      profile.role,
      profile.location,
      profile.email,
      profile.github,
      profile.linkedin,
      profile.website,
      profile.summary,
      profile.heroSummary,
      ...profile.about,
      copy.availability,
      copy.builderNoteTitle,
      copy.builderNoteDetail,
      copy.contactDescription,
      copy.contactAvailability,
    ])
      expect(full).toContain(value);
    for (const stage of defaultContent.buildPath) {
      expect(full).toContain(stage.title);
      expect(full).toContain(stage.detail);
    }
    for (const group of defaultContent.skillGroups) {
      expect(full).toContain(group.title);
      expect(full).toContain(group.subtitle);
      group.skills.forEach((skill) => expect(full).toContain(skill));
    }
    for (const area of defaultContent.focusAreas) {
      expect(full).toContain(area.title);
      expect(full).toContain(area.description);
    }
    for (const milestone of defaultContent.milestones) {
      expect(full).toContain(milestone.title);
      expect(full).toContain(milestone.organization);
      expect(full).toContain(milestone.description);
      milestone.highlights.forEach((highlight) => expect(full).toContain(highlight));
    }
    expect(full).toContain('it does not send or store contact messages');
  });

  it('keeps failed demos unlinked and private repository URL fields out of both resources', () => {
    const all = createLlmsIndex(defaultContent) + createLlmsFull(defaultContent);
    for (const project of defaultContent.projects) {
      if (project.demo.availability === 'unavailable') {
        if (project.demo.url) expect(all).not.toContain(project.demo.url);
        expect(readable(all)).toContain(project.demo.reason);
      } else {
        expect(all).toContain(project.demo.url);
        if (project.demo.availability === 'verified')
          expect(all).toContain(`public page checked ${project.demo.verifiedOn}`);
      }
      if (project.source.availability !== 'public') {
        expect(all).toContain(project.source.reason);
        if (project.source.availability === 'private' && project.source.url)
          expect(all).not.toContain(project.source.url);
      }
    }
    expect(all).not.toMatch(/passwordHash|sessionSecret|csrfToken|setup-key|\/api\/admin/);
  });

  it('labels provided demos, public source and supplied captures without inventing verification', () => {
    const modified = content();
    modified.projects[0]!.demo = {
      availability: 'unverified',
      url: 'https://demo.example.com',
      reason: 'Owner-provided URL only.',
    };
    modified.projects[0]!.source = {
      availability: 'public',
      url: 'https://github.com/example/project',
    };
    modified.projects[0]!.screenshot = {
      src: '/projects/supplied-ui.webp',
      alt: 'Owner-supplied crop assistance screen',
      width: 1280,
      height: 720,
      capturedOn: '2026-11-11',
    };
    const full = createLlmsFull(modified);
    expect(full).toContain(
      '[Provided demo](https://demo.example.com) — not independently verified.',
    );
    expect(full).toContain('Owner-provided URL only.');
    expect(full).toContain('[Public GitHub repository](https://github.com/example/project)');
    expect(full).toContain('[Owner-supplied crop assistance screen](/projects/supplied-ui.webp)');
    expect(full).toContain('owner-supplied; capture date 2026-11-11');
  });

  it('omits hidden projects, including their URLs, and keeps the published project order', () => {
    const modified = content();
    modified.projects[0]!.visible = false;
    modified.projects = [...modified.projects].reverse();
    const full = createLlmsFull(modified);
    expect(full).toContain('10 visible projects; 3 featured.');
    expect(full).not.toContain('### Kisan Sathi');
    expect(full).not.toContain('https://kisan-saathi-indol.vercel.app');
    expect(full.indexOf('### Rahat Hospital')).toBeLessThan(full.indexOf('### AEO Pulse'));
  });

  it('honors visible section order and omits the details of every hidden section', () => {
    const modified = content();
    modified.sections = [
      modified.sections[0]!,
      modified.sections[5]!,
      ...modified.sections.slice(1, 5),
    ];
    for (const section of modified.sections)
      if (['project', 'my-skill', 'about-me', 'experience'].includes(section.id))
        section.visible = false;
    const full = createLlmsFull(modified);
    expect(full.match(/^## .+/gm)).toEqual([
      '## Profile',
      '## Contact',
      '## Public text resources',
    ]);
    for (const value of [
      'Kisan Sathi',
      modified.skillGroups[0]!.title,
      modified.profile.about[0]!,
      modified.focusAreas[0]!.description,
      modified.milestones[0]!.description,
    ])
      expect(full).not.toContain(value);
  });

  it('removes résumé links when disabled without disabling the independent AI resources', () => {
    const modified = content();
    modified.settings.resumeEnabled = false;
    for (const body of [createLlmsIndex(modified), createLlmsFull(modified)]) {
      expect(body).not.toContain('/api/resume/');
      expect(body).toContain('/llms-full.txt');
      expect(body).toContain(modified.profile.name);
    }
  });

  it('uses editable identity and links, with portable same-origin text resource URLs', () => {
    const modified = content();
    modified.profile.name = 'Published Builder';
    modified.profile.email = 'published@example.com';
    modified.profile.website = 'https://portfolio.example.com';
    modified.profile.github = 'https://github.com/published-builder';
    modified.profile.linkedin = 'https://www.linkedin.com/in/published-builder';
    for (const body of [createLlmsIndex(modified), createLlmsFull(modified)]) {
      expect(body).toMatch(/^# Published Builder\n/);
      expect(body).toContain('https://portfolio.example.com');
      expect(body).toContain('mailto:published@example.com');
      expect(body).toContain('https://github.com/published-builder');
      expect(body).toContain('](/llms-full.txt)');
      expect(body).not.toContain('https://vikas-portfolio.is-a.dev');
      expect(body).not.toContain('mailto:vbvoxe@gmail.com');
    }
  });

  it('escapes Markdown and collapses embedded newlines instead of importing owner-supplied markup', () => {
    const modified = content();
    modified.profile.name = 'Owner [link]\n# Injected title';
    modified.profile.summary = '<script>alert("text")</script>\n\n# Not another heading';
    modified.profile.website = 'https://example.com/portfolio_(test)';
    const index = createLlmsIndex(modified);
    expect(index.match(/^# /gm)).toHaveLength(1);
    expect(index).toContain('Owner \\[link\\] \\# Injected title');
    expect(index).not.toContain('<script>');
    expect(index).toContain('https://example.com/portfolio_%28test%29');
    expect(index).not.toContain('\n# Not another heading');
  });

  it('routes every conventional public text path to the live Vercel API, not a static snapshot', () => {
    const config = JSON.parse(
      readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'),
    ) as { rewrites: { source: string; destination: string }[] };
    for (const [source, destination] of [
      [llmsPaths.index, '/api/llms'],
      [llmsPaths.full, '/api/llms/full'],
      [llmsPaths.markdown, '/api/llms/markdown'],
    ])
      expect(config.rewrites).toContainEqual({ source, destination });
  });
});

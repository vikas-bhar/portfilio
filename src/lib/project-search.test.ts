// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { projects } from '../data/portfolio';
import { matchesProjectSearch } from './projects';

const kisan = projects[0]!;

describe('project keyword matching', () => {
  it.each(['', '   ', '\n\t'])('includes all projects for an empty query %j', (query) => {
    expect(projects.every((project) => matchesProjectSearch(project, query))).toBe(true);
  });

  it('matches every query word across names, technologies, context and architecture', () => {
    expect(matchesProjectSearch(kisan, '  KISAN   React\nNative  ')).toBe(true);
    expect(matchesProjectSearch(kisan, 'SEVA2026 caching')).toBe(true);
    expect(matchesProjectSearch(kisan, 'Kisan Supabase')).toBe(false);
  });

  it('normalizes compatibility characters and supports editable non-Latin text', () => {
    expect(matchesProjectSearch(projects[2]!, 'ＦｏｃｕｓＰｕｌｓｅ')).toBe(true);
    expect(matchesProjectSearch({ ...kisan, title: 'किसान साथी' }, 'किसान')).toBe(true);
  });

  it('does not index contact, private-source URLs or evidence availability', () => {
    expect(matchesProjectSearch(kisan, 'github.com')).toBe(false);
    expect(matchesProjectSearch(kisan, 'private')).toBe(false);
  });
});

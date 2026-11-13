// @vitest-environment node
import { readFile, stat } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { projects } from '../data/portfolio';
import { projectIllustration } from './project-images';

describe('local project illustration assets', () => {
  it('supplies eleven distinct, lightweight local SVG images with no external dependencies or scripts', async () => {
    const images = projects.map(projectIllustration);
    expect(new Set(images.map((image) => image.src)).size).toBe(11);
    for (const image of images) {
      expect(image.alt.length).toBeGreaterThan(15);
      expect(image.src).toMatch(/^\/projects\/[a-z-]+\.svg$/);
      const file = `public${image.src}`;
      expect((await stat(file)).size).toBeLessThan(8192);
      const svg = await readFile(file, 'utf8');
      expect(svg).toContain('<title');
      expect(svg).toContain('not a product screenshot');
      expect(svg).not.toMatch(/<script|<foreignObject|https?:\/\/(?!www\.w3\.org)/i);
    }
  });
});

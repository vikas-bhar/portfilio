import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Hero from './Hero';
import { defaultContent } from '../data/portfolio';
import { SiteContext } from '../context/site-context';

function renderHero(name: string) {
  const content = structuredClone(defaultContent);
  content.profile.name = name;
  content.settings.animations = false;
  return render(
    <SiteContext.Provider
      value={{ content, revision: 'test', previewMode: false, loadError: null }}
    >
      <Hero onOpenResume={vi.fn()} />
    </SiteContext.Provider>,
  );
}

describe('editorial hero presentation', () => {
  it.each(['Vikas Bhardwaj', 'Vikas', 'Asha Kaur Singh', 'आरव शर्मा'])(
    'keeps an editable name and role as one accessible heading: %s',
    (name) => {
      renderHero(name);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(`${name} — ${defaultContent.profile.role}`);
      expect(heading.querySelectorAll('.hero-name-part')).toHaveLength(
        name.split(/\s+/).length > 1 ? 2 : 1,
      );
      expect(screen.getByText(defaultContent.profile.heroSummary)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View Featured Projects' })).toHaveAttribute(
        'href',
        '#project',
      );
    },
  );

  it('keeps the original artwork decorative and the build-path details optional', () => {
    const { container } = renderHero(defaultContent.profile.name);
    expect(container.querySelector('.studio-artwork')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.studio-artwork img')).toBeNull();
    expect(container.querySelector('.hero-build-details')).not.toHaveAttribute('open');
    expect(container.querySelectorAll('.notebook-steps > span')).toHaveLength(
      defaultContent.buildPath.length,
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      defaultContent.profile.github,
    );
    expect(screen.getByRole('button', { name: 'View résumé' })).toBeInTheDocument();
  });
});

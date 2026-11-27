import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { defaultContent } from '../data/portfolio';
import { SiteContext } from '../context/site-context';
import { siteContentSchema, type SiteContent } from '../lib/site-schema';
import About from './About';
import Contact from './Contact';
import Experience from './Experience';
import Skills from './Skills';

function renderSections(content: SiteContent = structuredClone(defaultContent)) {
  content.settings.animations = false;
  return render(
    <SiteContext.Provider
      value={{ content, revision: 'published', previewMode: false, loadError: null }}
    >
      <Skills />
      <About />
      <Experience />
      <Contact />
    </SiteContext.Provider>,
  );
}

describe('shared public paper sections', () => {
  it('keeps every capability, focus area, milestone and contact field in the shared card language', () => {
    const { container } = renderSections();
    for (const group of defaultContent.skillGroups) {
      const card = screen.getByRole('article', { name: group.title });
      expect(card).toHaveClass('paper-card');
      expect(within(card).getByText(group.subtitle)).toBeInTheDocument();
      for (const skill of group.skills) expect(within(card).getByText(skill)).toBeInTheDocument();
      expect(card.querySelector('.capability-list')).toHaveClass('paper-chips');
    }
    for (const milestone of defaultContent.milestones) {
      const card = screen.getByRole('article', { name: milestone.title });
      expect(card).toHaveClass('paper-card');
      expect(within(card).getByText(milestone.organization)).toBeInTheDocument();
      expect(within(card).getByText(milestone.description)).toBeInTheDocument();
      expect(within(card).getByText(milestone.category)).toHaveClass('paper-label');
    }
    for (const area of defaultContent.focusAreas) {
      expect(screen.getByRole('heading', { name: area.title }).closest('.focus-area')).toHaveClass(
        'paper-card',
      );
      expect(screen.getByText(area.description)).toBeInTheDocument();
    }
    for (const selector of [
      '.about-copy',
      '.about-stat-row',
      '.learning-note',
      '.contact-copy',
      '.contact-form-card',
    ])
      expect(container.querySelector(selector)).toHaveClass('paper-card');
    const form = screen.getByRole('form', { name: 'Contact Vikas' });
    expect(form.closest('[aria-hidden="true"]')).toBeNull();
    expect(within(form).getByLabelText('First name', { exact: false })).toBeRequired();
    expect(within(form).getByLabelText('Email address', { exact: false })).toBeRequired();
    expect(within(form).getByText(/Nothing is sent or stored/)).toBeInTheDocument();
    expect(container.querySelectorAll('.paper-illustration')).toHaveLength(
      defaultContent.skillGroups.length +
        defaultContent.focusAreas.length +
        defaultContent.milestones.length +
        1,
    );
    for (const print of container.querySelectorAll('.paper-illustration'))
      expect(print).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('img')).toBeNull();
  });

  it('uses edited, reordered and additional published rows rather than hard-coding the factory cards', () => {
    const edited = structuredClone(defaultContent);
    edited.profile.about = ['A published owner biography, still rendered as text.'];
    edited.profile.email = 'owner@example.com';
    edited.skillGroups.reverse();
    edited.skillGroups.push({
      id: 'custom-capability',
      title: 'An edited capability',
      subtitle: 'Owner-supplied detail.',
      skills: ['A new technology'],
    });
    edited.focusAreas.push({
      title: 'An edited focus area',
      description: 'An owner-supplied approach.',
    });
    edited.milestones.reverse();
    edited.milestones.push({
      id: 'custom-milestone',
      category: 'Owner category',
      title: 'An edited milestone',
      organization: 'Owner organization',
      description: 'An owner-supplied milestone description.',
      highlights: ['Owner highlight'],
    });
    const { container } = renderSections(siteContentSchema.parse(edited));
    expect(
      [...container.querySelectorAll('.skill-card h3')].map((heading) => heading.textContent),
    ).toEqual(edited.skillGroups.map(({ title }) => title));
    expect(
      [...container.querySelectorAll('.experience-card h3')].map((heading) => heading.textContent),
    ).toEqual(edited.milestones.map(({ title }) => title));
    expect(container.querySelectorAll('.skills-grid > .tilt-card')).toHaveLength(
      edited.skillGroups.length,
    );
    expect(screen.getByRole('article', { name: 'An edited capability' })).toHaveClass('paper-card');
    expect(screen.getByRole('article', { name: 'An edited milestone' })).toHaveClass('paper-card');
    expect(screen.getByText('An edited focus area').closest('.focus-area')).toHaveClass(
      'paper-card',
    );
    expect(screen.getByText(edited.profile.about[0]!)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: edited.profile.email })).toHaveAttribute(
      'href',
      `mailto:${edited.profile.email}`,
    );
    expect(container.querySelector('.hero-portrait-frame, .about-portrait-frame, img')).toBeNull();
  });
});

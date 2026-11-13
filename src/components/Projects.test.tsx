import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Projects from './Projects';
import ProjectPreview from './ProjectPreview';
import { defaultContent, projects } from '../data/portfolio';
import { SiteContext } from '../context/site-context';

const flagships = projects.filter((project) => project.featured);
describe('compact project collection', () => {
  it('keeps all eleven projects and starts each with a brief summary', () => {
    render(<Projects />);
    expect(screen.getAllByRole('article')).toHaveLength(11);
    expect(screen.getByRole('button', { name: /^All projects/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    projects.forEach((project) => {
      const card = screen.getByRole('article', { name: project.title });
      expect(within(card).getByRole('heading', { name: project.title })).toBeInTheDocument();
      expect(
        within(card).getByRole('button', { name: `Show more about ${project.title}` }),
      ).toHaveAttribute('aria-expanded', 'false');
      expect(document.getElementById(`${project.id}-details`)).toHaveAttribute('hidden');
      expect(card.querySelector('.project-description')!.textContent!.length).toBeLessThanOrEqual(
        146,
      );
    });
    expect(screen.getAllByRole('img')).toHaveLength(11);
    expect(screen.getAllByText('Illustration')).toHaveLength(11);
    expect(screen.queryByRole('figure', { name: /not a UI screenshot/ })).not.toBeInTheDocument();
  });

  it('expands and collapses one project without expanding the others', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const card = screen.getByRole('article', { name: 'Kisan Sathi' });
    const toggle = within(card).getByRole('button', { name: 'Show more about Kisan Sathi' });
    expect(within(card).getByText('Problem', { exact: true })).not.toBeVisible();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Show less about Kisan Sathi');
    expect(within(card).getByText('Problem', { exact: true })).toBeVisible();
    expect(within(card).getByText(projects[0]!.architecture)).toBeVisible();
    expect(within(card).getByText(/Offline and ML behavior have not/)).toBeVisible();
    expect(within(card).getByRole('figure', { name: /not a UI screenshot/ })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Show more about AEO Pulse' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(within(card).getByText('Problem', { exact: true })).not.toBeVisible();
  });

  it.each([
    [/^Applied AI/i, 'ai'],
    [/^Systems/i, 'systems'],
    [/^Full-stack/i, 'fullstack'],
    [/^Web/i, 'web'],
  ] as const)(
    'filters the %s domain and restores the older collection too',
    async (label, category) => {
      const user = userEvent.setup();
      render(<Projects />);
      await user.click(screen.getByRole('button', { name: label }));
      const expected = projects.filter((project) => project.category === category);
      await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(expected.length), {
        timeout: 2000,
      });
      expected.forEach((project) =>
        expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument(),
      );
      expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true');
      await user.click(screen.getByRole('button', { name: /Show all 11 projects/ }));
      await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(11), {
        timeout: 2000,
      });
    },
  );

  it('retains the four featured builds in their original priority order', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    await user.click(screen.getByRole('button', { name: /^Featured/ }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(4));
    expect(
      screen.getAllByRole('article').map((card) => card.getAttribute('aria-labelledby')),
    ).toEqual(flagships.map((project) => `${project.id}-title`));
  });

  it('keeps demo and source availability honest, including the older failed deployments', () => {
    render(<Projects />);
    projects.forEach((project) => {
      const card = screen.getByRole('article', { name: project.title });
      if (project.demo.availability !== 'unavailable') {
        const demo = within(card).getByRole('link', { name: `Live Demo: ${project.title}` });
        expect(demo).toHaveAttribute('href', project.demo.url);
        expect(demo).toHaveAttribute('rel', 'noopener noreferrer');
      } else {
        expect(within(card).getByRole('button', { name: /Live Demo/ })).toBeDisabled();
        expect(within(card).queryByRole('link', { name: /Live Demo/ })).not.toBeInTheDocument();
      }
      expect(within(card).getByRole('button', { name: /GitHub/ })).toBeDisabled();
      expect(within(card).queryByRole('link', { name: /^GitHub/ })).not.toBeInTheDocument();
      const request = within(card).getByRole('link', {
        name: `Request source access for ${project.title}`,
      });
      expect(new URL(request.getAttribute('href')!).searchParams.get('subject')).toContain(
        project.title,
      );
    });
  });

  it('honors published project order and visibility', () => {
    const content = structuredClone(defaultContent);
    content.projects = [content.projects[4]!, content.projects[0]!];
    content.projects[1]!.visible = false;
    render(
      <SiteContext.Provider
        value={{ content, revision: 'test', previewMode: false, loadError: null }}
      >
        <Projects />
      </SiteContext.Provider>,
    );
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Venus AI' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Kisan Sathi' })).not.toBeInTheDocument();
  });
});

describe('genuine project UI captures', () => {
  const project = {
    ...projects[0]!,
    screenshot: {
      src: '/projects/supplied-ui.webp',
      alt: 'Supplied Kisan Sathi working UI',
      width: 1280,
      height: 720,
      capturedOn: '2026-11-11',
    },
  };
  it('can display a real supplied screenshot with dimensions, alt text, and date', () => {
    render(<ProjectPreview project={project} index={0} />);
    const image = screen.getByRole('img', { name: project.screenshot.alt });
    expect(image).toHaveAttribute('src', project.screenshot.src);
    expect(image).toHaveAttribute('width', '1280');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(screen.getByText(/Working-UI capture · 2026-11-11/)).toBeInTheDocument();
  });
  it('falls back honestly instead of leaving a broken image frame', () => {
    render(<ProjectPreview project={project} index={0} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('UI capture unavailable')).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: /not a UI screenshot/ })).toBeInTheDocument();
  });
});

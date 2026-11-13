import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectCover from './ProjectCover';
import { projects } from '../data/portfolio';

const kisan = projects[0]!;
describe('simple project card images', () => {
  it('shows a descriptive built-in illustration without claiming it is a UI capture', () => {
    render(<ProjectCover project={kisan} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/projects/kisan-sathi.svg');
    expect(screen.getByRole('img')).toHaveAccessibleName(/sprout.*illustration/i);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
    expect(screen.getByText('Illustration')).toBeVisible();
    expect(screen.queryByText(/Working-UI capture/)).not.toBeInTheDocument();
  });
  it('gives a newly added project a category illustration too', () => {
    render(<ProjectCover project={{ ...kisan, id: 'new-ai-project', title: 'New AI project' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/projects/venus-ai.svg');
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /New AI project; not a product screenshot/,
    );
  });
  it('uses the owner’s custom image and alternative text independently of screenshot evidence', () => {
    render(
      <ProjectCover
        project={{
          ...kisan,
          coverImage: {
            src: 'https://example.com/cover.webp',
            alt: 'An owner-supplied project illustration.',
          },
        }}
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/cover.webp');
    expect(screen.getByRole('img')).toHaveAccessibleName('An owner-supplied project illustration.');
    expect(screen.getByText('Project image')).toBeVisible();
  });
  it('recovers from missing custom/built-in images without looping or leaving broken image frames', () => {
    render(
      <ProjectCover
        project={{ ...kisan, coverImage: { src: '/projects/missing.webp', alt: 'Missing image.' } }}
      />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', '/projects/kisan-sathi.svg');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', '/projects/venus-ai.svg');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAccessibleName('Kisan Sathi image unavailable');
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText('Project image unavailable')).toBeVisible();
  });
  it('does not load an invalid image URL from the unsaved admin working copy', () => {
    render(
      <ProjectCover
        project={{ ...kisan, coverImage: { src: 'javascript:alert(1)', alt: 'Unsafe URL.' } }}
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', '/projects/kisan-sathi.svg');
  });
});

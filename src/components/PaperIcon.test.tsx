import { render, screen } from '@testing-library/react';
import { Code2 } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import PaperIcon from './PaperIcon';

describe('decorative paper icon prints', () => {
  it.each([
    [0, '01', 'sage'],
    [3, '04', 'rose'],
    [4, '05', 'sage'],
    [11, '12', 'rose'],
  ] as const)(
    'numbers print %i without creating an accessible image or a content claim',
    (index, label, tone) => {
      const { container } = render(<PaperIcon icon={Code2} index={Number(index)} />);
      const mount = container.querySelector('.paper-illustration');
      expect(mount).toHaveAttribute('aria-hidden', 'true');
      expect(mount).toHaveAttribute('data-tone', tone);
      expect(mount?.querySelector('.paper-index')).toHaveTextContent(String(label));
      expect(mount?.querySelector('.paper-print svg')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(container.querySelector('img, a, button')).toBeNull();
    },
  );

  it('can render an unnumbered compact decoration without adding layout-specific markup', () => {
    const { container } = render(<PaperIcon icon={Code2} className="compact-print" />);
    expect(container.querySelector('.paper-mount')).toHaveClass('compact-print');
    expect(container.querySelector('.paper-index')).toBeNull();
  });
});

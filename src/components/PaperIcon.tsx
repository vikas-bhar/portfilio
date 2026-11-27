import type { LucideIcon } from 'lucide-react';

/** A decorative mounted print, not a project image, screenshot, or new content claim. */
export default function PaperIcon({
  icon: Icon,
  index,
  className = '',
}: {
  icon: LucideIcon;
  index?: number;
  className?: string;
}) {
  return (
    <div
      className={`paper-illustration paper-mount ${className}`}
      data-tone={['sage', 'lavender', 'ochre', 'rose'][(index ?? 0) % 4]}
      aria-hidden="true"
    >
      {index !== undefined && (
        <span className="paper-index">{String(index + 1).padStart(2, '0')}</span>
      )}
      <div className="paper-print">
        <div className="paper-icon-art">
          <Icon size={66} strokeWidth={1.25} />
        </div>
      </div>
    </div>
  );
}

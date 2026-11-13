import { useState } from 'react';
import { Activity, ArrowRight, Camera, Shield, ShoppingBag, Sprout } from 'lucide-react';
import type { Project } from '../data/portfolio';

const icons = {
  'kisan-sathi': Sprout,
  'aeo-pulse': Activity,
  focuspulse: Shield,
  'rasa-direct-ordering': ShoppingBag,
};

/** Diagrams are explicitly not screenshots. Only an actual supplied capture renders as an image. */
export default function ProjectPreview({ project, index }: { project: Project; index: number }) {
  const [captureFailed, setCaptureFailed] = useState(false);
  const capture = project.screenshot;
  const Icon = icons[project.id as keyof typeof icons] ?? Activity;

  if (capture && !captureFailed) {
    return (
      <figure className="project-preview project-capture">
        <img
          src={capture.src}
          alt={capture.alt}
          width={capture.width}
          height={capture.height}
          loading="lazy"
          decoding="async"
          onError={() => setCaptureFailed(true)}
        />
        <figcaption className="mono">Working-UI capture · {capture.capturedOn}</figcaption>
      </figure>
    );
  }

  return (
    <figure
      className={`project-preview architecture-preview preview-${project.id}`}
      aria-label={`${project.title} architecture diagram, not a UI screenshot`}
    >
      <div className="preview-topline mono">
        <span>ARCHITECTURE MAP</span>
        <span>CASE / 0{index + 1}</span>
      </div>
      <div className="architecture-flow" aria-label="Architecture stages">
        <span className="architecture-icon">
          <Icon size={24} strokeWidth={1.4} aria-hidden="true" />
        </span>
        <ol>
          {project.stages.map((stage, stageIndex) => (
            <li key={stage.label}>
              <span className="architecture-node">
                <strong>{stage.label}</strong>
                <span>{stage.detail}</span>
              </span>
              {stageIndex < project.stages.length - 1 && (
                <ArrowRight className="architecture-arrow" size={15} aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="preview-caption">
        <Camera size={13} aria-hidden="true" />
        <span>
          <strong>{captureFailed ? 'UI capture unavailable' : 'Working-UI capture pending'}</strong>
          <span>Architecture diagram—not a screenshot.</span>
        </span>
      </figcaption>
    </figure>
  );
}

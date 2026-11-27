import { projectExcerpt } from '../lib/projects';
import { useState } from 'react';
import { ArrowUpRight, Camera, ChevronUp, Star } from 'lucide-react';
import type { Project } from '../data/portfolio';
import ProjectPreview from './ProjectPreview';
import ProjectCover from './ProjectCover';
import ProjectActions from './ProjectActions';

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const details = [
    { label: 'Problem', value: project.problem },
    { label: 'Architecture', value: project.architecture },
    { label: 'Impact', value: project.impact },
  ].filter((entry) => entry.value);

  return (
    <article
      className={`project-card compact-project-card paper-card project-file ${expanded ? 'is-expanded' : ''}`}
      aria-labelledby={`${project.id}-title`}
    >
      <div className="project-file-summary">
        <div className="project-file-visual paper-mount">
          <span className="project-index paper-index mono" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="project-artwork paper-print">
            {project.screenshot ? (
              <ProjectPreview project={project} index={index} />
            ) : (
              <ProjectCover project={project} />
            )}
          </div>
        </div>
        <div className="project-card-content">
          <div className="project-caption-top">
            <p className="project-kind paper-label">{project.kind}</p>
            {project.featured && (
              <Star size={14} className="featured-star" aria-label="Featured project" />
            )}
          </div>
          <div className="project-title-row">
            <h3 id={`${project.id}-title`}>{project.title}</h3>
          </div>
          <p className="project-description">
            {expanded ? project.description : projectExcerpt(project.description)}
          </p>
          <ul className="tech-tags paper-chips" aria-label={`${project.title} technology stack`}>
            {(expanded ? project.tags : project.tags.slice(0, 4)).map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
            {!expanded && project.tags.length > 4 && <li>+{project.tags.length - 4}</li>}
          </ul>
          <button
            type="button"
            className="project-read-more"
            onClick={() => setExpanded((value) => !value)}
            aria-label={`${expanded ? 'Show less' : 'Show more'} about ${project.title}`}
            aria-expanded={expanded}
            aria-controls={`${project.id}-details`}
          >
            <span>{expanded ? 'Show less' : 'Show more'}</span>
            <span className="project-open-icon" aria-hidden="true">
              {expanded ? <ChevronUp size={18} /> : <ArrowUpRight size={18} />}
            </span>
          </button>
        </div>
      </div>
      <div id={`${project.id}-details`} className="project-expanded-details" hidden={!expanded}>
        {project.context && <p className="project-context">{project.context}</p>}
        {details.length > 0 && (
          <dl className="case-study-details">
            {details.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {!project.screenshot &&
          (project.stages.length ? (
            <ProjectPreview project={project} index={index} />
          ) : (
            <p className="project-capture-missing">
              <Camera size={14} aria-hidden="true" /> Working-UI capture not yet supplied.
            </p>
          ))}
        {project.evidenceNote && (
          <p className="project-verification-note">
            <strong>Verification note.</strong> {project.evidenceNote}
          </p>
        )}
      </div>
      <ProjectActions project={project} expanded={expanded} />
    </article>
  );
}

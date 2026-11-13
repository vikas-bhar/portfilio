import { projectExcerpt } from '../lib/projects';
import { useState } from 'react';
import { Camera, ChevronDown, ChevronUp, Star } from 'lucide-react';
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
      className={`project-card compact-project-card ${expanded ? 'is-expanded' : ''}`}
      aria-labelledby={`${project.id}-title`}
    >
      {project.screenshot ? (
        <ProjectPreview project={project} index={index} />
      ) : (
        <ProjectCover project={project} />
      )}
      <div className="project-card-content">
        <p className="project-kind">{project.kind}</p>
        <div className="project-title-row">
          <h3 id={`${project.id}-title`}>{project.title}</h3>
          {project.featured && (
            <Star size={14} className="featured-star" aria-label="Featured project" />
          )}
        </div>
        <p className="project-description">
          {expanded ? project.description : projectExcerpt(project.description)}
        </p>
        <ul className="tech-tags" aria-label={`${project.title} technology stack`}>
          {(expanded ? project.tags : project.tags.slice(0, 3)).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
          {!expanded && project.tags.length > 3 && <li>+{project.tags.length - 3}</li>}
        </ul>
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
        <button
          type="button"
          className="project-read-more"
          onClick={() => setExpanded((value) => !value)}
          aria-label={`${expanded ? 'Show less' : 'Show more'} about ${project.title}`}
          aria-expanded={expanded}
          aria-controls={`${project.id}-details`}
        >
          {expanded ? 'Show less' : 'Show more'}
          {expanded ? (
            <ChevronUp size={14} aria-hidden="true" />
          ) : (
            <ChevronDown size={14} aria-hidden="true" />
          )}
        </button>
        <ProjectActions project={project} expanded={expanded} />
      </div>
    </article>
  );
}

import { ArrowUpRight, LockKeyhole, Mail } from 'lucide-react';
import { Github } from './SocialIcons';
import type { Project } from '../data/portfolio';
import { useSiteContent } from '../hooks/useSiteContent';
import { createSourceRequestLink } from '../lib/projects';

export default function ProjectActions({
  project,
  expanded = false,
}: {
  project: Project;
  expanded?: boolean;
}) {
  const { content } = useSiteContent();
  const sourceAvailable = project.source.availability === 'public';
  return (
    <div className="project-actions-area">
      <div className="project-actions">
        {project.demo.availability !== 'unavailable' ? (
          <a
            href={project.demo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-primary button-small"
            aria-label={`Live Demo: ${project.title}`}
          >
            Live Demo <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        ) : (
          <button
            type="button"
            className="button button-secondary button-small"
            disabled
            title={project.demo.reason}
            aria-describedby={`${project.id}-availability`}
          >
            Live Demo · unavailable
          </button>
        )}
        {project.source.availability === 'public' ? (
          <a
            href={project.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-secondary button-small"
            aria-label={`GitHub: ${project.title}`}
          >
            <Github size={14} aria-hidden="true" /> GitHub{' '}
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        ) : (
          <button
            type="button"
            className="button button-secondary button-small"
            disabled
            title={project.source.reason}
            aria-describedby={`${project.id}-availability`}
          >
            <LockKeyhole size={13} aria-hidden="true" /> GitHub ·{' '}
            {project.source.availability === 'private' ? 'private' : 'unverified'}
          </button>
        )}
        {!sourceAvailable && (
          <a
            className="project-source-request text-link"
            href={createSourceRequestLink(project.title, content.profile)}
            aria-label={`Request source access for ${project.title}`}
          >
            <Mail size={12} aria-hidden="true" /> Request access
          </a>
        )}
      </div>
      <p id={`${project.id}-availability`} className="project-availability" hidden={!expanded}>
        {project.demo.availability === 'verified'
          ? `Public page checked ${project.demo.verifiedOn}. `
          : project.demo.availability === 'unverified'
            ? 'Provided URL—not independently checked. '
            : 'Public demo unavailable. '}
        {project.source.availability === 'private'
          ? 'Private source—available on request.'
          : project.source.availability === 'unverified'
            ? 'Source link pending verification.'
            : 'Public source available.'}
      </p>
    </div>
  );
}

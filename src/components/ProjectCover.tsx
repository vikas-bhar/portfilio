import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { Project } from '../lib/site-schema';
import { projectCoverImageSchema } from '../lib/site-schema';
import { categoryIllustration, projectIllustration } from '../lib/project-images';

/** A thematic card image is not evidence of a working UI. Real captures remain separate. */
export default function ProjectCover({ project }: { project: Project }) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const custom = projectCoverImageSchema.safeParse(project.coverImage);
  const candidates = [
    ...(custom.success ? [{ ...custom.data, custom: true }] : []),
    { ...projectIllustration(project), custom: false },
    { ...categoryIllustration(project), custom: false },
  ];
  const image = candidates.find((candidate) => !failedSources.includes(candidate.src));
  return (
    <figure className="project-cover" aria-label={`${project.title} project image`}>
      {image ? (
        <img
          src={image.src}
          alt={image.alt}
          width={800}
          height={480}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSources((previous) => [...previous, image.src])}
        />
      ) : (
        <div
          className="project-cover-fallback"
          role="img"
          aria-label={`${project.title} image unavailable`}
        >
          <ImageOff size={40} strokeWidth={1.2} aria-hidden="true" />
          <span>Project image unavailable</span>
        </div>
      )}
      <figcaption>{image?.custom ? 'Project image' : 'Illustration'}</figcaption>
    </figure>
  );
}

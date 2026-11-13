import { useState } from 'react';
import { ArrowUpRight, Box } from 'lucide-react';
import { Github } from './SocialIcons';
import { AnimatePresence, motion } from 'motion/react';
import type { ProjectCategory } from '../data/portfolio';
import ProjectCard from './ProjectCard';
import TiltCard from './TiltCard';
import Floating3DWrapper from './Floating3DWrapper';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useSiteContent } from '../hooks/useSiteContent';

const filters = [
  { id: 'featured', label: 'Featured' },
  { id: 'all', label: 'All projects' },
  { id: 'ai', label: 'Applied AI' },
  { id: 'systems', label: 'Systems' },
  { id: 'fullstack', label: 'Full-stack' },
  { id: 'web', label: 'Web' },
] as const;
export default function Projects() {
  const { content } = useSiteContent();
  const { profile, copy } = content;
  const projects = content.projects.filter((project) => project.visible);
  const [activeFilter, setActiveFilter] = useState<'featured' | 'all' | ProjectCategory>('all');
  const reducedMotion =
    useMediaQuery('(prefers-reduced-motion: reduce)') || !content.settings.animations;
  const matches = (filter: typeof activeFilter, project: (typeof projects)[number]) =>
    filter === 'all' || (filter === 'featured' ? project.featured : project.category === filter);
  const visibleProjects = projects.filter((project) => matches(activeFilter, project));
  return (
    <section id="project" className="section work-section" aria-labelledby="work-heading">
      <div className="container">
        <div className="section-heading">
          <div>
            <Floating3DWrapper depth={22} tiltIntensity={16} floatAmplitude={5}>
              <p className="eyebrow section-eyebrow">
                <span>01</span>
                {copy.workEyebrow}
                <Box size={13} className="motion-spin" aria-hidden="true" />
              </p>
            </Floating3DWrapper>
            <Floating3DWrapper depth={26} tiltIntensity={10} floatAmplitude={3} floatDelay={0.2}>
              <h2 id="work-heading">
                {copy.workTitle}
                <br />
                <em>{copy.workAccent}</em>
              </h2>
            </Floating3DWrapper>
          </div>
          <Floating3DWrapper depth={12} tiltIntensity={6} floatAmplitude={2} floatDelay={0.4}>
            <p className="section-description">{copy.workSummary}</p>
          </Floating3DWrapper>
        </div>
        <div className="project-toolbar">
          <div className="project-filters" role="group" aria-label="Filter projects">
            {filters.map((filter, index) => (
              <Floating3DWrapper
                key={filter.id}
                depth={activeFilter === filter.id ? 22 : 12}
                tiltIntensity={12}
                floatAmplitude={3}
                floatDelay={index * 0.15}
              >
                <button
                  className={`filter-button ${activeFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter.id)}
                  aria-pressed={activeFilter === filter.id}
                  aria-controls="project-grid"
                >
                  {filter.label}
                  <span className="mono">
                    {String(
                      projects.filter((project) => matches(filter.id, project)).length,
                    ).padStart(2, '0')}
                  </span>
                </button>
              </Floating3DWrapper>
            ))}
          </div>
          <span className="project-total mono" aria-live="polite" aria-atomic="true">
            {String(visibleProjects.length).padStart(2, '0')} /{' '}
            {String(projects.length).padStart(2, '0')} PROJECTS
          </span>
        </div>
        <motion.div layout={!reducedMotion} className="project-grid" id="project-grid">
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout={!reducedMotion}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.9, y: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.9, y: reducedMotion ? 0 : 25 }}
                transition={
                  reducedMotion ? { duration: 0 } : { duration: 0.35, delay: index * 0.04 }
                }
              >
                <TiltCard
                  maxTilt={14}
                  scale={1.04}
                  glareOpacity={0.22}
                  perspective={1200}
                  floating
                  floatDelay={index * 0.25}
                >
                  <ProjectCard project={project} index={projects.indexOf(project)} />
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {!visibleProjects.length && (
          <p className="project-empty" role="status">
            No published projects in this category yet. Choose All projects to explore the
            collection.
          </p>
        )}
        <div className="project-footer">
          {activeFilter !== 'all' && (
            <button
              className="button button-secondary button-small"
              onClick={() => setActiveFilter('all')}
            >
              Show all {projects.length} projects <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          )}
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-link">
            <Github size={16} aria-hidden="true" />
            GitHub profile
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href={`mailto:${profile.email}`} className="text-link">
            Request a project walkthrough
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

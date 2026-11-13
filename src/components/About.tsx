import { ArrowUpRight, Code2, Network, ScanLine, Sparkles } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import Floating3DWrapper from './Floating3DWrapper';
import TiltCard from './TiltCard';

export default function About() {
  const { content } = useSiteContent();
  const { profile, copy } = content;
  const projects = content.projects.filter((project) => project.visible && project.featured);
  const icons = [ScanLine, Network, Code2];
  const focusAreas = content.focusAreas.map((area, index) => ({
    ...area,
    Icon: icons[index % icons.length]!,
  }));
  const contactVisible = content.sections.some(
    (section) => section.id === 'contact' && section.visible,
  );
  return (
    <section id="about-me" className="section about-section" aria-labelledby="about-heading">
      <div className="container">
        <Floating3DWrapper
          className="about-eyebrow-float"
          depth={20}
          tiltIntensity={14}
          floatAmplitude={4}
        >
          <p className="eyebrow section-eyebrow">
            <span>03</span> {copy.aboutEyebrow}
            <Sparkles size={13} className="motion-spin" aria-hidden="true" />
          </p>
        </Floating3DWrapper>
        <div className="about-grid">
          <div className="about-visual">
            <div className="about-stat-row">
              <Floating3DWrapper depth={25} tiltIntensity={15} floatAmplitude={5}>
                <div className="about-stat">
                  <strong>{String(projects.length).padStart(2, '0')}</strong>
                  <span className="stat-label">Flagship case studies</span>
                </div>
              </Floating3DWrapper>
              <span className="about-stat-divider" aria-hidden="true" />
              <Floating3DWrapper depth={25} tiltIntensity={15} floatAmplitude={5} floatDelay={0.2}>
                <div className="about-stat">
                  <strong>
                    0 <span>→</span> 1
                  </strong>
                  <span className="stat-label">End-to-end ownership</span>
                </div>
              </Floating3DWrapper>
            </div>
            <div className="focus-areas">
              {focusAreas.map(({ Icon, title, description }, index) => (
                <TiltCard
                  key={title}
                  maxTilt={16}
                  scale={1.05}
                  glareOpacity={0.25}
                  perspective={1200}
                  floating
                  floatDelay={index * 0.3}
                >
                  <div className="focus-area">
                    <span className="focus-icon">
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
          <div className="about-copy">
            <Floating3DWrapper depth={24} tiltIntensity={8} floatAmplitude={3} floatDelay={0.2}>
              <h2 id="about-heading">
                {copy.aboutTitle}
                <br />
                <em>{copy.aboutAccent}</em>
              </h2>
            </Floating3DWrapper>
            <Floating3DWrapper depth={12} tiltIntensity={6} floatAmplitude={2} floatDelay={0.4}>
              <div className="about-description">
                {profile.about.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>
                    {paragraph
                      .split(/(Vision Start)/g)
                      .map((part, partIndex) =>
                        part === 'Vision Start' ? <strong key={partIndex}>{part}</strong> : part,
                      )}
                  </p>
                ))}
              </div>
            </Floating3DWrapper>
            <Floating3DWrapper depth={18} tiltIntensity={10} floatAmplitude={3} floatDelay={0.6}>
              <a
                href={contactVisible ? '#contact' : `mailto:${profile.email}`}
                className="text-link about-link"
              >
                {copy.aboutLink} <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </Floating3DWrapper>
          </div>
        </div>
      </div>
    </section>
  );
}

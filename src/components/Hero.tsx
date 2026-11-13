import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUpRight,
  Braces,
  Code2,
  ChevronDown,
  Cpu,
  Mail,
  Rocket,
  ScanLine,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Github, Linkedin } from './SocialIcons';
import { Fragment } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import Floating3DWrapper from './Floating3DWrapper';

interface HeroProps {
  onOpenResume: () => void;
}

export default function Hero({ onOpenResume }: HeroProps) {
  const { content } = useSiteContent();
  const { profile, copy } = content;
  const roleLines = profile.role
    .replace(' & ', ' &\n')
    .replace(' Product Engineer', '\nProduct Engineer')
    .split('\n');
  const pathIcons = [ScanLine, Code2, Rocket];
  const projectsVisible = content.sections.some(
    (section) => section.id === 'project' && section.visible,
  );
  const contactVisible = content.sections.some(
    (section) => section.id === 'contact' && section.visible,
  );
  return (
    <section id="home" className="hero" aria-labelledby="hero-heading">
      <div className="container hero-container">
        <div className="hero-grid">
          <div className="hero-copy">
            <Floating3DWrapper depth={25} tiltIntensity={18} floatAmplitude={6} floatDuration={3}>
              <div className="availability">
                <span className="status-dot" aria-hidden="true" />
                {copy.availability}
                <Sparkles size={13} className="motion-spin" aria-hidden="true" />
              </div>
            </Floating3DWrapper>
            <Floating3DWrapper
              depth={20}
              tiltIntensity={8}
              floatAmplitude={3}
              floatDuration={5}
              floatDelay={0.5}
            >
              <p className="eyebrow hero-eyebrow">{copy.heroEyebrow}</p>
            </Floating3DWrapper>
            <Floating3DWrapper depth={30} tiltIntensity={10} floatAmplitude={4} floatDuration={4.5}>
              <h1 id="hero-heading">
                <span className="hero-name">{profile.name} —</span>{' '}
                {roleLines.map((line, index) => (
                  <Fragment key={index}>
                    {index > 0 && (
                      <>
                        {' '}
                        <br />
                      </>
                    )}
                    {index === roleLines.length - 1 ? <em>{line}</em> : line}
                  </Fragment>
                ))}
              </h1>
            </Floating3DWrapper>
            <Floating3DWrapper
              depth={15}
              tiltIntensity={6}
              floatAmplitude={2.5}
              floatDuration={5.5}
              floatDelay={0.7}
            >
              <p className="hero-description">{profile.heroSummary}</p>
            </Floating3DWrapper>
            <div className="hero-buttons">
              <Floating3DWrapper
                depth={24}
                tiltIntensity={14}
                floatAmplitude={4}
                floatDuration={4.2}
                floatDelay={0.3}
              >
                <a
                  href={projectsVisible ? '#project' : profile.github}
                  className="button button-primary"
                >
                  View Featured Projects <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </Floating3DWrapper>
              <Floating3DWrapper depth={22} tiltIntensity={20} floatAmplitude={5}>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-secondary"
                >
                  <Github size={16} aria-hidden="true" /> GitHub
                </a>
              </Floating3DWrapper>
              <Floating3DWrapper
                depth={28}
                tiltIntensity={14}
                floatAmplitude={4}
                floatDuration={3.8}
              >
                <a
                  href={contactVisible ? '#contact' : `mailto:${profile.email}`}
                  className="button button-secondary"
                >
                  Get in Touch <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </Floating3DWrapper>
            </div>
            <div className="hero-secondary-actions">
              <Floating3DWrapper depth={18} tiltIntensity={10} floatAmplitude={3} floatDelay={0.3}>
                <a href={`mailto:${profile.email}`} className="text-link hero-email">
                  <Mail size={14} aria-hidden="true" /> {profile.email}
                </a>
              </Floating3DWrapper>
              <span className="action-divider" aria-hidden="true" />
              <Floating3DWrapper depth={18} tiltIntensity={10} floatAmplitude={3} floatDelay={0.6}>
                {content.settings.resumeEnabled && (
                  <button className="text-button" onClick={onOpenResume}>
                    <ArrowDownToLine size={15} aria-hidden="true" /> View résumé
                  </button>
                )}
              </Floating3DWrapper>
              <Floating3DWrapper depth={22} tiltIntensity={20} floatAmplitude={5} floatDelay={0.25}>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label={`${profile.name} on LinkedIn`}
                >
                  <Linkedin size={18} />
                </a>
              </Floating3DWrapper>
            </div>
          </div>

          <details className="hero-build-details">
            <summary>
              How I approach a project <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <aside className="hero-visual" aria-label="End-to-end product engineering">
              <div className="builder-coordinates mono" aria-hidden="true">
                <span>THE BUILD PATH</span>
                <span>00 → 01</span>
              </div>
              <div className="delivery-map">
                <div className="delivery-map-heading">
                  <span className="eyebrow">PROBLEM → PRODUCT</span>
                  <Braces size={24} strokeWidth={1.2} aria-hidden="true" />
                </div>
                <ol className="delivery-stages">
                  {content.buildPath
                    .map((stage, index) => ({
                      ...stage,
                      Icon: pathIcons[index % pathIcons.length]!,
                    }))
                    .map(({ Icon, title, detail }, index) => (
                      <li key={title}>
                        <span className="delivery-stage-icon">
                          <Icon size={19} strokeWidth={1.4} aria-hidden="true" />
                        </span>
                        <div>
                          <span className="mono delivery-step">0{index + 1}</span>
                          <strong>{title}</strong>
                          <p>{detail}</p>
                        </div>
                      </li>
                    ))}
                </ol>
                <p className="delivery-map-footer mono">
                  <span className="status-dot" aria-hidden="true" /> WEB / APPLIED AI / NATIVE
                  SYSTEMS
                </p>
              </div>
              <Floating3DWrapper
                className="hero-floating-note"
                depth={22}
                tiltIntensity={16}
                floatAmplitude={5}
              >
                <div className="builder-note">
                  <span className="builder-note-icon">
                    <Code2 size={22} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{copy.builderNoteTitle}</strong>
                    <span>{copy.builderNoteDetail}</span>
                  </span>
                </div>
              </Floating3DWrapper>
              <div className="builder-footnote mono">
                <span className="tiny-cross" aria-hidden="true">
                  +
                </span>
                CONSTRAINTS FIRST. FUNCTIONAL SOFTWARE ALWAYS.
              </div>
            </aside>
          </details>
        </div>

        <div className="hero-bottom">
          <a href={projectsVisible ? '#project' : '#main'} className="scroll-cue">
            <span className="scroll-cue-icon motion-bounce">
              <ArrowDown size={15} aria-hidden="true" />
            </span>
            <span className="mono">EXPLORE MY PROJECTS</span>
          </a>
          <div className="hero-stack" aria-label="Engineering domains">
            {[
              { Icon: Code2, text: 'Full-stack web' },
              { Icon: Cpu, text: 'Applied AI' },
              { Icon: Shield, text: 'Native systems' },
            ].map(({ Icon, text }, index) => (
              <Floating3DWrapper
                key={text}
                depth={15}
                tiltIntensity={12}
                floatAmplitude={4}
                floatDelay={index * 0.3}
              >
                <span className="hero-tech-pill">
                  <Icon size={13} aria-hidden="true" />
                  {text}
                </span>
              </Floating3DWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

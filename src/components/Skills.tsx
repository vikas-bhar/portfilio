import { BrainCircuit, Cloud, Code2, Shield } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import Floating3DWrapper from './Floating3DWrapper';
import TiltCard from './TiltCard';
import PaperIcon from './PaperIcon';

const icons = { ai: BrainCircuit, frontend: Code2, systems: Shield, cloud: Cloud };

export default function Skills() {
  const { content } = useSiteContent();
  const { skillGroups, copy } = content;
  return (
    <section id="my-skill" className="section skills-section" aria-labelledby="skills-heading">
      <div className="container">
        <div className="section-heading">
          <div>
            <Floating3DWrapper depth={20} tiltIntensity={14} floatAmplitude={4}>
              <p className="eyebrow section-eyebrow">
                <span>02</span> {copy.skillsEyebrow}
              </p>
            </Floating3DWrapper>
            <Floating3DWrapper depth={24} tiltIntensity={8} floatAmplitude={3} floatDelay={0.2}>
              <h2 id="skills-heading">
                {copy.skillsTitle}
                <br />
                <em>{copy.skillsAccent}</em>
              </h2>
            </Floating3DWrapper>
          </div>
          <Floating3DWrapper depth={12} tiltIntensity={6} floatAmplitude={2} floatDelay={0.4}>
            <p className="section-description">{copy.skillsSummary}</p>
          </Floating3DWrapper>
        </div>
        <div className="skills-grid">
          {skillGroups.map((group, index) => {
            const Icon = icons[group.id as keyof typeof icons] ?? Code2;
            return (
              <TiltCard
                key={group.id}
                maxTilt={14}
                scale={1.04}
                glareOpacity={0.22}
                floating
                floatDelay={index * 0.25}
              >
                <article
                  className="skill-card paper-card"
                  aria-labelledby={`capability-${group.id}`}
                >
                  <div className="skill-card-summary">
                    <PaperIcon icon={Icon} index={index} />
                    <div className="skill-card-copy">
                      <div className="skill-card-top">
                        <span className="mono paper-label">
                          PILLAR / {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 id={`capability-${group.id}`}>{group.title}</h3>
                      <p>{group.subtitle}</p>
                    </div>
                  </div>
                  <ul className="capability-list paper-chips">
                    {group.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </article>
              </TiltCard>
            );
          })}
        </div>
        <Floating3DWrapper
          depth={12}
          tiltIntensity={6}
          floatAmplitude={2}
          floatDelay={0.5}
          enableHoverDepth={false}
        >
          <div className="learning-note paper-card paper-card-note">
            <span className="status-dot" aria-hidden="true" />
            <span>{copy.skillsNote}</span>
            <span className="mono">WEB ↔ AI ↔ SYSTEMS ↔ CLOUD</span>
          </div>
        </Floating3DWrapper>
      </div>
    </section>
  );
}

import { BriefcaseBusiness, Flag, Users } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import Floating3DWrapper from './Floating3DWrapper';
import TiltCard from './TiltCard';

const icons = [BriefcaseBusiness, Flag, Users];

export default function Experience() {
  const { content } = useSiteContent();
  const { milestones, copy } = content;
  return (
    <section
      id="experience"
      className="section experience-section"
      aria-labelledby="experience-heading"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <Floating3DWrapper depth={20} tiltIntensity={14} floatAmplitude={4}>
              <p className="eyebrow section-eyebrow">
                <span>04</span> {copy.experienceEyebrow}
              </p>
            </Floating3DWrapper>
            <Floating3DWrapper depth={24} tiltIntensity={8} floatAmplitude={3} floatDelay={0.2}>
              <h2 id="experience-heading">
                {copy.experienceTitle}
                <br />
                <em>{copy.experienceAccent}</em>
              </h2>
            </Floating3DWrapper>
          </div>
          <Floating3DWrapper depth={12} tiltIntensity={6} floatAmplitude={2} floatDelay={0.4}>
            <p className="section-description">{copy.experienceSummary}</p>
          </Floating3DWrapper>
        </div>
        <div className="experience-grid">
          {milestones.map((milestone, index) => {
            const Icon = icons[index % icons.length]!;
            return (
              <TiltCard
                key={milestone.id}
                maxTilt={14}
                scale={1.04}
                glareOpacity={0.22}
                floating
                floatDelay={index * 0.25}
              >
                <article className="experience-card" aria-labelledby={`milestone-${milestone.id}`}>
                  <div className="experience-card-top">
                    <Icon size={22} strokeWidth={1.4} aria-hidden="true" />
                    <span className="eyebrow">{milestone.category}</span>
                  </div>
                  <h3 id={`milestone-${milestone.id}`}>{milestone.title}</h3>
                  <p className="experience-organization">{milestone.organization}</p>
                  <p className="experience-description">{milestone.description}</p>
                  <ul
                    className="milestone-highlights"
                    aria-label={`${milestone.title} focus areas`}
                  >
                    {milestone.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </article>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

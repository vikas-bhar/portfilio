import { Plus } from 'lucide-react';
import type { SiteContent } from '../lib/site-schema';
import { CheckField, Field, LinesField, MoveButtons, Panel, SelectField } from './Fields';
import { moveItem, uniqueId } from './helpers';
import type { ContentEditorProps } from './types';

export function ProfileEditor({ content, onChange }: ContentEditorProps) {
  const { profile } = content;
  const update = (patch: Partial<SiteContent['profile']>) =>
    onChange({ ...content, profile: { ...profile, ...patch } });
  return (
    <>
      <Panel
        title="Your profile"
        description="Shared by the hero, contact section, footer, metadata, and the live résumé."
      >
        <div className="admin-field-grid">
          <Field
            label="Full name"
            value={profile.name}
            onChange={(name) => update({ name })}
            path="profile.name"
            required
            maxLength={120}
          />
          <Field
            label="Professional role"
            value={profile.role}
            onChange={(role) => update({ role })}
            path="profile.role"
            required
            maxLength={160}
          />
          <Field
            label="Location"
            value={profile.location}
            onChange={(location) => update({ location })}
            path="profile.location"
            maxLength={180}
          />
          <Field
            label="Contact email"
            value={profile.email}
            onChange={(email) => update({ email })}
            path="profile.email"
            type="email"
            maxLength={254}
            required
          />
        </div>
        <Field
          label="Hero summary"
          value={profile.heroSummary}
          onChange={(heroSummary) => update({ heroSummary })}
          path="profile.heroSummary"
          area
          rows={4}
          maxLength={1500}
          required
        />
        <Field
          label="Résumé / professional summary"
          value={profile.summary}
          onChange={(summary) => update({ summary })}
          path="profile.summary"
          area
          rows={4}
          maxLength={3000}
          required
        />
        <p className="admin-field-help">
          Page headline:{' '}
          <strong>
            {profile.name} — {profile.role}
          </strong>
        </p>
      </Panel>
      <Panel
        title="Contact & profile links"
        description="Use complete HTTPS links. Email and GitHub remain one click away in the hero and footer."
      >
        <Field
          label="Portfolio URL / canonical address"
          value={profile.website}
          onChange={(website) => update({ website })}
          path="profile.website"
          type="url"
          maxLength={2000}
          required
        />
        <div className="admin-field-grid">
          <Field
            label="GitHub profile URL"
            value={profile.github}
            onChange={(github) => update({ github })}
            path="profile.github"
            type="url"
            maxLength={2000}
            required
          />
          <Field
            label="LinkedIn profile URL"
            value={profile.linkedin}
            onChange={(linkedin) => update({ linkedin })}
            path="profile.linkedin"
            type="url"
            maxLength={2000}
            required
          />
        </div>
        <p className="admin-inline-note">
          The contact form opens a prefilled email draft. This admin does not add an email-delivery
          service or store visitor messages.
        </p>
      </Panel>
      <Panel
        title="The build path"
        description="The editable steps in the portrait-free hero illustration."
        action={
          <button
            type="button"
            className="admin-button"
            disabled={content.buildPath.length >= 5}
            onClick={() =>
              onChange({
                ...content,
                buildPath: [...content.buildPath, { title: 'New step', detail: '' }],
              })
            }
          >
            <Plus size={14} aria-hidden="true" />
            Add step
          </button>
        }
      >
        {content.buildPath.map((step, index) => (
          <div className="admin-stage-row" key={index}>
            <Field
              label={`Step ${index + 1} title`}
              value={step.title}
              onChange={(title) =>
                onChange({
                  ...content,
                  buildPath: content.buildPath.map((item, i) =>
                    i === index ? { ...item, title } : item,
                  ),
                })
              }
              path={`buildPath.${index}.title`}
              maxLength={120}
            />
            <Field
              label={`Step ${index + 1} detail`}
              value={step.detail}
              onChange={(detail) =>
                onChange({
                  ...content,
                  buildPath: content.buildPath.map((item, i) =>
                    i === index ? { ...item, detail } : item,
                  ),
                })
              }
              path={`buildPath.${index}.detail`}
              maxLength={500}
            />
            <MoveButtons
              index={index}
              length={content.buildPath.length}
              label={`build step ${index + 1}`}
              onMove={(direction) =>
                onChange({ ...content, buildPath: moveItem(content.buildPath, index, direction) })
              }
              onRemove={
                content.buildPath.length > 1
                  ? () =>
                      onChange({
                        ...content,
                        buildPath: content.buildPath.filter((_, i) => i !== index),
                      })
                  : undefined
              }
            />
          </div>
        ))}
      </Panel>
    </>
  );
}

const copyGroups: { title: string; keys: (keyof SiteContent['copy'])[] }[] = [
  {
    title: 'Header & hero',
    keys: [
      'wordmark',
      'wordmarkSuffix',
      'availability',
      'heroEyebrow',
      'builderNoteTitle',
      'builderNoteDetail',
    ],
  },
  { title: 'Projects', keys: ['workEyebrow', 'workTitle', 'workAccent', 'workSummary'] },
  {
    title: 'Capabilities',
    keys: ['skillsEyebrow', 'skillsTitle', 'skillsAccent', 'skillsSummary', 'skillsNote'],
  },
  { title: 'About', keys: ['aboutEyebrow', 'aboutTitle', 'aboutAccent', 'aboutLink'] },
  {
    title: 'Experience',
    keys: ['experienceEyebrow', 'experienceTitle', 'experienceAccent', 'experienceSummary'],
  },
  {
    title: 'Contact',
    keys: [
      'contactEyebrow',
      'contactTitle',
      'contactAccent',
      'contactDescription',
      'contactAvailability',
    ],
  },
  { title: 'Footer', keys: ['footerTagline', 'footerSignoff'] },
];
const copyLabels: Record<keyof SiteContent['copy'], string> = {
  wordmark: 'Wordmark · main',
  wordmarkSuffix: 'Wordmark · suffix',
  availability: 'Availability badge',
  heroEyebrow: 'Hero eyebrow',
  builderNoteTitle: 'Builder note title',
  builderNoteDetail: 'Builder note detail',
  workEyebrow: 'Projects eyebrow',
  workTitle: 'Projects heading',
  workAccent: 'Projects italic heading',
  workSummary: 'Projects introduction',
  skillsEyebrow: 'Capabilities eyebrow',
  skillsTitle: 'Capabilities heading',
  skillsAccent: 'Capabilities italic heading',
  skillsSummary: 'Capabilities introduction',
  skillsNote: 'Capabilities closing note',
  aboutEyebrow: 'About eyebrow',
  aboutTitle: 'About heading',
  aboutAccent: 'About italic heading',
  aboutLink: 'About contact-link label',
  experienceEyebrow: 'Experience eyebrow',
  experienceTitle: 'Experience heading',
  experienceAccent: 'Experience italic heading',
  experienceSummary: 'Experience introduction',
  contactEyebrow: 'Contact eyebrow',
  contactTitle: 'Contact heading · first lines',
  contactAccent: 'Contact italic heading',
  contactDescription: 'Contact introduction',
  contactAvailability: 'Contact availability badge',
  footerTagline: 'Footer tagline',
  footerSignoff: 'Footer signoff',
};
export function SectionsEditor({ content, onChange }: ContentEditorProps) {
  return (
    <>
      <Panel
        title="Section order & visibility"
        description="Changes affect the page and its navigation together. Home stays first and visible."
      >
        <ol className="admin-section-list">
          {content.sections.map((section, index) => (
            <li key={section.id}>
              <span className="admin-project-position">{String(index + 1).padStart(2, '0')}</span>
              <Field
                label={`${section.id === 'home' ? 'Home' : section.id} navigation label`}
                value={section.label}
                onChange={(label) =>
                  onChange({
                    ...content,
                    sections: content.sections.map((item, i) =>
                      i === index ? { ...item, label } : item,
                    ),
                  })
                }
                path={`sections.${index}.label`}
                maxLength={40}
              />
              <CheckField
                label={`Show ${section.id === 'home' ? 'home' : section.label}`}
                checked={section.visible}
                onChange={(visible) =>
                  onChange({
                    ...content,
                    sections: content.sections.map((item, i) =>
                      i === index ? { ...item, visible } : item,
                    ),
                  })
                }
                disabled={section.id === 'home'}
              />
              <MoveButtons
                index={index}
                length={content.sections.length}
                minIndex={1}
                label={`${section.label} section`}
                onMove={(direction) =>
                  onChange({ ...content, sections: moveItem(content.sections, index, direction) })
                }
              />
            </li>
          ))}
        </ol>
      </Panel>
      <Panel
        title="Site copy"
        description="Edit headings, descriptions, availability, and branding without changing code. The italic line is a separate field."
      >
        <div className="admin-copy-groups">
          {copyGroups.map((group) => (
            <details key={group.title} open={group.title === 'Header & hero'}>
              <summary>
                {group.title}
                <span>{group.keys.length} fields</span>
              </summary>
              <div className="admin-field-grid">
                {group.keys.map((key) => (
                  <Field
                    key={key}
                    label={copyLabels[key]}
                    value={content.copy[key]}
                    onChange={(value) =>
                      onChange({ ...content, copy: { ...content.copy, [key]: value } })
                    }
                    path={`copy.${key}`}
                    maxLength={1500}
                    area={/Summary|Description|Title/.test(key) || key === 'heroEyebrow'}
                    rows={2}
                  />
                ))}
              </div>
            </details>
          ))}
        </div>
      </Panel>
    </>
  );
}

export function CapabilitiesEditor({ content, onChange }: ContentEditorProps) {
  return (
    <Panel
      title="Technical capabilities"
      description="Edit the grouped pillars, skills, and their order. These also feed the live résumé."
      action={
        <button
          type="button"
          className="admin-button"
          disabled={content.skillGroups.length >= 12}
          onClick={() =>
            onChange({
              ...content,
              skillGroups: [
                ...content.skillGroups,
                {
                  id: uniqueId('capability'),
                  title: 'New capability',
                  subtitle: '',
                  skills: ['New skill'],
                },
              ],
            })
          }
        >
          <Plus size={14} aria-hidden="true" />
          Add pillar
        </button>
      }
    >
      {content.skillGroups.map((group, index) => (
        <div className="admin-collection-card" key={group.id}>
          <div className="admin-subheading">
            <h3>{group.title || 'Untitled pillar'}</h3>
            <MoveButtons
              index={index}
              length={content.skillGroups.length}
              label={group.title}
              onMove={(direction) =>
                onChange({
                  ...content,
                  skillGroups: moveItem(content.skillGroups, index, direction),
                })
              }
              onRemove={
                content.skillGroups.length > 1
                  ? () => {
                      if (
                        window.confirm(`Remove the “${group.title}” pillar from this working copy?`)
                      )
                        onChange({
                          ...content,
                          skillGroups: content.skillGroups.filter((_, i) => i !== index),
                        });
                    }
                  : undefined
              }
            />
          </div>
          <div className="admin-field-grid">
            <Field
              label="Pillar title"
              value={group.title}
              onChange={(title) =>
                onChange({
                  ...content,
                  skillGroups: content.skillGroups.map((item, i) =>
                    i === index ? { ...item, title } : item,
                  ),
                })
              }
              path={`skillGroups.${index}.title`}
              maxLength={160}
              required
            />
            <Field
              label="Pillar subtitle"
              value={group.subtitle}
              onChange={(subtitle) =>
                onChange({
                  ...content,
                  skillGroups: content.skillGroups.map((item, i) =>
                    i === index ? { ...item, subtitle } : item,
                  ),
                })
              }
              path={`skillGroups.${index}.subtitle`}
              maxLength={500}
            />
          </div>
          <LinesField
            label="Skills"
            value={group.skills}
            onChange={(skills) =>
              onChange({
                ...content,
                skillGroups: content.skillGroups.map((item, i) =>
                  i === index ? { ...item, skills } : item,
                ),
              })
            }
            path={`skillGroups.${index}.skills`}
            rows={5}
            help="One per line, up to 24 skills in this pillar."
          />
        </div>
      ))}
    </Panel>
  );
}

export function StoryEditor({ content, onChange }: ContentEditorProps) {
  return (
    <>
      <Panel
        title="About you"
        description="Short, practical paragraphs. No invented dates, awards, or results."
        action={
          <button
            type="button"
            className="admin-button"
            disabled={content.profile.about.length >= 8}
            onClick={() =>
              onChange({
                ...content,
                profile: { ...content.profile, about: [...content.profile.about, ''] },
              })
            }
          >
            <Plus size={14} aria-hidden="true" />
            Add paragraph
          </button>
        }
      >
        {content.profile.about.map((paragraph, index) => (
          <div className="admin-paragraph-row" key={index}>
            <Field
              label={`About paragraph ${index + 1}`}
              value={paragraph}
              onChange={(value) =>
                onChange({
                  ...content,
                  profile: {
                    ...content.profile,
                    about: content.profile.about.map((item, i) => (i === index ? value : item)),
                  },
                })
              }
              path={`profile.about.${index}`}
              area
              rows={3}
              maxLength={2000}
            />
            <MoveButtons
              index={index}
              length={content.profile.about.length}
              label={`paragraph ${index + 1}`}
              onMove={(direction) =>
                onChange({
                  ...content,
                  profile: {
                    ...content.profile,
                    about: moveItem(content.profile.about, index, direction),
                  },
                })
              }
              onRemove={
                content.profile.about.length > 1
                  ? () =>
                      onChange({
                        ...content,
                        profile: {
                          ...content.profile,
                          about: content.profile.about.filter((_, i) => i !== index),
                        },
                      })
                  : undefined
              }
            />
          </div>
        ))}
      </Panel>
      <Panel
        title="Engineering principles"
        description="The focus cards next to your About section."
        action={
          <button
            type="button"
            className="admin-button"
            disabled={content.focusAreas.length >= 6}
            onClick={() =>
              onChange({
                ...content,
                focusAreas: [...content.focusAreas, { title: 'New principle', description: '' }],
              })
            }
          >
            <Plus size={14} aria-hidden="true" />
            Add principle
          </button>
        }
      >
        {content.focusAreas.map((area, index) => (
          <div className="admin-collection-card" key={index}>
            <div className="admin-subheading">
              <h3>Principle {index + 1}</h3>
              <MoveButtons
                index={index}
                length={content.focusAreas.length}
                label={`principle ${index + 1}`}
                onMove={(direction) =>
                  onChange({
                    ...content,
                    focusAreas: moveItem(content.focusAreas, index, direction),
                  })
                }
                onRemove={() =>
                  onChange({
                    ...content,
                    focusAreas: content.focusAreas.filter((_, i) => i !== index),
                  })
                }
              />
            </div>
            <Field
              label="Principle title"
              value={area.title}
              onChange={(title) =>
                onChange({
                  ...content,
                  focusAreas: content.focusAreas.map((item, i) =>
                    i === index ? { ...item, title } : item,
                  ),
                })
              }
              path={`focusAreas.${index}.title`}
              maxLength={160}
            />
            <Field
              label="Principle description"
              value={area.description}
              onChange={(description) =>
                onChange({
                  ...content,
                  focusAreas: content.focusAreas.map((item, i) =>
                    i === index ? { ...item, description } : item,
                  ),
                })
              }
              path={`focusAreas.${index}.description`}
              area
              maxLength={1500}
            />
          </div>
        ))}
      </Panel>
      <Panel
        title="Experience & milestones"
        description="Keep roles, ventures, communities, and submissions distinct from verified awards."
        action={
          <button
            type="button"
            className="admin-button"
            disabled={content.milestones.length >= 30}
            onClick={() =>
              onChange({
                ...content,
                milestones: [
                  ...content.milestones,
                  {
                    id: uniqueId('milestone'),
                    title: 'New milestone',
                    category: '',
                    organization: '',
                    description: '',
                    highlights: [],
                  },
                ],
              })
            }
          >
            <Plus size={14} aria-hidden="true" />
            Add milestone
          </button>
        }
      >
        {content.milestones.map((milestone, index) => (
          <div className="admin-collection-card" key={milestone.id}>
            <div className="admin-subheading">
              <h3>{milestone.title || 'Untitled milestone'}</h3>
              <MoveButtons
                index={index}
                length={content.milestones.length}
                label={milestone.title}
                onMove={(direction) =>
                  onChange({
                    ...content,
                    milestones: moveItem(content.milestones, index, direction),
                  })
                }
                onRemove={() => {
                  if (window.confirm(`Remove “${milestone.title}” from this working copy?`))
                    onChange({
                      ...content,
                      milestones: content.milestones.filter((_, i) => i !== index),
                    });
                }}
              />
            </div>
            {(['title', 'category', 'organization', 'description'] as const).map((key) => (
              <Field
                key={key}
                label={key === 'organization' ? 'Organization / context' : `Milestone ${key}`}
                value={milestone[key]}
                onChange={(value) =>
                  onChange({
                    ...content,
                    milestones: content.milestones.map((item, i) =>
                      i === index ? { ...item, [key]: value } : item,
                    ),
                  })
                }
                path={`milestones.${index}.${key}`}
                area={key === 'description'}
                maxLength={key === 'description' ? 3000 : key === 'organization' ? 300 : 200}
              />
            ))}
            <LinesField
              label="Milestone highlights"
              value={milestone.highlights}
              onChange={(highlights) =>
                onChange({
                  ...content,
                  milestones: content.milestones.map((item, i) =>
                    i === index ? { ...item, highlights } : item,
                  ),
                })
              }
              path={`milestones.${index}.highlights`}
              rows={3}
              help="One per line, up to 16."
            />
          </div>
        ))}
      </Panel>
    </>
  );
}

export function AppearanceEditor({ content, onChange }: ContentEditorProps) {
  const { settings } = content;
  const update = (patch: Partial<SiteContent['settings']>) =>
    onChange({ ...content, settings: { ...settings, ...patch } });
  return (
    <>
      <Panel
        title="Theme & accent"
        description="Visitors can still choose their own light or dark theme. Their saved preference takes priority over this default."
      >
        <SelectField
          label="Default theme for new visitors"
          value={settings.defaultTheme}
          onChange={(value) => update({ defaultTheme: value as 'dark' | 'light' })}
          options={[
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
          ]}
          path="settings.defaultTheme"
        />
        <div className="admin-field-grid">
          <div>
            <Field
              label="Accent · dark theme"
              value={settings.accentDark}
              onChange={(accentDark) => update({ accentDark })}
              path="settings.accentDark"
              help="Six-digit hex color. At least 4.5:1 contrast on the dark card surface."
              maxLength={7}
            />
            <div className="admin-accent-swatch admin-swatch-dark">
              <span
                style={{
                  color: /^#[\da-f]{6}$/i.test(settings.accentDark)
                    ? settings.accentDark
                    : undefined,
                }}
              >
                Your dark-theme accent
              </span>
            </div>
          </div>
          <div>
            <Field
              label="Accent · light theme"
              value={settings.accentLight}
              onChange={(accentLight) => update({ accentLight })}
              path="settings.accentLight"
              help="Six-digit hex color. At least 4.5:1 contrast on the light card surface."
              maxLength={7}
            />
            <div className="admin-accent-swatch admin-swatch-light">
              <span
                style={{
                  color: /^#[\da-f]{6}$/i.test(settings.accentLight)
                    ? settings.accentLight
                    : undefined,
                }}
              >
                Your light-theme accent
              </span>
            </div>
          </div>
        </div>
      </Panel>
      <Panel
        title="Motion & résumé"
        description="The original floating, tilt, ambient 3D, and circuit elements remain enabled by default."
      >
        <CheckField
          label="Enable original animations"
          checked={settings.animations}
          onChange={(animations) => update({ animations })}
          help="Disabling uses static fallbacks. A visitor’s reduced-motion preference always wins."
        />
        <CheckField
          label="Enable résumé & downloads"
          checked={settings.resumeEnabled}
          onChange={(resumeEnabled) => update({ resumeEnabled })}
          help="The dialog, print / Save PDF, HTML, and TXT views use published content. Disabling hides the controls and blocks the live résumé endpoints."
        />
      </Panel>
      <Panel
        title="Search & social metadata"
        description="Used in the live page response as well as the browser. Your profile supplies the title and canonical URL."
      >
        <Field
          label="Meta description"
          value={settings.metaDescription}
          onChange={(metaDescription) => update({ metaDescription })}
          path="settings.metaDescription"
          area
          rows={3}
          maxLength={500}
          required
        />
        <div className="admin-search-preview">
          <span>{content.profile.website}</span>
          <strong>
            {content.profile.name} — {content.profile.role}
          </strong>
          <p>{settings.metaDescription}</p>
        </div>
      </Panel>
    </>
  );
}

import { useState } from 'react';
import { CopyPlus, Eye, EyeOff, Plus, Star } from 'lucide-react';
import type { Project, ProjectDemo, ProjectSource } from '../lib/site-schema';
import { CheckField, Field, LinesField, MoveButtons, Panel, SelectField } from './Fields';
import { blankProject, moveItem, today, uniqueId } from './helpers';
import ProjectCover from '../components/ProjectCover';
import { projectIllustration } from '../lib/project-images';

const categories = [
  { value: 'ai', label: 'Applied AI' },
  { value: 'systems', label: 'Systems' },
  { value: 'fullstack', label: 'Full-stack' },
  { value: 'web', label: 'Web' },
];
const demoStates = [
  { value: 'verified', label: 'Verified public page' },
  { value: 'unverified', label: 'Provided URL · not verified' },
  { value: 'unavailable', label: 'Unavailable' },
];
const sourceStates = [
  { value: 'public', label: 'Public GitHub repository' },
  { value: 'private', label: 'Private repository' },
  { value: 'unverified', label: 'Unverified / not supplied' },
];
export default function ProjectEditor({
  projects,
  onChange,
  initialSelectedId,
}: {
  projects: Project[];
  onChange: (value: Project[]) => void;
  initialSelectedId?: string;
}) {
  const [selectedId, setSelectedId] = useState(initialSelectedId ?? projects[0]?.id ?? '');
  const project = projects.find((item) => item.id === selectedId) ?? projects[0];
  const index = project ? projects.indexOf(project) : -1;
  const update = (patch: Partial<Project>) => {
    if (project)
      onChange(projects.map((item) => (item.id === project.id ? { ...item, ...patch } : item)));
  };
  const path = (key: string) => `projects.${index}.${key}`;
  const add = () => {
    const created = blankProject();
    onChange([...projects, created]);
    setSelectedId(created.id);
  };
  const duplicate = () => {
    if (!project) return;
    const created = {
      ...structuredClone(project),
      id: uniqueId('project'),
      title: `${project.title} (copy)`,
      featured: false,
      visible: false,
    };
    onChange([...projects.slice(0, index + 1), created, ...projects.slice(index + 1)]);
    setSelectedId(created.id);
  };
  const demoState = (availability: string) => {
    if (!project) return;
    const url = 'url' in project.demo ? (project.demo.url ?? '') : '';
    const reason =
      'reason' in project.demo
        ? project.demo.reason
        : 'Public demo has not been independently checked.';
    const demo: ProjectDemo =
      availability === 'verified'
        ? { availability: 'verified', url, verifiedOn: today() }
        : availability === 'unverified'
          ? { availability: 'unverified', url, reason }
          : { availability: 'unavailable', reason, ...(url ? { url } : {}) };
    update({ demo });
  };
  const sourceState = (availability: string) => {
    if (!project) return;
    const url = 'url' in project.source ? (project.source.url ?? '') : '';
    const reason =
      'reason' in project.source
        ? project.source.reason
        : 'Request source access or a project walkthrough.';
    const source: ProjectSource =
      availability === 'public'
        ? { availability: 'public', url }
        : availability === 'private'
          ? { availability: 'private', reason, ...(url ? { url } : {}) }
          : { availability: 'unverified', reason };
    update({ source });
  };
  return (
    <div className="admin-projects-layout">
      <aside className="admin-project-list" aria-label="Project collection">
        <div className="admin-project-list-heading">
          <div>
            <h2>Your projects</h2>
            <p>{projects.length} total · order is shared with the site</p>
          </div>
          <button
            type="button"
            className="admin-icon-button"
            aria-label="Add project"
            disabled={projects.length >= 60}
            onClick={add}
          >
            <Plus size={18} />
          </button>
        </div>
        <ol>
          {projects.map((item, itemIndex) => (
            <li key={item.id} className={project?.id === item.id ? 'selected' : ''}>
              <button
                type="button"
                className="admin-project-select"
                onClick={() => setSelectedId(item.id)}
                aria-pressed={project?.id === item.id}
              >
                <span className="admin-project-position">
                  {String(itemIndex + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    {item.visible ? 'Visible' : 'Hidden'}
                    {item.featured ? ' · Featured' : ''}
                  </small>
                </span>
                <span aria-hidden="true">
                  {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </span>
              </button>
              <MoveButtons
                index={itemIndex}
                length={projects.length}
                label={item.title}
                onMove={(direction) => onChange(moveItem(projects, itemIndex, direction))}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="admin-button"
          disabled={projects.length >= 60}
          onClick={add}
        >
          <Plus size={15} aria-hidden="true" />
          Add project
        </button>
      </aside>
      {project ? (
        <div className="admin-project-detail" key={project.id}>
          <Panel
            title={project.title || 'Untitled project'}
            description="Cards show a short summary first. Show more reveals the story, diagram, and verification notes."
            action={
              <button
                type="button"
                className="admin-button"
                disabled={projects.length >= 60}
                onClick={duplicate}
              >
                <CopyPlus size={15} aria-hidden="true" />
                Duplicate
              </button>
            }
          >
            <div className="admin-toggle-row">
              <CheckField
                label="Visible on the site"
                checked={project.visible}
                onChange={(visible) => update({ visible })}
                help="Hidden projects stay in the editor."
              />
              <CheckField
                label="Featured project"
                checked={project.featured}
                onChange={(featured) => update({ featured })}
                help="Featured items appear in the first filter."
              />
            </div>
            <div className="admin-field-grid">
              <Field
                label="Project title"
                value={project.title}
                onChange={(title) => update({ title })}
                path={path('title')}
                maxLength={160}
                required
              />
              <SelectField
                label="Category"
                value={project.category}
                onChange={(category) => update({ category: category as Project['category'] })}
                options={categories}
                path={path('category')}
              />
              <Field
                label="Project type"
                value={project.kind}
                onChange={(kind) => update({ kind })}
                path={path('kind')}
                maxLength={160}
              />
              <Field
                label="Context / subtitle"
                value={project.context}
                onChange={(context) => update({ context })}
                path={path('context')}
                maxLength={400}
              />
            </div>
            <Field
              label="Short description"
              value={project.description}
              onChange={(description) => update({ description })}
              path={path('description')}
              area
              rows={4}
              maxLength={3000}
              required
              help="The first 145 characters are shown on the card; the rest is available through Show more."
            />
            <LinesField
              label="Technology tags"
              value={project.tags}
              onChange={(tags) => update({ tags })}
              path={path('tags')}
              rows={4}
              help="One per line, up to 16. The card initially shows three, plus a count."
            />
          </Panel>
          <Panel
            title="Project image"
            description="Every project has a simple illustration. You can replace it with your own image without changing the story or verification status."
          >
            <div className="admin-project-image-preview">
              <ProjectCover project={project} />
            </div>
            <CheckField
              label="Use a custom project image"
              checked={Boolean(project.coverImage)}
              onChange={(enabled) =>
                update({ coverImage: enabled ? projectIllustration(project) : undefined })
              }
              help="Turn this off to restore the built-in illustration. Image URLs only; this editor does not upload files."
            />
            {project.coverImage && (
              <>
                <Field
                  label="Project image URL"
                  value={project.coverImage.src}
                  onChange={(src) => update({ coverImage: { ...project.coverImage!, src } })}
                  path={path('coverImage.src')}
                  maxLength={2000}
                  required
                  help="Use an HTTPS image URL or an image already deployed under /projects/."
                />
                <Field
                  label="Project image description"
                  value={project.coverImage.alt}
                  onChange={(alt) => update({ coverImage: { ...project.coverImage!, alt } })}
                  path={path('coverImage.alt')}
                  maxLength={300}
                  required
                  help="Describe what the image shows for visitors using a screen reader."
                />
              </>
            )}
            <p className="admin-field-help">
              Illustrations are not product screenshots. Use Genuine project capture below for an
              actual UI capture; a genuine capture takes priority over this card image.
            </p>
          </Panel>
          <Panel
            title="The fuller story"
            description="Optional. Keep claims factual; leave fields empty when details have not been established."
          >
            {(['problem', 'architecture', 'impact'] as const).map((key) => (
              <Field
                key={key}
                label={key[0].toUpperCase() + key.slice(1)}
                value={project[key]}
                onChange={(value) => update({ [key]: value })}
                path={path(key)}
                area
                rows={3}
                maxLength={4000}
              />
            ))}
            <Field
              label="Verification / evidence note"
              value={project.evidenceNote}
              onChange={(evidenceNote) => update({ evidenceNote })}
              path={path('evidenceNote')}
              area
              maxLength={2000}
              help="Explain what was actually checked, any missing evidence, and any limits on the claims."
            />
            <div className="admin-subheading">
              <h3>Architecture diagram</h3>
              <button
                type="button"
                className="admin-button"
                disabled={project.stages.length >= 5}
                onClick={() =>
                  update({ stages: [...project.stages, { label: 'New stage', detail: '' }] })
                }
              >
                <Plus size={14} aria-hidden="true" />
                Add stage
              </button>
            </div>
            <p className="admin-field-help">
              A labeled diagram is used only when no genuine UI capture is supplied. Up to five
              stages.
            </p>
            {project.stages.map((stage, stageIndex) => (
              <div className="admin-stage-row" key={stageIndex}>
                <Field
                  label={`Stage ${stageIndex + 1} label`}
                  value={stage.label}
                  onChange={(label) =>
                    update({
                      stages: project.stages.map((item, i) =>
                        i === stageIndex ? { ...item, label } : item,
                      ),
                    })
                  }
                  path={path(`stages.${stageIndex}.label`)}
                  maxLength={80}
                />
                <Field
                  label={`Stage ${stageIndex + 1} detail`}
                  value={stage.detail}
                  onChange={(detail) =>
                    update({
                      stages: project.stages.map((item, i) =>
                        i === stageIndex ? { ...item, detail } : item,
                      ),
                    })
                  }
                  path={path(`stages.${stageIndex}.detail`)}
                  maxLength={200}
                />
                <MoveButtons
                  index={stageIndex}
                  length={project.stages.length}
                  label={`stage ${stageIndex + 1}`}
                  onMove={(direction) =>
                    update({ stages: moveItem(project.stages, stageIndex, direction) })
                  }
                  onRemove={() =>
                    update({ stages: project.stages.filter((_, i) => i !== stageIndex) })
                  }
                />
              </div>
            ))}
          </Panel>
          <Panel
            title="Demos & source"
            description="Private or unavailable links are labeled honestly. A profile URL is not a project source link."
          >
            <div className="admin-field-grid">
              <SelectField
                label="Demo availability"
                value={project.demo.availability}
                onChange={demoState}
                options={demoStates}
                path={path('demo.availability')}
              />
              {project.demo.availability !== 'unavailable' && (
                <Field
                  label="Demo URL"
                  value={project.demo.url}
                  onChange={(url) => update({ demo: { ...project.demo, url } })}
                  path={path('demo.url')}
                  type="url"
                  maxLength={2000}
                  required
                />
              )}
              {project.demo.availability === 'verified' && (
                <Field
                  label="Public page checked on"
                  value={project.demo.verifiedOn}
                  onChange={(verifiedOn) =>
                    update({ demo: { ...project.demo, verifiedOn } as ProjectDemo })
                  }
                  path={path('demo.verifiedOn')}
                  type="date"
                  required
                />
              )}
            </div>
            {project.demo.availability !== 'verified' && (
              <Field
                label="Demo availability explanation"
                value={project.demo.reason}
                onChange={(reason) => update({ demo: { ...project.demo, reason } as ProjectDemo })}
                path={path('demo.reason')}
                area
                maxLength={1000}
                required
              />
            )}
            <hr className="admin-rule" />
            <div className="admin-field-grid">
              <SelectField
                label="Source availability"
                value={project.source.availability}
                onChange={sourceState}
                options={sourceStates}
                path={path('source.availability')}
              />
              {project.source.availability !== 'unverified' && (
                <Field
                  label={
                    project.source.availability === 'public'
                      ? 'Public GitHub repository URL'
                      : 'Private repository URL (optional)'
                  }
                  value={project.source.url ?? ''}
                  onChange={(value) =>
                    update({
                      source: { ...project.source, url: value || undefined } as ProjectSource,
                    })
                  }
                  path={path('source.url')}
                  type="url"
                  help="Use the actual github.com/owner/repository URL."
                  maxLength={2000}
                  required={project.source.availability === 'public'}
                />
              )}
            </div>
            {project.source.availability !== 'public' && (
              <Field
                label="Source availability explanation"
                value={project.source.reason}
                onChange={(reason) =>
                  update({ source: { ...project.source, reason } as ProjectSource })
                }
                path={path('source.reason')}
                area
                maxLength={1000}
                required
              />
            )}
          </Panel>
          <Panel
            title="Genuine project capture"
            description="Optional. Use an actual working-UI screenshot or GIF—not a stock image or a fabricated product screen."
          >
            <CheckField
              label="Use a project UI capture"
              checked={Boolean(project.screenshot)}
              onChange={(enabled) =>
                update({
                  screenshot: enabled
                    ? {
                        src: '',
                        alt: `${project.title} working interface`,
                        width: 1440,
                        height: 900,
                        capturedOn: today(),
                      }
                    : undefined,
                })
              }
            />
            {project.screenshot && (
              <>
                <Field
                  label="Image URL or /projects/ path"
                  value={project.screenshot.src}
                  onChange={(src) => update({ screenshot: { ...project.screenshot!, src } })}
                  path={path('screenshot.src')}
                  maxLength={2000}
                  help="Use an HTTPS image URL, or a file already deployed under public/projects/. This editor does not upload files."
                  required
                />
                <Field
                  label="Accessible image description"
                  value={project.screenshot.alt}
                  onChange={(alt) => update({ screenshot: { ...project.screenshot!, alt } })}
                  path={path('screenshot.alt')}
                  maxLength={300}
                  required
                />
                <div className="admin-field-grid admin-three-columns">
                  <Field
                    label="Width (px)"
                    value={String(project.screenshot.width)}
                    onChange={(value) =>
                      update({ screenshot: { ...project.screenshot!, width: Number(value) } })
                    }
                    path={path('screenshot.width')}
                    type="number"
                  />
                  <Field
                    label="Height (px)"
                    value={String(project.screenshot.height)}
                    onChange={(value) =>
                      update({ screenshot: { ...project.screenshot!, height: Number(value) } })
                    }
                    path={path('screenshot.height')}
                    type="number"
                  />
                  <Field
                    label="Captured on"
                    value={project.screenshot.capturedOn}
                    onChange={(capturedOn) =>
                      update({ screenshot: { ...project.screenshot!, capturedOn } })
                    }
                    path={path('screenshot.capturedOn')}
                    type="date"
                  />
                </div>
              </>
            )}
          </Panel>
          <div className="admin-delete-project">
            <span className="admin-field-help">
              Internal ID: <code>{project.id}</code>
            </span>
            <button
              type="button"
              className="admin-button admin-danger-text"
              disabled={projects.length <= 1}
              onClick={() => {
                if (
                  window.confirm(
                    `Remove “${project.title}” from this working copy? It will not affect visitors until you publish.`,
                  )
                )
                  onChange(projects.filter((item) => item.id !== project.id));
              }}
            >
              Remove project
            </button>
          </div>
          <p className="admin-field-help">
            <Star size={12} className="admin-inline-icon" aria-hidden="true" />
            The four current flagship builds remain featured by default. New projects start hidden.
          </p>
        </div>
      ) : (
        <Panel title="No projects yet" description="Add a project to start your collection.">
          <button type="button" className="admin-button admin-button-primary" onClick={add}>
            Add your first project
          </button>
        </Panel>
      )}
    </div>
  );
}

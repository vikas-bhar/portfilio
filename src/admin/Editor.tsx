import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  Eye,
  FilePenLine,
  FolderKanban,
  Home,
  LayoutList,
  LogOut,
  Paintbrush,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react';
import { defaultContent } from '../data/portfolio';
import {
  ApiError,
  getSession,
  loadEditor,
  publishContent,
  saveDraft,
  signOut,
} from '../lib/admin-api';
import {
  siteContentSchema,
  type AdminSession,
  type ContentRecord,
  type DraftRecord,
  type SiteContent,
} from '../lib/site-schema';
import { FieldIssuesContext, fieldId, type FieldIssue } from './field-issues';
import { ConfirmDialog, Panel } from './Fields';
import { downloadBackup, formatTime, normalizeContent, notifySite } from './helpers';
import ProjectEditor from './ProjectEditor';
import {
  AppearanceEditor,
  CapabilitiesEditor,
  ProfileEditor,
  SectionsEditor,
  StoryEditor,
} from './ContentEditors';
import SecurityEditor from './SecurityEditor';
import AuthForm from './AuthForm';
import type { EditorSection } from './types';

interface WorkingCopy {
  content: SiteContent;
  published: ContentRecord;
  draft: DraftRecord | null;
  baseRevision: string;
  savedSignature: string;
  savedBaseRevision: string;
}
interface EditorProps {
  session: AdminSession;
  onLoggedOut: () => void;
}
const items = [
  { id: 'overview', label: 'Overview', Icon: Home, detail: 'Your publishing workspace' },
  {
    id: 'profile',
    label: 'Profile & home',
    Icon: UserRound,
    detail: 'Identity, contact links, and hero content',
  },
  {
    id: 'projects',
    label: 'Projects',
    Icon: FolderKanban,
    detail: 'Projects, case studies, and honest evidence',
  },
  {
    id: 'sections',
    label: 'Sections & copy',
    Icon: LayoutList,
    detail: 'Navigation, visibility, order, and site copy',
  },
  {
    id: 'capabilities',
    label: 'Capabilities',
    Icon: Sparkles,
    detail: 'Engineering pillars and skills',
  },
  {
    id: 'story',
    label: 'About & experience',
    Icon: FilePenLine,
    detail: 'Your practical story, principles, and milestones',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    Icon: Paintbrush,
    detail: 'Themes, motion, résumé, and metadata',
  },
  {
    id: 'security',
    label: 'Security',
    Icon: Settings2,
    detail: 'Password and storage configuration',
  },
] as const;
const signature = (content: SiteContent) => JSON.stringify(content);
function createWorkingCopy(published: ContentRecord, draft: DraftRecord | null): WorkingCopy {
  const useDraft = draft && draft.baseRevision === published.revision;
  const content = structuredClone(useDraft ? draft.content : published.content);
  const baseRevision = useDraft ? draft.baseRevision : published.revision;
  return {
    content,
    published,
    draft,
    baseRevision,
    savedSignature: signature(content),
    savedBaseRevision: baseRevision,
  };
}
export default function Editor({ session, onLoggedOut }: EditorProps) {
  const [model, setModel] = useState<WorkingCopy | null>(null);
  const [section, setSection] = useState<EditorSection>('overview');
  const [projectFocus, setProjectFocus] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [reauthenticate, setReauthenticate] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const dirty = Boolean(
    model &&
    (signature(model.content) !== model.savedSignature ||
      model.baseRevision !== model.savedBaseRevision),
  );
  const unpublished = Boolean(
    model && signature(model.content) !== signature(model.published.content),
  );
  const hasOlderDraft = Boolean(
    model?.draft &&
    model.draft.baseRevision !== model.published.revision &&
    signature(model.draft.content) !== signature(model.published.content),
  );
  const staleBase = Boolean(model && model.baseRevision !== model.published.revision);
  const navigate = (id: EditorSection) => {
    setSection(id);
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const handleError = useCallback((reason: unknown) => {
    setError(reason instanceof Error ? reason.message : 'The action could not be completed.');
    if (reason instanceof ApiError) {
      setIssues(reason.issues);
      if (reason.status === 401) setReauthenticate(true);
    }
  }, []);
  useEffect(() => {
    let active = true;
    void loadEditor()
      .then((data) => {
        if (active) setModel(createWorkingCopy(data.published, data.draft));
      })
      .catch((reason: unknown) => {
        if (active) handleError(reason);
      });
    return () => {
      active = false;
    };
  }, [handleError]);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);
  const mayDiscard = () =>
    !dirty ||
    window.confirm(
      'You have edits that are not saved to the server. Leave this working copy and discard those unsaved edits?',
    );
  const update = (content: SiteContent) => {
    setModel((current) => (current ? { ...current, content } : current));
    setMessage('');
  };
  const ensureSession = async () => {
    const active = await getSession();
    if (!active.authenticated)
      throw new ApiError(
        'Your session has expired. Sign in again; your edits are still here.',
        401,
      );
  };
  const validate = (): SiteContent | null => {
    if (!model) return null;
    const result = normalizeContent(model.content);
    if (!result.success) {
      setIssues(
        result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );
      setError('Please correct the listed fields before saving or publishing.');
      return null;
    }
    setIssues([]);
    setError('');
    return result.data;
  };
  const persistDraft = async (content: SiteContent): Promise<DraftRecord> => {
    if (!model) throw new Error('The editor is not loaded.');
    await ensureSession();
    const draft = await saveDraft(content, model.baseRevision, model.draft?.revision ?? 'initial');
    setModel((current) =>
      current
        ? {
            ...current,
            draft,
            content: draft.content,
            savedSignature: signature(draft.content),
            savedBaseRevision: draft.baseRevision,
          }
        : current,
    );
    notifySite();
    return draft;
  };
  const save = async () => {
    const content = validate();
    if (!content) return;
    setBusy(true);
    setMessage('');
    try {
      await persistDraft(content);
      setMessage('Draft saved securely. Your public site has not changed.');
    } catch (reason) {
      handleError(reason);
    } finally {
      setBusy(false);
    }
  };
  const preview = async () => {
    const content = validate();
    if (!content || !model) return;
    // Open during the actual click so browsers do not block a popup after the save request.
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    setBusy(true);
    setMessage('');
    try {
      const matchesDraft =
        model.draft &&
        signature(content) === signature(model.draft.content) &&
        model.draft.baseRevision === model.baseRevision;
      if (!matchesDraft) await persistDraft(content);
      else await ensureSession();
      if (tab) tab.location.replace('/?preview=draft');
      setMessage(
        tab
          ? 'Private draft preview opened in a new tab. Nothing has been published.'
          : 'Draft saved. Your browser blocked the preview popup; use “Open saved draft” below.',
      );
    } catch (reason) {
      tab?.close();
      handleError(reason);
    } finally {
      setBusy(false);
    }
  };
  const publish = async () => {
    const content = validate();
    if (!content || !model) {
      setConfirmPublish(false);
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      // Persist the exact working copy first; never silently publish an unsaved/mismatched draft.
      if (
        !model.draft ||
        signature(content) !== signature(model.draft.content) ||
        model.draft.baseRevision !== model.baseRevision
      )
        await persistDraft(content);
      else await ensureSession();
      const published = await publishContent(content, model.baseRevision);
      setModel((current) =>
        current
          ? {
              ...current,
              content: published.content,
              published,
              baseRevision: published.revision,
              savedSignature: signature(published.content),
              savedBaseRevision: published.revision,
            }
          : current,
      );
      notifySite();
      setConfirmPublish(false);
      setMessage(
        'Published. New visitors now see this version; open pages refresh on focus or within a minute.',
      );
    } catch (reason) {
      handleError(reason);
      setConfirmPublish(false);
    } finally {
      setBusy(false);
    }
  };
  const reload = async () => {
    if (!mayDiscard()) return;
    setBusy(true);
    setError('');
    setIssues([]);
    try {
      await ensureSession();
      const data = await loadEditor();
      setModel(createWorkingCopy(data.published, data.draft));
      setMessage('Loaded the latest server version.');
    } catch (reason) {
      handleError(reason);
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    if (!mayDiscard()) return;
    setBusy(true);
    setError('');
    try {
      await ensureSession();
      await signOut();
      onLoggedOut();
    } catch (reason) {
      handleError(reason);
    } finally {
      setBusy(false);
    }
  };
  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !model) return;
    try {
      if (file.size > 262_144) throw new Error('Keep content backups under 256 KB.');
      const result = siteContentSchema.safeParse(JSON.parse(await file.text()));
      if (!result.success) {
        setIssues(
          result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        );
        throw new Error(
          'This backup does not match the site content schema. No content was imported.',
        );
      }
      if (
        !window.confirm(
          'Replace this working copy with the backup? Your public site will not change until you publish.',
        )
      )
        return;
      update(result.data);
      setIssues([]);
      setError('');
      setMessage('Backup imported into this tab. Save a draft or preview it before publishing.');
      navigate('overview');
    } catch (reason) {
      handleError(reason);
    }
  };
  const restoreDraft = () => {
    if (!model?.draft || !mayDiscard()) return;
    const draft = model.draft;
    setModel({
      ...model,
      content: structuredClone(draft.content),
      baseRevision: draft.baseRevision,
      savedSignature: signature(draft.content),
      savedBaseRevision: draft.baseRevision,
    });
    setMessage(
      'Saved draft restored. If it is based on an older publication, review and rebase it before publishing.',
    );
  };
  const startFromPublished = () => {
    if (
      !model ||
      !window.confirm(
        'Replace this working copy with the current published content? Save a new draft afterward to replace the saved draft too.',
      )
    )
      return;
    setModel({
      ...model,
      content: structuredClone(model.published.content),
      baseRevision: model.published.revision,
    });
    setMessage('Working copy replaced with published content. Save draft to persist this choice.');
  };
  const goToIssue = (issue: FieldIssue) => {
    const path = issue.path;
    let target: EditorSection = 'sections';
    if (path.startsWith('projects')) {
      target = 'projects';
      setProjectFocus(model?.content.projects[Number(path.split('.')[1])]?.id);
    } else if (path.startsWith('skillGroups')) target = 'capabilities';
    else if (
      path.startsWith('milestones') ||
      path.startsWith('focusAreas') ||
      path.startsWith('profile.about')
    )
      target = 'story';
    else if (path.startsWith('profile') || path.startsWith('buildPath')) target = 'profile';
    else if (path.startsWith('settings')) target = 'appearance';
    navigate(target);
    window.setTimeout(() => document.getElementById(fieldId(path))?.focus(), 0);
  };
  const currentSection = items.find((item) => item.id === section)!;
  const visibleCount = model?.content.projects.filter((project) => project.visible).length ?? 0;
  return (
    <FieldIssuesContext.Provider value={issues}>
      <div className="admin-app admin-workspace">
        <a href="#admin-main" className="admin-skip-link">
          Skip to editor
        </a>
        <aside className="admin-sidebar">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-brand admin-sidebar-brand"
          >
            <span className="admin-brand-mark">v.</span>
            <span>
              SITE ADMIN<small>PORTFOLIO WORKSPACE</small>
            </span>
          </a>
          <div className="admin-workspace-label">
            <span className="admin-status-dot" />
            Owner workspace <ShieldCheck size={13} aria-hidden="true" />
          </div>
          <button
            type="button"
            className="admin-icon-button admin-mobile-signout"
            aria-label="Sign out"
            disabled={busy}
            onClick={() => void logout()}
          >
            <LogOut size={16} />
          </button>
          <nav aria-label="Admin sections">
            {items.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={section === id ? 'active' : ''}
                onClick={() => navigate(id)}
                aria-current={section === id ? 'page' : undefined}
              >
                <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                <span>{label}</span>
                {id === 'projects' && model && <small>{model.content.projects.length}</small>}
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-bottom">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ArrowUpRight size={16} aria-hidden="true" />
              View public site
            </a>
            <button type="button" disabled={busy} onClick={() => void logout()}>
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
            <p>
              <span className="admin-status-dot" />
              {session.storage === 'vercel-blob'
                ? 'Private shared storage'
                : 'Local server storage'}
            </p>
          </div>
        </aside>
        <div className="admin-work-area">
          <header className="admin-topbar">
            <div className="admin-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={13} aria-hidden="true" />
              <strong>{currentSection.label}</strong>
            </div>
            <div className="admin-publish-tools">
              <span className={`admin-save-state ${dirty ? 'is-dirty' : ''}`} role="status">
                <span className="admin-status-dot" />
                {busy
                  ? 'Working…'
                  : dirty
                    ? 'Unsaved edits'
                    : unpublished
                      ? 'Unpublished draft'
                      : 'Up to date'}
              </span>
              <button
                type="button"
                className="admin-button admin-save-button"
                disabled={busy || !model}
                onClick={() => void save()}
              >
                <Save size={15} aria-hidden="true" />
                <span>Save draft</span>
              </button>
              <button
                type="button"
                className="admin-button"
                disabled={busy || !model}
                onClick={() => void preview()}
              >
                <Eye size={15} aria-hidden="true" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                className="admin-button admin-button-primary"
                disabled={busy || !model || staleBase}
                onClick={() => {
                  if (validate()) setConfirmPublish(true);
                }}
              >
                <Send size={14} aria-hidden="true" />
                <span>Publish</span>
              </button>
            </div>
          </header>
          <main id="admin-main" className="admin-main" ref={mainRef} tabIndex={-1}>
            <div className="admin-page-heading">
              <div>
                <p className="admin-kicker">YOUR SITE, YOUR CONTROL</p>
                <h1>
                  {section === 'overview'
                    ? 'A little care. A better portfolio.'
                    : currentSection.label}
                </h1>
                <p>
                  {section === 'overview'
                    ? 'Keep the work current. Keep drafts private. Publish when it feels right.'
                    : currentSection.detail}
                </p>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                aria-label="Reload latest content"
                title="Reload latest content"
                disabled={busy}
                onClick={() => void reload()}
              >
                <RefreshCw size={17} />
              </button>
            </div>
            {reauthenticate && (
              <section className="admin-reauth" aria-label="Session expired">
                <AuthForm
                  reauthenticate
                  onAuthenticated={() => {
                    setReauthenticate(false);
                    setError('');
                    setMessage('Signed in again. Your edits are intact; retry your save.');
                    if (!model) void reload();
                  }}
                />
              </section>
            )}
            {message && (
              <p className="admin-notice admin-notice-success" role="status">
                <Check size={16} aria-hidden="true" />
                {message}
              </p>
            )}
            {error && (
              <div className="admin-notice admin-notice-error" role="alert">
                <p>{error}</p>
                {issues.length > 0 && (
                  <ul className="admin-issue-list">
                    {issues.slice(0, 20).map((issue, index) => (
                      <li key={`${issue.path}-${index}`}>
                        <button type="button" onClick={() => goToIssue(issue)}>
                          <code>{issue.path || 'content'}</code> — {issue.message}
                          <ArrowRight size={12} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {!issues.length && model && (
                  <div className="admin-notice-actions">
                    <button type="button" onClick={() => downloadBackup(model.content)}>
                      Back up current edits
                    </button>
                    <button type="button" disabled={busy} onClick={() => void reload()}>
                      Reload latest
                    </button>
                  </div>
                )}
              </div>
            )}
            {staleBase && model && (
              <div className="admin-notice admin-notice-warning" role="alert">
                <p>
                  <strong>This draft is based on an older publication.</strong> Publishing is
                  blocked until you review the current public site and explicitly rebase, or start
                  from published content.
                </p>
                <div className="admin-notice-actions">
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    Review public site
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          'Use this working copy to replace the latest publication after review? Other published changes may be replaced. You will still need to press Publish.',
                        )
                      )
                        setModel({ ...model, baseRevision: model.published.revision });
                    }}
                  >
                    Rebase after review
                  </button>
                  <button type="button" onClick={startFromPublished}>
                    Start from published
                  </button>
                </div>
              </div>
            )}
            {!model ? (
              <div className="admin-panel admin-loading-panel" role="status">
                {error
                  ? 'Your working copy has not been loaded. Try reloading after the service is available.'
                  : 'Loading your content…'}
              </div>
            ) : (
              <fieldset disabled={busy} className="admin-fieldset">
                <legend className="admin-sr-only">Site content editor</legend>
                {section === 'overview' && (
                  <>
                    <div className="admin-overview-stats">
                      <div>
                        <FolderKanban size={18} aria-hidden="true" />
                        <strong>{String(model.content.projects.length).padStart(2, '0')}</strong>
                        <span>Projects in your collection</span>
                        <button type="button" onClick={() => navigate('projects')}>
                          Manage projects <ArrowUpRight size={13} aria-hidden="true" />
                        </button>
                      </div>
                      <div>
                        <Eye size={18} aria-hidden="true" />
                        <strong>{String(visibleCount).padStart(2, '0')}</strong>
                        <span>Visible in this working copy</span>
                        <button type="button" onClick={() => navigate('sections')}>
                          Arrange your site <ArrowUpRight size={13} aria-hidden="true" />
                        </button>
                      </div>
                      <div>
                        <Sparkles size={18} aria-hidden="true" />
                        <strong>
                          {String(
                            model.content.projects.filter(
                              (project) => project.featured && project.visible,
                            ).length,
                          ).padStart(2, '0')}
                        </strong>
                        <span>Featured builds</span>
                        <button type="button" onClick={() => navigate('projects')}>
                          Curate featured work <ArrowUpRight size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="admin-overview-grid">
                      <Panel
                        title="The publishing flow"
                        description="Your changes are not public until you choose to publish."
                      >
                        <ol className="admin-workflow">
                          <li>
                            <span>01</span>
                            <div>
                              <strong>Edit your content</strong>
                              <p>
                                Update projects, profile details, site copy, or appearance. Unsaved
                                edits stay in this tab.
                              </p>
                            </div>
                          </li>
                          <li>
                            <span>02</span>
                            <div>
                              <strong>Save & preview</strong>
                              <p>
                                Save a private server-backed draft. Preview uses your authenticated
                                session, not a public sharing link.
                              </p>
                            </div>
                          </li>
                          <li>
                            <span>03</span>
                            <div>
                              <strong>Publish deliberately</strong>
                              <p>
                                Confirm the working copy and publish. The live page, metadata, and
                                résumé use the same content.
                              </p>
                            </div>
                          </li>
                        </ol>
                        <button
                          type="button"
                          className="admin-button admin-button-primary"
                          onClick={() => navigate('projects')}
                        >
                          Start with your projects
                          <ArrowRight size={15} aria-hidden="true" />
                        </button>
                      </Panel>
                      <Panel
                        title="Version & storage"
                        description={
                          session.storage === 'vercel-blob'
                            ? 'Durable private Vercel Blob storage.'
                            : 'This server shares content with all of its visitors.'
                        }
                      >
                        <dl className="admin-version-info">
                          <div>
                            <dt>Published</dt>
                            <dd>{formatTime(model.published.updatedAt)}</dd>
                          </div>
                          <div>
                            <dt>Saved draft</dt>
                            <dd>
                              {model.draft
                                ? formatTime(model.draft.updatedAt)
                                : 'No draft saved yet'}
                            </dd>
                          </div>
                          <div>
                            <dt>Live revision</dt>
                            <dd>
                              <code>{model.published.revision.slice(0, 12)}</code>
                            </dd>
                          </div>
                        </dl>
                        {session.storage === 'local' && (
                          <p className="admin-inline-note">
                            Local files are real server-backed saves, but they are not Vercel’s
                            durable storage. Follow docs/ADMIN.md before deploying.
                          </p>
                        )}
                        <div className="admin-stacked-links">
                          <a href="/" target="_blank" rel="noopener noreferrer">
                            View public site
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </a>
                          {model.draft && (
                            <a href="/?preview=draft" target="_blank" rel="noopener noreferrer">
                              Open saved draft
                              <ArrowUpRight size={14} aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </Panel>
                    </div>
                    {hasOlderDraft && (
                      <Panel
                        title="An older saved draft is available"
                        description="It was based on a previous publication. It was not loaded automatically, so it cannot silently replace newer published work."
                      >
                        <div className="admin-inline-actions">
                          <button type="button" className="admin-button" onClick={restoreDraft}>
                            Restore saved draft for review
                          </button>
                          <button
                            type="button"
                            className="admin-button"
                            onClick={() => model.draft && downloadBackup(model.draft.content)}
                          >
                            Download older draft
                          </button>
                        </div>
                      </Panel>
                    )}
                    <Panel
                      title="Backups & recovery"
                      description="Backups contain site content only. Importing or resetting changes this working copy—not your live site."
                    >
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="admin-button"
                          onClick={() => downloadBackup(model.content)}
                        >
                          <Download size={15} aria-hidden="true" />
                          Export content JSON
                        </button>
                        <button
                          type="button"
                          className="admin-button"
                          onClick={() => importRef.current?.click()}
                        >
                          <Upload size={15} aria-hidden="true" />
                          Import content JSON
                        </button>
                        <button type="button" className="admin-button" onClick={startFromPublished}>
                          <RotateCcw size={15} aria-hidden="true" />
                          Start from published
                        </button>
                        <button
                          type="button"
                          className="admin-button admin-danger-text"
                          onClick={() => {
                            if (
                              window.confirm(
                                'Replace this working copy with the original 11-project content? Existing public content will not change until you publish. Export a backup first if you need it.',
                              )
                            ) {
                              update(structuredClone(defaultContent));
                              setMessage(
                                'Factory content loaded into this tab. Save or preview before publishing.',
                              );
                            }
                          }}
                        >
                          Restore factory content
                        </button>
                      </div>
                      <input
                        ref={importRef}
                        type="file"
                        accept="application/json,.json"
                        hidden
                        aria-label="Import content backup"
                        onChange={(event) => void importBackup(event)}
                      />
                    </Panel>
                    <p className="admin-workspace-note">
                      <CircleHelp size={15} aria-hidden="true" />
                      Hidden projects and sections are not rendered on the site. Keep confidential
                      work in the private draft; visibility settings are not access controls.
                    </p>
                  </>
                )}
                {section === 'profile' && (
                  <ProfileEditor content={model.content} onChange={update} />
                )}
                {section === 'projects' && (
                  <ProjectEditor
                    key={projectFocus ?? 'projects'}
                    initialSelectedId={projectFocus}
                    projects={model.content.projects}
                    onChange={(projects) => update({ ...model.content, projects })}
                  />
                )}
                {section === 'sections' && (
                  <SectionsEditor content={model.content} onChange={update} />
                )}
                {section === 'capabilities' && (
                  <CapabilitiesEditor content={model.content} onChange={update} />
                )}
                {section === 'story' && <StoryEditor content={model.content} onChange={update} />}
                {section === 'appearance' && (
                  <AppearanceEditor content={model.content} onChange={update} />
                )}
                {section === 'security' && (
                  <SecurityEditor
                    session={session}
                    onLoggedOut={onLoggedOut}
                    allowChange={mayDiscard}
                  />
                )}
              </fieldset>
            )}
            <footer className="admin-main-footer">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ArrowLeft size={13} aria-hidden="true" />
                Portfolio
              </a>
              <span>
                <ShieldCheck size={13} aria-hidden="true" />
                Private owner workspace
              </span>
            </footer>
          </main>
        </div>
        <ConfirmDialog
          open={confirmPublish}
          title="Ready to publish?"
          confirmLabel="Publish changes"
          onConfirm={() => void publish()}
          onCancel={() => setConfirmPublish(false)}
          busy={busy}
        >
          <p>
            This replaces the public site content with your current working copy. Your draft will be
            saved first.
          </p>
          <dl className="admin-publish-summary">
            <div>
              <dt>Projects visible</dt>
              <dd>
                {visibleCount} / {model?.content.projects.length ?? 0}
              </dd>
            </div>
            <div>
              <dt>Sections visible</dt>
              <dd>{model?.content.sections.filter((item) => item.visible).length ?? 0}</dd>
            </div>
            <div>
              <dt>Updates include</dt>
              <dd>Page content, links, appearance, metadata, and résumé</dd>
            </div>
          </dl>
          <p className="admin-field-help">
            New visitors see the published version immediately. Existing pages refresh when focused
            or within a minute.
          </p>
        </ConfirmDialog>
      </div>
    </FieldIssuesContext.Provider>
  );
}

import { useEffect, useRef } from 'react';
import { Check, Copy, Download, ExternalLink, FileText, Printer, X } from 'lucide-react';
import { resumeFiles } from '../data/portfolio';
import { useSiteContent } from '../hooks/useSiteContent';
import { createResumeText, resumeFileStem } from '../lib/resume';
import { createSourceRequestLink } from '../lib/projects';
import { useClipboard } from '../hooks/useClipboard';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const { content, previewMode } = useSiteContent();
  const resumeQuery = previewMode ? '?preview=draft' : '';
  const { milestones, profile, skillGroups } = content;
  const projects = content.projects.filter((project) => project.visible);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { copy, status } = useClipboard();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!isOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    const previousFocus = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="resume-dialog"
      aria-labelledby="resume-dialog-title"
      aria-modal="true"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex="0"]',
          ),
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="resume-dialog-header">
        <div>
          <FileText size={20} aria-hidden="true" />
          <div>
            <h2 id="resume-dialog-title">Product engineering, end to end.</h2>
            <p>{profile.name} · Résumé / CV</p>
          </div>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close résumé">
          <X size={22} />
        </button>
      </div>
      <div className="resume-actions">
        <a
          href={resumeFiles.html + resumeQuery}
          target="_blank"
          rel="noopener noreferrer"
          className="button button-primary button-small"
        >
          <Printer size={14} aria-hidden="true" />
          Print / Save PDF
        </a>
        <a
          href={resumeFiles.text + resumeQuery}
          download={`${resumeFileStem(profile.name)}.txt`}
          className="button button-secondary button-small"
        >
          <Download size={14} aria-hidden="true" />
          TXT
        </a>
        <a
          href={resumeFiles.html + resumeQuery}
          download={`${resumeFileStem(profile.name)}.html`}
          className="button button-secondary button-small"
        >
          <Download size={14} aria-hidden="true" />
          HTML
        </a>
        <button
          className="button button-secondary button-small"
          onClick={() => void copy(createResumeText(content))}
        >
          {status === 'copied' ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
          {status === 'copied' ? 'Copied!' : 'Copy text'}
        </button>
        <span className="resume-copy-status" role="status">
          {status === 'error' ? 'Copy unavailable. Please download the TXT version.' : ''}
        </span>
      </div>
      <div className="resume-body" tabIndex={0} aria-label="Résumé contents">
        <header className="resume-profile">
          <p className="eyebrow">FULL-STACK / APPLIED AI / SYSTEMS</p>
          <h3>{profile.name}</h3>
          <p>{profile.role}</p>
          <div>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub <ExternalLink size={11} aria-hidden="true" />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn <ExternalLink size={11} aria-hidden="true" />
            </a>
          </div>
        </header>
        <section>
          <h4>Professional summary</h4>
          <p>{profile.summary}</p>
        </section>
        <section>
          <h4>Technical capabilities</h4>
          <div className="resume-skills">
            {skillGroups.map((group) => (
              <div key={group.id}>
                <strong>{group.title}</strong>
                <p>{group.skills.join(' · ')}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h4>Projects & selected work</h4>
          <div className="resume-projects">
            {projects.map((project) => (
              <article key={project.id}>
                <div>
                  <h5>{project.title}</h5>
                </div>
                <p className="resume-project-context">{project.context}</p>
                <p className="resume-project-tech">{project.tags.join(' · ')}</p>
                <p>
                  {project.problem ? (
                    <>
                      <strong>Problem.</strong> {project.problem}
                    </>
                  ) : (
                    project.description
                  )}
                </p>
                {project.architecture && (
                  <p>
                    <strong>Architecture.</strong> {project.architecture}
                  </p>
                )}
                {project.impact && (
                  <p>
                    <strong>Impact.</strong> {project.impact}
                  </p>
                )}
                <div className="resume-project-links">
                  {project.demo.availability !== 'unavailable' ? (
                    <a
                      href={project.demo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Live Demo: ${project.title} from résumé`}
                    >
                      Live Demo <ExternalLink size={11} aria-hidden="true" />
                    </a>
                  ) : (
                    <span>Live Demo: not verified</span>
                  )}
                  {project.source.availability === 'public' ? (
                    <a href={project.source.url} target="_blank" rel="noopener noreferrer">
                      GitHub <ExternalLink size={11} aria-hidden="true" />
                    </a>
                  ) : (
                    <>
                      <span>
                        GitHub:{' '}
                        {project.source.availability === 'private' ? 'private' : 'unverified'}
                      </span>
                      <a href={createSourceRequestLink(project.title, profile)}>
                        Request source / walkthrough
                      </a>
                    </>
                  )}
                </div>
                <p className="resume-verification">{project.evidenceNote}</p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h4>Experience & milestones</h4>
          <div className="resume-milestones">
            {milestones.map((milestone) => (
              <article key={milestone.id}>
                <h5>{milestone.title}</h5>
                <p className="resume-project-context">{milestone.organization}</p>
                <p>{milestone.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <div className="resume-dialog-footer">
        For a PDF, open the print version and choose “Save as PDF” in your browser.
      </div>
    </dialog>
  );
}

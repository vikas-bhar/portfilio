import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Copy, Mail, MessageSquare } from 'lucide-react';
import { Github, Linkedin } from './SocialIcons';
import { useSiteContent } from '../hooks/useSiteContent';
import { createMailtoLink, type ContactMessage } from '../lib/contact';
import { useClipboard } from '../hooks/useClipboard';
import Floating3DWrapper from './Floating3DWrapper';
import TiltCard from './TiltCard';

const initialMessage: ContactMessage = { firstName: '', lastName: '', email: '', message: '' };

export default function Contact() {
  const { content } = useSiteContent();
  const { profile } = content;
  const siteCopy = content.copy;
  const [formData, setFormData] = useState(initialMessage);
  const [draftReady, setDraftReady] = useState(false);
  const { copy, status } = useClipboard();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = event.currentTarget.elements.namedItem('firstName') as HTMLInputElement;
    const message = event.currentTarget.elements.namedItem('message') as HTMLTextAreaElement;
    if (!formData.firstName.trim()) {
      name.setCustomValidity('Please enter your first name.');
      name.reportValidity();
      return;
    }
    if (formData.message.trim().length < 10) {
      message.setCustomValidity('Please add a little detail: at least 10 characters.');
      message.reportValidity();
      return;
    }
    setDraftReady(true);
    window.location.href = createMailtoLink(formData, profile);
  };

  return (
    <section id="contact" className="section contact-section" aria-labelledby="contact-heading">
      <div className="container">
        <Floating3DWrapper
          className="contact-eyebrow-float"
          depth={20}
          tiltIntensity={16}
          floatAmplitude={4}
        >
          <p className="eyebrow section-eyebrow">
            <span>05</span> {siteCopy.contactEyebrow}
            <MessageSquare size={13} className="motion-bounce" aria-hidden="true" />
          </p>
        </Floating3DWrapper>
        <div className="contact-grid">
          <div className="contact-copy">
            <Floating3DWrapper depth={20} tiltIntensity={16} floatAmplitude={4}>
              <div className="availability">
                <span className="status-dot" aria-hidden="true" />
                {siteCopy.contactAvailability}
              </div>
            </Floating3DWrapper>
            <Floating3DWrapper depth={24} tiltIntensity={8} floatAmplitude={3} floatDelay={0.2}>
              <h2 id="contact-heading">
                <span className="multiline-copy">{siteCopy.contactTitle}</span>
                <br />
                <em>{siteCopy.contactAccent}</em>
                <ArrowUpRight
                  className="contact-heading-arrow"
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </h2>
            </Floating3DWrapper>
            <p>{siteCopy.contactDescription}</p>
            <div className="email-link-row">
              <Floating3DWrapper depth={20} tiltIntensity={15} floatAmplitude={4}>
                <a href={`mailto:${profile.email}`} className="contact-email">
                  {profile.email}
                </a>
              </Floating3DWrapper>
              <button
                className="icon-button copy-email"
                onClick={() => void copy(profile.email)}
                aria-label="Copy email address"
                title="Copy email address"
              >
                {status === 'copied' ? <Check size={17} /> : <Copy size={17} />}
              </button>
            </div>
            <p className="copy-feedback" role="status">
              {status === 'copied'
                ? 'Email address copied.'
                : status === 'error'
                  ? 'Copy unavailable. You can select the email address above.'
                  : '\u00a0'}
            </p>
            <div className="contact-socials">
              <Floating3DWrapper depth={20} tiltIntensity={15} floatAmplitude={4} floatDelay={0.4}>
                <a href={profile.github} target="_blank" rel="noopener noreferrer">
                  <Github size={17} aria-hidden="true" /> GitHub{' '}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </Floating3DWrapper>
              <Floating3DWrapper depth={20} tiltIntensity={15} floatAmplitude={4} floatDelay={0.2}>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin size={17} aria-hidden="true" /> LinkedIn{' '}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </Floating3DWrapper>
            </div>
          </div>
          <TiltCard
            maxTilt={8}
            scale={1.01}
            glareOpacity={0.18}
            perspective={1400}
            floating={false}
          >
            <div className="contact-form-card">
              <div className="form-heading">
                <span>Let’s hear it.</span>
                <Mail size={20} strokeWidth={1.3} aria-hidden="true" />
              </div>
              <form
                onSubmit={handleSubmit}
                aria-label={`Contact ${profile.name.split(' ')[0]}`}
                aria-describedby="contact-form-note"
              >
                <div className="form-name-row">
                  <div className="form-field">
                    <label htmlFor="first-name">
                      First name <span>*</span>
                    </label>
                    <input
                      id="first-name"
                      name="firstName"
                      autoComplete="given-name"
                      placeholder="Your first name"
                      required
                      maxLength={80}
                      value={formData.firstName}
                      onChange={(event) => {
                        event.target.setCustomValidity('');
                        setFormData({ ...formData, firstName: event.target.value });
                      }}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="last-name">Last name</label>
                    <input
                      id="last-name"
                      name="lastName"
                      autoComplete="family-name"
                      placeholder="Your last name"
                      maxLength={80}
                      value={formData.lastName}
                      onChange={(event) =>
                        setFormData({ ...formData, lastName: event.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="email-address">
                    Email address <span>*</span>
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    maxLength={254}
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="message-input">
                    What are you thinking? <span>*</span>
                  </label>
                  <textarea
                    id="message-input"
                    name="message"
                    placeholder="A little about your idea, project, or what’s on your mind…"
                    rows={4}
                    required
                    minLength={10}
                    maxLength={1500}
                    value={formData.message}
                    onChange={(event) => {
                      event.target.setCustomValidity('');
                      setFormData({ ...formData, message: event.target.value });
                    }}
                  />
                </div>
                <button type="submit" className="button button-primary form-submit">
                  Open email draft <ArrowUpRight size={17} aria-hidden="true" />
                </button>
                <p id="contact-form-note" className="form-note">
                  This opens your email app with a draft. Nothing is sent or stored by this website.
                </p>
                {draftReady && (
                  <div className="draft-status" role="status">
                    <Check size={18} aria-hidden="true" />
                    <div>
                      <strong>Your draft is ready.</strong>
                      <p>
                        Finish sending it in your email app. Didn’t open?{' '}
                        <a href={createMailtoLink(formData, profile)}>Try the email link</a> or
                        write directly to {profile.email}.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}

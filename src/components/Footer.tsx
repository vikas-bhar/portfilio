import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import Floating3DWrapper from './Floating3DWrapper';

export default function Footer() {
  const { content } = useSiteContent();
  const { profile, copy } = content;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Floating3DWrapper
            className="footer-home"
            depth={16}
            tiltIntensity={12}
            floatAmplitude={3}
          >
            <a href="#home" className="wordmark" aria-label={`${profile.name}, back to home`}>
              <span className="brand-symbol" aria-hidden="true">
                <span />
                <span />
              </span>
              <span>
                {copy.wordmark}
                <span className="wordmark-muted">{copy.wordmarkSuffix}</span>
              </span>
              <span className="brand-dot" aria-hidden="true" />
            </a>
          </Floating3DWrapper>
          <span className="footer-tagline">{copy.footerTagline}</span>
          <Floating3DWrapper
            className="footer-back-top"
            depth={20}
            tiltIntensity={16}
            floatAmplitude={4}
          >
            <a href="#home" className="back-to-top">
              Back to top <ArrowUp size={16} aria-hidden="true" />
            </a>
          </Floating3DWrapper>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {profile.name}. Crafted with intention.
          </p>
          <div>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub <ArrowUpRight size={12} aria-hidden="true" />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn <ArrowUpRight size={12} aria-hidden="true" />
            </a>
            <a href={`mailto:${profile.email}`}>
              {profile.email} <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          </div>
          <span className="mono footer-signoff">
            <span className="status-dot" aria-hidden="true" />
            {copy.footerSignoff}
          </span>
        </div>
      </div>
    </footer>
  );
}

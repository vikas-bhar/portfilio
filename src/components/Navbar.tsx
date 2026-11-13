import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, LockKeyhole, Menu, Moon, Sun, X } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Floating3DWrapper from './Floating3DWrapper';

interface NavbarProps {
  onOpenResume: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Navbar({ onOpenResume, theme, onToggleTheme }: NavbarProps) {
  const { content } = useSiteContent();
  const { profile, copy } = content;
  const navigation = useMemo(
    () => content.sections.filter((section) => section.visible && section.id !== 'home'),
    [content.sections],
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const headerRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const site = useSiteContent();
  const reducedMotion =
    useMediaQuery('(prefers-reduced-motion: reduce)') || !site.content.settings.animations;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id === 'home' ? '' : entry.target.id);
          }
        });
      },
      { rootMargin: '-15% 0px -65% 0px' },
    );
    ['home', ...navigation.map(({ id }) => id)].forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [navigation]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    const closeOutside = (event: Event) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target))
        setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="site-header">
      <div className="container header-inner">
        <Floating3DWrapper
          className="header-brand"
          depth={18}
          tiltIntensity={16}
          floatAmplitude={3}
          floatDuration={3.5}
        >
          <a href="#home" className="wordmark" aria-label={`${profile.name}, home`}>
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

        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(({ id, label }, index) => (
            <Floating3DWrapper
              key={id}
              depth={12}
              tiltIntensity={10}
              floatAmplitude={2}
              floatDelay={index * 0.2}
            >
              <a href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined}>
                {label}
              </a>
            </Floating3DWrapper>
          ))}
        </nav>

        <div className="header-actions">
          {content.settings.resumeEnabled && (
            <Floating3DWrapper
              className="header-resume"
              depth={20}
              tiltIntensity={14}
              floatAmplitude={3}
              floatDelay={0.8}
            >
              <button className="resume-nav" onClick={onOpenResume}>
                Résumé <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            </Floating3DWrapper>
          )}
          <span className="header-divider" aria-hidden="true" />
          <button
            className="icon-button theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <motion.button
            ref={menuToggleRef}
            className="icon-button mobile-menu-toggle"
            whileTap={reducedMotion ? undefined : { scale: 0.9 }}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="site-navigation-menu"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </motion.button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-nav"
            id="site-navigation-menu"
            aria-label="Menu navigation"
            initial={reducedMotion ? false : { opacity: 0, height: 0, rotateX: -15 }}
            animate={{ opacity: 1, height: 'auto', rotateX: 0 }}
            exit={{ opacity: 0, height: 0, rotateX: reducedMotion ? 0 : -15 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
            style={{ transformOrigin: 'top center' }}
          >
            {navigation.map(({ id, label }, index) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
                <span className="mono">0{index + 1}</span>
                {label}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            ))}
            <a
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              <LockKeyhole size={16} aria-hidden="true" />
              Admin login
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            {content.settings.resumeEnabled && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenResume();
                }}
              >
                View résumé <ArrowUpRight size={18} aria-hidden="true" />
              </button>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

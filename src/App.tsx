/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fragment, lazy, Suspense, useState } from 'react';
import { MotionConfig } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ResumeModal from './components/ResumeModal';
import CyberMatrixWires from './components/CyberMatrixWires';
import WireframeGlobe from './components/WireframeGlobe';
import { useTheme } from './hooks/useTheme';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useSiteContent } from './hooks/useSiteContent';

const Ambient3DBackground = lazy(() => import('./components/Ambient3DBackground'));

export default function App() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const { content, previewMode, loadError } = useSiteContent();
  const { theme, toggleTheme } = useTheme(content.settings.defaultTheme);
  const reducedMotion =
    useMediaQuery('(prefers-reduced-motion: reduce)') || !content.settings.animations;
  const sections = {
    home: <Hero onOpenResume={() => setIsResumeOpen(true)} />,
    project: <Projects />,
    'my-skill': <Skills />,
    'about-me': <About />,
    experience: <Experience />,
    contact: <Contact />,
  };
  const backgroundFallback = (
    <div className="ambient-background" aria-hidden="true">
      <WireframeGlobe />
    </div>
  );

  return (
    <MotionConfig reducedMotion={content.settings.animations ? 'user' : 'always'}>
      <div className="site-shell">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Suspense fallback={backgroundFallback}>
          {reducedMotion ? backgroundFallback : <Ambient3DBackground />}
        </Suspense>
        <CyberMatrixWires />
        <Navbar
          onOpenResume={() => setIsResumeOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        {previewMode && (
          <div className="draft-preview-banner" role="status">
            <strong>PRIVATE DRAFT PREVIEW — not published</strong>
            <span>{loadError ?? 'Only your authenticated session can see this draft.'}</span>
            <a href="/admin">Back to admin</a>
          </div>
        )}
        <main id="main" tabIndex={-1}>
          {content.sections
            .filter((section) => section.visible)
            .map((section) => (
              <Fragment key={section.id}>{sections[section.id]}</Fragment>
            ))}
        </main>
        <Footer />
        <ResumeModal
          isOpen={isResumeOpen && content.settings.resumeEnabled}
          onClose={() => setIsResumeOpen(false)}
        />
      </div>
    </MotionConfig>
  );
}

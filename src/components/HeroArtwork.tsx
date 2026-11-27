import { ArrowUpRight, Asterisk, Braces, Sparkle } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import Floating3DWrapper from './Floating3DWrapper';

/** Original, purely decorative notebook artwork — never a project UI capture. */
export default function HeroArtwork() {
  const { content } = useSiteContent();
  return (
    <div className="studio-artwork" aria-hidden="true">
      <div className="notebook-backing" />
      <Asterisk className="studio-spark studio-spark-top" size={68} strokeWidth={1.1} />
      <Floating3DWrapper
        depth={15}
        tiltIntensity={8}
        floatAmplitude={5}
        floatDuration={6}
        enableHoverDepth={false}
      >
        <div className="notebook-print">
          <div className="notebook-topline mono">
            <Braces size={18} strokeWidth={1.4} />
            <span>WEB / AI / SYSTEMS</span>
            <ArrowUpRight size={18} strokeWidth={1.3} />
          </div>
          <div className="notebook-sketch">
            <svg viewBox="0 0 360 255" fill="none">
              <path d="M39 194C11 158 33 105 74 99M279 62c42 1 65 44 47 73M82 216c67 28 161 23 204-10" />
              <path
                className="sketch-dashed"
                d="M52 130l49-23m158 9 45 45M98 203l36-25m120 13 38 19"
              />
              <g transform="rotate(-8 180 130)">
                <rect className="sketch-back-sheet" x="82" y="49" width="197" height="147" rx="5" />
              </g>
              <g transform="rotate(5 180 130)">
                <rect className="sketch-window" x="76" y="54" width="207" height="150" rx="5" />
                <path d="M76 80h207" />
                <circle cx="91" cy="67" r="2.5" className="sketch-dot" />
                <circle cx="102" cy="67" r="2.5" className="sketch-dot" />
                <circle cx="113" cy="67" r="2.5" className="sketch-dot" />
                <path
                  d="m135 113-20 18 20 18m89-36 20 18-20 18m-33-43-22 51"
                  className="sketch-code"
                />
                <path d="M133 177h93" className="sketch-dashed" />
              </g>
              <g className="sketch-star" transform="translate(286 40)">
                <path d="M0-17 4-5 16-7 8 2 15 12 3 9-2 21-5 8-18 10-10 0-18-10-5-7Z" />
              </g>
              <circle cx="57" cy="169" r="16" className="sketch-orbit" />
              <path d="m49 169 6 6 10-12" />
            </svg>
            <div className="notebook-steps">
              {content.buildPath.map((stage, index) => (
                <span key={stage.title}>
                  <small className="mono">0{index + 1}</small>
                  {stage.title}
                </span>
              ))}
            </div>
          </div>
          <div className="notebook-caption">
            <strong>{content.copy.builderNoteTitle}</strong>
            <span>{content.copy.builderNoteDetail}</span>
          </div>
        </div>
      </Floating3DWrapper>
      <Sparkle className="studio-spark studio-spark-bottom" size={42} strokeWidth={1.1} />
      <svg className="notebook-doodle" viewBox="0 0 130 70" fill="none">
        <path d="M6 48C40 80 87 55 73 28 59 1 30 46 79 41c17-2 32-13 41-29m-17 8 19-12-2 24" />
      </svg>
    </div>
  );
}

import { useSiteContent } from '../hooks/useSiteContent';
import { useEffect, useRef, useState } from 'react';

interface WirePath {
  id: string;
  d: string;
  targetX: number;
  targetY: number;
  label: string;
}

/** Original circuit splines, moving packets, ping rings and spinning matrix node. */
export default function CyberMatrixWires() {
  const { content } = useSiteContent();
  const sectionLayout = content.sections
    .map((section) => `${section.id}:${section.visible}`)
    .join('|');
  const svgRef = useRef<SVGSVGElement>(null);
  const [{ wirePaths, windowWidth }, setLayout] = useState<{
    wirePaths: WirePath[];
    windowWidth: number;
  }>({ wirePaths: [], windowWidth: 1200 });

  useEffect(() => {
    let frame = 0;
    let viewportFrame = 0;
    let disposed = false;
    const root = document.querySelector<HTMLElement>('.site-shell');
    if (!root) return;

    const syncViewport = () => {
      const svg = svgRef.current;
      if (disposed || !svg) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const top = window.scrollY - rootTop;
      // Render the exact document-space paths through a viewport-sized window.
      // A page-tall SVG filter otherwise allocates enormous offscreen textures.
      svg.setAttribute('viewBox', `0 ${top} ${width} ${height}`);
      const glow = svg.querySelector('#circuitGlow');
      glow?.setAttribute('x', '-32');
      glow?.setAttribute('y', String(top - 32));
      glow?.setAttribute('width', String(width + 64));
      glow?.setAttribute('height', String(height + 64));
    };
    const scheduleViewport = () => {
      if (disposed) return;
      cancelAnimationFrame(viewportFrame);
      viewportFrame = requestAnimationFrame(syncViewport);
    };

    const updateWires = () => {
      if (disposed) return;
      const width = window.innerWidth;
      const originX = width / 2;
      const originY = 320;
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const targetConfigs = [
        { id: 'about-me', name: 'NEURAL // CORE' },
        { id: 'project', name: 'PIPELINE // APPS' },
        { id: 'my-skill', name: 'MATRIX // STACK' },
        { id: 'contact', name: 'UPLINK // CONNECT' },
      ];
      const paths: WirePath[] = [];
      targetConfigs.forEach((config, index) => {
        const element = document.getElementById(config.id);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const isLeft = index % 2 === 0;
        const targetX = isLeft
          ? Math.max(rect.left + 40, 50)
          : Math.min(rect.right - 40, width - 50);
        const targetY = rect.top + 70 + window.scrollY - rootTop;
        const deltaY = targetY - originY;
        const midY1 = originY + deltaY * 0.28;
        const midX1 = originX + (isLeft ? -160 : 160);
        const midY2 = originY + deltaY * 0.72;
        const midX2 = targetX + (isLeft ? -40 : 40);
        paths.push({
          id: config.id,
          d: `M ${originX} ${originY} C ${midX1} ${midY1}, ${midX2} ${midY2}, ${targetX} ${targetY}`,
          targetX,
          targetY,
          label: config.name,
        });
      });
      setLayout({ wirePaths: paths, windowWidth: width });
      syncViewport();
    };
    const scheduleUpdate = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateWires);
    };
    // The original spline math is unchanged. Measure on layout changes rather than
    // forcing an identical React render on every scroll event.
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(root);
    root.querySelectorAll('main > section, .site-header, .site-footer').forEach((section) => {
      observer.observe(section);
    });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleViewport, { passive: true });
    document.addEventListener('load', scheduleUpdate, true);
    void document.fonts?.ready.then(scheduleUpdate);
    scheduleUpdate();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(viewportFrame);
      observer.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleViewport);
      document.removeEventListener('load', scheduleUpdate, true);
    };
  }, [sectionLayout]);

  return (
    <div className="cyber-matrix-wires" aria-hidden="true">
      <svg
        ref={svgRef}
        className="matrix-svg"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* High-Contrast Crisp White & Silver Glowing Gradients */}
          <linearGradient id="cyberWireWhite" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="cyberDataPulseWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>

          {/* Glowing Filters */}
          <filter id="whiteGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="circuitGlow" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Floating Digital Coordinate Crosses in Background */}
        {[
          { x: 120, y: 450, tag: '[NODE::01]' },
          { x: windowWidth - 140, y: 750, tag: '[GEO::SPATIAL]' },
          { x: 80, y: 1350, tag: '[AI::STREAM]' },
          { x: windowWidth - 160, y: 1950, tag: '[PIPELINE::V4]' },
          { x: 140, y: 2550, tag: '[TENSOR::SYS]' },
          { x: windowWidth - 120, y: 3150, tag: '[SOCKET::READY]' },
        ].map((pt, idx) => (
          <g
            key={idx}
            opacity={0.35}
            className="restored-pulse"
            style={{ animationDuration: `${3.5 + idx * 0.8}s` }}
          >
            <line
              x1={pt.x - 12}
              y1={pt.y}
              x2={pt.x + 12}
              y2={pt.y}
              stroke="currentColor"
              strokeWidth="1"
            />
            <line
              x1={pt.x}
              y1={pt.y - 12}
              x2={pt.x}
              y2={pt.y + 12}
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle cx={pt.x} cy={pt.y} r="2" fill="currentColor" />
            <text
              x={pt.x + 16}
              y={pt.y + 4}
              fill="currentColor"
              fontSize="9"
              fontFamily="monospace"
              opacity="0.6"
            >
              {pt.tag}
            </text>
          </g>
        ))}

        {/* Render Circuit Bus Wires & Energy Pulses to Each Section */}
        {wirePaths.map((wire, index) => (
          <g key={wire.id} data-target={wire.id}>
            {/* Broad Subtle White Halo */}
            <path
              d={wire.d}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeOpacity="0.06"
            />

            {/* Base Fiber Circuit Wire */}
            <path
              d={wire.d}
              fill="none"
              stroke="url(#cyberWireWhite)"
              strokeWidth="1.2"
              strokeDasharray="6 6"
              strokeOpacity="0.25"
            />

            {/* Kinetic High-Speed Energy Pulse 1 */}
            <path
              d={wire.d}
              fill="none"
              stroke="url(#cyberDataPulseWhite)"
              strokeWidth="2.2"
              strokeDasharray="30 180"
              strokeDashoffset="0"
              className="circuit-pulse"
              style={{
                animationDuration: `${2.8 + index * 0.4}s`,
                animationDelay: `${index * 0.35}s`,
              }}
              filter="url(#circuitGlow)"
            />

            {/* Fast Spark Packet 2 */}
            <path
              d={wire.d}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeDasharray="8 240"
              strokeDashoffset="0"
              className="circuit-pulse"
              style={{
                animationDuration: `${2.0 + index * 0.3}s`,
                animationDelay: `${0.7 + index * 0.3}s`,
              }}
            />

            {/* Target Section Node Terminal Anchor */}
            <g transform={`translate(${wire.targetX}, ${wire.targetY})`}>
              {/* Outer Pulse Ping Ring */}
              <circle
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.4"
                className="restored-ping"
                style={{ animationDuration: '3s', animationDelay: `${index * 0.4}s` }}
              />

              {/* Node Outer Ring */}
              <circle
                r="8"
                fill="var(--bg)"
                stroke="currentColor"
                strokeWidth="2"
                filter="url(#whiteGlow)"
              />

              {/* Node Core */}
              <circle r="3.5" fill="currentColor" className="restored-pulse" />

              {/* Terminal Port Label */}
              <rect
                x="-48"
                y="14"
                width="96"
                height="18"
                rx="4"
                fill="var(--bg)"
                fillOpacity="0.9"
                stroke="currentColor"
                strokeWidth="1"
              />
              <text
                x="0"
                y="26"
                textAnchor="middle"
                fill="currentColor"
                fontSize="8.5"
                fontFamily="monospace"
                fontWeight="bold"
                letterSpacing="0.8"
              >
                {wire.label}
              </text>
            </g>
          </g>
        ))}

        {/* Central Top Matrix Node Anchor in Hero */}
        <g transform={`translate(${windowWidth / 2}, 320)`}>
          <circle
            r="38"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            strokeOpacity="0.4"
            className="matrix-orbit orbit-outer"
          />
          <circle
            r="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.25"
            className="matrix-orbit orbit-inner"
          />
          <circle r="6" fill="currentColor" opacity="0.8" className="restored-pulse" />
        </g>
      </svg>
    </div>
  );
}

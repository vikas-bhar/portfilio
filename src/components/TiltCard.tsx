import { useSiteContent } from '../hooks/useSiteContent';
import { useState, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glareOpacity?: number;
  perspective?: number;
  floating?: boolean;
  floatDelay?: number;
}

/** Implements the full tilt/glare/floating API referenced by the uploaded sections. */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 14,
  scale = 1.04,
  glareOpacity = 0.22,
  perspective = 1200,
  floating = true,
  floatDelay = 0,
}: TiltCardProps) {
  const site = useSiteContent();
  const reducedMotion =
    useMediaQuery('(prefers-reduced-motion: reduce)') || !site.content.settings.animations;
  const canHover = useMediaQuery('(hover: hover)');
  const [hovered, setHovered] = useState(false);
  const enabled = !reducedMotion && canHover;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.8), transparent 65%)`;
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 250,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 250,
    damping: 25,
  });

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;
    x.set(relativeX - 0.5);
    y.set(relativeY - 0.5);
    glareX.set(relativeX * 100);
    glareY.set(relativeY * 100);
  };

  return (
    <div
      className={`tilt-card ${className}`}
      style={{ perspective }}
      onPointerMove={handleMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
        setHovered(false);
      }}
      data-motion={reducedMotion ? 'reduced' : 'tilt'}
    >
      <motion.div
        className="tilt-float"
        animate={!reducedMotion && floating ? { y: [0, -6, 0, 3.6, 0] } : { y: 0 }}
        transition={
          !reducedMotion && floating
            ? { duration: 4.5, delay: floatDelay, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0 }
        }
      >
        <motion.div
          className="tilt-card-inner"
          style={enabled ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
          whileHover={enabled ? { scale, transition: { duration: 0.2 } } : undefined}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        >
          {children}
          <motion.div
            aria-hidden="true"
            className="tilt-card-glare"
            style={{ background: glare, opacity: enabled && hovered ? glareOpacity : 0 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

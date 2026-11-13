import { useSiteContent } from '../hooks/useSiteContent';
import { useRef, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useMediaQuery } from '../hooks/useMediaQuery';

export interface Floating3DWrapperProps {
  children: ReactNode;
  className?: string;
  depth?: number;
  tiltIntensity?: number;
  floatAmplitude?: number;
  floatDuration?: number;
  floatDelay?: number;
  enableHoverDepth?: boolean;
}

/** Original floating path, pointer parallax, and hover depth from the uploaded wrapper. */
export default function Floating3DWrapper({
  children,
  className = '',
  depth = 20,
  tiltIntensity = 12,
  floatAmplitude = 6,
  floatDuration = 4,
  floatDelay = 0,
  enableHoverDepth = true,
}: Floating3DWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const site = useSiteContent();
  const reducedMotion =
    useMediaQuery('(prefers-reduced-motion: reduce)') || !site.content.settings.animations;
  const canHover = useMediaQuery('(hover: hover)');
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 350 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);
  const interactive = !reducedMotion && canHover;

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive || event.pointerType === 'touch' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div
      ref={ref}
      className={`floating-wrapper ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
      style={{ perspective: 1000 }}
      data-motion={reducedMotion ? 'reduced' : 'floating'}
    >
      {/* Separate layers keep the original float and pointer Y offset from overwriting each other. */}
      <motion.div
        className="floating-motion"
        animate={
          reducedMotion
            ? { y: 0, rotateZ: 0 }
            : {
                y: [0, -floatAmplitude, 0, floatAmplitude * 0.6, 0],
                rotateZ: [0, 0.8, 0, -0.8, 0],
              }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : {
                duration: floatDuration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: floatDelay,
              }
        }
      >
        <motion.div
          className="floating-tilt"
          style={
            interactive
              ? { rotateX, rotateY, x: translateX, y: translateY, transformStyle: 'preserve-3d' }
              : undefined
          }
          whileHover={
            interactive && enableHoverDepth
              ? { scale: 1.05, z: depth, transition: { duration: 0.2 } }
              : undefined
          }
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        >
          <div
            className="floating-content"
            style={
              reducedMotion
                ? undefined
                : { transform: `translateZ(${depth}px)`, transformStyle: 'preserve-3d' }
            }
          >
            {children}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

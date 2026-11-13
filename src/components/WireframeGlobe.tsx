/** Shared static fallback; no WebGL library is needed to render this globe. */
export default function WireframeGlobe() {
  return (
    <svg className="ambient-fallback" viewBox="0 0 400 400" fill="none">
      <g stroke="currentColor" strokeWidth="0.6">
        <circle cx="200" cy="200" r="170" />
        {[35, 70, 110, 145].map((radius) => (
          <ellipse key={radius} cx="200" cy="200" rx={radius} ry="170" />
        ))}
        {[55, 100, 140].map((radius) => (
          <ellipse key={radius} cx="200" cy="200" rx="170" ry={radius} />
        ))}
        <path d="M30 200h340M200 30v340" />
      </g>
    </svg>
  );
}

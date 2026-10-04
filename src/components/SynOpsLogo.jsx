export default function SynOpsLogo({ size = 38, darkBg = true }) {
  // Background color for the donut holes depends on where logo is placed
  const holeFill = darkBg ? '#1A0A2E' : '#F9FAFB';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="synops-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="synops-g2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="synops-g3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0891B2" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="synops-g4" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <radialGradient id="synops-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CFFAFE" stopOpacity="1" />
          <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Top-left donut - purple gradient */}
      <circle cx="38" cy="38" r="22" fill="url(#synops-g1)" />
      <circle cx="38" cy="38" r="9" fill={holeFill} />

      {/* Top-right donut - deep purple */}
      <circle cx="62" cy="38" r="22" fill="url(#synops-g2)" opacity="0.88" />
      <circle cx="62" cy="38" r="9" fill={holeFill} />

      {/* Bottom-left donut - magenta/purple */}
      <circle cx="38" cy="62" r="22" fill="url(#synops-g3)" opacity="0.88" />
      <circle cx="38" cy="62" r="9" fill={holeFill} />

      {/* Bottom-right donut - blue/purple */}
      <circle cx="62" cy="62" r="22" fill="url(#synops-g4)" />
      <circle cx="62" cy="62" r="9" fill={holeFill} />

      {/* Center glow */}
      <circle cx="50" cy="50" r="13" fill="url(#synops-center)" />
    </svg>
  );
}

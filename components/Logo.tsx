export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8b2dff" /><stop offset="1" stopColor="#19b8ff" /></linearGradient></defs>
        <rect width="48" height="48" rx="14" fill="url(#lg)" />
        <path d="M13 31 L22 22 L27 27 L36 16" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M29 16 H36 V23" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span className="text-lg font-extrabold tracking-wide">OMA<span className="text-neon">-</span>BOOSTER</span>
    </span>
  );
}

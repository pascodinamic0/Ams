import { cn } from "@/lib/utils";

type BrandLogoMarkProps = {
  size?: number;
  className?: string;
  /** Adds a soft outer glow - best on dark / hero backgrounds */
  glow?: boolean;
};

/**
 * ShuleOS crest: open knowledge rising into a golden achievement star.
 * Inline SVG so gradients stay crisp at every size.
 */
export function BrandLogoMark({
  size = 40,
  className,
  glow = false,
}: BrandLogoMarkProps) {
  const id = "shuleos-mark";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      className={cn(
        "shrink-0",
        glow &&
          "drop-shadow-[0_0_14px_rgba(20,184,166,0.55)] drop-shadow-[0_4px_12px_rgba(4,47,46,0.45)]",
        className
      )}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="4" y1="44" x2="44" y2="4">
          <stop offset="0%" stopColor="#022c22" />
          <stop offset="38%" stopColor="#0f766e" />
          <stop offset="72%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="24" y1="34" x2="24" y2="10">
          <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.15" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#99f6e4" />
        </linearGradient>
        <linearGradient id={`${id}-page-l`} x1="10" y1="30" x2="22" y2="36">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#ccfbf1" stopOpacity="0.72" />
        </linearGradient>
        <radialGradient
          id={`${id}-star-glow`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(24 11.5) scale(9)"
        >
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-star`} x1="24" y1="6" x2="24" y2="17">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter
          id={`${id}-depth`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#022c22" floodOpacity="0.35" />
        </filter>
        <filter id={`${id}-star-shine`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        width="48"
        height="48"
        rx="13"
        fill={`url(#${id}-bg)`}
        filter={`url(#${id}-depth)`}
      />
      <rect
        x="1.25"
        y="1.25"
        width="45.5"
        height="45.5"
        rx="11.75"
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="0.75"
      />
      <path
        d="M8 12C14 8 34 8 40 12"
        stroke="white"
        strokeOpacity="0.08"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path
        d="M11 18.5C16.5 14.5 31.5 14.5 37 18.5"
        stroke="#5eead4"
        strokeOpacity="0.35"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeDasharray="2.5 3.5"
      />
      <path
        d="M24 33.5V13.5"
        stroke={`url(#${id}-beam)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M24 28.5C21.8 25.8 21.8 22.2 24 19.5C26.2 22.2 26.2 25.8 24 28.5Z"
        fill="#ffffff"
        fillOpacity="0.92"
      />
      <path
        d="M24 34.2L11.5 29.8C10.4 29.3 10 28.1 10.4 27C10.8 25.8 12 25.2 13.2 25.7L24 29.8L34.8 25.7C36 25.2 37.2 25.8 37.6 27C38 28.1 37.6 29.3 36.5 29.8L24 34.2Z"
        fill={`url(#${id}-page-l)`}
      />
      <path
        d="M24 34.2L13.2 30.1C12.3 29.7 11.8 28.8 12 27.9C12.2 27 13.1 26.5 14 26.9L24 30.8V34.2Z"
        fill="#ffffff"
        fillOpacity="0.55"
      />
      <path
        d="M24 34.2L34.8 30.1C35.7 29.7 36.2 28.8 36 27.9C35.8 27 34.9 26.5 34 26.9L24 30.8V34.2Z"
        fill="#ffffff"
        fillOpacity="0.35"
      />
      <path
        d="M24 29.8V34.2"
        stroke="#0f766e"
        strokeOpacity="0.45"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M19.5 31.5C21.2 28.8 22.8 24.8 24 20.5C25.2 24.8 26.8 28.8 28.5 31.5"
        stroke="#99f6e4"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="24" cy="11.5" r="7.5" fill={`url(#${id}-star-glow)`} />
      <path
        d="M24 7.2L25.1 10.3L28.4 10.3L25.65 12.3L26.75 15.4L24 13.4L21.25 15.4L22.35 12.3L19.6 10.3L22.9 10.3L24 7.2Z"
        fill={`url(#${id}-star)`}
        filter={`url(#${id}-star-shine)`}
      />
      <circle cx="23.1" cy="9.4" r="0.85" fill="#fffbeb" fillOpacity="0.85" />
    </svg>
  );
}

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const BrandMark: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const dimension = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const rx = size === 'sm' ? 8 : size === 'lg' ? 12 : 10;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={dimension}
      height={dimension}
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bm-emerald" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#248A68" />
          <stop offset="60%" stopColor="#1B7457" />
          <stop offset="100%" stopColor="#13533D" />
        </linearGradient>
        <radialGradient id="bm-highlight" cx="24" cy="8" r="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Squircle Base with Depth */}
      <rect width="48" height="48" rx={13} fill="url(#bm-emerald)" />
      <rect width="48" height="48" rx={13} fill="url(#bm-highlight)" />
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx={12}
        stroke="#FFFFFF"
        strokeOpacity="0.22"
        strokeWidth="1.2"
      />

      {/* Pen Nib Silhouette (Tilted 38 deg for dynamic grace) */}
      <g transform="translate(23.5, 25.5) rotate(-38) translate(-24, -24)">
        {/* Nib Body */}
        <path
          d="M24 7.5 L29 18 C30.8 21.5 32 24.2 32 27 C32 31.4 28.4 35 24 35 C19.6 35 16 31.4 16 27 C16 24.2 17.2 21.5 19 18 Z"
          fill="#FFFFFF"
        />

        {/* Nib Breather Hole (Vermillion / Coral Accent) */}
        <circle cx="24" cy="23.5" r="2.5" fill="#EE6A4B" />

        {/* Center Ink Slit */}
        <line
          x1="24"
          y1="7.5"
          x2="24"
          y2="21"
          stroke="#13533D"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Subtle Base Ring */}
        <path
          d="M19.5 33.5 C20.8 34.5 22.3 35 24 35 C25.7 35 27.2 34.5 28.5 33.5"
          stroke="#D5CDBD"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* The Muse Sparkle (4-point star in Coral/Vermillion at upper-right) */}
      <path
        d="M34.5 8.5 C34.5 11 32.8 12.8 30.5 12.8 C32.8 12.8 34.5 14.6 34.5 17.1 C34.5 14.6 36.2 12.8 38.5 12.8 C36.2 12.8 34.5 11 34.5 8.5 Z"
        fill="#EE6A4B"
      />
      {/* Tiny companion glint */}
      <circle cx="39" cy="7.5" r="1.1" fill="#FFB199" />
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  className = '',
}) => {
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const taglineSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-[11px]' : 'text-[9.5px]';

  return (
    <div className={`flex items-center gap-3 group shrink-0 ${className}`}>
      <div className="relative group-hover:scale-105 transition-transform duration-200">
        <BrandMark size={size} />
      </div>

      {showText && (
        <div className="flex flex-col justify-center select-none">
          <div className="flex items-center leading-none">
            <span className={`font-serif font-bold tracking-tight text-[#2B2B2B] ${textSize}`}>
              Reply<span className="text-[#1F7A5C]">Muse</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EE6A4B] ml-1 mb-1 self-end inline-block" />
          </div>

          {showTagline && (
            <p
              className="uppercase font-semibold mt-1 hidden sm:block"
              style={{
                fontSize: '0.68rem',
                letterSpacing: '0.08em',
                color: '#7A7468',
              }}
            >
              Every reply, in your voice
            </p>
          )}
        </div>
      )}
    </div>
  );
};

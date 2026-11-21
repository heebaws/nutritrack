import React from 'react';

/**
 * Low-contrast organic botanical line art, citrus/avocado shapes, and gentle wellness arcs.
 * Kept intentionally whisper-soft so dashboard cards and typography retain WCAG AA contrast.
 */
export const WellnessBackdrop: React.FC = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Top-right botanical branch line art */}
      <svg
        className="absolute -top-8 -right-12 w-72 h-72 sm:w-96 sm:h-96 text-emerald-900 dark:text-emerald-300 opacity-[0.045] dark:opacity-[0.055]"
        viewBox="0 0 320 320"
        fill="none"
      >
        <path
          d="M290 24 C230 74, 185 138, 128 242"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M236 74 C190 52, 146 68, 134 104 C178 112, 218 98, 236 74 Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M196 128 C242 114, 286 138, 290 176 C248 176, 212 154, 196 128 Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M164 176 C122 156, 80 172, 68 208 C110 216, 146 198, 164 176 Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      {/* Bottom-left wellness fruit & heartbeat ring line art */}
      <svg
        className="absolute -bottom-10 -left-10 w-80 h-80 sm:w-[420px] sm:h-[420px] text-emerald-900 dark:text-emerald-200 opacity-[0.04] dark:opacity-[0.05]"
        viewBox="0 0 360 360"
        fill="none"
      >
        <circle cx="132" cy="236" r="88" stroke="currentColor" strokeWidth="1.8" strokeDasharray="8 8" />
        {/* Stylized avocado/citrus silhouette */}
        <path
          d="M132 162 C164 162, 186 206, 186 244 C186 282, 162 308, 132 308 C102 308, 78 282, 78 244 C78 206, 100 162, 132 162 Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="132" cy="252" r="22" stroke="currentColor" strokeWidth="2" />
        {/* Gentle leaf stem */}
        <path
          d="M214 278 C246 250, 292 252, 316 282 C282 298, 236 296, 214 278 Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

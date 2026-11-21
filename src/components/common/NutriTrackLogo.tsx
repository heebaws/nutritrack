import React from 'react';

export interface NutriTrackLogoProps {
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color theme variant (includes monochrome option) */
  variant?: 'light' | 'dark' | 'auto' | 'mono';
  /** Whether to render icon mark only or with text */
  showText?: boolean;
  /** Optional pill badge next to brand name */
  badge?: string;
  /** Optional subtitle (defaults to brand tagline "Eat smart. Live strong.") */
  subtitle?: string;
  /** Optional extra CSS classes */
  className?: string;
}

/**
 * NutriTrack Brand Mark v2
 * Botanical leaf intertwined with a circular progress ring and heartbeat pulse wave.
 * Includes full-color Emerald/Coral emblem and monochrome variant (`variant="mono"`).
 */
export const NutriTrackLogo: React.FC<NutriTrackLogoProps> = ({
  size = 'md',
  variant = 'auto',
  showText = true,
  badge,
  subtitle = 'Eat smart. Live strong.',
  className = '',
}) => {
  const dimensions = {
    xs: { icon: 26, fontSize: 'text-sm', subSize: 'text-[10px]' },
    sm: { icon: 34, fontSize: 'text-base', subSize: 'text-[10px]' },
    md: { icon: 42, fontSize: 'text-lg', subSize: 'text-[11px]' },
    lg: { icon: 50, fontSize: 'text-2xl', subSize: 'text-xs' },
    xl: { icon: 64, fontSize: 'text-3xl', subSize: 'text-sm' },
  }[size];

  const isDarkSurface = variant === 'dark';
  const isMono = variant === 'mono';
  const titleColorClass = isMono
    ? 'text-current'
    : isDarkSurface
    ? 'text-white'
    : variant === 'light'
    ? 'text-[#122119]'
    : 'text-[#122119] dark:text-white';
  const subColorClass = isMono
    ? 'text-current opacity-75'
    : isDarkSurface
    ? 'text-emerald-200/85'
    : variant === 'light'
    ? 'text-[#52675B]'
    : 'text-[#52675B] dark:text-emerald-200/80';

  const uid = `${size}-${variant}`;

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none max-w-full min-w-0 ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-105"
        style={{ width: dimensions.icon, height: dimensions.icon }}
      >
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {!isMono && (
            <defs>
              <linearGradient id={`nt-v2-bg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isDarkSurface ? '#09442A' : '#063723'} />
                <stop offset="100%" stopColor={isDarkSurface ? '#156A43' : '#0F5132'} />
              </linearGradient>
              <linearGradient id={`nt-v2-ring-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="60%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#E06D53" />
              </linearGradient>
              <linearGradient id={`nt-v2-leaf-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#A7F3D0" />
              </linearGradient>
            </defs>
          )}

          {/* Rounded squircle emblem container */}
          <rect
            x="18"
            y="18"
            width="476"
            height="476"
            rx="124"
            fill={isMono ? 'currentColor' : `url(#nt-v2-bg-${uid})`}
            fillOpacity={isMono ? 0.1 : 1}
          />
          <rect
            x="22"
            y="22"
            width="468"
            height="468"
            rx="120"
            stroke={isMono ? 'currentColor' : 'rgba(255,255,255,0.22)'}
            strokeOpacity={isMono ? 0.45 : 1}
            strokeWidth="8"
          />

          {/* Progress ring track */}
          <circle
            cx="256"
            cy="256"
            r="164"
            stroke={isMono ? 'currentColor' : 'rgba(255,255,255,0.16)'}
            strokeOpacity={isMono ? 0.25 : 1}
            strokeWidth="22"
          />
          {/* Progress arc */}
          <circle
            cx="256"
            cy="256"
            r="164"
            stroke={isMono ? 'currentColor' : `url(#nt-v2-ring-${uid})`}
            strokeWidth="22"
            strokeLinecap="round"
            strokeDasharray="815 1030"
            transform="rotate(-118 256 256)"
          />

          {/* Botanical leaf */}
          <path
            d="M178 320 C174 234, 224 166, 330 144 C336 228, 286 312, 178 320 Z"
            fill={isMono ? 'currentColor' : `url(#nt-v2-leaf-${uid})`}
            fillOpacity={isMono ? 0.35 : 0.92}
          />

          {/* Heartbeat vitality pulse line */}
          {!isMono && (
            <path
              d="M148 264 L206 264 L230 220 L256 302 L284 244 L306 264 L364 264"
              stroke="#063723"
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <path
            d="M148 264 L206 264 L230 220 L256 302 L284 244 L306 264 L364 264"
            stroke={isMono ? 'currentColor' : '#FFFFFF'}
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vitality coral sprout dot */}
          <circle
            cx="332"
            cy="144"
            r="16"
            fill={isMono ? 'currentColor' : '#E06D53'}
            stroke={isMono ? 'none' : '#FFFFFF'}
            strokeWidth="5"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`font-editorial font-bold tracking-tight truncate ${dimensions.fontSize} ${titleColorClass}`}>
              Nutri<span className={isMono ? '' : 'text-emerald-600 dark:text-emerald-400'}>Track</span>
            </span>
            {badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 uppercase tracking-wider shrink-0">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`font-medium tracking-normal truncate ${dimensions.subSize} ${subColorClass}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NutriTrackLogo;

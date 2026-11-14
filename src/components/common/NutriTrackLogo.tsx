import React from 'react';

export interface NutriTrackLogoProps {
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color theme variant */
  variant?: 'light' | 'dark' | 'auto';
  /** Whether to render only the N-leaf icon mark or with text */
  showText?: boolean;
  /** Badge text next to brand name (default: "PRO") */
  badge?: string;
  /** Optional secondary subtitle / badge */
  subtitle?: string;
  /** Optional extra CSS classes */
  className?: string;
}

/**
 * NutriTrack Modern Branding Logo
 * Distinctive letter "N" combined with a stylized organic nutrition leaf.
 * Brand Colors: Dark forest green (#064e3b), fresh lime green (#84cc16 / #22c55e / #10b981), crisp white.
 */
export const NutriTrackLogo: React.FC<NutriTrackLogoProps> = ({
  size = 'md',
  variant = 'auto',
  showText = true,
  badge = 'PRO',
  subtitle,
  className = '',
}) => {
  // Dimension mappings
  const dimensions = {
    xs: { icon: 24, fontSize: 'text-sm', subSize: 'text-[9px]' },
    sm: { icon: 32, fontSize: 'text-base', subSize: 'text-[10px]' },
    md: { icon: 40, fontSize: 'text-lg', subSize: 'text-xs' },
    lg: { icon: 48, fontSize: 'text-2xl', subSize: 'text-xs' },
    xl: { icon: 64, fontSize: 'text-3xl', subSize: 'text-sm' },
  }[size];

  const isDarkSurface = variant === 'dark';
  const titleColorClass = isDarkSurface
    ? 'text-white'
    : variant === 'light'
    ? 'text-slate-900'
    : 'text-slate-900 dark:text-white';
  const subColorClass = isDarkSurface
    ? 'text-emerald-200/80'
    : variant === 'light'
    ? 'text-slate-500'
    : 'text-slate-500 dark:text-emerald-200/80';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon Mark: Standalone SVG */}
      <div 
        className="relative shrink-0 flex items-center justify-center transition-transform hover:scale-105"
        style={{ width: dimensions.icon, height: dimensions.icon }}
      >
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`nt-bg-${size}-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkSurface ? "#064e3b" : "#043d2e"} />
              <stop offset="60%" stopColor={isDarkSurface ? "#065f46" : "#064e3b"} />
              <stop offset="100%" stopColor={isDarkSurface ? "#047857" : "#065f46"} />
            </linearGradient>

            <linearGradient id={`nt-leaf-${size}-${variant}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#84cc16" />
            </linearGradient>
          </defs>

          {/* Squircle rounded background shield */}
          <rect
            x="20"
            y="20"
            width="472"
            height="472"
            rx="116"
            fill={`url(#nt-bg-${size}-${variant})`}
          />

          {/* Inner subtle glow rim */}
          <rect
            x="24"
            y="24"
            width="464"
            height="464"
            rx="112"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="8"
          />

          {/* Left upright stem of "N" */}
          <rect x="136" y="108" width="68" height="296" rx="34" fill="#ffffff" />

          {/* Right upright stem of "N" */}
          <rect x="306" y="108" width="68" height="296" rx="34" fill="#ffffff" />

          {/* Diagonal Spanning Nutrition Leaf */}
          <path
            d="M 172 344 
               C 172 344, 238 250, 318 174 
               C 356 138, 394 112, 416 78 
               C 420 72, 422 80, 408 122 
               C 388 166, 344 216, 290 274 
               C 246 322, 204 376, 182 390 
               C 172 396, 166 386, 166 370 
               Z"
            fill={`url(#nt-leaf-${size}-${variant})`}
          />

          {/* Clean Botanical Leaf Spine */}
          <path
            d="M 204 314 
               C 252 250, 318 178, 406 82"
            stroke="#ffffff"
            strokeWidth="12"
            strokeLinecap="round"
            strokeOpacity="0.95"
          />

          {/* Sprouting vitality bud */}
          <circle cx="368" cy="114" r="18" fill="#84cc16" />
        </svg>
      </div>

      {/* Typography Section */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight ${dimensions.fontSize} ${titleColorClass}`}>
              Nutri<span className="text-emerald-500 font-extrabold">Track</span>
            </span>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {subtitle !== undefined ? (
            <p className={`font-medium tracking-normal ${dimensions.subSize} ${subColorClass}`}>
              {subtitle}
            </p>
          ) : (
            <p className={`font-medium tracking-normal ${dimensions.subSize} ${subColorClass}`}>
              Diet &amp; Nutrition Management
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NutriTrackLogo;

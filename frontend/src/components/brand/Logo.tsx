import React from 'react';

export type LogoMarkType = 'A' | 'B' | 'C';
export type LogoVariant = 'mark' | 'horizontal';

export interface LogoProps extends React.SVGAttributes<SVGElement> {
  markType?: LogoMarkType;
  variant?: LogoVariant;
  size?: 16 | 20 | 24 | 32 | 48 | 64 | 96 | number;
  className?: string;
  showText?: boolean;
}

/**
 * Refined Concept A: Shield Outline + Circuit Trace Path + Accent Node Dot.
 * - Shield outline: uses currentColor (dark in light theme, white in dark theme).
 * - Trace line: uses theme accent token (var(--color-accent, #3DDC97)).
 * - Terminal node dot: uses theme accent token.
 * - Circuit path: enters cleanly from shield left inner edge, 90-degree bend up to accent dot.
 * - Consistent stroke widths with the shield (1.85px on 24x24 viewBox).
 * - Remains perfectly sharp and uncluttered at 16px (favicon scale).
 */
export const LogoMarkA: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => {
  // At 16px / 20px, use a high-contrast single-bend circuit trace for maximum clarity
  const isMicro = size <= 20;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`.trim()}
      aria-hidden="true"
    >
      {/* Outer Shield Outline in currentColor (dark in light theme, white in dark theme) */}
      <path
        d="M12 2.5L4.5 5.5v5.8c0 5.2 3.3 9.7 7.5 11.2 4.2-1.5 7.5-6 7.5-11.2V5.5L12 2.5z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Internal Circuit Trace Path in theme accent token */}
      {isMicro ? (
        /* Simplified single-bend circuit trace at 16px to prevent merging */
        <path
          d="M4.5 13.5H12V8.5"
          stroke="var(--color-accent, #3DDC97)"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        /* Standard 90-degree circuit path entering from left inner edge */
        <path
          d="M4.5 14H9.5V9.5H12V7.75"
          stroke="var(--color-accent, #3DDC97)"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Terminal Node Dot in theme accent token */}
      <circle
        cx="12"
        cy={isMicro ? '7.5' : '6.75'}
        r={isMicro ? '1.5' : '1.65'}
        fill="var(--color-accent, #3DDC97)"
      />
    </svg>
  );
};

export const LogoMarkB: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`.trim()}
    aria-hidden="true"
  >
    <path
      d="M4.5 18.5h3.5v-3.5l1.8-1.2a4 4 0 1 1 4.4 0l1.8 1.2v3.5h3.5"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 10.5v3"
      stroke="var(--color-accent, #3DDC97)"
      strokeWidth="1.85"
      strokeLinecap="round"
    />
    <circle cx="19.5" cy="18.5" r="1.5" fill="var(--color-accent, #3DDC97)" />
  </svg>
);

export const LogoMarkC: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`.trim()}
    aria-hidden="true"
  >
    <path
      d="M6 9.5V6.5a6 6 0 0 1 12 0v3"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 9.5h17M12 9.5v4.5m0 3v4"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="15.5" r="1.5" fill="var(--color-accent, #3DDC97)" />
  </svg>
);

/**
 * Unified Logo Component:
 * - Mark A as refined primary brand mark.
 * - Uses currentColor for outline & text, and theme accent token for circuit trace & dot.
 * - Horizontal lockup: Inter 600, letter-spacing -0.01em.
 */
export const Logo: React.FC<LogoProps> = ({
  markType = 'A',
  variant = 'horizontal',
  size = 24,
  className = '',
  showText,
}) => {
  const isHorizontal = variant === 'horizontal' || showText === true;

  const renderMark = () => {
    switch (markType) {
      case 'B':
        return <LogoMarkB size={size} />;
      case 'C':
        return <LogoMarkC size={size} />;
      case 'A':
      default:
        return <LogoMarkA size={size} />;
    }
  };

  if (!isHorizontal) {
    return <div className={`inline-flex items-center text-current ${className}`}>{renderMark()}</div>;
  }

  // Calculate proportional font size based on mark size
  const textSizeClass =
    size <= 18
      ? 'text-xs'
      : size <= 28
      ? 'text-sm'
      : size <= 36
      ? 'text-base'
      : size <= 52
      ? 'text-xl'
      : 'text-3xl';

  return (
    <div className={`inline-flex items-center gap-2.5 text-current font-sans ${className}`.trim()}>
      {renderMark()}
      <span
        className={`font-semibold tracking-[-0.01em] text-current leading-none ${textSizeClass}`}
        style={{ letterSpacing: '-0.01em' }}
      >
        Tracelock
      </span>
    </div>
  );
};

export default Logo;

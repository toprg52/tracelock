import React from 'react';

export type BadgeVariant =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info'
  | 'neutral'
  | 'success'
  | 'demo';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[12px] px-2 py-0.5 gap-1.5',
    md: 'text-[12px] px-2.5 py-1 gap-1.5',
  }[size];

  // Soft tinted background (~12-15% opacity), no border
  const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
    critical: {
      badge: 'bg-critical/15 text-critical',
      dot: 'bg-critical',
    },
    high: {
      badge: 'bg-high/15 text-high',
      dot: 'bg-high',
    },
    medium: {
      badge: 'bg-medium/15 text-medium',
      dot: 'bg-medium',
    },
    low: {
      badge: 'bg-low/15 text-low',
      dot: 'bg-low',
    },
    success: {
      badge: 'bg-low/15 text-low',
      dot: 'bg-low',
    },
    info: {
      badge: 'bg-info/15 text-info',
      dot: 'bg-info',
    },
    neutral: {
      badge: 'bg-surface-raised text-text-muted',
      dot: 'bg-text-muted',
    },
    demo: {
      badge: 'bg-high/15 text-high',
      dot: 'bg-high',
    },
  };

  const { badge: vStyle, dot: dStyle } = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center font-sans font-medium rounded-[6px] select-none ${sizeStyles} ${vStyle} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dStyle}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dStyle}`} />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </span>
  );
};

Badge.displayName = 'Badge';

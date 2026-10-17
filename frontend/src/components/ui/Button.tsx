import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium rounded transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-base gap-2.5',
    }[size];

    const variantStyles = {
      // Primary: Mint accent background and mint focus outline
      primary:
        'bg-accent text-[var(--btn-accent-text)] hover:opacity-90 active:opacity-95 shadow-sm focus-visible:outline-accent',
      // Secondary: Neutral surface-raised, 1px quiet border, no accent outline, hover lightens
      secondary:
        'bg-surface-raised border border-border/80 text-text hover:brightness-110 active:brightness-95 shadow-sm focus-visible:outline-border',
      // Ghost: Transparent background, no accent outline
      ghost:
        'bg-transparent text-text-muted hover:text-text hover:bg-surface-raised active:bg-border/30 focus-visible:outline-border',
      // Danger: Solid but slightly less saturated crimson
      danger:
        'bg-[#D44353] hover:bg-[#C23948] active:bg-[#AF303F] text-white shadow-sm focus-visible:outline-[#D44353]',
    }[variant];

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`.trim()}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          iconLeft && <span className="inline-flex shrink-0">{iconLeft}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

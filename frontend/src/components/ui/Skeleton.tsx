import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'rounded h-4 w-full my-1',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }[variant];

  const inlineStyles: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-surface-raised border border-border/40 ${variantStyles} ${className}`.trim()}
      style={inlineStyles}
      {...props}
    />
  );
};

Skeleton.displayName = 'Skeleton';

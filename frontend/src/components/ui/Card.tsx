import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised';
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', interactive = false, className = '', ...props }, ref) => {
    const bgStyle = variant === 'raised' ? 'bg-surface-raised' : 'bg-surface';
    const interactiveStyle = interactive
      ? 'transition-all duration-fast hover:border-accent/40 hover:shadow-card-hover cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`rounded-lg border border-border shadow-card ${bgStyle} ${interactiveStyle} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`px-5 py-4 border-b border-border/60 flex items-center justify-between gap-4 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className = '', ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-base font-semibold text-text leading-tight tracking-normal ${className}`.trim()}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, className = '', ...props }, ref) => (
  <p ref={ref} className={`text-[13px] font-medium text-text-muted mt-1 leading-normal ${className}`.trim()} {...props}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`p-5 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`px-5 py-3 border-t border-border/60 bg-surface-raised/40 rounded-b-lg flex items-center justify-between gap-4 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

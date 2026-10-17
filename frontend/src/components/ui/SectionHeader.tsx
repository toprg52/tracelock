import React from 'react';

export interface SectionHeaderProps {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  icon,
  badge,
  actions,
  level = 2,
  className = '',
}) => {
  const HeadingTag = (`h${level}` as unknown) as React.ElementType;

  const headingSize = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-semibold',
    3: 'text-base font-semibold',
  }[level];

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-border/70 ${className}`.trim()}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded bg-surface-raised border border-border text-accent shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <HeadingTag className={`${headingSize} text-text tracking-normal leading-tight truncate`}>
              {title}
            </HeadingTag>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-sm text-text-muted mt-1 leading-normal">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};

SectionHeader.displayName = 'SectionHeader';

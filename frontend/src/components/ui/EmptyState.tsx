import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto ${className}`.trim()}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center text-text-muted mb-4 shrink-0 shadow-sm">
          {icon}
        </div>
      )}
      <h4 className="text-base font-semibold text-text mb-1">{title}</h4>
      {description && (
        <p className="text-sm text-text-muted mb-6 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';

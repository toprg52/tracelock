import React from 'react';
import { Tooltip } from './Tooltip';

export interface DemoBadgeProps {
  label?: string;
  className?: string;
  tooltip?: string;
  pulsing?: boolean;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label = 'Demo data',
  className = '',
  tooltip = 'This view contains simulated or mock data for demonstration purposes.',
  pulsing = true,
}) => {
  const badgeElement = (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-sans font-medium bg-high/15 text-high select-none ${className}`.trim()}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
        {pulsing && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-high opacity-75" />
        )}
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-high" />
      </span>
      <span>{label}</span>
    </span>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position="top">
        {badgeElement}
      </Tooltip>
    );
  }

  return badgeElement;
};

DemoBadge.displayName = 'DemoBadge';

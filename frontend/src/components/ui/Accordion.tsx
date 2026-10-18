import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItemProps {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
  headerClassName?: string;
}

export function AccordionItem({
  id,
  title,
  subtitle,
  badge,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  className = '',
  headerClassName = '',
}: AccordionItemProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isExpanded = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const handleToggle = () => {
    const next = !isExpanded;
    if (controlledIsOpen === undefined) {
      setInternalOpen(next);
    }
    onToggle?.(next);
  };

  const headerId = `accordion-header-${id}`;
  const panelId = `accordion-panel-${id}`;

  return (
    <div className={`border border-border rounded-xl overflow-hidden bg-surface transition-colors ${className}`}>
      <button
        type="button"
        id={headerId}
        aria-controls={panelId}
        aria-expanded={isExpanded}
        onClick={handleToggle}
        className={`w-full flex items-center justify-between gap-3 p-4 text-left font-medium text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${headerClassName}`}
      >
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-sm font-semibold tracking-tight text-text truncate">{title}</span>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div
          className={`shrink-0 p-1 rounded-md text-text-muted transition-transform duration-200 ${
            isExpanded ? 'rotate-180 text-text' : ''
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {isExpanded && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="p-4 pt-1 border-t border-border/60 bg-surface-raised/40 text-xs text-text-muted"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface AccordionGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionGroup({ children, className = '' }: AccordionGroupProps) {
  return <div className={`space-y-2.5 ${className}`}>{children}</div>;
}

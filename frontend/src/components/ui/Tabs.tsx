import React, { useRef, useEffect } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  count?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'line' | 'pills';
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId,
  onChange,
  variant = 'line',
  size = 'md',
  className = '',
  ariaLabel = 'Navigation Tabs',
}) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledIndices = tabs
      .map((tab, idx) => (!tab.disabled ? idx : null))
      .filter((idx): idx is number => idx !== null);

    const currentPos = enabledIndices.indexOf(index);
    if (currentPos === -1) return;

    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = enabledIndices[0];
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = enabledIndices[enabledIndices.length - 1];
    }

    if (nextIndex !== null) {
      tabRefs.current[nextIndex]?.focus();
      onChange(tabs[nextIndex].id);
    }
  };

  const sizeClass = size === 'sm' ? 'text-xs py-1.5 px-3' : 'text-sm py-2 px-4';

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-1 ${
        variant === 'line' ? 'border-b border-border' : 'p-1 bg-surface-raised rounded-md border border-border'
      } ${className}`.trim()}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`
              relative inline-flex items-center gap-2 font-medium transition-colors duration-fast select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 whitespace-nowrap
              ${sizeClass}
              ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}
              ${
                variant === 'line'
                  ? isActive
                    ? 'text-text font-semibold border-b-2 border-accent -mb-px'
                    : 'text-text-muted hover:text-text border-b-2 border-transparent'
                  : isActive
                  ? 'bg-surface text-text shadow-sm rounded font-semibold'
                  : 'text-text-muted hover:text-text rounded'
              }
            `.trim()}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-xs font-mono tabular-nums ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'bg-surface-raised text-text-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && <span className="ml-1">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};

export interface TabPanelProps {
  id: string;
  activeId: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ id, activeId, children, className = '' }) => {
  if (id !== activeId) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={`focus:outline-none py-4 ${className}`.trim()}
    >
      {children}
    </div>
  );
};

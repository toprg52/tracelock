import React, { useRef } from 'react';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  ariaLabel = 'Options',
  className = '',
}: SegmentedControlProps<T>) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledIndices = options
      .map((opt, idx) => (!opt.disabled ? idx : null))
      .filter((idx): idx is number => idx !== null);

    const currentPos = enabledIndices.indexOf(index);
    if (currentPos === -1) return;

    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
    }

    if (nextIndex !== null) {
      itemRefs.current[nextIndex]?.focus();
      onChange(options[nextIndex].value);
    }
  };

  const sizeClass = size === 'sm' ? 'text-xs py-1 px-2.5 gap-1.5' : 'text-sm py-1.5 px-3.5 gap-2';

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex items-center p-1 bg-surface-raised border border-border rounded-lg ${
        fullWidth ? 'w-full' : ''
      } ${className}`.trim()}
    >
      {options.map((opt, idx) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`
              relative inline-flex items-center justify-center font-medium rounded-md transition-all duration-fast select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent
              ${sizeClass}
              ${fullWidth ? 'flex-1' : ''}
              ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}
              ${
                isSelected
                  ? 'bg-surface text-text font-semibold shadow-sm border border-border/80'
                  : 'text-text-muted hover:text-text hover:bg-surface/40'
              }
            `.trim()}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

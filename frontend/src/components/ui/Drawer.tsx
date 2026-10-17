import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnBackdropClick?: boolean;
  noPadding?: boolean;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'right',
  size = 'md',
  closeOnBackdropClick = true,
  noPadding = false,
  className = '',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    full: 'max-w-full',
  }[size];

  // Capture previous active element and trap focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      } else {
        drawerRef.current?.focus();
      }

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }

    if (e.key === 'Tab' && drawerRef.current) {
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-fast"
        aria-hidden="true"
        onClick={() => closeOnBackdropClick && onClose()}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        aria-describedby={description ? 'drawer-description' : undefined}
        tabIndex={-1}
        className={`
          relative w-full ${sizeStyles} bg-surface border-border shadow-elevation-4
          flex flex-col h-full overflow-hidden outline-none z-10 duration-fast
          ${position === 'right' ? 'ml-auto border-l' : 'mr-auto border-r'}
          ${className}
        `.trim()}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4">
            <div>
              {title && (
                <h2 id="drawer-title" className="text-lg font-semibold text-text leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p id="drawer-description" className="text-xs text-text-muted mt-1 leading-normal">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 -mr-2 -mt-1 text-text-muted hover:text-text rounded-md hover:bg-surface-raised transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 min-h-0 ${noPadding ? 'flex flex-col h-full overflow-hidden' : 'overflow-y-auto p-6'}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3.5 bg-surface-raised border-t border-border flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Drawer.displayName = 'Drawer';

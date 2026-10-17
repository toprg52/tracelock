import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2, Copy, Check } from 'lucide-react';
import { Tooltip } from './Tooltip';

export type TableDensity = 'compact' | 'normal' | 'spacious';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  isMono?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  density?: TableDensity;
  stickyHeader?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

/**
 * Truncates hashes and long values in the middle with an accessible tooltip and copy button.
 */
export const MiddleTruncate: React.FC<{
  value: string;
  startChars?: number;
  endChars?: number;
  className?: string;
  showCopy?: boolean;
}> = ({ value, startChars = 8, endChars = 8, className = '', showCopy = true }) => {
  const [copied, setCopied] = useState(false);

  const shouldTruncate = value.length > startChars + endChars + 3;
  const displayText = shouldTruncate
    ? `${value.slice(0, startChars)}…${value.slice(-endChars)}`
    : value;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono ${className}`.trim()}>
      <Tooltip content={<span className="font-mono text-xs">{value}</span>} position="top">
        <span className="cursor-help hover:text-text">{displayText}</span>
      </Tooltip>
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy full value'}
          className="p-0.5 rounded text-text-muted hover:text-text hover:bg-surface-raised transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="w-3 h-3 text-low" />
          ) : (
            <Copy className="w-3 h-3 opacity-70 hover:opacity-100" />
          )}
        </button>
      )}
    </div>
  );
};

/**
 * Compact type chip for data tables and telemetry
 */
export const TypeChip: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span
    className={`inline-flex items-center px-1.5 py-0.2 rounded-[4px] text-[10px] font-sans font-medium bg-surface-raised text-text-muted border border-border/50 select-none ${className}`.trim()}
  >
    {children}
  </span>
);

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  density = 'normal',
  stickyHeader = false,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  isLoading = false,
  emptyState,
  maxHeight,
  className = '',
}: DataTableProps<T>) {
  const densityStyles = {
    compact: 'py-2 px-3 text-xs',
    normal: 'py-3 px-4 text-sm',
    spacious: 'py-4 px-5 text-sm',
  }[density];

  const headerDensityStyles = {
    compact: 'py-2 px-3 text-[12px]',
    normal: 'py-2.5 px-4 text-[12px]',
    spacious: 'py-3 px-5 text-[12px]',
  }[density];

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center justify-center';
    if (align === 'right') return 'text-right justify-end';
    return 'text-left justify-start';
  };

  return (
    <div
      className={`relative w-full overflow-auto rounded-lg border border-border bg-surface ${className}`.trim()}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full border-collapse text-left">
        <thead
          className={`${
            stickyHeader ? 'sticky top-0 z-10' : ''
          } bg-surface-raised border-b border-border text-text-muted font-medium select-none text-[12px] normal-case`}
        >
          <tr>
            {columns.map((col) => {
              const isSorted = sortColumn === col.key;
              return (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`${headerDensityStyles} ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } font-medium normal-case tracking-normal`}
                >
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className={`inline-flex items-center gap-1.5 hover:text-text cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded ${getAlignClass(
                        col.align
                      )}`}
                    >
                      <span>{col.header}</span>
                      <span className="shrink-0 text-text-muted">
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-accent" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                        )}
                      </span>
                    </button>
                  ) : (
                    <div className={`inline-flex items-center ${getAlignClass(col.align)}`}>
                      {col.header}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-text-muted">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  <span className="text-sm">Loading data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-text-muted">
                {emptyState || <span className="text-sm">No records found</span>}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const rowKey = keyExtractor ? keyExtractor(row, index) : index;
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    transition-colors duration-fast
                    ${onRowClick ? 'cursor-pointer hover:bg-surface-raised/70' : 'hover:bg-surface-raised/40'}
                  `.trim()}
                >
                  {columns.map((col) => {
                    const value = (row as Record<string, unknown>)[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`
                          ${densityStyles}
                          ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }
                          ${col.isMono ? 'font-mono text-xs tabular-nums' : ''}
                          text-text
                        `.trim()}
                      >
                        {col.render ? col.render(row, index) : (value as React.ReactNode)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

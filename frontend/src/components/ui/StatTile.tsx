import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface StatTileDelta {
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface StatTileProps {
  label: string;
  value: string | number;
  delta?: StatTileDelta;
  invertDelta?: boolean; // When true, up is bad (red) and down is good (green)
  sparkline?: number[];
  icon?: React.ReactNode;
  helperText?: string;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  delta,
  invertDelta = false,
  sparkline,
  icon,
  helperText,
  className = '',
}) => {
  // Sparkline SVG with fixed 72x24 dimensions
  const renderSparkline = (data: number[]) => {
    if (data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 72;
    const height = 24;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const isTrendingUp = data[data.length - 1] >= data[0];
    const isGood = invertDelta ? !isTrendingUp : isTrendingUp;
    const strokeColor = isGood ? 'var(--color-low)' : 'var(--color-critical)';

    return (
      <div className="w-[72px] h-[24px] shrink-0 flex items-center justify-end">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
          aria-hidden="true"
        >
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points.join(' ')}
          />
        </svg>
      </div>
    );
  };

  const getDeltaStyles = (d: StatTileDelta) => {
    const isUp = d.trend === 'up';
    const isDown = d.trend === 'down';

    if (d.trend === 'neutral' || (!isUp && !isDown)) {
      return {
        bg: 'bg-surface-raised text-text-muted',
        icon: <Minus className="w-3.5 h-3.5" aria-hidden="true" />,
      };
    }

    // Good/bad meaning determination based on invertDelta
    const isGood = invertDelta ? isDown : isUp;

    if (isGood) {
      return {
        bg: 'bg-low/15 text-low',
        icon: isUp ? (
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
        ),
      };
    }

    return {
      bg: 'bg-critical/15 text-critical',
      icon: isUp ? (
        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
      ),
    };
  };

  return (
    <div
      className={`p-4 rounded-lg bg-surface border border-border shadow-card flex flex-col justify-between h-[126px] ${className}`.trim()}
    >
      {/* Row 1: One-line truncated label in sentence case */}
      <div className="flex items-center justify-between gap-2 min-h-[20px]">
        <span
          className="text-[13px] font-medium text-text-muted truncate leading-tight"
          title={label}
        >
          {label}
        </span>
        {icon && <span className="text-text-muted shrink-0">{icon}</span>}
      </div>

      {/* Row 2: Value and fixed-size sparkline */}
      <div className="flex items-baseline justify-between gap-2 my-auto">
        <div className="text-2xl font-bold font-mono text-text tabular-nums tracking-tight leading-none truncate">
          {value}
        </div>
        {sparkline && renderSparkline(sparkline)}
      </div>

      {/* Row 3: Footer row with delta and short context */}
      <div className="flex items-center gap-2 min-h-[22px] overflow-hidden">
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[6px] text-xs font-medium tabular-nums shrink-0 ${
              getDeltaStyles(delta).bg
            }`}
          >
            {getDeltaStyles(delta).icon}
            <span>{delta.value}</span>
          </span>
        )}
        {helperText && (
          <span className="text-xs text-text-muted truncate leading-none" title={helperText}>
            {helperText}
          </span>
        )}
      </div>
    </div>
  );
};

StatTile.displayName = 'StatTile';

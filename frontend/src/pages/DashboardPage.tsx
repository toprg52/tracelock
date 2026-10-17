import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileCode,
  ShieldAlert,
  Activity,
  Crosshair,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FolderGit2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

import { useDemoMode } from '../context/DemoModeContext';
import { StatTile } from '../components/ui/StatTile';
import { DataTable, Column, MiddleTruncate } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

interface CaseItem {
  id: string;
  case_number: string;
  sha256: string;
  filename: string;
  status: string;
  created_at: string;
  risk_score: number | null;
  verdict: string | null;
}

interface RiskTrendPoint {
  date: string;
  avg_risk: number;
  count: number;
}

interface BackendStats {
  total_cases: number;
  critical_cases: number;
  high_cases: number;
  average_risk_score: number;
  active_iocs: number;
  risk_trend: RiskTrendPoint[];
}

interface TopThreatFamily {
  name: string;
  count: number;
  avgRisk: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

// Sample Data for Demo Mode
const DEMO_STATS: BackendStats = {
  total_cases: 142,
  critical_cases: 18,
  high_cases: 34,
  average_risk_score: 74,
  active_iocs: 812,
  risk_trend: [
    { date: '10/06', avg_risk: 72, count: 5 },
    { date: '10/08', avg_risk: 85, count: 8 },
    { date: '10/10', avg_risk: 68, count: 4 },
    { date: '10/12', avg_risk: 91, count: 9 },
    { date: '10/14', avg_risk: 76, count: 6 },
    { date: '10/16', avg_risk: 88, count: 7 },
    { date: '10/18', avg_risk: 92, count: 12 },
  ],
};

const DEMO_CASES: CaseItem[] = [
  {
    id: 'case-demo-92',
    case_number: 'BC-9201',
    filename: 'demo_sample.apk',
    sha256: 'bfb624ea3887d197607a72382cf8943793e2b38cd4857b61f891b9201974de31',
    risk_score: 92,
    verdict: 'Anubis Banking Trojan',
    status: 'COMPLETED',
    created_at: '2026-10-18T02:15:00Z',
  },
  {
    id: 'case-demo-02',
    case_number: 'BC-8812',
    filename: 'delivery_tracker_update.apk',
    sha256: 'f3a09b456123456789abcdef1234567890abcdef1234567890abcdef92e10',
    risk_score: 88,
    verdict: 'TeaBot Spyware',
    status: 'COMPLETED',
    created_at: '2026-10-17T18:40:00Z',
  },
  {
    id: 'case-demo-03',
    case_number: 'BC-7840',
    filename: 'secure_auth_token.apk',
    sha256: 'e4d29a123456789abcdef1234567890abcdef1234567890abcdef12345678',
    risk_score: 86,
    verdict: 'Cerberus Trojan',
    status: 'COMPLETED',
    created_at: '2026-10-16T11:20:00Z',
  },
  {
    id: 'case-demo-04',
    case_number: 'BC-6421',
    filename: 'system_optimizer_pro.apk',
    sha256: 'c1b2a3456789abcdef1234567890abcdef1234567890abcdef1234567890ab',
    risk_score: 65,
    verdict: 'SpyNote RAT',
    status: 'COMPLETED',
    created_at: '2026-10-15T09:10:00Z',
  },
  {
    id: 'case-demo-05',
    case_number: 'BC-5412',
    filename: 'utility_fast_connect.apk',
    sha256: 'a9b8c7123456789abcdef1234567890abcdef1234567890abcdef12345678cd',
    risk_score: 32,
    verdict: 'Adware / PUA',
    status: 'COMPLETED',
    created_at: '2026-10-14T14:30:00Z',
  },
];

const DEMO_TOP_THREATS: TopThreatFamily[] = [
  { name: 'Anubis Banking Trojan', count: 48, avgRisk: 92, severity: 'critical' },
  { name: 'Cerberus Trojan', count: 32, avgRisk: 86, severity: 'critical' },
  { name: 'TeaBot Spyware', count: 25, avgRisk: 78, severity: 'high' },
  { name: 'SpyNote RAT', count: 19, avgRisk: 65, severity: 'high' },
];

export function DashboardPage() {
  const { isDemoMode, setDemoMode } = useDemoMode();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [realStats, setRealStats] = useState<BackendStats | null>(null);
  const [realCases, setRealCases] = useState<CaseItem[]>([]);

  // /dashboard?demo=1 turns demo mode on
  useEffect(() => {
    if (searchParams.get('demo') === '1') {
      if (!isDemoMode) {
        setDemoMode(true);
      }
    }
  }, [searchParams, isDemoMode, setDemoMode]);

  // Fetch real cases & stats when demo mode is OFF
  const fetchRealData = async () => {
    if (isDemoMode) return;
    setIsLoading(true);
    try {
      const [statsRes, casesRes] = await Promise.all([
        fetch('/api/v1/cases/stats').catch(() => null),
        fetch('/api/v1/cases?page=1&limit=10').catch(() => null),
      ]);

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setRealStats(statsData);
      } else {
        setRealStats(null);
      }

      if (casesRes && casesRes.ok) {
        const casesData = await casesRes.json();
        setRealCases(Array.isArray(casesData) ? casesData : []);
      } else {
        setRealCases([]);
      }
    } catch {
      setRealStats(null);
      setRealCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isDemoMode) {
      fetchRealData();
    }
  }, [isDemoMode]);

  // Resolve active stats & cases based on Demo Mode
  const stats: BackendStats = isDemoMode
    ? DEMO_STATS
    : realStats || {
        total_cases: 0,
        critical_cases: 0,
        high_cases: 0,
        average_risk_score: 0,
        active_iocs: 0,
        risk_trend: [],
      };

  const casesList: CaseItem[] = isDemoMode ? DEMO_CASES : realCases;

  // Compute top threats from cases when in real mode
  const topThreats: TopThreatFamily[] = useMemo(() => {
    if (isDemoMode) return DEMO_TOP_THREATS;
    if (!casesList.length) return [];

    const familyMap = new Map<string, { count: number; totalRisk: number }>();
    for (const c of casesList) {
      const name = c.verdict || 'Unclassified Android Binary';
      const risk = c.risk_score ?? 0;
      const current = familyMap.get(name) || { count: 0, totalRisk: 0 };
      familyMap.set(name, {
        count: current.count + 1,
        totalRisk: current.totalRisk + risk,
      });
    }

    return Array.from(familyMap.entries())
      .map(([name, data]) => {
        const avgRisk = Math.round(data.totalRisk / data.count);
        const severity: 'critical' | 'high' | 'medium' | 'low' =
          avgRisk >= 80 ? 'critical' : avgRisk >= 60 ? 'high' : avgRisk >= 40 ? 'medium' : 'low';
        return { name, count: data.count, avgRisk, severity };
      })
      .sort((a, b) => b.count - a.count || b.avgRisk - a.avgRisk)
      .slice(0, 4);
  }, [isDemoMode, casesList]);

  // Format date helper
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Recent Cases DataTable column definitions
  const columns: Column<CaseItem>[] = [
    {
      key: 'filename',
      header: 'Case / Binary',
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-surface-raised border border-border flex items-center justify-center text-accent shrink-0">
            <FileCode className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-text truncate block text-xs">
              {row.filename}
            </span>
            <MiddleTruncate
              value={row.sha256}
              startChars={6}
              endChars={6}
              className="text-[11px] text-text-muted"
            />
          </div>
        </div>
      ),
    },
    {
      key: 'verdict',
      header: 'Verdict / Threat',
      render: (row) => (
        <span className="text-xs text-text font-medium truncate block max-w-[170px]">
          {row.verdict || 'Unclassified'}
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      align: 'center',
      render: (row) => {
        const score = row.risk_score;
        if (score === null || score === undefined) {
          return (
            <Badge variant="neutral" size="sm">
              Pending
            </Badge>
          );
        }
        const variant =
          score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';
        const label =
          score >= 80 ? 'Critical' : score >= 60 ? 'High' : score >= 40 ? 'Medium' : 'Low';
        return (
          <Badge variant={variant} size="sm" dot>
            {label}
          </Badge>
        );
      },
    },
    {
      key: 'risk_score',
      header: 'Risk Score',
      align: 'right',
      render: (row) => (
        <span className="font-mono tabular-nums text-xs font-semibold text-text">
          {row.risk_score !== null && row.risk_score !== undefined
            ? `${row.risk_score}/100`
            : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Time',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-text-muted text-[11px] whitespace-nowrap">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  // Skeletons during real data load
  if (isLoading && !isDemoMode) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto py-2">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="space-y-1.5">
            <Skeleton width="180px" height="24px" />
            <Skeleton width="280px" height="14px" />
          </div>
          <Skeleton width="120px" height="32px" className="rounded-lg" />
        </div>

        {/* 4 StatTiles Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="126px" className="rounded-lg" />
          ))}
        </div>

        {/* Main Grid Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <Skeleton height="460px" className="rounded-xl" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton height="218px" className="rounded-xl" />
            <Skeleton height="218px" className="rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state when real mode is ON and there are 0 cases
  if (!isDemoMode && stats.total_cases === 0 && casesList.length === 0) {
    return (
      <div className="py-16 max-w-2xl mx-auto space-y-6">
        <EmptyState
          icon={<ShieldCheck className="w-8 h-8 text-accent" />}
          title="No malware cases recorded"
          description="Your forensic incident repository is empty. Submit an Android application package (.apk) for static heuristics decompilation and dynamic threat emulation, or enable Demo mode to inspect simulated SOC telemetry."
          action={
            <Button
              variant="primary"
              iconRight={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/analyze')}
            >
              Analyze your first APK
            </Button>
          }
          secondaryAction={
            <Button
              variant="secondary"
              iconLeft={<Sparkles className="w-4 h-4 text-amber-400" />}
              onClick={() => setDemoMode(true)}
            >
              Enable demo mode
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto py-1">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-text">
              SOC Command Center
            </h2>
            {isDemoMode && (
              <Badge variant="demo" size="sm">
                Demo data
              </Badge>
            )}
          </div>
          <p className="text-xs text-text-muted">
            Live incident detection, telemetry heuristics, and active campaign tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isDemoMode && (
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchRealData}
            >
              Refresh data
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            iconRight={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate('/analyze')}
          >
            Submit APK
          </Button>
        </div>
      </div>

      {/* Row 1: Top Row of 4 StatTiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Cases analysed"
          value={stats.total_cases}
          helperText="Total APK binaries processed"
          icon={<FileCode className="w-4 h-4" />}
          sparkline={isDemoMode ? [120, 126, 131, 138, 142] : undefined}
        />
        <StatTile
          label="Critical threats"
          value={stats.critical_cases}
          helperText="Threat score ≥ 80 / 100"
          icon={<ShieldAlert className="w-4 h-4 text-critical" />}
          delta={{ value: '+12%', trend: 'up' }}
          invertDelta={true}
        />
        <StatTile
          label="Average risk score"
          value={`${Math.round(stats.average_risk_score)} / 100`}
          helperText="Calculated across cases"
          icon={<Activity className="w-4 h-4 text-medium" />}
          delta={{ value: '-3.4%', trend: 'down' }}
          invertDelta={true}
        />
        <StatTile
          label="Active IOC indicators"
          value={stats.active_iocs}
          helperText="Distinct C2 IPs, domains & hashes"
          icon={<Crosshair className="w-4 h-4 text-accent" />}
          sparkline={isDemoMode ? [680, 720, 750, 795, 812] : undefined}
        />
      </div>

      {/* Row 2: Main Operational Grid (Balanced Row Heights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Recent Cases DataTable */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-5 shadow-card space-y-4 min-h-[500px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-text">Recent Investigated Cases</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => navigate('/cases')}
              >
                View all cases
              </Button>
            </div>

            <DataTable
              columns={columns}
              data={casesList}
              keyExtractor={(r) => r.id}
              density="compact"
              onRowClick={(row) => navigate(`/cases/${row.id}`)}
              emptyState={
                <div className="py-8 text-center text-xs text-text-muted">
                  No cases found in this view.
                </div>
              }
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
            <span>Showing top {casesList.length} recent cases</span>
            <span className="font-mono">Click row to open dossier</span>
          </div>
        </div>

        {/* Right Column (5 cols): Top Threats Panel + Compact Risk-Trend Chart */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Threats Panel */}
          <Card className="p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-critical" />
                <h3 className="text-sm font-semibold text-text">Top Detected Threats</h3>
              </div>
              <span className="text-[11px] text-text-muted font-mono">By prevalence</span>
            </div>

            {topThreats.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-muted">
                No threat families classified yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {topThreats.map((threat) => (
                  <div
                    key={threat.name}
                    className="p-3 rounded-lg bg-surface-raised border border-border space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text truncate max-w-[200px]">
                        {threat.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-text-muted text-[11px] font-mono">
                          {threat.count} {threat.count === 1 ? 'case' : 'cases'}
                        </span>
                        <Badge variant={threat.severity} size="sm">
                          Risk {threat.avgRisk}
                        </Badge>
                      </div>
                    </div>

                    {/* Proportional Segmented Risk Meter */}
                    <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          threat.avgRisk >= 80
                            ? 'bg-critical'
                            : threat.avgRisk >= 60
                            ? 'bg-high'
                            : threat.avgRisk >= 40
                            ? 'bg-medium'
                            : 'bg-low'
                        }`}
                        style={{ width: `${Math.min(100, threat.avgRisk)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Compact Risk-Trend Chart Card */}
          <Card className="p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-text">14-Day Risk Index Trend</h3>
              </div>
              <span className="text-[11px] font-mono text-text-muted">Daily average</span>
            </div>

            <div className="h-44 w-full">
              {stats.risk_trend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-text-muted">
                  Insufficient chronological data points for trend.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.risk_trend}
                    margin={{ top: 10, right: 12, left: -14, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                    <XAxis
                      dataKey="date"
                      stroke="var(--color-text-muted)"
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontFamily: 'monospace' }}
                      dy={4}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="var(--color-text-muted)"
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontFamily: 'monospace' }}
                      dx={-2}
                    />
                    <ReferenceLine
                      y={80}
                      stroke="var(--color-critical)"
                      strokeDasharray="3 3"
                      label={{
                        value: 'CRIT 80',
                        position: 'insideTopRight',
                        fill: 'var(--color-critical)',
                        fontSize: 9,
                        fontFamily: 'monospace',
                      }}
                    />
                    <ReferenceLine
                      y={60}
                      stroke="var(--color-high)"
                      strokeDasharray="3 3"
                      strokeOpacity={0.7}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload as RiskTrendPoint;
                        return (
                          <div className="p-2.5 rounded-lg bg-surface border border-border shadow-md text-xs font-sans space-y-1">
                            <span className="font-mono text-text-muted text-[10px] block">
                              {data.date}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-text font-medium">Avg Risk:</span>
                              <span className="font-mono font-bold text-accent">
                                {data.avg_risk} / 100
                              </span>
                            </div>
                            <span className="text-[11px] text-text-muted block font-mono">
                              {data.count} {data.count === 1 ? 'sample' : 'samples'} analyzed
                            </span>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avg_risk"
                      stroke="var(--color-accent)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#riskGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-critical inline-block" />
                Critical &ge; 80
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-high inline-block" />
                High 60&ndash;79
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                Trend
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

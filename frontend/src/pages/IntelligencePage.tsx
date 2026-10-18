import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  Database,
  Layers,
  Globe,
  Network,
  Download,
  Search,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Sparkles,
  Server,
  Share2,
  FileCode,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

import { useDemoMode } from '../context/DemoModeContext';
import { Tabs, TabItem } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatTile } from '../components/ui/StatTile';
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, Column, MiddleTruncate } from '../components/ui/DataTable';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { DemoBadge } from '../components/ui/DemoBadge';

import WorldThreatMap from '../components/WorldThreatMap';
import ThreatCorrelationGraph from '../components/ThreatCorrelationGraph';
import {
  MOCK_THREAT_FAMILIES,
  MOCK_CAMPAIGNS,
  MOCK_IOCS,
  MOCK_MITRE_CELLS,
  ThreatFamilyDetail,
} from '../data/mockIntelligence';
import { IocIntelRow, MitreHeatmapCell } from '../types/dashboard';

type IntelligenceTabId =
  | 'families'
  | 'campaigns'
  | 'iocs'
  | 'mitre'
  | 'map'
  | 'graph';

const TABS: TabItem[] = [
  { id: 'families', label: 'Threat Families', icon: <ShieldAlert className="w-4 h-4" /> },
  { id: 'campaigns', label: 'Campaigns', icon: <Activity className="w-4 h-4" /> },
  { id: 'iocs', label: 'IOC Database', icon: <Database className="w-4 h-4" /> },
  { id: 'mitre', label: 'MITRE Heatmap', icon: <Layers className="w-4 h-4" /> },
  { id: 'map', label: 'World Map', icon: <Globe className="w-4 h-4" /> },
  { id: 'graph', label: 'Correlation Graph', icon: <Network className="w-4 h-4" /> },
];

export function IntelligencePage() {
  const navigate = useNavigate();
  const { isDemoMode, setDemoMode } = useDemoMode();

  const [activeTab, setActiveTab] = useState<IntelligenceTabId>('families');

  // IOC Database filter states
  const [iocSearch, setIocSearch] = useState('');
  const [iocSeverity, setIocSeverity] = useState<string>('all');
  const [copiedIoc, setCopiedIoc] = useState<string | null>(null);

  // Filtered IOC list for DataTable
  const filteredIocs = useMemo(() => {
    return MOCK_IOCS.filter((ioc) => {
      if (iocSeverity !== 'all' && ioc.severity.toLowerCase() !== iocSeverity.toLowerCase()) {
        return false;
      }
      if (iocSearch.trim()) {
        const q = iocSearch.toLowerCase().trim();
        const matchVal = ioc.value.toLowerCase().includes(q);
        const matchFam = ioc.threatFamily.toLowerCase().includes(q);
        const matchType = ioc.type.toLowerCase().includes(q);
        const matchFile = ioc.fileName.toLowerCase().includes(q);
        return matchVal || matchFam || matchType || matchFile;
      }
      return true;
    });
  }, [iocSearch, iocSeverity]);

  // Export CSV Action
  const handleExportCsv = () => {
    const headers = ['Type', 'Indicator Value', 'Severity', 'Confidence', 'Threat Family', 'Source APK', 'First Seen'];
    const rows = filteredIocs.map((i) => [
      i.type,
      `"${i.value.replace(/"/g, '""')}"`,
      i.severity,
      `${i.confidence}%`,
      `"${i.threatFamily.replace(/"/g, '""')}"`,
      `"${i.fileName.replace(/"/g, '""')}"`,
      i.firstSeen,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tracelock-iocs-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIoc(text);
    setTimeout(() => setCopiedIoc(null), 2000);
  };

  // IOC DataTable Columns
  const iocColumns: Column<IocIntelRow>[] = [
    {
      key: 'type',
      header: 'Type',
      width: '100px',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-surface-raised border border-border">
          {item.type}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Indicator Value',
      render: (item) => (
        <div className="flex items-center gap-2 group">
          <code className="text-xs font-mono font-semibold text-text select-all truncate max-w-[240px] sm:max-w-[320px]">
            {item.value}
          </code>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(item.value);
            }}
            className="p-1 rounded text-text-muted hover:text-accent hover:bg-surface-raised transition-colors shrink-0"
            title="Copy indicator value"
            aria-label="Copy indicator"
          >
            {copiedIoc === item.value ? (
              <Check className="w-3.5 h-3.5 text-severity-low" />
            ) : (
              <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      width: '120px',
      render: (item) => {
        const sev = item.severity.toLowerCase();
        const variant: BadgeVariant =
          sev === 'critical' ? 'critical' : sev === 'high' ? 'high' : sev === 'medium' ? 'medium' : 'low';
        return (
          <Badge variant={variant} dot size="sm">
            {item.severity}
          </Badge>
        );
      },
    },
    {
      key: 'threatFamily',
      header: 'Threat Family',
      render: (item) => (
        <span className="text-xs text-text font-medium truncate block max-w-[180px]">
          {item.threatFamily}
        </span>
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      width: '100px',
      align: 'right',
      render: (item) => (
        <span className="text-xs font-mono font-semibold text-text tabular-nums">
          {item.confidence}%
        </span>
      ),
    },
    {
      key: 'fileName',
      header: 'Source APK',
      render: (item) => (
        <span className="text-xs font-mono text-text-muted truncate block max-w-[160px]" title={item.fileName}>
          {item.fileName}
        </span>
      ),
    },
    {
      key: 'firstSeen',
      header: 'First Seen',
      width: '110px',
      render: (item) => (
        <span className="text-xs font-mono text-text-muted">
          {item.firstSeen}
        </span>
      ),
    },
  ];

  // Colors for Threat Families Bar Chart
  const BAR_COLORS = [
    'var(--color-critical, #f05d6c)',
    'var(--color-critical, #f05d6c)',
    'var(--color-high, #f59e4b)',
    'var(--color-high, #f59e4b)',
    'var(--color-medium, #f2c94c)',
    'var(--color-accent, #3ddc97)',
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto py-2">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
              Threat Intelligence
            </h1>
            {isDemoMode && <DemoBadge />}
          </div>
          <p className="text-xs text-text-muted font-sans">
            Global malware family classifications, tracked threat campaigns, indicators of compromise, and infrastructure correlation.
          </p>
        </div>

        {isDemoMode && (
          <div className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border text-xs font-mono text-text-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Simulated Intelligence Feeds Active</span>
          </div>
        )}
      </div>

      {!isDemoMode ? (
        <Card className="py-16 max-w-2xl mx-auto shadow-sm my-6">
          <EmptyState
            icon={<Layers className="w-8 h-8 text-text-muted" />}
            title="Intelligence builds from analysed samples"
            description="Threat families, IOCs, campaigns and ATT&CK mappings appear here as APKs are analysed. Real detection coverage is still limited, so this section currently shows sample data in demo mode only."
            action={
              <Button
                variant="primary"
                iconRight={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/analyze')}
              >
                Analyze an APK
              </Button>
            }
            secondaryAction={
              <Button
                variant="secondary"
                iconLeft={<Sparkles className="w-4 h-4 text-amber-400" />}
                onClick={() => setDemoMode(true)}
              >
                Preview with demo data
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* ── Navigation Tabs ── */}
          <div className="overflow-x-auto scrollbar-none border-b border-border pb-2">
            <Tabs
              tabs={TABS}
              activeId={activeTab}
              onChange={(id) => setActiveTab(id as IntelligenceTabId)}
              variant="line"
              size="sm"
              ariaLabel="Threat Intelligence Section Tabs"
            />
          </div>

          {/* ── TAB 1: THREAT FAMILIES ── */}
          {activeTab === 'families' && (
            <div className="space-y-6">
              {/* Summary StatTiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile
                  label="Tracked Families"
                  value={MOCK_THREAT_FAMILIES.length}
                  helperText="Active mobile malware classifications"
                  icon={<ShieldAlert className="w-5 h-5 text-severity-critical" />}
                />
                <StatTile
                  label="Prevalent Vector"
                  value="Banking Trojan"
                  helperText="Primary trojan classification category"
                  icon={<Activity className="w-5 h-5 text-severity-high" />}
                />
                <StatTile
                  label="Average Risk Rating"
                  value="84 / 100"
                  helperText="Critical severity weighted baseline"
                  icon={<AlertTriangle className="w-5 h-5 text-severity-critical" />}
                />
                <StatTile
                  label="Critical Families"
                  value={MOCK_THREAT_FAMILIES.filter((f) => f.severity === 'critical').length}
                  helperText="High-density financial threat vectors"
                  icon={<Server className="w-5 h-5 text-accent" />}
                />
              </div>

              {/* Threat Distribution Chart Card */}
              <Card className="p-5 space-y-4 shadow-card">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
                      Malware Family Case Density & Prevalence
                    </h3>
                    <p className="text-[11px] text-text-muted font-mono mt-0.5">
                      Attributed sample ingestion counts and average forensic risk indexes.
                    </p>
                  </div>
                  <DemoBadge />
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={MOCK_THREAT_FAMILIES}
                      layout="vertical"
                      margin={{ top: 8, right: 16, left: 10, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} opacity={0.6} />
                      <XAxis type="number" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} fontFamily="monospace" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="var(--color-text-muted)"
                        fontSize={10}
                        tickLine={false}
                        width={150}
                        fontFamily="monospace"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload as ThreatFamilyDetail;
                          return (
                            <div className="p-2.5 rounded-lg bg-surface border border-border shadow-md text-xs font-mono space-y-1">
                              <p className="font-bold text-text">{d.name}</p>
                              <p className="text-text-muted text-[11px]">{d.category}</p>
                              <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
                                <span>Total Samples:</span>
                                <strong className="text-accent">{d.count}</strong>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span>Average Risk:</span>
                                <strong className="text-severity-critical">{d.avgRisk}/100</strong>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                        {MOCK_THREAT_FAMILIES.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Threat Families Detail Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_THREAT_FAMILIES.map((fam) => {
                  const TrendIcon = fam.trend === 'up' ? TrendingUp : fam.trend === 'down' ? TrendingDown : Minus;
                  return (
                    <Card key={fam.id} className="p-4 space-y-3 shadow-card flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                            {fam.category}
                          </span>
                          <Badge variant={fam.severity} dot size="sm">
                            {fam.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-text">{fam.name}</h4>
                        <p className="text-xs text-text-muted leading-relaxed font-sans line-clamp-2">
                          {fam.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-text-muted">Primary Vector:</span>
                          <span className="text-accent font-semibold truncate max-w-[150px]">{fam.primaryVector}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-text-muted">Prevalence:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text">{fam.count} samples</span>
                            <TrendIcon
                              className={`w-3.5 h-3.5 ${
                                fam.trend === 'up'
                                  ? 'text-severity-critical'
                                  : fam.trend === 'down'
                                  ? 'text-severity-low'
                                  : 'text-text-muted'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 2: CAMPAIGNS ── */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Campaign Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatTile
                  label="Tracked Campaigns"
                  value={MOCK_CAMPAIGNS.length}
                  helperText="Active cyber threat operations"
                  icon={<Activity className="w-5 h-5 text-accent" />}
                />
                <StatTile
                  label="Active Operations"
                  value={MOCK_CAMPAIGNS.filter((c) => c.status === 'active').length}
                  helperText="Currently propagating or exfiltrating"
                  icon={<AlertTriangle className="w-5 h-5 text-severity-critical" />}
                />
                <StatTile
                  label="Shared C2 Endpoints"
                  value="12"
                  helperText="Cross-campaign infrastructure overlap"
                  icon={<Server className="w-5 h-5 text-severity-high" />}
                />
              </div>

              {/* Campaign Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {MOCK_CAMPAIGNS.map((camp) => (
                  <Card key={camp.id} className="p-5 space-y-4 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text">{camp.label}</h3>
                          <DemoBadge />
                        </div>
                        <p className="text-xs font-mono text-text-muted mt-0.5">
                          Threat Family: <strong className="text-accent">{camp.threatFamily}</strong>
                        </p>
                      </div>

                      <Badge
                        variant={camp.status === 'active' ? 'critical' : camp.status === 'monitoring' ? 'high' : 'low'}
                        dot
                        size="sm"
                      >
                        {camp.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-surface-raised border border-border text-center text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-text-muted uppercase block">Samples</span>
                        <strong className="text-sm text-text font-bold">{camp.caseCount}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted uppercase block">Avg Risk</span>
                        <strong className="text-sm text-severity-critical font-bold">{camp.avgRisk} / 100</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted uppercase block">Last Seen</span>
                        <span className="text-text font-semibold">
                          {new Date(camp.lastSeen).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {camp.sharedInfrastructure.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
                          Identified Infrastructure Overlap:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {camp.sharedInfrastructure.map((infra) => (
                            <span
                              key={infra}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-raised border border-border text-text-muted"
                            >
                              {infra}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: IOC DATABASE ── */}
          {activeTab === 'iocs' && (
            <div className="space-y-6">
              {/* Header KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatTile
                  label="Total Indicators"
                  value={MOCK_IOCS.length}
                  helperText="Correlated forensic artifacts"
                  icon={<Database className="w-5 h-5 text-accent" />}
                />
                <StatTile
                  label="C2 IP Addresses"
                  value={MOCK_IOCS.filter((i) => i.type === 'IP').length}
                  helperText="Remote botnet controllers"
                  icon={<Server className="w-5 h-5 text-severity-critical" />}
                />
                <StatTile
                  label="Phishing Domains"
                  value={MOCK_IOCS.filter((i) => i.type === 'Domain').length}
                  helperText="Malicious web hosts"
                  icon={<Globe className="w-5 h-5 text-severity-high" />}
                />
                <StatTile
                  label="Payload Hashes"
                  value={MOCK_IOCS.filter((i) => i.type === 'SHA256').length}
                  helperText="Cryptographic fingerprints"
                  icon={<FileCode className="w-5 h-5 text-blue-400" />}
                />
              </div>

              {/* Controls Bar: Search, Severity Filter, Export CSV */}
              <Card className="p-4 space-y-3.5 shadow-sm">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[240px] max-w-lg">
                    <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={iocSearch}
                      onChange={(e) => setIocSearch(e.target.value)}
                      placeholder="Search indicator value, threat family, or APK..."
                      className="w-full bg-surface-raised border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-text placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Severity Segmented Control */}
                    <SegmentedControl<string>
                      size="sm"
                      value={iocSeverity}
                      onChange={setIocSeverity}
                      options={[
                        { value: 'all', label: 'All' },
                        { value: 'critical', label: 'Critical' },
                        { value: 'high', label: 'High' },
                        { value: 'medium', label: 'Medium' },
                      ]}
                      ariaLabel="Filter IOCs by severity"
                    />

                    {/* Export CSV Button */}
                    <Button
                      variant="primary"
                      size="sm"
                      iconLeft={<Download className="w-3.5 h-3.5" />}
                      onClick={handleExportCsv}
                    >
                      Export CSV
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted font-mono">
                  <span>Showing {filteredIocs.length} of {MOCK_IOCS.length} indicators</span>
                  <DemoBadge />
                </div>
              </Card>

              {/* Main DataTable View */}
              <Card className="p-5 space-y-4 shadow-card">
                <DataTable
                  columns={iocColumns}
                  data={filteredIocs}
                  keyExtractor={(item) => item.id}
                  density="normal"
                  emptyState={
                    <div className="py-12 text-center space-y-2">
                      <p className="text-xs font-semibold text-text">No matching IOCs found</p>
                      <p className="text-[11px] text-text-muted">
                        No indicators match the active search query or severity filter.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIocSearch('');
                          setIocSeverity('all');
                        }}
                        className="mt-2"
                      >
                        Clear filters
                      </Button>
                    </div>
                  }
                />
              </Card>
            </div>
          )}

          {/* ── TAB 4: MITRE HEATMAP ── */}
          {activeTab === 'mitre' && (
            <div className="space-y-6">
              <Card className="p-5 space-y-5 shadow-card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
                    MITRE ATT&CK Mobile Heatmap Matrix
                  </h3>
                  <p className="text-[11px] text-text-muted font-mono mt-0.5">
                    Mobile Matrix v14 · Standardized technique mapping and adversary tactic density.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DemoBadge />
                  <span className="text-xs font-mono text-text-muted">
                    {MOCK_MITRE_CELLS.length} techniques mapped
                  </span>
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center gap-5 flex-wrap text-xs font-mono">
                {(['critical', 'high', 'medium', 'low'] as const).map((sev) => (
                  <div key={sev} className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        sev === 'critical'
                          ? 'bg-severity-critical'
                          : sev === 'high'
                          ? 'bg-severity-high'
                          : sev === 'medium'
                          ? 'bg-severity-medium'
                          : 'bg-severity-low'
                      }`}
                    />
                    <span className="text-text-muted capitalize">{sev}</span>
                  </div>
                ))}
              </div>

              {/* Tactic Rows */}
              <div className="space-y-4 pt-1">
                {[
                  'Initial Access',
                  'Execution',
                  'Persistence',
                  'Privilege Escalation',
                  'Credential Access',
                  'Defense Evasion',
                  'Command & Control',
                ].map((tactic) => {
                  const cells = MOCK_MITRE_CELLS.filter((c) => c.tactic === tactic);
                  if (cells.length === 0) return null;

                  return (
                    <div key={tactic} className="space-y-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                        {tactic}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {cells.map((cell) => {
                          const sevVariant: BadgeVariant =
                            cell.severity === 'critical'
                              ? 'critical'
                              : cell.severity === 'high'
                              ? 'high'
                              : cell.severity === 'medium'
                              ? 'medium'
                              : 'low';
                          return (
                            <div
                              key={cell.techniqueId}
                              className="p-3 rounded-xl border border-border bg-surface-raised space-y-1.5 hover:border-accent/40 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-accent">
                                  {cell.techniqueId}
                                </span>
                                <Badge variant={sevVariant} size="sm">
                                  {cell.count} hits
                                </Badge>
                              </div>
                              <p className="text-xs font-medium text-text truncate" title={cell.techniqueName}>
                                {cell.techniqueName}
                              </p>
                              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-0.5">
                                <span>Confidence:</span>
                                <strong>{cell.confidence}%</strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

          {/* ── TAB 5: WORLD MAP ── */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <WorldThreatMap />
            </div>
          )}

          {/* ── TAB 6: CORRELATION GRAPH ── */}
          {activeTab === 'graph' && (
            <div className="space-y-6">
              <Card className="p-5 space-y-4 shadow-card">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
                    Cross-Sample Correlation & Infrastructure Linkage
                  </h3>
                  <p className="text-[11px] text-text-muted font-mono mt-0.5">
                    Graph mapping relationship ties between analyzed target binaries, botnet controllers, and campaign nodes.
                  </p>
                </div>
                <DemoBadge />
              </div>

              <div className="h-[520px] bg-surface-raised border border-border rounded-xl overflow-hidden relative">
                <ThreatCorrelationGraph
                  fileName="demo_sample.apk"
                  threatFamily="Anubis Banking Trojan"
                  riskScore={92}
                  mitreTags={[
                    { id: 'T1400', name: 'Accessibility Abuse' },
                    { id: 'T1412', name: 'Capture SMS' },
                    { id: 'T1417', name: 'Input Interception' },
                  ]}
                  iocs={[
                    { type: 'IP', value: '185.220.101.5', severity: 'CRITICAL' },
                    { type: 'Domain', value: 'update-server-v3.net', severity: 'HIGH' },
                    { type: 'SHA256', value: 'bfb624ea3887d197607a72382cf8943793e2b38cd4857b61f891b9201974de31', severity: 'CRITICAL' },
                  ]}
                />
              </div>
            </Card>
          </div>
        )}
      </>
    )}
  </div>
);
}

export default IntelligencePage;

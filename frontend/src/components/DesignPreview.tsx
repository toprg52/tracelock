import React, { useState } from 'react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  SectionHeader,
  Tabs,
  TabPanel,
  SegmentedControl,
  StatTile,
  DataTable,
  Column,
  MiddleTruncate,
  TypeChip,
  EmptyState,
  Skeleton,
  ToastProvider,
  useToast,
  Drawer,
  Modal,
  Tooltip,
  Breadcrumbs,
  DemoBadge,
} from './ui';
import {
  Shield,
  Sun,
  Moon,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Database,
  Search,
  Download,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface SampleIoc {
  id: string;
  type: string;
  indicator: string;
  threatFamily: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const sampleIocs: SampleIoc[] = [
  {
    id: 'ioc-01',
    type: 'IP',
    indicator: '185.220.101.5',
    threatFamily: 'Anubis Banking Trojan',
    confidence: 98,
    severity: 'critical',
  },
  {
    id: 'ioc-02',
    type: 'Domain',
    indicator: 'update-server-v3.net',
    threatFamily: 'Anubis Banking Trojan',
    confidence: 92,
    severity: 'high',
  },
  {
    id: 'ioc-03',
    type: 'SHA256',
    indicator: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    threatFamily: 'Cerberus Spyware',
    confidence: 89,
    severity: 'high',
  },
  {
    id: 'ioc-04',
    type: 'Package',
    indicator: 'com.android.system.service.payload',
    threatFamily: 'TeaBot Dropper',
    confidence: 76,
    severity: 'medium',
  },
  {
    id: 'ioc-05',
    type: 'URL',
    indicator: 'https://cdn-node-04.net/dist/update.apk',
    threatFamily: 'SpyNote RAT',
    confidence: 64,
    severity: 'low',
  },
];

function PreviewContent({ onExit }: { onExit?: () => void }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('components');
  const [tableDensity, setTableDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() =>
    document.documentElement.classList.contains('light')
  );

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('light')) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      setIsLightMode(true);
    }
  };

  const columns: Column<SampleIoc>[] = [
    {
      key: 'indicator',
      header: 'Indicator',
      sortable: true,
      isMono: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.type === 'SHA256' ? (
            <MiddleTruncate value={row.indicator} startChars={8} endChars={8} />
          ) : (
            <span className="font-mono text-xs">{row.indicator}</span>
          )}
          <TypeChip>{row.type}</TypeChip>
        </div>
      ),
    },
    {
      key: 'threatFamily',
      header: 'Threat family',
      sortable: true,
      render: (row) => <span className="font-medium text-text">{row.threatFamily}</span>,
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (row) => {
        const labelMap: Record<string, string> = {
          critical: 'Critical threat',
          high: 'High risk',
          medium: 'Medium risk',
          low: 'Low risk',
        };
        return (
          <Badge variant={row.severity} dot pulse={row.severity === 'critical'} size="sm">
            {labelMap[row.severity] || row.severity}
          </Badge>
        );
      },
    },
    {
      key: 'confidence',
      header: 'Confidence',
      align: 'right',
      sortable: true,
      isMono: true,
      render: (row) => (
        <span className="font-mono tabular-nums font-semibold text-text">
          {row.confidence}%
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-fast font-sans pb-24">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border shadow-elevation-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onExit && (
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<ArrowLeft className="w-4 h-4" />}
                onClick={onExit}
              >
                Back to App
              </Button>
            )}
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent text-surface flex items-center justify-center font-bold text-sm">
                TL
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-text leading-none">
                  Tracelock Design System
                </h1>
                <span className="text-xs text-text-muted">
                  Tokens & shared components preview (#design-preview)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={isLightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              onClick={toggleTheme}
            >
              {isLightMode ? 'Switch to Dark' : 'Switch to Light'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
        {/* Intro Header */}
        <div>
          <Breadcrumbs
            items={[
              { label: 'System', href: '#' },
              { label: 'Foundations', href: '#design-preview' },
              { label: 'Design system & tokens' },
            ]}
          />
          <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text">
                Foundations & component catalog
              </h2>
              <p className="text-[13px] font-medium text-text-muted mt-1 max-w-3xl leading-normal">
                Refined tokens with sentence-case typography, semantic status palettes, WCAG AA compliant contrast,
                Inter variable for UI text, and JetBrains Mono variable for code and tabular metrics. Light mode is flat with zero gradients or glassmorphism.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info" dot>WCAG AA checked</Badge>
              <Badge variant="success" dot>Inter & JetBrains Mono</Badge>
            </div>
          </div>
        </div>

        {/* System Navigation Tabs */}
        <Tabs
          activeId={activeTab}
          onChange={setActiveTab}
          variant="pills"
          tabs={[
            { id: 'components', label: '16 Shared components', icon: <Layers className="w-4 h-4" /> },
            { id: 'tokens', label: 'Color tokens & contrast', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'typography', label: 'Typography & scale', icon: <Terminal className="w-4 h-4" /> },
            { id: 'elevation', label: 'Elevation & motion', icon: <Activity className="w-4 h-4" /> },
          ]}
        />

        {/* TAB 1: SHARED COMPONENTS */}
        <TabPanel id="components" activeId={activeTab}>
          <div className="space-y-12">
            {/* 1. Buttons & Badges */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>1. Buttons & badges</CardTitle>
                  <CardDescription>
                    Button variants (primary, secondary, ghost, danger) and soft tinted badges with 6px radius and sentence case.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-[13px] font-medium text-text-muted block mb-3">
                    Button variants & sizes
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" size="lg">Primary large</Button>
                    <Button variant="primary" size="md">Primary medium</Button>
                    <Button variant="primary" size="sm">Primary small</Button>
                    <Button variant="secondary" size="md">Secondary button</Button>
                    <Button variant="ghost" size="md">Ghost button</Button>
                    <Button variant="danger" size="md">Danger button</Button>
                    <Button variant="primary" size="md" isLoading>Loading state</Button>
                    <Button variant="secondary" size="md" disabled>Disabled</Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <span className="text-[13px] font-medium text-text-muted block mb-3">
                    Badge severity & status variants (soft tint, 6px radius, sentence case)
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant="critical" dot pulse>Critical threat</Badge>
                    <Badge variant="high" dot>High risk</Badge>
                    <Badge variant="medium" dot>Medium risk</Badge>
                    <Badge variant="low" dot>Low risk</Badge>
                    <Badge variant="success" dot pulse>Online (green)</Badge>
                    <Badge variant="info" dot>Info advisory</Badge>
                    <Badge variant="neutral" dot>Neutral status</Badge>
                    <DemoBadge label="Demo data" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Stat Tiles with Tabular Numerals & Sparklines */}
            <div>
              <SectionHeader
                title="2. StatTile (Fixed height, aligned rows, good/bad delta)"
                description="Metrics tiles built with fixed 126px height, single-line truncated label, large value, and footer row with meaningful delta coloring."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile
                  label="Total cases analyzed"
                  value="1,428"
                  delta={{ value: '+14.2%', trend: 'up' }}
                  invertDelta={false}
                  sparkline={[20, 25, 32, 28, 45, 52, 60, 68]}
                  helperText="Across all monitored endpoints"
                  icon={<Database className="w-4 h-4" />}
                />
                <StatTile
                  label="Critical threat score"
                  value="94.5"
                  delta={{ value: '+8.1%', trend: 'up' }}
                  invertDelta={true}
                  sparkline={[40, 55, 62, 58, 75, 88, 94]}
                  helperText="Above threshold (>80.0)"
                  icon={<AlertTriangle className="w-4 h-4 text-critical" />}
                />
                <StatTile
                  label="Quarantined APKs"
                  value="342"
                  delta={{ value: '-5.4%', trend: 'down' }}
                  invertDelta={false}
                  sparkline={[90, 85, 78, 65, 55, 48, 42]}
                  helperText="Automated containment rate"
                  icon={<Shield className="w-4 h-4 text-accent" />}
                />
                <StatTile
                  label="IOCs synchronized"
                  value="12,890"
                  delta={{ value: 'Stable', trend: 'neutral' }}
                  sparkline={[50, 50, 52, 50, 51, 50, 50]}
                  helperText="MITRE ATT&CK & MISP feed"
                  icon={<CheckCircle className="w-4 h-4 text-low" />}
                />
              </div>
            </div>

            {/* 3. SectionHeader, SegmentedControl & DataTable */}
            <div>
              <SectionHeader
                title="3. DataTable, SectionHeader & SegmentedControl"
                description="High-density data visualization with sentence-case headers, middle truncation for hashes, and sticky headers."
                actions={
                  <div className="flex items-center gap-2">
                    <SegmentedControl
                      size="sm"
                      value={tableDensity}
                      onChange={setTableDensity}
                      options={[
                        { value: 'compact', label: 'Compact' },
                        { value: 'normal', label: 'Normal' },
                        { value: 'spacious', label: 'Spacious' },
                      ]}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft={<Download className="w-3.5 h-3.5" />}
                      onClick={() => addToast({ type: 'info', title: 'Export triggered', description: 'Exporting 5 IOC records to CSV format.' })}
                    >
                      Export
                    </Button>
                  </div>
                }
              />
              <DataTable
                columns={columns}
                data={sampleIocs}
                density={tableDensity}
                sortColumn="confidence"
                sortDirection="desc"
                onRowClick={(row) =>
                  addToast({
                    type: 'info',
                    title: `Row selected: ${row.indicator}`,
                    description: `Threat family: ${row.threatFamily}`,
                  })
                }
              />
            </div>

            {/* 4. Modals, Drawers, Toasts & Tooltips */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>4. Overlays, dialogs & feedback</CardTitle>
                  <CardDescription>
                    Accessible modal (with focus trap, Escape to close, aria-modal), slide-out drawer, interactive toasts, and tooltips.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-[13px] font-medium text-text-muted block mb-3">
                    Modals & drawers
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                      Open accessible modal
                    </Button>
                    <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>
                      Open side drawer
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <span className="text-[13px] font-medium text-text-muted block mb-3">
                    Toast notifications (click to trigger)
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        addToast({
                          type: 'success',
                          title: 'Sandbox analysis complete',
                          description: 'Static heuristics and YARA signatures compiled cleanly.',
                        })
                      }
                    >
                      Success toast
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        addToast({
                          type: 'critical',
                          title: 'Critical threat alert',
                          description: 'Accessibility abuse detected targeting mobile banking APK.',
                        })
                      }
                    >
                      Critical toast
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        addToast({
                          type: 'warning',
                          title: 'High latency detected',
                          description: 'Sandbox queue is running at 82% capacity.',
                        })
                      }
                    >
                      Warning toast
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        addToast({
                          type: 'info',
                          title: 'MISP feed synchronized',
                          description: '142 new IOC signatures received from CIRCL.',
                        })
                      }
                    >
                      Info toast
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <span className="text-[13px] font-medium text-text-muted block mb-3">
                    Tooltips (hover or focus with tab)
                  </span>
                  <div className="flex flex-wrap items-center gap-4">
                    <Tooltip content="Information tooltip positioned on top" position="top">
                      <Button variant="ghost" size="sm">Hover / focus (top)</Button>
                    </Tooltip>
                    <Tooltip content="Information tooltip positioned on bottom" position="bottom">
                      <Button variant="ghost" size="sm">Hover / focus (bottom)</Button>
                    </Tooltip>
                    <Tooltip content="Information tooltip positioned on right" position="right">
                      <Button variant="ghost" size="sm">Hover / focus (right)</Button>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Skeleton & EmptyState */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>5a. Skeleton loading placeholders</CardTitle>
                  <CardDescription>Respects prefers-reduced-motion automatically.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={44} height={44} />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </div>
                  </div>
                  <Skeleton variant="rectangular" height={96} />
                  <div className="space-y-2">
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="85%" />
                    <Skeleton variant="text" width="70%" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5b. EmptyState component</CardTitle>
                  <CardDescription>Consistent feedback when query or list returns zero records.</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    icon={<Search className="w-6 h-6" />}
                    title="No suspicious binaries found"
                    description="Upload an Android APK or adjust your telemetry filters to inspect forensic artifacts."
                    action={<Button size="sm">Submit binary</Button>}
                    secondaryAction={<Button variant="ghost" size="sm">Reset filters</Button>}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* TAB 2: COLOR TOKENS & CONTRAST */}
        <TabPanel id="tokens" activeId={activeTab}>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Color tokens & WCAG AA contrast analysis</CardTitle>
                  <CardDescription>
                    All foreground and background token pairs have been evaluated for WCAG 2.1 AA (4.5:1 text, 3:1 graphical elements).
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contrast Adjustment Alert */}
                <div className="p-4 rounded-lg bg-surface-raised border border-border flex items-start gap-3">
                  <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
                  <div className="text-xs space-y-2 leading-relaxed">
                    <p className="font-semibold text-text text-[13px]">
                      Dark Theme Token Nudge & Contrast Verification:
                    </p>
                    <p className="text-text-muted">
                      Dark surface was nudged from <code className="font-mono text-text">#111720</code> to <strong className="text-text font-mono">#121923</strong>, and dark border was nudged from <code className="font-mono text-text">#232C3A</code> to <strong className="text-text font-mono">#263041</strong>. Contrast was re-evaluated against both surface and background:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-text-muted">
                      <li><strong className="text-text">Text (#E6EAF0):</strong> 14.63:1 on #121923 (Pass AAA) | 15.92:1 on #0B0F14 (Pass AAA)</li>
                      <li><strong className="text-text-muted">Text Muted (#8B96A7):</strong> 5.90:1 on #121923 (Pass AA) | 6.42:1 on #0B0F14 (Pass AA)</li>
                      <li><strong className="text-accent">Accent (#3DDC97):</strong> 9.99:1 on #121923 (Pass AAA) | Primary button text (#0B0F14) on accent: 10.87:1 (Pass AAA)</li>
                      <li><strong className="text-critical">Critical (#F05D6C):</strong> 5.46:1 on #121923 (Pass AA) | 5.94:1 on #0B0F14 (Pass AA)</li>
                      <li><strong className="text-high">High (#F59E4B):</strong> 8.30:1 on #121923 (Pass AAA) | 9.04:1 on #0B0F14 (Pass AAA)</li>
                      <li><strong className="text-medium">Medium (#F2C94C):</strong> 11.13:1 on #121923 (Pass AAA) | 12.11:1 on #0B0F14 (Pass AAA)</li>
                      <li><strong className="text-low">Low (#4CC38A):</strong> 7.97:1 on #121923 (Pass AAA) | 8.68:1 on #0B0F14 (Pass AAA)</li>
                      <li><strong className="text-info">Info (#5B9DF5):</strong> 6.38:1 on #121923 (Pass AA) | 6.94:1 on #0B0F14 (Pass AA)</li>
                      <li><strong className="text-text">Border (#263041):</strong> 1.33:1 contrast against surface #121923 (clean, quiet separation)</li>
                    </ul>
                    <p className="text-text-muted pt-1">
                      Light theme values remain unchanged: critical (#C92A3E, 4.86:1), info (#1D62C9, 5.19:1), accent (#087F5B, 4.50:1), high (#9E5600, 4.99:1), medium (#876500, 4.85:1), low (#14754D, 5.13:1).
                    </p>
                  </div>
                </div>

                {/* Swatches Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { name: 'Background', variable: '--color-background', role: 'Page canvas' },
                    { name: 'Surface', variable: '--color-surface', role: 'Default cards, panels' },
                    { name: 'Surface raised', variable: '--color-surface-raised', role: 'Elevated headers, inputs' },
                    { name: 'Border', variable: '--color-border', role: 'Dividers & containers' },
                    { name: 'Text', variable: '--color-text', role: 'High-contrast typography' },
                    { name: 'Text muted', variable: '--color-text-muted', role: 'Subtitles & hints' },
                    { name: 'Accent', variable: '--color-accent', role: 'Primary interactive actions' },
                    { name: 'Critical', variable: '--color-critical', role: 'Critical threats / errors' },
                    { name: 'High', variable: '--color-high', role: 'High warnings / severity' },
                    { name: 'Medium', variable: '--color-medium', role: 'Medium warnings' },
                    { name: 'Low', variable: '--color-low', role: 'Low risk / healthy status' },
                    { name: 'Info', variable: '--color-info', role: 'Informational notices' },
                  ].map((token) => (
                    <div
                      key={token.variable}
                      className="p-3 rounded-lg border border-border bg-surface flex flex-col justify-between h-32"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-text">{token.name}</span>
                        <div
                          className="w-5 h-5 rounded-md border border-border/80 shadow-sm shrink-0"
                          style={{ backgroundColor: `var(${token.variable})` }}
                        />
                      </div>
                      <div>
                        <code className="text-[10px] font-mono text-text-muted block truncate">
                          {token.variable}
                        </code>
                        <span className="text-[10px] text-text-muted block mt-0.5 truncate">
                          {token.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        {/* TAB 3: TYPOGRAPHY */}
        <TabPanel id="typography" activeId={activeTab}>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Typography system & font stacks</CardTitle>
                  <CardDescription>
                    Clean separation between UI text (Inter Variable + Noto Sans Indic fallbacks) and data elements (JetBrains Mono Variable).
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-surface-raised border border-border">
                    <span className="text-[13px] font-medium text-text-muted block mb-2">
                      UI sans stack: Inter Variable
                    </span>
                    <p className="text-sm text-text leading-relaxed font-sans">
                      The quick brown fox jumps over the lazy dog. Used for all primary interface text, buttons, headings, and descriptions. Sentence case throughout.
                    </p>
                    <div className="mt-3 pt-3 border-t border-border text-[11px] text-text-muted">
                      <strong>Regional Indic fallbacks:</strong> Noto Sans Devanagari, Bengali, Gujarati, Gurmukhi, Kannada, Malayalam, Oriya, Tamil, Telugu.
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-surface-raised border border-border">
                    <span className="text-[13px] font-medium text-text-muted block mb-2">
                      Code and telemetry: JetBrains Mono Variable
                    </span>
                    <p className="text-xs text-text font-mono leading-relaxed">
                      SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069<br />
                      IP: 192.168.1.105:8443 | PKG: com.cedarline.sample
                    </p>
                    <div className="mt-3 pt-3 border-t border-border text-[11px] text-text-muted">
                      Strictly reserved for hashes, IPs, package names, code snippets, and tabular numbers.
                    </div>
                  </div>
                </div>

                {/* Type Scale Table */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-[13px] font-medium text-text-muted mb-3">
                    Type scale (minimum body size 12px)
                  </h4>
                  <div className="space-y-3">
                    {[
                      { size: 'text-3xl', px: '32px / line-height 40px', label: 'Display & hero titles', sample: 'Security operations center' },
                      { size: 'text-2xl', px: '24px / line-height 32px', label: 'Page titles (H1)', sample: 'Forensic investigation workspace' },
                      { size: 'text-xl', px: '20px / line-height 28px', label: 'Section headers (H2)', sample: 'Target APK telemetry matrix' },
                      { size: 'text-base', px: '16px / line-height 24px', label: 'Card titles & lead (H3)', sample: 'Behavioral sandbox heuristics' },
                      { size: 'text-sm', px: '14px / line-height 20px', label: 'Default body & table cells', sample: 'Decompiled AndroidManifest.xml identified suspicious receiver.' },
                      { size: 'text-xs', px: '12px / line-height 16px', label: 'Badges, labels, metadata', sample: 'Timestamp: 2026-10-18T01:30:00Z | Confidence: 94%' },
                    ].map((item) => (
                      <div
                        key={item.size}
                        className="p-3 rounded-lg border border-border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-2"
                      >
                        <div className="w-48 shrink-0">
                          <code className="text-xs font-mono font-bold text-accent">{item.size}</code>
                          <span className="text-[11px] text-text-muted block">{item.px}</span>
                        </div>
                        <div className="flex-1">
                          <span className={`${item.size} text-text font-medium block truncate`}>
                            {item.sample}
                          </span>
                        </div>
                        <div className="w-48 text-right shrink-0">
                          <span className="text-xs text-text-muted">{item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabular Numerals Comparison */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-[13px] font-medium text-text-muted mb-3">
                    Tabular numerals comparison
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-surface border border-border">
                      <span className="text-[13px] font-medium text-low block mb-2">
                        ✓ Tabular numerals (.tabular-nums) - aligned
                      </span>
                      <div className="font-mono tabular-nums text-sm space-y-1">
                        <div>111,111.11 USD</div>
                        <div>888,888.88 USD</div>
                        <div>222,222.22 USD</div>
                        <div>999,999.99 USD</div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-surface border border-border opacity-75">
                      <span className="text-[13px] font-medium text-critical block mb-2">
                        ✗ Proportional numerals - uneven spacing
                      </span>
                      <div className="text-sm space-y-1">
                        <div>111,111.11 USD</div>
                        <div>888,888.88 USD</div>
                        <div>222,222.22 USD</div>
                        <div>999,999.99 USD</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        {/* TAB 4: ELEVATION & MOTION */}
        <TabPanel id="elevation" activeId={activeTab}>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Elevation & shadows</CardTitle>
                  <CardDescription>
                    Soft, low-contrast shadows designed for both dark and flat light themes.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { name: 'Card shadow', utility: 'shadow-card', role: 'Default panels & cards' },
                    { name: 'Elevation 1', utility: 'shadow-elevation-1', role: 'Sticky bars & pills' },
                    { name: 'Elevation 2', utility: 'shadow-elevation-2', role: 'Tooltips & popovers' },
                    { name: 'Elevation 3', utility: 'shadow-elevation-3', role: 'Toasts & dropdowns' },
                    { name: 'Elevation 4', utility: 'shadow-elevation-4', role: 'Modals & drawers' },
                  ].map((s) => (
                    <div
                      key={s.utility}
                      className={`p-4 rounded-lg border border-border bg-surface ${s.utility} flex flex-col justify-between h-32`}
                    >
                      <span className="text-[13px] font-medium text-text">{s.name}</span>
                      <div>
                        <code className="text-[10px] font-mono text-accent block">{s.utility}</code>
                        <span className="text-[10px] text-text-muted block mt-0.5">{s.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Motion & accessibility tokens</CardTitle>
                  <CardDescription>
                    Predictable transition durations respecting prefers-reduced-motion.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-surface border border-border">
                    <span className="text-[13px] font-medium text-text-muted block mb-1">
                      duration-fast (150ms)
                    </span>
                    <p className="text-xs text-text-muted">
                      Used for micro-interactions: button hovers, color shifts, tooltip appearances, and segmented control pill sliding.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-surface border border-border">
                    <span className="text-[13px] font-medium text-text-muted block mb-1">
                      duration-normal (200ms)
                    </span>
                    <p className="text-xs text-text-muted">
                      Used for macro-transitions: modal dialog fades, drawer slides, and toast insertions.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface-raised border border-border text-xs text-text-muted">
                  <strong>Accessibility guarantee:</strong> When a user sets <code>prefers-reduced-motion: reduce</code> at the OS level,
                  all transitions and animations collapse to 0.01ms automatically via global CSS rules.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabPanel>
      </main>

      {/* Interactive Modal Instance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sample forensic configuration modal"
        description="This modal demonstrates focus trapping, Escape to close, role='dialog', and aria-modal."
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                addToast({ type: 'success', title: 'Settings saved', description: 'Modal actions executed successfully.' });
              }}
            >
              Save changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-text-muted">
          <p>
            When this modal is open, pressing <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border font-mono text-text">Tab</kbd> cycles focus exclusively within the modal. Pressing <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border font-mono text-text">Escape</kbd> or clicking the backdrop safely closes the dialog and returns focus to the initiating trigger button.
          </p>
          <div className="p-3 rounded bg-surface-raised border border-border space-y-2">
            <label className="font-medium text-text block">Telemetry endpoint URL</label>
            <input
              type="text"
              defaultValue="https://telemetry.tracelock.local/v1/cases"
              className="w-full bg-surface border border-border rounded px-3 py-1.5 text-xs text-text font-mono focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      </Modal>

      {/* Interactive Drawer Instance */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="IOC deep inspection panel"
        description="Drawer panel demonstrating keyboard focus trapping, Escape handling, and clean responsive layout."
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setIsDrawerOpen(false)}>
              Close panel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsDrawerOpen(false);
                addToast({ type: 'info', title: 'Inspection submitted', description: 'Deep inspection queued for sandbox node.' });
              }}
            >
              Dispatch probe
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-text-muted">
          <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-1">
            <span className="text-xs font-medium text-text-muted">Target IP</span>
            <div className="text-sm font-mono text-text font-bold">185.220.101.5:8080</div>
            <div className="text-[11px] text-text-muted">Autonomous System: AS9009 (M247 Ltd)</div>
          </div>
          <p>
            This drawer slides out from the edge, trapping focus for keyboard accessibility while allowing rapid review of incident details without losing navigation context.
          </p>
        </div>
      </Drawer>
    </div>
  );
}

export function DesignPreview({ onExit }: { onExit?: () => void }) {
  return (
    <ToastProvider>
      <PreviewContent onExit={onExit} />
    </ToastProvider>
  );
}
export default DesignPreview;

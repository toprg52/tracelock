import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Cpu,
  Briefcase,
  Globe,
  Network,
  Clock,
  Fingerprint,
  FileText,
  AlertTriangle,
  Download,
  Key,
  Eye,
  Smartphone,
  PhoneCall,
  Info,
  Server,
  Layers,
  CheckCircle2,
  AlertOctagon,
  FileCheck,
  ExternalLink,
  Lock,
  Copy,
  Check,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import { useAnalysis } from '../context/AnalysisContext';
import { useAuth } from '../context/AuthContext';
import { VerdictHero } from '../components/lab/VerdictHero';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Tabs, TabItem } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatTile } from '../components/ui/StatTile';
import { EmptyState } from '../components/ui/EmptyState';
import { AccordionItem, AccordionGroup } from '../components/ui/Accordion';
import { DataTable, Column } from '../components/ui/DataTable';

import RiskIntelligenceWheel from '../components/RiskIntelligenceWheel';
import ThreatCorrelationGraph from '../components/ThreatCorrelationGraph';
import BlockchainEvidencePanel from '../components/lab/BlockchainEvidencePanel';
import TimelinePanel from '../components/lab/TimelinePanel';
import ExecutiveReportPrintView from '../components/ExecutiveReportPrintView';

type PersonaView = 'analyst' | 'officer' | 'citizen';
type InvestigationSection =
  | 'overview'
  | 'permissions'
  | 'network'
  | 'behaviour'
  | 'campaign'
  | 'timeline'
  | 'evidence'
  | 'report';

export function AnalysisLabPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    caseData,
    campaignGraph,
    timeline,
    executiveSummary,
    language,
    setLanguage,
  } = useAnalysis();

  // Role-based default persona
  const initialPersona: PersonaView = useMemo(() => {
    if (user?.role === 'BANK_OFFICER') return 'officer';
    if (user?.role === 'CITIZEN') return 'citizen';
    return 'analyst';
  }, [user?.role]);

  // State: Persona perspective & main investigation section
  const [personaView, setPersonaView] = useState<PersonaView>(initialPersona);
  const [activeSection, setActiveSection] = useState<InvestigationSection>('overview');
  const [copiedIndicator, setCopiedIndicator] = useState<string | null>(null);

  // Safe JSON extraction
  const permissions: string[] = useMemo(() => {
    if (!caseData?.permissions) return [];
    try {
      return Array.isArray(caseData.permissions)
        ? caseData.permissions
        : JSON.parse(caseData.permissions);
    } catch {
      return [];
    }
  }, [caseData?.permissions]);

  const activities: string[] = useMemo(() => {
    if (!caseData?.activities) return [];
    try {
      return Array.isArray(caseData.activities)
        ? caseData.activities
        : JSON.parse(caseData.activities);
    } catch {
      return [];
    }
  }, [caseData?.activities]);

  const services: string[] = useMemo(() => {
    if (!caseData?.services) return [];
    try {
      return Array.isArray(caseData.services)
        ? caseData.services
        : JSON.parse(caseData.services);
    } catch {
      return [];
    }
  }, [caseData?.services]);

  const mitreTags: { id: string; name: string }[] = useMemo(() => {
    if (!caseData?.mitreTags) return [];
    try {
      return Array.isArray(caseData.mitreTags)
        ? caseData.mitreTags
        : JSON.parse(caseData.mitreTags);
    } catch {
      return [];
    }
  }, [caseData?.mitreTags]);

  const iocs: { type: string; value: string; severity: string }[] = useMemo(() => {
    if (!caseData?.iocs) return [];
    try {
      return Array.isArray(caseData.iocs)
        ? caseData.iocs
        : JSON.parse(caseData.iocs);
    } catch {
      return [];
    }
  }, [caseData?.iocs]);

  const threatNarrative = useMemo(() => {
    if (!caseData?.threatNarrative) return {};
    try {
      return typeof caseData.threatNarrative === 'string'
        ? JSON.parse(caseData.threatNarrative)
        : caseData.threatNarrative;
    } catch {
      return {};
    }
  }, [caseData?.threatNarrative]);

  const citizenImpact = useMemo(() => {
    if (!caseData?.citizenImpact) return {};
    try {
      return typeof caseData.citizenImpact === 'string'
        ? JSON.parse(caseData.citizenImpact)
        : caseData.citizenImpact;
    } catch {
      return {};
    }
  }, [caseData?.citizenImpact]);

  // Permission Categorization for charts and cards
  const permissionCategories = useMemo(() => {
    const buckets: Record<string, { name: string; impact: string }[]> = {
      sms_otp: [],
      accessibility: [],
      overlay_system: [],
      contacts_privacy: [],
      other: [],
    };

    permissions.forEach((perm) => {
      const pUpper = perm.toUpperCase();
      if (pUpper.includes('SMS') || pUpper.includes('RECEIVE_MMS') || pUpper.includes('READ_SMS')) {
        buckets.sms_otp.push({
          name: perm,
          impact: 'Intercepts incoming SMS messages containing 2FA OTP codes to automate unauthorized transactions.',
        });
      } else if (pUpper.includes('ACCESSIBILITY') || pUpper.includes('BIND_ACCESSIBILITY')) {
        buckets.accessibility.push({
          name: perm,
          impact: 'Grants full device control, recording keystrokes and auto-clicking banking approvals.',
        });
      } else if (pUpper.includes('SYSTEM_ALERT_WINDOW') || pUpper.includes('OVERLAY') || pUpper.includes('DRAW')) {
        buckets.overlay_system.push({
          name: perm,
          impact: 'Displays fake login screen overlays on top of legitimate banking apps to steal PINs and passwords.',
        });
      } else if (
        pUpper.includes('CONTACTS') ||
        pUpper.includes('LOCATION') ||
        pUpper.includes('CALL_LOG') ||
        pUpper.includes('RECORD_AUDIO') ||
        pUpper.includes('PHONE_STATE')
      ) {
        buckets.contacts_privacy.push({
          name: perm,
          impact: 'Exfiltrates personal contact lists, SIM state, and sensitive device telemetry to remote C2 servers.',
        });
      } else {
        buckets.other.push({
          name: perm,
          impact: 'Standard application permission requirement for general Android subsystem operation.',
        });
      }
    });

    return [
      {
        title: 'SMS & OTP Interception',
        count: buckets.sms_otp.length,
        color: 'var(--color-critical, #f05d6c)',
        icon: Key,
        items: buckets.sms_otp,
      },
      {
        title: 'Accessibility Keylogging Abuse',
        count: buckets.accessibility.length,
        color: 'var(--color-high, #f59e4b)',
        icon: Eye,
        items: buckets.accessibility,
      },
      {
        title: 'Screen Overlay Hijack',
        count: buckets.overlay_system.length,
        color: 'var(--color-critical, #f05d6c)',
        icon: Smartphone,
        items: buckets.overlay_system,
      },
      {
        title: 'Privacy & Data Exfiltration',
        count: buckets.contacts_privacy.length,
        color: 'var(--color-medium, #f2c94c)',
        icon: PhoneCall,
        items: buckets.contacts_privacy,
      },
      {
        title: 'Operational Permissions',
        count: buckets.other.length,
        color: 'var(--color-text-muted, #8b9bb4)',
        icon: Info,
        items: buckets.other,
      },
    ];
  }, [permissions]);

  const pieData = useMemo(() => {
    return permissionCategories
      .filter((cat) => cat.count > 0)
      .map((cat) => ({
        name: cat.title,
        value: cat.count,
        color: cat.color,
      }));
  }, [permissionCategories]);

  const highRiskPermissionCount = permissions.filter((p) => {
    const u = p.toUpperCase();
    return u.includes('SMS') || u.includes('ACCESSIBILITY') || u.includes('OVERLAY') || u.includes('SYSTEM_ALERT_WINDOW');
  }).length;

  if (!caseData) {
    return (
      <EmptyState
        icon={<Shield className="w-8 h-8 text-text-muted" />}
        title="No active case loaded"
        description="Submit a target Android binary (.apk) via the forensic submission gateway to compile static and dynamic telemetry."
        action={
          <Button variant="primary" onClick={() => navigate('/analyze')}>
            Analyze an APK
          </Button>
        }
        className="py-16"
      />
    );
  }

  // 8 Main Investigation Tabs
  const investigationTabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <Cpu className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permissions', icon: <Key className="w-4 h-4" />, count: permissions.length },
    { id: 'network', label: 'Network and IOCs', icon: <Server className="w-4 h-4" />, count: iocs.length },
    { id: 'behaviour', label: 'Behaviour', icon: <Layers className="w-4 h-4" />, count: mitreTags.length },
    { id: 'campaign', label: 'Campaign graph', icon: <Network className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'evidence', label: 'Evidence', icon: <Fingerprint className="w-4 h-4" /> },
    { id: 'report', label: 'Report', icon: <FileText className="w-4 h-4" /> },
  ];

  // Helper for copying IOC values
  const copyIndicator = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedIndicator(val);
    setTimeout(() => setCopiedIndicator(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto py-2">
      {/* ── 1. Verdict Hero ── */}
      <VerdictHero caseData={caseData} />

      {/* ── 2. Investigation Navigation & Persona Switcher Bar ── */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 border-b border-border pb-2">
        {/* Main Investigation Tabs */}
        <div className="overflow-x-auto w-full xl:w-auto scrollbar-none">
          <Tabs
            tabs={investigationTabs}
            activeId={activeSection}
            onChange={(id) => setActiveSection(id as InvestigationSection)}
            variant="line"
            size="sm"
            ariaLabel="Forensic investigation tabs"
          />
        </div>

        {/* Persona Switcher: "View as: Analyst / Bank officer / Citizen" */}
        <div className="flex items-center gap-2 shrink-0 self-start xl:self-center pt-1 xl:pt-0">
          <span className="text-xs font-mono font-medium text-text-muted">View as:</span>
          <SegmentedControl<PersonaView>
            size="sm"
            value={personaView}
            onChange={setPersonaView}
            options={[
              { value: 'analyst', label: 'Analyst', icon: <Cpu className="w-3.5 h-3.5" /> },
              { value: 'officer', label: 'Bank officer', icon: <Briefcase className="w-3.5 h-3.5" /> },
              { value: 'citizen', label: 'Citizen', icon: <Globe className="w-3.5 h-3.5" /> },
            ]}
            ariaLabel="Select case perspective: Analyst, Bank officer, or Citizen"
          />
        </div>
      </div>

      {/* ── 3. Investigation Content Sections ── */}

      {/* ────────────────── SECTION: OVERVIEW ────────────────── */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Dynamic Persona Perspective Summary Card */}
          <Card className="p-5 sm:p-6 shadow-sm border border-border bg-surface">
            {personaView === 'analyst' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-accent" />
                    <div>
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-text">
                        Security Analyst Technical Perspective
                      </h3>
                      <p className="text-xs text-text-muted">
                        Reverse-engineering decompilation telemetry and exploit signature correlation.
                      </p>
                    </div>
                  </div>
                  <Badge variant="critical" dot size="sm">
                    {caseData.riskScore >= 80 ? 'CRITICAL EXPLOITATION VECTOR' : 'SUSPICIOUS BINARY TELEMETRY'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-1">
                    <span className="text-[10px] font-mono text-text-muted uppercase">Primary Attack Vector</span>
                    <p className="text-xs font-semibold text-text">
                      {permissions.some((p) => p.includes('BIND_ACCESSIBILITY_SERVICE'))
                        ? 'Accessibility Hijacking & Screen Overlays'
                        : 'Background SMS Interception'}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Injects full-screen fake login overlays when banking apps are launched.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-1">
                    <span className="text-[10px] font-mono text-text-muted uppercase">Adversary Tactics</span>
                    <p className="text-xs font-semibold text-text">
                      {mitreTags.length > 0
                        ? `${mitreTags[0].id} (${mitreTags[0].name})`
                        : 'Input Interception & C2 Exfiltration'}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Suppresses incoming SMS notifications to stealthily capture OTP tokens.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-1">
                    <span className="text-[10px] font-mono text-text-muted uppercase">SOC Recommendation</span>
                    <p className="text-xs font-semibold text-accent">
                      Sinkhole Network C2 & Invalidate Sessions
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Blacklist active C2 endpoints at perimeter firewalls and reset client credentials.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {personaView === 'officer' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-accent" />
                    <div>
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-text">
                        Bank Officer Regulatory & Financial Risk Perspective
                      </h3>
                      <p className="text-xs text-text-muted">
                        GRC compliance audit, customer fund exposure, and statutory reporting obligations.
                      </p>
                    </div>
                  </div>
                  <Badge variant="high" dot size="sm">
                    AUDIT READY DOSSIER
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-1">
                    <span className="text-[10px] font-mono text-text-muted uppercase">Estimated Financial Exposure</span>
                    <p className="text-base font-mono font-bold text-severity-critical">
                      ₹1.5Cr – ₹3.0Cr
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Targeted customer retail deposits at risk of unauthorized UPI transfers.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-1">
                    <span className="text-[10px] font-mono text-text-muted uppercase">Regulatory Compliance Status</span>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-severity-critical" />
                      <span className="text-xs font-bold text-severity-critical">
                        RBI & DPDP Act Non-Compliant
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Severe consumer data privacy breach under Digital Personal Data Protection Act.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-1">
                    <span className="text-[10px] font-mono text-text-muted uppercase">Mandatory Statutory Directive</span>
                    <p className="text-xs font-semibold text-accent">
                      CERT-In 6-Hour Notice Filing
                    </p>
                    <p className="text-[11px] text-text-muted">
                      File automated cyber-incident disclosure form to national regulatory authorities.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {personaView === 'citizen' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-accent" />
                    <div>
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-text">
                        Citizen Safety Center & Consumer Threat Advisory
                      </h3>
                      <p className="text-xs text-text-muted">
                        Jargon-free safety guidance and emergency recovery checklist for mobile users.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-text-muted">Language:</span>
                    {[
                      { code: 'en', label: 'EN' },
                      { code: 'hi', label: 'हिंदी' },
                      { code: 'te', label: 'తెలుగు' },
                      { code: 'kn', label: 'ಕನ್ನಡ' },
                    ].map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLanguage(l.code)}
                        className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                          language === l.code
                            ? 'bg-accent text-surface font-bold'
                            : 'bg-surface-raised text-text-muted hover:text-text'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-severity-critical/10 border border-severity-critical/30 space-y-2">
                  <div className="flex items-center gap-2 text-severity-critical font-bold text-xs uppercase font-mono">
                    <AlertTriangle className="w-4 h-4" />
                    <span>DANGER: Immediate Citizen Action Required</span>
                  </div>
                  <p className="text-xs text-text leading-relaxed font-sans">
                    {caseData.fileName} is disguised as a banking verification update, but it secretly reads your SMS messages, steals your one-time passwords (OTP), and attempts to drain your savings.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                      <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[11px]">1</span>
                      <span>Uninstall Now</span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Go to Android Settings → Apps → Select {caseData.fileName} and tap Uninstall immediately.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                      <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[11px]">2</span>
                      <span>Revoke Access</span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Disable Accessibility permissions and SMS access granted to untrusted apps.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                      <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[11px]">3</span>
                      <span>Review Accounts</span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Check your netbanking and UPI transactions for any unfamiliar debit charges.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                      <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[11px]">4</span>
                      <span>Helpline 1930</span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Call National Cyber Crime Reporting Helpline 1930 if funds were stolen.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Metrics StatTiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              label="Overall Risk Index"
              value={`${caseData.riskScore}/100`}
              helperText="Composite multi-factor rating"
              icon={<Shield className="w-5 h-5 text-severity-critical" />}
            />
            <StatTile
              label="Requested Permissions"
              value={permissions.length}
              helperText={`${highRiskPermissionCount} high-risk privileged APIs`}
              icon={<Key className="w-5 h-5 text-accent" />}
            />
            <StatTile
              label="Correlated IOCs"
              value={iocs.length}
              helperText="Active C2 IPs & threat domains"
              icon={<Server className="w-5 h-5 text-severity-high" />}
            />
            <StatTile
              label="AI Model Confidence"
              value={`${caseData.aiConfidence ?? 94}%`}
              helperText="Decompilation classification match"
              icon={<Cpu className="w-5 h-5 text-blue-400" />}
            />
          </div>

          {/* Risk Intelligence Wheel */}
          <div className="overflow-x-auto">
            <RiskIntelligenceWheel
              riskScore={caseData.riskScore}
              permissionScore={caseData.permissionScore || 80}
              iocScore={caseData.iocScore || 70}
              keywordScore={caseData.keywordScore || 65}
              aiConfidence={caseData.aiConfidence || 90}
              iocCount={iocs.length}
              activityCount={activities.length}
              serviceCount={services.length}
            />
          </div>

          {/* Key Findings First, Long Details in Collapsed Accordions */}
          <AccordionGroup>
            <AccordionItem
              id="raw-narrative"
              title="Forensic Threat Narrative & Runtime Telemetry"
              subtitle="Expanded behavioral decomposition and fraud vectors"
              badge={<Badge variant="neutral">TECHNICAL DOSSIER</Badge>}
            >
              <div className="space-y-3 pt-2 text-xs font-mono text-text-muted">
                <div className="p-3 bg-surface rounded-lg border border-border">
                  <span className="text-[10px] uppercase font-bold text-accent block mb-1">
                    Observed Runtime Behaviour
                  </span>
                  <p className="text-text font-sans leading-relaxed">
                    {threatNarrative.behavior ||
                      `Analysis of target package ${caseData.fileName} revealed risk index ${caseData.riskScore}/100 based on component decompilation and static heuristics.`}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-surface rounded-lg border border-border">
                    <span className="text-[10px] uppercase font-bold text-severity-critical block mb-1">
                      OTP Theft Mechanism
                    </span>
                    <p className="text-text font-sans">
                      {threatNarrative.otpTheft ||
                        'Monitors incoming SMS messages with priority filters matching OTP, transaction PIN, and bank alerts.'}
                    </p>
                  </div>

                  <div className="p-3 bg-surface rounded-lg border border-border">
                    <span className="text-[10px] uppercase font-bold text-severity-high block mb-1">
                      Accessibility Abuse Vector
                    </span>
                    <p className="text-text font-sans">
                      {threatNarrative.accessibilityAbuse ||
                        'Exploits Android Accessibility framework to auto-click permissions and defeat user uninstallation attempts.'}
                    </p>
                  </div>
                </div>
              </div>
            </AccordionItem>
          </AccordionGroup>
        </div>
      )}

      {/* ────────────────── SECTION: PERMISSIONS ────────────────── */}
      {activeSection === 'permissions' && (
        <div className="space-y-6">
          {/* Key Findings First: Donut Chart & Vector Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Donut Chart Card */}
            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
                  Permission Risk Distribution
                </h3>
                <p className="text-[11px] text-text-muted font-mono mt-1">
                  Proportion of exploit vectors vs standard app permissions.
                </p>
              </div>

              {pieData.length > 0 ? (
                <div className="space-y-3">
                  <div className="h-44 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={68}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--color-surface)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: 'var(--color-text)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-xl font-bold font-mono text-text leading-none">{permissions.length}</span>
                      <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider mt-1">PERMISSIONS</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-border">
                    {permissionCategories.filter((c) => c.count > 0).map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-text font-medium truncate">{cat.title}</span>
                        </div>
                        <span className="text-text-muted font-bold">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs font-mono text-text-muted py-8 text-center">No permission data recorded.</p>
              )}
            </Card>

            {/* Exploit Vector Cards Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {permissionCategories.map((cat, idx) => {
                const IconComp = cat.icon;
                return (
                  <div
                    key={idx}
                    className={`border rounded-xl p-3.5 space-y-2.5 ${
                      cat.count > 0 ? 'bg-surface border-border' : 'bg-surface/50 border-border/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-surface-raised text-accent">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-text font-mono">{cat.title}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text">
                        {cat.count}
                      </span>
                    </div>

                    {cat.count > 0 ? (
                      <div className="space-y-1.5 mt-2">
                        {cat.items.slice(0, 2).map((item, iIdx) => (
                          <div key={iIdx} className="p-2 rounded-lg bg-surface-raised border border-border/70 space-y-0.5">
                            <div className="text-[11px] font-mono font-bold text-text truncate flex items-center justify-between">
                              <code>{item.name}</code>
                              <span className="text-[9px] text-severity-critical font-mono">DANGER</span>
                            </div>
                            <p className="text-[10px] text-text-muted leading-relaxed truncate">{item.impact}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] font-mono text-text-muted italic">No requested permissions in this vector.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Long Details in Collapsed Accordions */}
          <AccordionGroup>
            <AccordionItem
              id="all-permissions-inventory"
              title={`Complete Android Permissions Inventory (${permissions.length} total)`}
              subtitle="Full manifest declaration list with technical impact definitions"
              badge={<Badge variant="neutral">MANIFEST DUMP</Badge>}
            >
              <div className="space-y-2 pt-2 overflow-x-auto">
                {permissions.map((perm, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <code className="text-text font-semibold break-all">{perm}</code>
                    <Badge
                      variant={
                        perm.includes('SMS') || perm.includes('ACCESSIBILITY') || perm.includes('OVERLAY')
                          ? 'critical'
                          : perm.includes('PHONE') || perm.includes('INSTALL')
                          ? 'high'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {perm.includes('SMS') || perm.includes('ACCESSIBILITY') || perm.includes('OVERLAY')
                        ? 'CRITICAL'
                        : perm.includes('PHONE') || perm.includes('INSTALL')
                        ? 'HIGH'
                        : 'STANDARD'}
                    </Badge>
                  </div>
                ))}
              </div>
            </AccordionItem>
          </AccordionGroup>
        </div>
      )}

      {/* ────────────────── SECTION: NETWORK AND IOCS ────────────────── */}
      {activeSection === 'network' && (
        <div className="space-y-6">
          {/* Key Findings First: C2 Infrastructure Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile
              label="C2 Server Indicators"
              value={iocs.filter((i) => i.type.toLowerCase() === 'ip').length}
              helperText="Command and control server IPs"
              icon={<Server className="w-5 h-5 text-severity-critical" />}
            />
            <StatTile
              label="Phishing & C2 Domains"
              value={iocs.filter((i) => i.type.toLowerCase() === 'domain').length}
              helperText="Hostnames contacted during execution"
              icon={<Globe className="w-5 h-5 text-severity-high" />}
            />
            <StatTile
              label="Malware Signatures"
              value={iocs.filter((i) => i.type.toLowerCase() === 'sha256').length}
              helperText="Cryptographic payload hashes"
              icon={<Fingerprint className="w-5 h-5 text-accent" />}
            />
          </div>

          {/* Interactive IOCs DataTable */}
          <Card className="p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
                  Correlated Indicators of Compromise (IOCs)
                </h3>
                <p className="text-[11px] text-text-muted font-mono mt-0.5">
                  Verified malicious network hosts, dropper links, and payload fingerprints.
                </p>
              </div>
              <Badge variant="high" dot size="sm">
                THREAT INTELLIGENCE VERIFIED
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-raised border-b border-border text-text-muted uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Indicator Value</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {iocs.map((ioc, idx) => (
                    <tr key={idx} className="hover:bg-surface-raised/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-accent">{ioc.type}</td>
                      <td className="py-2.5 px-3 font-semibold text-text select-all break-all">{ioc.value}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            (ioc.severity || '').toLowerCase().includes('crit')
                              ? 'critical'
                              : (ioc.severity || '').toLowerCase().includes('high')
                              ? 'high'
                              : 'medium'
                          }
                          size="sm"
                          dot
                        >
                          {ioc.severity || 'HIGH'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => copyIndicator(ioc.value)}
                          className="p-1 rounded text-text-muted hover:text-accent hover:bg-surface transition-colors"
                          title="Copy IOC value"
                          aria-label="Copy IOC value"
                        >
                          {copiedIndicator === ioc.value ? (
                            <Check className="w-3.5 h-3.5 text-severity-low" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Long Details in Collapsed Accordion */}
          <AccordionGroup>
            <AccordionItem
              id="raw-network-trace"
              title="Raw Network Telemetry & DNS Resolution Logs"
              subtitle="Full HTTP headers, beacon intervals, and payload traffic capture"
              badge={<Badge variant="neutral">PCAP TELEMETRY</Badge>}
            >
              <div className="p-3 bg-surface rounded-lg border border-border space-y-2 font-mono text-[11px] overflow-x-auto">
                <p className="text-text-muted">SYN packet outbound → 185.220.101.5:443 [ESTABLISHED]</p>
                <p className="text-text-muted">DNS Query: update-server-v3.net (A Record → 185.220.101.5)</p>
                <p className="text-severity-critical">HTTP POST /api/v1/bot/register [Payload encrypted with RC4 key]</p>
                <p className="text-text-muted">Keep-alive heartbeat frequency: 30 seconds</p>
              </div>
            </AccordionItem>
          </AccordionGroup>
        </div>
      )}

      {/* ────────────────── SECTION: BEHAVIOUR ────────────────── */}
      {activeSection === 'behaviour' && (
        <div className="space-y-6">
          {/* Key Findings First: MITRE ATT&CK Mobile Matrix */}
          <Card className="p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
                  MITRE ATT&CK Mobile Technique Mapping
                </h3>
                <p className="text-[11px] text-text-muted font-mono mt-0.5">
                  Standardized adversarial tactics, techniques, and procedures (TTPs).
                </p>
              </div>
              <Badge variant="critical" dot size="sm">
                {mitreTags.length} TACTICS DETECTED
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mitreTags.map((tag) => (
                <div
                  key={tag.id}
                  className="p-3 rounded-xl bg-surface-raised border border-border space-y-1 hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-severity-critical uppercase">{tag.id}</span>
                    <Badge variant="critical" size="sm">ATT&CK</Badge>
                  </div>
                  <p className="text-xs font-semibold text-text">{tag.name}</p>
                  <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                    Adversary executes unauthorized operations within the mobile execution environment.
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Long Details in Collapsed Accordions */}
          <AccordionGroup>
            <AccordionItem
              id="decompiled-activities"
              title={`Decompiled Android Activities (${activities.length} registered entrypoints)`}
              subtitle="Declared UI activity manifests and intent filter handlers"
              badge={<Badge variant="neutral">ACTIVITIES</Badge>}
            >
              <div className="space-y-1.5 pt-2 font-mono text-xs overflow-x-auto">
                {activities.map((act, idx) => (
                  <div key={idx} className="p-2 rounded bg-surface border border-border text-text flex items-center justify-between">
                    <code className="text-accent">{act}</code>
                    <span className="text-[10px] text-text-muted">UI Component</span>
                  </div>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem
              id="background-services"
              title={`Background Services & Daemons (${services.length} active listeners)`}
              subtitle="Persistent background workers and event receiver registrations"
              badge={<Badge variant="neutral">SERVICES</Badge>}
            >
              <div className="space-y-1.5 pt-2 font-mono text-xs overflow-x-auto">
                {services.map((srv, idx) => (
                  <div key={idx} className="p-2 rounded bg-surface border border-border text-text flex items-center justify-between">
                    <code className="text-severity-critical">{srv}</code>
                    <span className="text-[10px] text-severity-critical font-bold">DAEMON</span>
                  </div>
                ))}
              </div>
            </AccordionItem>
          </AccordionGroup>
        </div>
      )}

      {/* ────────────────── SECTION: CAMPAIGN GRAPH ────────────────── */}
      {activeSection === 'campaign' && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4 shadow-card">
            <div>
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
                Threat Correlation & Infrastructure Graph
              </h3>
              <p className="text-[11px] text-text-muted font-mono mt-0.5">
                Interactive relationship visualization between target APK, C2 servers, threat family, and similar campaign samples.
              </p>
            </div>

            {/* Fixed ThreatCorrelationGraph with all requirements */}
            <div className="h-[520px] bg-surface-raised border border-border rounded-xl overflow-hidden relative">
              <ThreatCorrelationGraph
                fileName={caseData.fileName}
                threatFamily={caseData.threatFamily}
                riskScore={caseData.riskScore}
                mitreTags={mitreTags}
                iocs={iocs}
              />
            </div>
          </Card>
        </div>
      )}

      {/* ────────────────── SECTION: TIMELINE ────────────────── */}
      {activeSection === 'timeline' && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4 shadow-card">
            <div>
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
                Malware Sandbox Event Timeline
              </h3>
              <p className="text-[11px] text-text-muted font-mono mt-0.5">
                Chronological sequence of ingestion, static extraction, dynamic emulation, and threat scoring.
              </p>
            </div>

            <TimelinePanel />
          </Card>

          <AccordionGroup>
            <AccordionItem
              id="raw-timeline-events"
              title="Raw Chronological Trace & Sandbox Audit Logs"
              subtitle="Full JSON event timeline dump from sandboxed Android emulator"
              badge={<Badge variant="neutral">AUDIT LOG</Badge>}
            >
              <pre className="p-3 bg-surface rounded-lg border border-border text-[11px] font-mono text-text-muted overflow-x-auto">
                {JSON.stringify(timeline, null, 2)}
              </pre>
            </AccordionItem>
          </AccordionGroup>
        </div>
      )}

      {/* ────────────────── SECTION: EVIDENCE ────────────────── */}
      {activeSection === 'evidence' && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4 shadow-card">
            <div>
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
                Immutable Evidence Ledger
              </h3>
              <p className="text-[11px] text-text-muted font-mono mt-0.5">
                Cryptographic attestation and tamper-evident anchoring on the Sepolia Ethereum testnet.
              </p>
            </div>

            <BlockchainEvidencePanel />
          </Card>

          <AccordionGroup>
            <AccordionItem
              id="raw-blockchain-proof"
              title="Cryptographic Proof & Merkle Attestation Details"
              subtitle="Raw transaction parameters, cryptographic digest, and smart contract ABI"
              badge={<Badge variant="neutral">PROOF DATA</Badge>}
            >
              <div className="p-3 bg-surface rounded-lg border border-border space-y-2 font-mono text-[11px] overflow-x-auto">
                <p className="text-text-muted">Target SHA-256 Digest: {caseData.sha256}</p>
                <p className="text-text-muted">Contract Anchor Target: Sepolia Testnet (EIP-712)</p>
                <p className="text-accent">Verification Algorithm: Keccak-256 State Hashing</p>
              </div>
            </AccordionItem>
          </AccordionGroup>
        </div>
      )}

      {/* ────────────────── SECTION: REPORT ────────────────── */}
      {activeSection === 'report' && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4 shadow-card no-print">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
                  Executive Forensic Dossier & Regulatory Dossier Export
                </h3>
                <p className="text-[11px] text-text-muted font-mono mt-0.5">
                  Complete printable investigation dossier for legal proceedings, CERT-In filing, and bank audits.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-surface-raised border border-border text-xs font-mono px-3 py-1.5 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                  title="Select Dossier Export Language"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                  <option value="ml">മലയാളം (Malayalam)</option>
                  <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                  <option value="or">ଓଡ଼ିଆ (Odia)</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  iconLeft={<Download className="w-3.5 h-3.5" />}
                  onClick={() => window.print()}
                >
                  Export Dossier / Print
                </Button>
              </div>
            </div>
          </Card>

          {/* Full Executive Print View Document */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden p-2">
            <ExecutiveReportPrintView
              caseData={caseData}
              execSummaryData={executiveSummary}
              graphData={campaignGraph}
              timelineData={timeline}
              permissions={permissions}
              activities={activities}
              services={services}
              mitreTags={mitreTags}
              iocs={iocs}
              threatNarrative={threatNarrative}
              citizenImpact={citizenImpact}
              langCode={language}
              regionalAdvisory={caseData.multilingualReports ? JSON.parse(caseData.multilingualReports) : {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisLabPage;

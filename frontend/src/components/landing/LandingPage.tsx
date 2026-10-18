import React, { useState } from 'react';
import {
  ArrowRight,
  Activity,
  UploadCloud,
  Cpu,
  FileText,
  ShieldAlert,
  Sliders,
  Terminal,
  Layers,
  Lock,
  Globe,
  Play,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { StatTile } from '../ui/StatTile';
import { Modal } from '../ui/Modal';
import { HeroArt } from './HeroArt';
import { Logo } from '../brand/Logo';

export interface LandingPageProps {
  onLaunchDashboard: () => void;
  onUploadApk: () => void;
  onSelectSampleApk?: (apkName: string) => void;
}

interface DemoApkItem {
  name: string;
  label: string;
  pkg: string;
  risk: number;
  malwareType: string;
  threatFamily: string;
  permissions: string[];
  summary: string;
  status: 'CLEAN' | 'SUSPICIOUS' | 'CRITICAL';
}

const DEMO_APK_DATA: Record<string, DemoApkItem> = {
  '08_Anubis_Overlay_Trojan.apk': {
    name: '08_Anubis_Overlay_Trojan.apk',
    label: 'Anubis Trojan',
    pkg: 'com.cedarline.secure.token.anubis',
    risk: 88,
    malwareType: 'Banking Trojan / Overlay Hijacker',
    threatFamily: 'Anubis / Cerberus Family',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.READ_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.BIND_ACCESSIBILITY_SERVICE',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
    summary:
      'Abuses Accessibility Services to intercept SMS OTPs and inject transparent overlay phishing windows over active banking apps.',
    status: 'CRITICAL',
  },
  '10_SpyNote_RAT_Injector.apk': {
    name: '10_SpyNote_RAT_Injector.apk',
    label: 'SpyNote RAT',
    pkg: 'com.spynote.rat.remote.access',
    risk: 98,
    malwareType: 'Remote Access Trojan (RAT)',
    threatFamily: 'SpyNote RAT Variant',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.READ_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.BIND_ACCESSIBILITY_SERVICE',
      'android.permission.RECORD_AUDIO',
      'android.permission.CAMERA',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
    summary:
      'Full Remote Access Trojan with active keylogging, ambient microphone capture, remote camera control, and credential exfiltration.',
    status: 'CRITICAL',
  },
  '04_Game_Mod_Booster.apk': {
    name: '04_Game_Mod_Booster.apk',
    label: 'Adware Mod',
    pkg: 'com.speed.gamebooster.mod',
    risk: 48,
    malwareType: 'Potentially Unwanted Application (PUA)',
    threatFamily: 'Generic Mobile Riskware',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.WAKE_LOCK',
      'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
    summary:
      'Aggressive adware and device modifier requesting persistent background wake locks, boot receivers, and out-of-context ad displays.',
    status: 'SUSPICIOUS',
  },
  '01_Official_Mobile_Banking.apk': {
    name: '01_Official_Mobile_Banking.apk',
    label: 'Official Bank App',
    pkg: 'com.cedarline.mobile.official',
    risk: 18,
    malwareType: 'Clean Mobile Application',
    threatFamily: 'Verified Safe Binary',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.VIBRATE',
    ],
    summary:
      'Official banking client. Signed by trusted root certificate with standard network access and strict baseline permissions.',
    status: 'CLEAN',
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  onUploadApk,
  onSelectSampleApk,
}) => {
  const [selectedDemoKey, setSelectedDemoKey] = useState<string>('08_Anubis_Overlay_Trojan.apk');
  const [isLimitationsModalOpen, setIsLimitationsModalOpen] = useState(false);

  const activeDemo = DEMO_APK_DATA[selectedDemoKey] || DEMO_APK_DATA['08_Anubis_Overlay_Trojan.apk'];

  return (
    <div className="space-y-16 py-4 max-w-6xl mx-auto">
      {/* =========================================================================
          1. HERO ENTRY: EYEBROW, HEADLINE, SUPPORTING SENTENCE, TWO BUTTONS + ART
          ========================================================================= */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-2 pb-2">
        {/* Left Hero Text: left-aligned on desktop, centred on mobile */}
        <div className="flex-1 max-w-2xl text-center lg:text-left space-y-6">
          <div className="space-y-3">
            {/* Eyebrow: sentence case, small, muted */}
            <p className="text-xs sm:text-sm font-sans font-medium text-text-muted tracking-normal">
              Android malware analysis
            </p>

            {/* Headline: ~48px desktop, line-height 1.1, weight 600, not tighter than -0.02em */}
            <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold text-text leading-[1.1] tracking-[-0.015em]">
              Trace the threat. Lock the evidence.
            </h1>

            {/* One supporting sentence */}
            <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
              Decompile Android APKs, evaluate multi-dimensional risk heuristics, map MITRE ATT&CK Mobile techniques, and verify chain-of-custody evidence on Ethereum.
            </p>
          </div>

          {/* Two buttons directly beneath with 24px spacing, no large empty gap */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Button
              id="hero-cta-analyze"
              variant="primary"
              size="lg"
              onClick={onUploadApk}
              iconRight={<ArrowRight className="w-4 h-4" />}
              className="font-semibold shadow-sm"
            >
              Analyze an APK
            </Button>

            <Button
              id="hero-cta-dashboard"
              variant="secondary"
              size="lg"
              onClick={onLaunchDashboard}
              iconLeft={<Activity className="w-4 h-4 text-accent" />}
              className="font-semibold"
            >
              Open dashboard
            </Button>
          </div>
        </div>

        {/* Right Hero Art: fine mint contour lines + lock shape, hidden below 768px */}
        <div className="hidden md:flex flex-1 justify-center lg:justify-end items-center max-w-[480px] w-full">
          <HeroArt className="w-full" />
        </div>
      </section>

      {/* =========================================================================
          2. STATS ROW: FOUR REAL TILES WITH SENTENCE-CASE LABELS (StatTile)
          ========================================================================= */}
      <section aria-label="Key platform metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Risk dimensions"
            value={9}
            helperText="Multi-factor weights in risk_weights.yaml"
            icon={<Sliders className="w-4 h-4 text-accent" />}
            className="h-full"
          />
          <StatTile
            label="Permission rules"
            value={3}
            helperText="Composite fraud & abuse heuristics"
            icon={<ShieldAlert className="w-4 h-4 text-critical" />}
            className="h-full"
          />
          <StatTile
            label="IOC extractors"
            value={6}
            helperText="C2 IPs, domains, Telegram & crypto"
            icon={<Terminal className="w-4 h-4 text-info" />}
            className="h-full"
          />
          <StatTile
            label="Advisory languages"
            value={11}
            helperText="Regional translation resources"
            icon={<Globe className="w-4 h-4 text-accent" />}
            className="h-full"
          />
        </div>
      </section>

      {/* =========================================================================
          3. THREE-STEP "HOW IT WORKS" SECTION (UPLOAD, ANALYZE, REPORT)
          ========================================================================= */}
      <section className="space-y-6" aria-labelledby="how-it-works-heading">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">
            Operational Workflow
          </span>
          <h2 id="how-it-works-heading" className="text-xl sm:text-2xl font-bold text-text">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto">
            Automated three-stage triage from raw Android binary ingestion to verifiable forensic reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Upload */}
          <Card className="p-5 space-y-3 relative overflow-hidden border-border bg-surface hover:border-accent/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-raised text-text-muted border border-border">
                STEP 01
              </span>
            </div>
            <h3 className="text-base font-semibold text-text">1. Upload APK</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Drop any Android <span className="font-mono text-text">.apk</span> package. The automated pipeline decompiles the package, unpacks <span className="font-mono text-text">AndroidManifest.xml</span>, extracts DEX bytecode strings, and parses cryptographic signing certificates.
            </p>
          </Card>

          {/* Step 2: Analyze */}
          <Card className="p-5 space-y-3 relative overflow-hidden border-border bg-surface hover:border-accent/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center text-info">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-raised text-text-muted border border-border">
                STEP 02
              </span>
            </div>
            <h3 className="text-base font-semibold text-text">2. Analyze Threat Vectors</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Calculates a unified threat score across 9 weighted risk dimensions. Flags high-risk composite permission combos (such as Accessibility Service + SMS Interception), extracts C2 IOCs, and attributes techniques to the MITRE ATT&CK Mobile matrix.
            </p>
          </Card>

          {/* Step 3: Report */}
          <Card className="p-5 space-y-3 relative overflow-hidden border-border bg-surface hover:border-accent/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-raised text-text-muted border border-border">
                STEP 03
              </span>
            </div>
            <h3 className="text-base font-semibold text-text">3. Report & Anchor</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Generates role-tailored intelligence briefings for SOC analysts and fraud officers across 11 regional languages, and cryptographically anchors report digests to Ethereum Sepolia via smart contract for courtroom-ready chain of custody.
            </p>
          </Card>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURE GRID (LISTING ONLY FEATURES THAT EXIST IN THIS CODEBASE)
          ========================================================================= */}
      <section className="space-y-6" aria-labelledby="features-heading">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">
            Engineered Capabilities
          </span>
          <h2 id="features-heading" className="text-xl sm:text-2xl font-bold text-text">
            Platform Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto">
            Forensic analysis features implemented in Tracelock, built specifically for mobile malware triage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Feature 1 */}
          <Card className="p-5 space-y-2.5 border-border bg-surface">
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-critical">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-text">Composite Permission Heuristics</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Detects high-risk banking trojan permission combinations in <span className="font-mono text-text">PermissionAnalyzer</span>: Accessibility Service abuse coupled with SMS interception, silent SMS capture, and overlay window hijacking.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="p-5 space-y-2.5 border-border bg-surface">
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-accent">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-text">9-Dimension Risk Scoring</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Dynamic multi-factor risk computation combining weighted dimensions: permissions (15%), runtime events (25%), network telemetry (15%), certificates (10%), IOC density (10%), obfuscation (10%), and ATT&CK alignment.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="p-5 space-y-2.5 border-border bg-surface">
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-info">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-text">6 IOC Pattern Extractors</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Embedded regex plugins scan unpacked binaries and DEX strings for C2 IPv4 addresses, URLs, contact emails, Telegram bot/channel handles, Discord invites, and cryptocurrency wallet addresses.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card className="p-5 space-y-2.5 border-border bg-surface">
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-medium">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-text">MITRE ATT&CK Mobile Mapping</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Correlates observed permissions and deobfuscated behavior to mobile adversary tactics, tracking specific techniques such as T1400 (Accessibility Abuse), T1412 (SMS Capture), and T1407 (Obfuscation).
            </p>
          </Card>

          {/* Feature 5 */}
          <Card className="p-5 space-y-2.5 border-border bg-surface">
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-accent">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-text">Ethereum Evidence Ledger</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Immutable SHA-256 and Keccak-256 evidence hashing anchored via <span className="font-mono text-text">EvidenceAnchor.sol</span> on Ethereum Sepolia with client-side MetaMask signing, verifying courtroom chain of custody.
            </p>
          </Card>

          {/* Feature 6 */}
          <Card className="p-5 space-y-2.5 border-border bg-surface">
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-info">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-text">11 Regional Advisory Languages</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Generates executive briefings and citizen threat warnings localized in English, Hindi, Kannada, Tamil, Telugu, Bengali, Marathi, Gujarati, Malayalam, Punjabi, and Odia for rapid fraud response.
            </p>
          </Card>
        </div>
      </section>

      {/* =========================================================================
          5. SAMPLE DEMO SECTION (LABELLED "DEMO DATA") + HONEST NOTE
          ========================================================================= */}
      <section className="space-y-4" aria-labelledby="sample-demo-heading">
        <Card className="p-6 space-y-6 border-border bg-surface">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 id="sample-demo-heading" className="text-base sm:text-lg font-bold text-text">
                  Interactive Malware Telemetry Sandbox
                </h2>
                <Badge variant="demo" size="sm">
                  Demo data
                </Badge>
              </div>
              <p className="text-xs text-text-muted">
                Explore pre-computed forensic cases and simulated banking trojan behavior without uploading live binaries.
              </p>
            </div>

            {/* Sample pill selector */}
            <div className="flex flex-wrap gap-1.5 font-mono text-xs" role="tablist" aria-label="Sample APK selector">
              {Object.keys(DEMO_APK_DATA).map((key) => {
                const sample = DEMO_APK_DATA[key];
                const isSelected = selectedDemoKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedDemoKey(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-colors cursor-pointer border focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? 'bg-accent/15 border-accent text-accent font-semibold'
                        : 'bg-surface-raised border-border text-text-muted hover:text-text hover:bg-surface-raised/70'
                    }`}
                  >
                    {sample.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sample Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Risk score panel */}
            <div className="p-5 rounded-xl bg-surface-raised/50 border border-border flex flex-col justify-between space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Threat Score Index
                </span>
                <Badge
                  variant={
                    activeDemo.status === 'CLEAN'
                      ? 'low'
                      : activeDemo.status === 'SUSPICIOUS'
                      ? 'medium'
                      : 'critical'
                  }
                  size="sm"
                >
                  {activeDemo.status}
                </Badge>
              </div>

              <div className="text-center space-y-2 py-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-mono font-bold text-accent">
                    {activeDemo.risk}
                  </span>
                  <span className="text-sm font-mono text-text-muted">/100</span>
                </div>

                {/* Segmented bar */}
                <div className="flex gap-1 justify-center max-w-[180px] mx-auto pt-1" aria-hidden="true">
                  {[20, 40, 60, 80, 100].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 h-1.5 rounded-full transition-colors ${
                        activeDemo.risk >= step
                          ? step >= 80
                            ? 'bg-critical'
                            : step >= 50
                            ? 'bg-high'
                            : 'bg-low'
                          : 'bg-border'
                      }`}
                    />
                  ))}
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-text">{activeDemo.malwareType}</p>
                  <p className="text-[11px] font-mono text-text-muted">{activeDemo.threatFamily}</p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  if (onSelectSampleApk) {
                    onSelectSampleApk(activeDemo.name);
                  } else {
                    onLaunchDashboard();
                  }
                }}
                iconLeft={<Play className="w-3.5 h-3.5 text-accent" />}
                className="font-medium"
              >
                Open in Analysis Lab
              </Button>
            </div>

            {/* Right: Metadata and permissions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-text-muted">
                  <span className="uppercase">Target Package</span>
                  <span className="truncate">Sample: {activeDemo.name}</span>
                </div>
                <div className="text-xs font-mono font-bold text-accent break-all">
                  {activeDemo.pkg}
                </div>
                <p className="text-xs text-text-muted leading-relaxed pt-1">
                  {activeDemo.summary}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                  <span className="uppercase">
                    Manifest Permissions ({activeDemo.permissions.length})
                  </span>
                  <span className="text-[10px] text-critical font-sans">
                    {activeDemo.permissions.filter((p) => p.includes('ACCESSIBILITY') || p.includes('SMS') || p.includes('ALERT')).length > 0
                      ? 'Critical Android capabilities flagged'
                      : 'Standard permissions only'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeDemo.permissions.map((perm, idx) => {
                    const isDangerous =
                      perm.includes('ACCESSIBILITY') ||
                      perm.includes('SMS') ||
                      perm.includes('ALERT') ||
                      perm.includes('AUDIO') ||
                      perm.includes('CAMERA');

                    return (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                          isDangerous
                            ? 'bg-critical/10 text-critical border-critical/30 font-semibold'
                            : 'bg-surface border-border text-text-muted'
                        }`}
                      >
                        {perm}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Short Honest Note on Demo Mode vs Live Pipeline */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-surface border border-border text-xs text-text-muted max-w-2xl mx-auto text-center">
          <Info className="w-4 h-4 text-accent shrink-0" />
          <span>
            Some analysis modules use sample data in demo mode.{' '}
            <button
              type="button"
              onClick={() => setIsLimitationsModalOpen(true)}
              className="text-accent underline hover:opacity-85 cursor-pointer font-medium focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-accent"
            >
              See Known limitations.
            </button>
          </span>
        </div>
      </section>

      {/* =========================================================================
          6. FOOTER WITH LARGE FAINT "TRACELOCK" WORDMARK (~4% OPACITY)
          ========================================================================= */}
      <footer className="pt-12 pb-6 border-t border-border/40 text-center relative overflow-hidden select-none">
        {/* Large Faint Wordmark (about 4% opacity) */}
        <div
          className="text-[64px] sm:text-[96px] md:text-[124px] font-bold tracking-tight text-text pointer-events-none select-none opacity-[0.04] leading-none"
          aria-hidden="true"
        >
          Tracelock
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-text-muted font-sans">
          <span className="flex items-center gap-1.5">
            <Logo markType="A" variant="mark" size={14} className="text-text" />
            <span>Android Malware Forensics & Intelligence</span>
          </span>
          <span>•</span>
          <span>EvidenceAnchor.sol Verified</span>
        </div>
      </footer>

      {/* Known Limitations Modal */}
      <Modal
        isOpen={isLimitationsModalOpen}
        onClose={() => setIsLimitationsModalOpen(false)}
        title="Architecture & Known Limitations"
        size="md"
      >
        <div className="space-y-4 text-xs text-text leading-relaxed">
          <p>
            Tracelock combines deterministic static decompilation, heuristic rules, and smart contract anchoring. For full operational transparency, here is the exact breakdown:
          </p>

          <div className="space-y-2">
            <h4 className="font-semibold text-text flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
              <span>Real Live Capabilities</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-text-muted pl-1">
              <li>Binary decompilation & AndroidManifest.xml unpacking via Androguard / fallback zip parser.</li>
              <li>3 heuristic composite permission rules in <code className="text-text">PermissionAnalyzer</code>.</li>
              <li>6 regex IOC extractors scanning unpacked DEX strings for C2 IPs, URLs, Telegram, Discord, and crypto addresses.</li>
              <li>9-factor weighted risk engine configured in <code className="text-text">risk_weights.yaml</code>.</li>
              <li>Tamper-proof report hashing anchored to Ethereum Sepolia via <code className="text-text">EvidenceAnchor.sol</code>.</li>
              <li>11 localized advisory languages in <code className="text-text">frontend/src/i18n.ts</code>.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-text flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Mode Simulations</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-text-muted pl-1">
              <li>Pre-loaded banking trojan cases (Anubis, SpyNote, Cerberus) simulate real forensic output when no APK is uploaded.</li>
              <li>Simulated C2 network graph edges visualize infrastructure overlap until real cases are indexed into Neo4j.</li>
              <li>Dynamic sandbox emulations use synthetic runtime telemetry if Cuckoo/CAPE sandboxes are not connected.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsLimitationsModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Cpu,
  Palette,
  Shield,
  Key,
  LogOut,
  CheckCircle2,
  UserCheck,
  BadgeCheck,
  RefreshCw,
  Sliders,
  Database,
  Volume2,
  Save,
  Server,
  Activity,
  Sun,
  Moon,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';
import { useDemoMode } from '../context/DemoModeContext';
import { MultiSpeakerNarrator } from '../components/copilot/MultiSpeakerNarrator';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

type SettingsSection = 'account' | 'system' | 'appearance';

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSectionParam = (searchParams.get('section') as SettingsSection) || 'account';
  const activeSection: SettingsSection = ['account', 'system', 'appearance'].includes(currentSectionParam)
    ? currentSectionParam
    : 'account';

  const { t } = useTranslation();
  const { user, updateRole, logout, login, isAuthenticated } = useAuth();
  const { language, setLanguage } = useAnalysis();
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  // Account State
  const [copiedToken, setCopiedToken] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);

  // System Settings State
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-pro');
  const [temperature, setTemperature] = useState(0.2);
  const [heuristicThreshold, setHeuristicThreshold] = useState(75);
  const [autoBlocklist, setAutoBlocklist] = useState(true);
  const [rpcEndpoint, setRpcEndpoint] = useState('http://127.0.0.1:8545');
  const [contractAddress, setContractAddress] = useState('0x5FbDB2315678afecb367f032d93F642f64180aa3');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [savedStatus, setSavedStatus] = useState(false);

  // Appearance State
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  // Handle URL hash anchor scrolling (e.g. /settings?section=system#nodes)
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [activeSection]);

  const handleSectionChange = (section: SettingsSection) => {
    setSearchParams({ section });
  };

  const handleCopyJwt = () => {
    if (!user.jwtToken) return;
    navigator.clipboard.writeText(user.jwtToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleRoleChange = (role: 'ANALYST' | 'BANK_OFFICER' | 'CITIZEN' | 'AUDITOR' | 'ADMIN') => {
    updateRole(role);
    setAuthStatusMessage(`Operational Persona updated to ${role}`);
    setTimeout(() => setAuthStatusMessage(null), 2500);
  };

  const handleSaveSystemConfig = () => {
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
    }, 2000);
  };

  const toggleTheme = (theme: 'dark' | 'light') => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsLightMode(true);
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setIsLightMode(false);
    }
  };

  // Node telemetry mock data
  const telemetryNodes = [
    { name: 'FastAPI Cyber Core Service', port: '8000', status: 'HEALTHY', latency: '18 ms', group: 'Backend API' },
    { name: 'Gemini 1.5 LLM Gateway', port: '443', status: 'ONLINE', latency: '142 ms', group: 'AI Engine' },
    { name: 'SQLite / PostgreSQL Relational DB', port: '5432', status: 'HEALTHY', latency: '4 ms', group: 'Database' },
    { name: 'Neo4j Malware DNA Graph Engine', port: '7687', status: 'HEALTHY', latency: '12 ms', group: 'Graph Engine' },
    { name: 'Ethereum EVM Smart Contract Node', port: '8545', status: 'ANCHORED', latency: '2 ms', group: 'Blockchain' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Page Title & Description */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-text">Platform Settings</h2>
        <p className="text-xs text-text-muted">
          Manage identity clearance, operational persona, backend telemetry pipelines, and interface preferences.
        </p>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-border gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleSectionChange('account')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-medium transition-colors border-b-2 cursor-pointer ${
            activeSection === 'account'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text hover:bg-surface-raised/40'
          }`}
        >
          <Users className={`w-4 h-4 ${activeSection === 'account' ? 'text-accent' : 'text-text-muted'}`} />
          <span>Account & Identity</span>
        </button>

        <button
          type="button"
          onClick={() => handleSectionChange('system')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-medium transition-colors border-b-2 cursor-pointer ${
            activeSection === 'system'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text hover:bg-surface-raised/40'
          }`}
        >
          <Cpu className={`w-4 h-4 ${activeSection === 'system' ? 'text-accent' : 'text-text-muted'}`} />
          <span>System & Telemetry</span>
        </button>

        <button
          type="button"
          onClick={() => handleSectionChange('appearance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-medium transition-colors border-b-2 cursor-pointer ${
            activeSection === 'appearance'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text hover:bg-surface-raised/40'
          }`}
        >
          <Palette className={`w-4 h-4 ${activeSection === 'appearance' ? 'text-accent' : 'text-text-muted'}`} />
          <span>Appearance & Audio</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: ACCOUNT & IDENTITY                             */}
      {/* ========================================================= */}
      {activeSection === 'account' && (
        <div className="space-y-6">
          {authStatusMessage && (
            <div className="p-3 rounded-lg bg-surface-raised border border-border text-xs text-text flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
              <span>{authStatusMessage}</span>
            </div>
          )}

          {/* User Profile Card */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-surface-raised border border-border text-accent font-bold flex items-center justify-center font-mono text-base shrink-0 shadow-sm">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text">{user.name}</h3>
                    <BadgeCheck className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-xs text-text-muted">{user.organization}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={isAuthenticated ? 'low' : 'critical'} size="sm" dot>
                  {isAuthenticated ? 'Session active' : 'Guest mode'}
                </Badge>
              </div>
            </div>

            <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-raised border border-border/50">
                <span className="text-text-muted">Security clearance:</span>
                <span className="font-mono font-medium text-accent">{user.clearanceLevel}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-raised border border-border/50">
                <span className="text-text-muted">Session logged at:</span>
                <span className="font-mono text-text-muted text-[11px] truncate max-w-[180px]">{user.lastLogin}</span>
              </div>
            </div>
          </Card>

          {/* Role Switcher */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-text">Operational Persona (RBAC Scope)</h3>
              <p className="text-xs text-text-muted">
                Switching personas filters specialized lab views and analytical toolsets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: 'ANALYST', label: 'SOC Analyst', desc: 'Technical APK decompilation, YARA signatures & bytecode disassembly' },
                { id: 'BANK_OFFICER', label: 'Bank Officer', desc: 'GRC compliance, DPDP Act 2023 directives & incident risk control' },
                { id: 'CITIZEN', label: 'Citizen / Public', desc: 'Public exposure advisory, scam warnings & vernacular summaries' },
                { id: 'AUDITOR', label: 'Legal Auditor', desc: 'Chain-of-custody proofs, EVM block receipts & courtroom evidence' },
                { id: 'ADMIN', label: 'Sys Administrator', desc: 'Heuristics thresholds, LLM orchestration & C2 pipeline configuration' },
              ].map((roleSpec) => {
                const isSelected = user.role === roleSpec.id;
                return (
                  <button
                    key={roleSpec.id}
                    type="button"
                    onClick={() => handleRoleChange(roleSpec.id as any)}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer space-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? 'bg-accent/10 border-accent text-text'
                        : 'bg-surface border-border hover:border-border-subtle hover:bg-surface-raised/50 text-text-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-accent' : 'text-text'}`}>
                        {roleSpec.label}
                      </span>
                      {isSelected && <UserCheck className="w-4 h-4 text-accent" />}
                    </div>
                    <p className="text-[11px] leading-relaxed text-text-muted font-sans">
                      {roleSpec.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* JWT Session Digest */}
          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 font-medium text-text">
                <Key className="w-3.5 h-3.5 text-accent" />
                <span>Active JWT Session Token</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                iconLeft={copiedToken ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                onClick={handleCopyJwt}
              >
                {copiedToken ? 'Copied' : 'Copy token'}
              </Button>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-raised border border-border text-[11px] font-mono text-text-muted break-all line-clamp-2">
              {user.jwtToken}
            </div>
          </Card>

          {/* Session Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {isAuthenticated ? (
              <Button
                variant="danger"
                size="sm"
                iconLeft={<LogOut className="w-4 h-4" />}
                onClick={() => {
                  logout();
                  setAuthStatusMessage('Signed out. Session reverted to guest mode.');
                }}
              >
                Sign out session
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                iconLeft={<RefreshCw className="w-4 h-4" />}
                onClick={() => {
                  login('demo_token_123', 'ANALYST', 'Demo Analyst');
                  setAuthStatusMessage('Authenticated as Lead SOC Analyst.');
                }}
              >
                Re-authenticate session
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: SYSTEM & TELEMETRY                             */}
      {/* ========================================================= */}
      {activeSection === 'system' && (
        <div className="space-y-6">
          {savedStatus && (
            <div className="p-3 rounded-lg bg-surface-raised border border-border text-xs text-text flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
              <span>Configuration successfully saved and synced with backend pipeline.</span>
            </div>
          )}

          {/* Demo Mode Toggle Card */}
          <Card className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-text">Demo Simulation Mode</h3>
                </div>
                <p className="text-xs text-text-muted">
                  When enabled, pre-analyzed Banking Trojan cases, sample MITRE matrices, and simulated IOC feeds are loaded across all dashboards.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <Badge variant={isDemoMode ? 'demo' : 'neutral'} size="sm">
                  {isDemoMode ? 'Demo active' : 'Live mode'}
                </Badge>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDemoMode}
                  onClick={toggleDemoMode}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isDemoMode ? 'bg-accent justify-end' : 'bg-surface-raised border border-border justify-start'
                  }`}
                  aria-label="Toggle demo mode"
                >
                  <span className={`w-4 h-4 rounded-full transition-transform ${isDemoMode ? 'bg-black' : 'bg-text-muted'}`} />
                </button>
              </div>
            </div>
          </Card>

          {/* System Load Stat Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col items-center justify-center space-y-1">
              <span className="text-xs text-text-muted">CPU load</span>
              <span className="text-2xl font-bold font-mono text-accent">14%</span>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col items-center justify-center space-y-1">
              <span className="text-xs text-text-muted">RAM allocated</span>
              <span className="text-2xl font-bold font-mono text-accent">3.8 GB</span>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col items-center justify-center space-y-1">
              <span className="text-xs text-text-muted">Average latency</span>
              <span className="text-2xl font-bold font-mono text-accent">24 ms</span>
            </div>
          </div>

          {/* AI Copilot Parameters */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Cpu className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text">AI Copilot Engine Parameters</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="gemini-model-select" className="block text-text-muted font-medium">
                  Active Gemini LLM model
                </label>
                <select
                  id="gemini-model-select"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-raised border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                >
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep forensic reasoning)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra-fast streaming)</option>
                </select>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-text-muted font-medium">
                  <span>LLM temperature (Determinism vs Creativity)</span>
                  <span className="font-mono text-accent font-semibold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Threat Thresholds */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Sliders className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text">Threat & Alert Thresholds</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-text-muted font-medium">
                  <span>Minimum threat index threshold for critical triage</span>
                  <span className="font-mono text-severity-critical font-semibold">{heuristicThreshold} / 100</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="5"
                  value={heuristicThreshold}
                  onChange={(e) => setHeuristicThreshold(parseInt(e.target.value, 10))}
                  className="w-full accent-severity-critical cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-border">
                <div>
                  <span className="text-text font-medium block">Automated C2 sinkhole generation</span>
                  <span className="text-text-muted text-[11px]">Generate IP & domain blocklists for firewall sync</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoBlocklist}
                  onChange={(e) => setAutoBlocklist(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Ethereum Web3 Evidence Anchor */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Database className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text">Ethereum Web3 Evidence Anchor</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="rpc-url-input" className="block text-text-muted font-medium">
                  Ethereum JSON-RPC node endpoint
                </label>
                <input
                  id="rpc-url-input"
                  type="text"
                  value={rpcEndpoint}
                  onChange={(e) => setRpcEndpoint(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-raised border border-border text-xs font-mono text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contract-addr-input" className="block text-text-muted font-medium">
                  Smart contract address (EvidenceAnchor.sol)
                </label>
                <input
                  id="contract-addr-input"
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-raised border border-border text-xs font-mono text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
            </div>
          </Card>

          {/* Infrastructure Node Health Matrix */}
          <div id="nodes" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text">Infrastructure Node Health Matrix</h3>
                <p className="text-xs text-text-muted">Real-time status of forensic telemetry microservices.</p>
              </div>
              <Badge variant="demo" size="sm">Demo data</Badge>
            </div>

            <div className="space-y-2">
              {telemetryNodes.map((node, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping shrink-0" />
                    <div className="min-w-0">
                      <span className="font-semibold text-text block truncate">{node.name}</span>
                      <span className="text-[11px] font-mono text-text-muted">
                        Port {node.port} · {node.group}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="low" size="sm">
                      {node.status}
                    </Badge>
                    <span className="text-[11px] font-mono text-text-muted block mt-0.5">{node.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Save className="w-4 h-4" />}
              onClick={handleSaveSystemConfig}
            >
              Save system configuration
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: APPEARANCE & AUDIO                             */}
      {/* ========================================================= */}
      {activeSection === 'appearance' && (
        <div className="space-y-6">
          {/* Theme Mode Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Palette className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text">Theme & Color Mode</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => toggleTheme('dark')}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  !isLightMode
                    ? 'bg-accent/10 border-accent'
                    : 'bg-surface border-border hover:bg-surface-raised/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-text">Dark mode</span>
                  </div>
                  {!isLightMode && <BadgeCheck className="w-4 h-4 text-accent" />}
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Engineered for SOC low-light environments. Deep background with high-contrast text and emerald accents.
                </p>
              </button>

              <button
                type="button"
                onClick={() => toggleTheme('light')}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isLightMode
                    ? 'bg-accent/10 border-accent'
                    : 'bg-surface border-border hover:bg-surface-raised/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-text">Light mode</span>
                  </div>
                  {isLightMode && <BadgeCheck className="w-4 h-4 text-accent" />}
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Clean light palette with crisp boundaries and full WCAG contrast for daytime triage.
                </p>
              </button>
            </div>
          </Card>

          {/* Language Selection */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Shield className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text">Console Regional Language</h3>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-text-muted">
                Dossier reports and executive briefings are dynamically translated into 11 regional languages for citizen advisory notices.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
                {[
                  { code: 'en', label: 'English', native: 'English' },
                  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
                  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
                  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
                  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
                  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
                  { code: 'mr', label: 'Marathi', native: 'मराठी' },
                  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
                  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
                  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
                  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      language === lang.code
                        ? 'bg-accent/15 border-accent text-text font-semibold'
                        : 'bg-surface-raised border-border text-text-muted hover:text-text hover:border-border-subtle'
                    }`}
                  >
                    <div>
                      <span className="block text-xs">{lang.native}</span>
                      <span className="text-[10px] text-text-muted">{lang.label}</span>
                    </div>
                    {language === lang.code && <BadgeCheck className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Audio & Alert Narration */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Volume2 className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text">Audio Narration & Chimes</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-border">
                <div>
                  <span className="text-text font-medium block">Audible threat alerts</span>
                  <span className="text-text-muted text-[11px]">Play audio chimes when critical APK samples are verified</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-lg bg-surface-raised border border-border flex items-center justify-between gap-4">
                <div>
                  <span className="text-text font-medium block">Multi-speaker speech synthesizer</span>
                  <span className="text-text-muted text-[11px]">Narrate executive summaries in active language ({language.toUpperCase()})</span>
                </div>
                <MultiSpeakerNarrator
                  langCode={language}
                  textToRead="Active campaigns detected targeting mobile banking applications via OTP interception and accessibility abuse."
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;

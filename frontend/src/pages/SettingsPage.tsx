import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Activity,
  Palette,
  Sparkles,
  Server,
  Database,
  Layers,
  HardDrive,
  GitFork,
  Cpu,
  ShieldCheck,
  Check,
  Copy,
  RefreshCw,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  BadgeCheck,
  UserCheck,
  LogOut,
  Sliders,
  Radio,
  FileCode,
  Shield,
  Clock,
  Info,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';
import { useDemoMode } from '../context/DemoModeContext';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Tooltip } from '../components/ui/Tooltip';

export type SettingsSection = 'system' | 'account' | 'appearance' | 'demo';

interface HealthServices {
  postgres: 'ok' | 'unreachable' | string;
  redis: 'ok' | 'unreachable' | string;
  rabbitmq: 'ok' | 'unreachable' | string;
  neo4j: 'ok' | 'unreachable' | string;
  minio: 'ok' | 'unreachable' | string;
  gemini: 'ok' | 'not_configured' | 'unreachable' | string;
  ethereum: 'ok' | 'not_configured' | 'unreachable' | string;
}

interface HealthResponse {
  status: 'ok' | 'degraded';
  services: HealthServices;
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSectionParam = searchParams.get('section') as SettingsSection | null;
  const activeSection: SettingsSection =
    currentSectionParam && ['system', 'account', 'appearance', 'demo'].includes(currentSectionParam)
      ? currentSectionParam
      : 'system';

  const { t } = useTranslation();
  const { user, updateRole, logout, login, isAuthenticated } = useAuth();
  const { language, setLanguage } = useAnalysis();
  const { isDemoMode, setDemoMode, toggleDemoMode } = useDemoMode();

  // ==========================================
  // System Health State
  // ==========================================
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setIsHealthLoading(true);
    setHealthError(null);
    try {
      const res = await api.get<HealthResponse>('/health');
      if (res.data && res.data.services) {
        setHealthData(res.data);
        setLastHealthCheck(new Date());
      } else {
        throw new Error('Invalid health response format');
      }
    } catch (err: any) {
      // Fallback probe attempt to /system/health in case of reverse proxy divergence
      try {
        const fallbackRes = await api.get<HealthResponse>('/system/health');
        if (fallbackRes.data && fallbackRes.data.services) {
          setHealthData(fallbackRes.data);
          setLastHealthCheck(new Date());
          return;
        }
      } catch {
        // Fallback also failed
      }
      setHealthError(err?.response?.data?.detail || err?.message || 'Failed to connect to backend health probe');
      setHealthData(null);
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // ==========================================
  // Account & Persona State
  // ==========================================
  const [copiedToken, setCopiedToken] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);

  // ==========================================
  // Appearance State (Theme, Density, Language)
  // ==========================================
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  const [density, setDensity] = useState<'comfortable' | 'compact'>(() => {
    return (localStorage.getItem('tracelock_density') as 'comfortable' | 'compact') || 'comfortable';
  });

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
    setAuthStatusMessage(`Operational Persona updated to ${role.replace('_', ' ')}`);
    setTimeout(() => setAuthStatusMessage(null), 2500);
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

  const changeDensity = (newDensity: 'comfortable' | 'compact') => {
    setDensity(newDensity);
    localStorage.setItem('tracelock_density', newDensity);
    document.documentElement.setAttribute('data-density', newDensity);
    if (newDensity === 'compact') {
      document.documentElement.classList.add('density-compact');
    } else {
      document.documentElement.classList.remove('density-compact');
    }
  };

  useEffect(() => {
    // Initialise density attribute on document root
    const saved = localStorage.getItem('tracelock_density');
    if (saved === 'compact') {
      document.documentElement.setAttribute('data-density', 'compact');
      document.documentElement.classList.add('density-compact');
    } else {
      document.documentElement.setAttribute('data-density', 'comfortable');
      document.documentElement.classList.remove('density-compact');
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Page Title & Description */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-text">Platform Settings</h2>
        <p className="text-xs text-text-muted">
          Real-time microservice health, operational role clearance, interface styling, and simulation environments.
        </p>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-border gap-1 overflow-x-auto" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'system'}
          onClick={() => handleSectionChange('system')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-medium transition-colors border-b-2 cursor-pointer ${
            activeSection === 'system'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text hover:bg-surface-raised/40'
          }`}
        >
          <Activity className={`w-4 h-4 ${activeSection === 'system' ? 'text-accent' : 'text-text-muted'}`} />
          <span>System status</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'account'}
          onClick={() => handleSectionChange('account')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-medium transition-colors border-b-2 cursor-pointer ${
            activeSection === 'account'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text hover:bg-surface-raised/40'
          }`}
        >
          <Users className={`w-4 h-4 ${activeSection === 'account' ? 'text-accent' : 'text-text-muted'}`} />
          <span>Account & persona</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'appearance'}
          onClick={() => handleSectionChange('appearance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-medium transition-colors border-b-2 cursor-pointer ${
            activeSection === 'appearance'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text hover:bg-surface-raised/40'
          }`}
        >
          <Palette className={`w-4 h-4 ${activeSection === 'appearance' ? 'text-accent' : 'text-text-muted'}`} />
          <span>Appearance</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'demo'}
          onClick={() => handleSectionChange('demo')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-medium transition-colors border-b-2 cursor-pointer ${
            activeSection === 'demo'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text hover:bg-surface-raised/40'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeSection === 'demo' ? 'text-amber-400' : 'text-text-muted'}`} />
          <span>Demo mode</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: SYSTEM STATUS (REAL DATA)                       */}
      {/* ========================================================= */}
      {activeSection === 'system' && (
        <div className="space-y-6">
          {/* Status Header Overview Card */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <Server className="w-5 h-5 text-accent" />
                  <h3 className="text-sm font-semibold text-text">Microservices Connectivity & Diagnostics</h3>
                  {isHealthLoading ? (
                    <Badge variant="info" size="sm" dot pulse>
                      Probing...
                    </Badge>
                  ) : healthError ? (
                    <Badge variant="critical" size="sm" dot>
                      Backend unreachable
                    </Badge>
                  ) : healthData?.status === 'ok' ? (
                    <Badge variant="low" size="sm" dot pulse>
                      All core services OK
                    </Badge>
                  ) : (
                    <Badge variant="critical" size="sm" dot>
                      Service degraded
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  Live connectivity telemetry verified directly via backend diagnostic probes. Zero secrets or sensitive credentials exposed.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {lastHealthCheck && (
                  <span className="text-[11px] font-mono text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3 text-text-muted" />
                    {lastHealthCheck.toLocaleTimeString()}
                  </span>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={<RefreshCw className={`w-3.5 h-3.5 ${isHealthLoading ? 'animate-spin text-accent' : ''}`} />}
                  onClick={fetchHealth}
                  disabled={isHealthLoading}
                >
                  Refresh status
                </Button>
              </div>
            </div>

            {healthError && (
              <div className="p-3 rounded-lg bg-critical/10 border border-critical/30 text-xs text-critical flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{healthError}</span>
              </div>
            )}
          </Card>

          {/* Infrastructure Node Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text">Core Infrastructure Services</h3>
                <p className="text-xs text-text-muted">
                  Active connection handshakes for relational persistence, task queues, in-memory caches, and graph engines.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {/* 1. PostgreSQL */}
              <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-lg bg-surface-raised border border-border text-accent shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text truncate">PostgreSQL Database</span>
                      <span className="font-mono text-[11px] text-text-muted">Port 5432</span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      Primary relational store for case dossiers, forensic metadata, and authentication sessions.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {isHealthLoading && !healthData ? (
                    <Badge variant="neutral" size="sm">Checking...</Badge>
                  ) : healthData?.services.postgres === 'ok' ? (
                    <Badge variant="low" size="sm" dot>OK</Badge>
                  ) : (
                    <Badge variant="critical" size="sm" dot>Unreachable</Badge>
                  )}
                </div>
              </div>

              {/* 2. Redis */}
              <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-lg bg-surface-raised border border-border text-accent shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text truncate">Redis Cache & PubSub</span>
                      <span className="font-mono text-[11px] text-text-muted">Port 6379</span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      In-memory data store for live analysis caching, job lock arbitration, and event telemetry.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {isHealthLoading && !healthData ? (
                    <Badge variant="neutral" size="sm">Checking...</Badge>
                  ) : healthData?.services.redis === 'ok' ? (
                    <Badge variant="low" size="sm" dot>OK</Badge>
                  ) : (
                    <Badge variant="critical" size="sm" dot>Unreachable</Badge>
                  )}
                </div>
              </div>

              {/* 3. RabbitMQ */}
              <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-lg bg-surface-raised border border-border text-accent shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text truncate">RabbitMQ Task Broker</span>
                      <span className="font-mono text-[11px] text-text-muted">Port 5672</span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      Asynchronous message bus dispatching APK decompilation and dynamic sandbox tasks to workers.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {isHealthLoading && !healthData ? (
                    <Badge variant="neutral" size="sm">Checking...</Badge>
                  ) : healthData?.services.rabbitmq === 'ok' ? (
                    <Badge variant="low" size="sm" dot>OK</Badge>
                  ) : (
                    <Badge variant="critical" size="sm" dot>Unreachable</Badge>
                  )}
                </div>
              </div>

              {/* 4. Neo4j */}
              <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-lg bg-surface-raised border border-border text-accent shrink-0">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text truncate">Neo4j Malware DNA Graph Engine</span>
                      <span className="font-mono text-[11px] text-text-muted">Port 7687</span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      Graph database performing threat actor clustering, shared signing certificate links, and C2 correlation.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {isHealthLoading && !healthData ? (
                    <Badge variant="neutral" size="sm">Checking...</Badge>
                  ) : healthData?.services.neo4j === 'ok' ? (
                    <Badge variant="low" size="sm" dot>OK</Badge>
                  ) : (
                    <Badge variant="critical" size="sm" dot>Unreachable</Badge>
                  )}
                </div>
              </div>

              {/* 5. MinIO */}
              <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-lg bg-surface-raised border border-border text-accent shrink-0">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text truncate">MinIO Object Storage</span>
                      <span className="font-mono text-[11px] text-text-muted">Port 9000</span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      S3-compatible immutable vault storing raw uploaded APK binaries and decompiled forensic artifacts.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {isHealthLoading && !healthData ? (
                    <Badge variant="neutral" size="sm">Checking...</Badge>
                  ) : healthData?.services.minio === 'ok' ? (
                    <Badge variant="low" size="sm" dot>OK</Badge>
                  ) : (
                    <Badge variant="critical" size="sm" dot>Unreachable</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI & Blockchain Integrations Matrix */}
          <div className="space-y-3 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-text">External Intelligence & Ledger Integrations</h3>
              <p className="text-xs text-text-muted">
                Status reflects active configuration variables. Services display "Not configured" when API keys or contracts are unset.
              </p>
            </div>

            <div className="space-y-2">
              {/* Google Gemini */}
              <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-lg bg-surface-raised border border-border text-accent shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text truncate">Google Gemini Reasoning LLM</span>
                      <span className="font-mono text-[11px] text-text-muted">GEMINI_API_KEY</span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      Multi-agent forensic signal synthesis and automated 11-language citizen advisory generation.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {isHealthLoading && !healthData ? (
                    <Badge variant="neutral" size="sm">Checking...</Badge>
                  ) : healthData?.services.gemini === 'ok' ? (
                    <Badge variant="low" size="sm" dot>Configured</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm" dot>Not configured</Badge>
                  )}
                </div>
              </div>

              {/* Ethereum Web3 */}
              <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-lg bg-surface-raised border border-border text-accent shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text truncate">Ethereum Web3 Evidence Anchor</span>
                      <span className="font-mono text-[11px] text-text-muted">VITE_CONTRACT_ADDRESS</span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      Tamper-proof cryptographic custody receipts and courtroom evidence proofs anchored to EVM blockchain.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {isHealthLoading && !healthData ? (
                    <Badge variant="neutral" size="sm">Checking...</Badge>
                  ) : healthData?.services.ethereum === 'ok' ? (
                    <Badge variant="low" size="sm" dot>Configured</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm" dot>Not configured</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security & Audit Note */}
          <div className="p-4 rounded-xl bg-surface-raised/40 border border-border text-xs text-text-muted flex items-start gap-3">
            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-text block">Zero-Secret Telemetry Assurance</span>
              <p className="text-[11px] leading-relaxed">
                Health probes verify handshake reachability with sub-second timeouts. Internal database credentials, secret keys, authorization tokens, and private keys are never transmitted or displayed in client telemetry.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: ACCOUNT & PERSONA                              */}
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

          {/* Role / Persona Switcher */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-text">Operational Persona (RBAC Scope)</h3>
              <p className="text-xs text-text-muted">
                Switching personas changes investigation perspectives, analytical views, and compliance filters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: 'ANALYST', label: 'SOC Analyst', desc: 'Technical APK decompilation, YARA bytecode signatures & network telemetry' },
                { id: 'BANK_OFFICER', label: 'Bank Officer', desc: 'GRC compliance, DPDP Act 2023 directives & customer fraud impact control' },
                { id: 'CITIZEN', label: 'Citizen / Public', desc: 'Public exposure advisories, scam warnings & vernacular audio summaries' },
                { id: 'AUDITOR', label: 'Legal Auditor', desc: 'Chain-of-custody proofs, EVM block receipts & courtroom evidence integrity' },
                { id: 'ADMIN', label: 'Sys Administrator', desc: 'Heuristics thresholds, LLM orchestration & microservice pipeline routing' },
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
                <FileCode className="w-3.5 h-3.5 text-accent" />
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
      {/* SECTION 3: APPEARANCE (THEME, DENSITY, LANGUAGE)           */}
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

          {/* Density Selection Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Sliders className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text">Display Density</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => changeDensity('comfortable')}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  density === 'comfortable'
                    ? 'bg-accent/10 border-accent'
                    : 'bg-surface border-border hover:bg-surface-raised/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text">Comfortable (Standard)</span>
                  {density === 'comfortable' && <BadgeCheck className="w-4 h-4 text-accent" />}
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Generous row spacing, spacious paddings, and standard typography. Ideal for in-depth investigative reading.
                </p>
              </button>

              <button
                type="button"
                onClick={() => changeDensity('compact')}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  density === 'compact'
                    ? 'bg-accent/10 border-accent'
                    : 'bg-surface border-border hover:bg-surface-raised/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text">Compact (High Density)</span>
                  {density === 'compact' && <BadgeCheck className="w-4 h-4 text-accent" />}
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Condensed table rows, tighter margins, and higher information density. Optimized for multi-monitor SOC triage.
                </p>
              </button>
            </div>
          </Card>

          {/* Language Selection Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Shield className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text">Console Regional Language</h3>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-text-muted">
                Executive briefings, dossiers, and citizen advisory warnings are dynamically translated into 11 regional languages.
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
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: DEMO SIMULATION MODE                           */}
      {/* ========================================================= */}
      {activeSection === 'demo' && (
        <div className="space-y-6">
          <Card className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-semibold text-text">Global Demo Mode Simulation</h3>
                </div>
                <p className="text-xs text-text-muted max-w-xl">
                  Enables demonstration of Android Banking Trojan analysis workflows, simulated ATT&CK matrices, and pre-computed threat graphs without requiring live APK uploads.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
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

            <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-2">
                <span className="font-semibold text-text flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>When Demo Mode is Enabled</span>
                </span>
                <ul className="text-text-muted space-y-1.5 text-[11px] list-disc list-inside">
                  <li>Sample banking trojan cases (Anubis, Cerberus, Spynote) are pre-loaded.</li>
                  <li>MITRE ATT&CK coverage heatmaps render simulated tactical matrices.</li>
                  <li>Threat correlation graph visualizes synthetic C2 campaign linkages.</li>
                  <li>All sample panels explicitly carry the "Demo data" indicator badge.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-2">
                <span className="font-semibold text-text flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-accent" />
                  <span>When Demo Mode is Disabled (Live Mode)</span>
                </span>
                <ul className="text-text-muted space-y-1.5 text-[11px] list-disc list-inside">
                  <li>Sample and placeholder cases are suppressed across all dashboards.</li>
                  <li>Intelligence matrices display clean empty states until samples are analyzed.</li>
                  <li>New cases appear only when real APKs are submitted on the Analyze page.</li>
                  <li>Blockchain anchoring executes real MetaMask wallet transactions.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant={isDemoMode ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setDemoMode(!isDemoMode)}
              >
                {isDemoMode ? 'Switch to live mode only' : 'Enable demo simulation'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;

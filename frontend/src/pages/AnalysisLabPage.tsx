import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Shield,
  Cpu,
  Briefcase,
  Globe,
  Network,
  Clock,
  Fingerprint,
  Download,
} from 'lucide-react';

import SecurityAnalystPanel from '../components/lab/SecurityAnalystPanel';
import GrcCompliancePanel from '../components/lab/GrcCompliancePanel';
import CitizenImpactPanel from '../components/lab/CitizenImpactPanel';
import CampaignDnaPanel from '../components/lab/CampaignDnaPanel';
import TimelinePanel from '../components/lab/TimelinePanel';
import BlockchainEvidencePanel from '../components/lab/BlockchainEvidencePanel';
import ExecutiveReportPrintView from '../components/ExecutiveReportPrintView';

export function AnalysisLabPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    caseData,
    campaignGraph,
    timeline,
    executiveSummary,
    language,
    setLanguage,
  } = useAnalysis();

  const currentRole = user?.role || 'ANALYST';

  const defaultSubTab = useMemo(() => {
    if (currentRole === 'BANK_OFFICER') return 'officer';
    if (currentRole === 'CITIZEN') return 'citizen';
    return 'analyst';
  }, [currentRole]);

  const [activeSubTab, setActiveSubTab] = useState<
    'analyst' | 'officer' | 'citizen' | 'campaign' | 'timeline' | 'ledger'
  >(defaultSubTab);

  useEffect(() => {
    if (currentRole === 'BANK_OFFICER' && activeSubTab === 'analyst') {
      setActiveSubTab('officer');
    } else if (currentRole === 'CITIZEN' && (activeSubTab === 'analyst' || activeSubTab === 'officer')) {
      setActiveSubTab('citizen');
    }
  }, [currentRole, activeSubTab]);

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

  const allTabs = [
    { id: 'analyst', label: t('security_analyst') || 'Forensic Analysis', icon: Cpu, roles: ['ANALYST', 'ADMIN'] },
    { id: 'officer', label: t('bank_officer') || 'GRC Compliance', icon: Briefcase, roles: ['ANALYST', 'BANK_OFFICER', 'ADMIN'] },
    { id: 'citizen', label: t('citizen_impact') || 'Citizen Exposure', icon: Globe, roles: ['ANALYST', 'BANK_OFFICER', 'CITIZEN', 'AUDITOR', 'ADMIN'] },
    { id: 'campaign', label: t('campaign_dna') || 'Campaign DNA', icon: Network, roles: ['ANALYST', 'BANK_OFFICER', 'ADMIN'] },
    { id: 'timeline', label: t('timeline') || 'Event Timeline', icon: Clock, roles: ['ANALYST', 'BANK_OFFICER', 'CITIZEN', 'AUDITOR', 'ADMIN'] },
    { id: 'ledger', label: t('evidence_ledger') || 'Evidence Ledger', icon: Fingerprint, roles: ['ANALYST', 'BANK_OFFICER', 'CITIZEN', 'AUDITOR', 'ADMIN'] },
  ];

  const allowedTabs = allTabs.filter((tab) => tab.roles.includes(currentRole));

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Target APK Identification Header */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-2xl uppercase border ${
                caseData.riskScore > 50
                  ? 'bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] border-[var(--severity-critical)]/30'
                  : 'bg-[var(--accent-cool)]/10 text-[var(--accent-cool)] border-[var(--accent-cool)]/30'
              }`}
            >
              {caseData.riskScore > 50 ? 'CRITICAL RISKS TARGET DETECTED' : 'VERIFIED LOW RISK TARGET'}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              PKG: <code className="text-[var(--text-primary)] font-mono">{caseData.packageName} v{caseData.versionCode}</code>
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-2xl bg-[var(--bg-panel-alt)] text-[var(--text-muted)] border border-[var(--border)]">
              ROLE: {currentRole}
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {caseData.fileName}
          </h2>
          <p className="text-xs font-mono text-[var(--text-muted)] truncate max-w-2xl">
            SHA256: {caseData.sha256}
          </p>
        </div>

        <div className="flex gap-6 items-center flex-wrap">
          {/* Signal Bar Risk Meter */}
          <div className="text-right flex flex-col justify-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">TROJAN RISK SCORE</div>
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-3xl font-mono font-bold text-[var(--accent)]">
                {caseData.riskScore}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">/100</span>
            </div>
            {/* Segmented meter bar */}
            <div className="flex gap-1 mt-1 justify-end">
              {[20, 40, 60, 80, 100].map((step) => (
                <div
                  key={step}
                  className={`w-4 h-1.5 rounded-full ${
                    caseData.riskScore >= step
                      ? step >= 80
                        ? 'bg-[var(--severity-critical)]'
                        : step >= 50
                        ? 'bg-[var(--severity-high)]'
                        : 'bg-[var(--severity-low)]'
                      : 'bg-[var(--border)]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="w-[1px] h-10 bg-[var(--border)]" />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">MALWARE CLASSIFICATION</div>
            <div className="text-sm font-bold text-[var(--accent)] font-mono uppercase">
              {caseData.threatFamily}
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
              Confidence {caseData.threatConfidence}%
            </span>
          </div>
          <div className="flex items-center gap-2 no-print">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[var(--bg-panel)] border border-[var(--border)] text-xs font-mono px-2 py-1 rounded-2xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/50 cursor-pointer"
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

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-[var(--bg-panel-alt)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-mono font-medium px-3.5 py-2 rounded-2xl text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>EXPORT DOSSIER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex border-b border-[var(--border)] pb-1 gap-1 overflow-x-auto">
        {allowedTabs.map((tab) => {
          const TabIcon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium uppercase tracking-wider border-b-2 transition-colors shrink-0 cursor-pointer ${
                isSelected
                  ? 'border-[var(--accent)] text-[var(--text-primary)] bg-[var(--bg-panel)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Workspace Panel */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-5 min-h-[500px]">
        {activeSubTab === 'analyst' && currentRole !== 'BANK_OFFICER' && currentRole !== 'CITIZEN' && <SecurityAnalystPanel />}
        {activeSubTab === 'officer' && currentRole !== 'CITIZEN' && <GrcCompliancePanel />}
        {activeSubTab === 'citizen' && <CitizenImpactPanel />}
        {activeSubTab === 'campaign' && currentRole !== 'CITIZEN' && <CampaignDnaPanel />}
        {activeSubTab === 'timeline' && <TimelinePanel />}
        {activeSubTab === 'ledger' && <BlockchainEvidencePanel />}
      </div>

      <ExecutiveReportPrintView
        caseData={caseData}
        execSummaryData={executiveSummary}
        graphData={campaignGraph}
        timelineData={timeline}
        permissions={JSON.parse(caseData.permissions || '[]')}
        activities={JSON.parse(caseData.activities || '[]')}
        services={JSON.parse(caseData.services || '[]')}
        mitreTags={JSON.parse(caseData.mitreTags || '[]')}
        iocs={JSON.parse(caseData.iocs || '[]')}
        threatNarrative={caseData.threatNarrative ? JSON.parse(caseData.threatNarrative) : {}}
        citizenImpact={caseData.citizenImpact ? JSON.parse(caseData.citizenImpact) : {}}
        langCode={language}
        regionalAdvisory={caseData.multilingualReports ? JSON.parse(caseData.multilingualReports) : {}}
      />
    </div>
  );
}

export default AnalysisLabPage;

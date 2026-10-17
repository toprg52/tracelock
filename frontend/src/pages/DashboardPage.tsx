import React from 'react';
import SocCommandCenter from '../components/dashboard/SocCommandCenter';
import { SocDashboardPayload } from '../types/dashboard';
import { useAnalysis } from '../context/AnalysisContext';

export const mockDashboardData: SocDashboardPayload = {
  metrics: {
    totalCases: 142,
    criticalThreats: 18,
    highRiskApks: 34,
    avgRisk: 74,
    citizenExposure: 'High',
    activeCampaign: 'Anubis-X V3',
    activeCampaignConfidence: 94,
    iocCount: 812,
    mitreTechniqueCount: 27,
  },
  mitreHeatmap: [
    { tactic: 'Initial Access', techniqueId: 'T1475', techniqueName: 'Malicious APK Link', count: 42, severity: 'critical', confidence: 95 },
    { tactic: 'Execution', techniqueId: 'T1446', techniqueName: 'Shared Library Load', count: 18, severity: 'high', confidence: 88 },
    { tactic: 'Persistence', techniqueId: 'T1624', techniqueName: 'Receiver Registered', count: 35, severity: 'high', confidence: 91 },
    { tactic: 'Privilege Escalation', techniqueId: 'T1400', techniqueName: 'Accessibility Abuse', count: 28, severity: 'critical', confidence: 97 },
    { tactic: 'Credential Access', techniqueId: 'T1417', techniqueName: 'Input Interception', count: 15, severity: 'high', confidence: 90 },
    { tactic: 'Defense Evasion', techniqueId: 'T1407', techniqueName: 'Obfuscation', count: 56, severity: 'critical', confidence: 99 },
  ],
  threatFamilies: [
    { name: 'Anubis Banking Trojan', count: 48, avgRisk: 92, trend: 'up' },
    { name: 'Cerberus Trojan', count: 32, avgRisk: 86, trend: 'stable' },
    { name: 'TeaBot Spyware', count: 25, avgRisk: 78, trend: 'up' },
    { name: 'SpyNote RAT', count: 19, avgRisk: 65, trend: 'down' },
  ],
  riskTrend: [
    { date: '07/03', score: 85, file: 'update.apk', caseId: 'c1' },
    { date: '07/04', score: 92, file: 'invoice.apk', caseId: 'c2' },
    { date: '07/05', score: 64, file: 'game.apk', caseId: 'c3' },
    { date: '07/06', score: 78, file: 'pdf_viewer.apk', caseId: 'c4' },
    { date: '07/07', score: 91, file: 'demo_sample.apk', caseId: 'c5' },
    { date: '07/08', score: 88, file: 'delivery_tracking.apk', caseId: 'c6' },
  ],
  iocIntel: [
    { id: 'ioc-1', type: 'IP', value: '185.220.101.5', severity: 'CRITICAL', confidence: 98, caseId: 'case-01', fileName: 'demo_sample.apk', threatFamily: 'Anubis', firstSeen: '2026-07-09' },
    { id: 'ioc-2', type: 'Domain', value: 'update-server-v3.net', severity: 'HIGH', confidence: 92, caseId: 'case-01', fileName: 'demo_sample.apk', threatFamily: 'Anubis', firstSeen: '2026-07-08' },
    { id: 'ioc-3', type: 'SHA256', value: 'f3a09b...92e10', severity: 'MEDIUM', confidence: 85, caseId: 'case-02', fileName: 'delivery_tracking.apk', threatFamily: 'TeaBot', firstSeen: '2026-07-07' },
  ],
  campaigns: [
    { id: 'c-1', label: 'Anubis-X Campaign', threatFamily: 'Anubis', caseCount: 14, avgRisk: 91, sharedInfrastructure: ['update-server-v3.net', '185.220.101.5'], status: 'active', lastSeen: '2026-07-09' },
    { id: 'c-2', label: 'TeaBot Spreader', threatFamily: 'TeaBot', caseCount: 8, avgRisk: 82, sharedInfrastructure: ['cdn-node-04.net'], status: 'monitoring', lastSeen: '2026-07-08' },
  ],
  correlationGraph: {
    nodes: [
      { id: 'apk-1', type: 'apk', label: 'demo_sample.apk', sublabel: 'BC-9201', risk: 91 },
      { id: 'domain-1', type: 'domain', label: 'update-server-v3.net', risk: 85 },
      { id: 'ip-1', type: 'ip', label: '185.220.101.5', risk: 98 },
      { id: 'family-1', type: 'family', label: 'Anubis Family', risk: 90 },
    ],
    edges: [
      { id: 'e1', source: 'apk-1', target: 'domain-1', label: 'CONTACTS' },
      { id: 'e2', source: 'domain-1', target: 'ip-1', label: 'RESOLVES_TO' },
      { id: 'e3', source: 'apk-1', target: 'family-1', label: 'BELONGS_TO' },
    ],
  },
};

export interface DashboardPageProps {
  onNavigateToUpload: () => void;
}

export function DashboardPage({ onNavigateToUpload }: DashboardPageProps) {
  const { casesAnalyzed } = useAnalysis();

  return (
    <SocCommandCenter
      data={{
        ...mockDashboardData,
        metrics: {
          ...mockDashboardData.metrics,
          totalCases: casesAnalyzed,
        },
      }}
      onNavigateToUpload={onNavigateToUpload}
    />
  );
}

export default DashboardPage;

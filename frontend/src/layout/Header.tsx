import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Server, Users, Settings, Terminal, Menu, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnalysis } from '../context/AnalysisContext';
import { useDemoMode } from '../context/DemoModeContext';
import { MultiSpeakerNarrator } from '../components/copilot/MultiSpeakerNarrator';
import { ThemeToggleSwitch } from '../components/ThemeToggleSwitch';
import { Badge } from '../components/ui/Badge';
import { Tooltip } from '../components/ui/Tooltip';
import { Breadcrumbs, BreadcrumbItem } from '../components/ui/Breadcrumbs';
import { Logo } from '../components/brand/Logo';

export interface HeaderProps {
  headerNotify?: string | null;
  onOpenAnalystConsole: () => void;
  onOpenMobileNav: () => void;
  onOpenCommandPalette?: () => void;
}

export function Header({
  headerNotify,
  onOpenAnalystConsole,
  onOpenMobileNav,
  onOpenCommandPalette,
}: HeaderProps) {
  const { language, setLanguage, caseData } = useAnalysis();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [copilotBriefingText, setCopilotBriefingText] = useState<Record<string, string>>({
    en: 'Active campaigns detected targeting mobile banking applications via OTP interception and accessibility abuse. Immediate review of high-risk cases recommended.',
    hi: 'ओटीपी इंटरसेप्शन और एक्सेसिबिलिटी दुरुपयोग के माध्यम से बैंकिंग अनुप्रयोगों को लक्षित करने वाले सक्रिय अभियानों का पता चला है।',
    te: 'OTP అంతరాయం మరియు యాక్సెసిబిలిటీ దుర్వినియోగం ద్వారా బ్యాంకింగ్ అప్లికేషన్‌లను లక్ష్యంగా చేసుకునే ప్రచారాలు కనుగొనబడ్డాయి.',
    kn: 'OTP ప్రతిబಂಧ ಮತ್ತು ಪ್ರವೇಶಿಸುವಿಕೆ ದುರುಪಯೋಗದ ಮೂಲಕ ಬ್ಯಾಂಕಿಂಗ್ ಅಪ್ಲಿಕೇಶನ್‌ಗಳನ್ನು ಗುರಿಯಾಗಿಸುವ ಸಕ್ರಿಯ ಪ್ರಚಾರಗಳು ಪತ್ತೆಯಾಗಿವೆ.',
    ta: 'OTP இடைமறிப்பு மற்றும் அணுகல் துஷ்பிரயோகம் மூலம் வங்கி பயன்பாடுகளை இலக்காகக் கொண்ட பிரச்சారங்கள் கண்டறியப்பட்டுள்ளன.',
  });

  useEffect(() => {
    fetch('/api/admin/executive-summary')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.copilotBriefing) {
          setCopilotBriefingText(data.copilotBriefing);
        }
      })
      .catch((err) => console.error('Failed to load briefing for narrator', err));
  }, []);

  // Compute dynamic breadcrumbs based on active route
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const { pathname, search } = location;

    if (pathname === '/' || pathname === '/platform-overview' || pathname === '/overview') {
      return [{ label: 'Platform overview' }];
    }

    if (pathname === '/dashboard') {
      return [{ label: 'Dashboard' }];
    }

    if (pathname === '/analyze') {
      return [{ label: 'Analyze' }];
    }

    if (pathname === '/cases') {
      return [{ label: 'Cases' }];
    }

    if (pathname.startsWith('/cases/')) {
      const caseId = pathname.replace('/cases/', '');
      const label = caseData && caseData.id === caseId ? caseData.fileName : caseId;
      return [
        { label: 'Cases', onClick: () => navigate('/cases') },
        { label: label || caseId },
      ];
    }

    if (pathname.startsWith('/intelligence')) {
      return [{ label: 'Intelligence' }];
    }

    if (pathname.startsWith('/settings')) {
      const section = new URLSearchParams(search).get('section');
      const sectionLabel =
        section === 'system'
          ? 'System status'
          : section === 'appearance'
          ? 'Appearance'
          : section === 'demo'
          ? 'Demo mode'
          : 'Account & Persona';
      return [
        { label: 'Settings', onClick: () => navigate('/settings') },
        { label: sectionLabel },
      ];
    }

    return [{ label: 'Not found' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 border-b border-border px-3 sm:px-6 flex items-center justify-between bg-surface shrink-0 z-20 gap-2">
      {/* Left Area: Mobile Menu + Environment Indicator + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Tooltip content="Navigation menu" position="bottom">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </Tooltip>

        <Link to="/" className="md:hidden flex items-center shrink-0 pr-1 hover:opacity-85 transition-opacity" aria-label="Tracelock Home">
          <Logo markType="A" variant="mark" size={20} className="text-text" />
        </Link>

        <Badge variant={isDemoMode ? 'demo' : 'neutral'} size="sm" dot className="shrink-0">
          <span className="hidden min-[380px]:inline">{isDemoMode ? 'Demo environment' : 'Local environment'}</span>
          <span className="min-[380px]:hidden">{isDemoMode ? 'Demo' : 'Local'}</span>
        </Badge>

        <div className="hidden sm:block h-4 w-[1px] bg-border shrink-0" aria-hidden="true" />

        <div className="hidden sm:flex items-center min-w-0">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Center Area: Optional Notification */}
      {headerNotify && (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-surface-raised border border-border text-xs font-sans text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="truncate max-w-sm">{headerNotify}</span>
        </div>
      )}

      {/* Right Area: Command Palette, Demo Mode Switch, Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted shrink-0">
        {/* Command Palette Trigger Button */}
        <Tooltip content="Open command palette (Ctrl+K)" position="bottom">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="h-8 px-2 sm:px-2.5 rounded-md bg-surface-raised hover:bg-surface-raised/80 border border-border text-xs font-sans text-text-muted hover:text-text flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Open command palette"
          >
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <kbd className="hidden md:inline font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border">Ctrl K</kbd>
          </button>
        </Tooltip>

        {/* Global Demo Mode Toggle Switch */}
        <Tooltip content={isDemoMode ? "Disable demo mode" : "Enable demo mode"} position="bottom">
          <button
            type="button"
            onClick={toggleDemoMode}
            className={`h-8 px-2 sm:px-2.5 rounded-md border text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isDemoMode
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                : 'bg-surface-raised border-border text-text-muted hover:text-text'
            }`}
            aria-label={isDemoMode ? "Disable demo mode" : "Enable demo mode"}
          >
            <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-text-muted'}`} />
            <span className="hidden sm:inline">{isDemoMode ? 'Demo mode' : 'Live mode'}</span>
          </button>
        </Tooltip>

        {/* Analyst Console Button */}
        <Tooltip content="Analyst console" position="bottom">
          <button
            type="button"
            onClick={onOpenAnalystConsole}
            className="h-8 px-2 sm:px-2.5 rounded-md bg-surface-raised hover:bg-surface-raised/80 border border-border text-xs font-sans font-medium text-text flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Analyst console"
          >
            <Terminal className="w-4 h-4 text-accent shrink-0" />
            <span className="hidden xl:inline">Analyst console</span>
          </button>
        </Tooltip>

        {/* Language Selector */}
        <Tooltip content="Console language" position="bottom">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-8 px-1.5 sm:px-2 text-xs font-sans font-medium bg-surface-raised border border-border rounded-md text-text hover:border-border-subtle focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer transition-colors max-w-[58px] sm:max-w-none"
            aria-label="Select console language"
          >
            <option value="en">EN</option>
            <option value="hi">HI - हिंदी</option>
            <option value="kn">KN - ಕನ್ನಡ</option>
            <option value="ta">TA - தமிழ்</option>
            <option value="te">TE - తెలుగు</option>
            <option value="bn">BN - বাংলা</option>
            <option value="mr">MR - मराठी</option>
            <option value="gu">GU - ગુજરાતી</option>
            <option value="ml">ML - മലയാളം</option>
            <option value="pa">PA - ਪੰਜਾਬੀ</option>
            <option value="or">OR - ଓଡ଼ିଆ</option>
          </select>
        </Tooltip>

        {/* Sound Toggle (TTS) */}
        <Tooltip content="Audio narration" position="bottom">
          <MultiSpeakerNarrator
            langCode={language}
            textToRead={copilotBriefingText[language] || copilotBriefingText.en || ''}
          />
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip content="Toggle theme" position="bottom">
          <ThemeToggleSwitch />
        </Tooltip>

        {/* Server Telemetry -> Links to /settings?section=system */}
        <Tooltip content="Infrastructure telemetry" position="bottom">
          <Link
            to="/settings?section=system"
            className="hidden sm:flex w-8 h-8 rounded-md items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Infrastructure telemetry"
          >
            <Server className="w-4 h-4" />
          </Link>
        </Tooltip>

        {/* User Auth -> Links to /settings?section=account */}
        <Tooltip content="Identity & access" position="bottom">
          <Link
            to="/settings?section=account"
            className="hidden sm:flex w-8 h-8 rounded-md items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Identity and role access"
          >
            <Users className="w-4 h-4" />
          </Link>
        </Tooltip>

        {/* System Settings -> Links to /settings */}
        <Tooltip content="System settings" position="bottom">
          <Link
            to="/settings?section=appearance"
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="System configuration"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </Tooltip>
      </div>
    </header>
  );
}

export default Header;

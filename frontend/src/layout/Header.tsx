import React, { useState, useEffect } from 'react';
import { Server, Users, Settings, Terminal, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnalysis } from '../context/AnalysisContext';
import { MultiSpeakerNarrator } from '../components/copilot/MultiSpeakerNarrator';
import { ThemeToggleSwitch } from '../components/ThemeToggleSwitch';
import { Badge } from '../components/ui/Badge';
import { Tooltip } from '../components/ui/Tooltip';

export interface HeaderProps {
  headerNotify?: string | null;
  onOpenServer: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenAnalystConsole: () => void;
  onOpenMobileNav: () => void;
}

export function Header({
  headerNotify,
  onOpenServer,
  onOpenAuth,
  onOpenSettings,
  onOpenAnalystConsole,
  onOpenMobileNav,
}: HeaderProps) {
  const { language, setLanguage } = useAnalysis();
  const { t } = useTranslation();

  const [copilotBriefingText, setCopilotBriefingText] = useState<Record<string, string>>({
    en: 'Active campaigns detected targeting mobile banking applications via OTP interception and accessibility abuse. Immediate review of high-risk cases recommended.',
    hi: 'ओटीपी इंटरसेप्शन और एक्सेसिबिलिटी दुरुपयोग के माध्यम से बैंकिंग अनुप्रयोगों को लक्षित करने वाले सक्रिय अभियानों का पता चला है।',
    te: 'OTP అంతరాయం మరియు యాక్సెసిబిలిటీ దుర్వినియోగం ద్వారా బ్యాంకింగ్ అప్లికేషన్‌లను లక్ష్యంగా చేసుకునే ప్రచారాలు కనుగొనబడ్డాయి.',
    kn: 'OTP ప్రతిಬಂಧ ಮತ್ತು ಪ್ರವೇಶಿಸುವಿಕೆ ದುರುಪಯೋಗದ ಮೂಲಕ ಬ್ಯಾಂಕಿಂಗ್ ಅಪ್ಲಿಕೇಶನ್‌ಗಳನ್ನು ಗುರಿಯಾಗಿಸುವ ಸಕ್ರಿಯ ಪ್ರಚಾರಗಳು ಪತ್ತೆಯಾಗಿವೆ.',
    ta: 'OTP இடைமறிப்பு மற்றும் அணுகல் துஷ்பிரயோகம் மூலம் வங்கி பயன்பாடுகளை இலக்காகக் கொண்ட பிரச்சாரங்கள் கண்டறியப்பட்டுள்ளன.',
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

  return (
    <header className="h-14 border-b border-border px-3 sm:px-6 flex items-center justify-between bg-surface shrink-0 z-20 gap-2">
      {/* Left Area: Mobile Menu + Environment Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Tooltip content="Navigation menu" position="bottom">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </Tooltip>

        <Badge variant="neutral" size="sm" dot>
          <span className="hidden min-[380px]:inline">Local environment</span>
          <span className="min-[380px]:hidden">Local</span>
        </Badge>
      </div>

      {/* Center Area: Optional Notification */}
      {headerNotify && (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-surface-raised border border-border text-xs font-sans text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="truncate max-w-sm">{headerNotify}</span>
        </div>
      )}

      {/* Right Area: Analyst Console + Action Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 text-text-muted shrink-0">
        {/* Analyst Console Button */}
        <Tooltip content="Analyst console" position="bottom">
          <button
            type="button"
            onClick={onOpenAnalystConsole}
            className="h-8 px-2 sm:px-2.5 rounded-md bg-surface-raised hover:bg-surface-raised/80 border border-border text-xs font-sans font-medium text-text flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Analyst console"
          >
            <Terminal className="w-5 h-5 text-accent shrink-0" />
            <span className="hidden md:inline">Analyst console</span>
          </button>
        </Tooltip>

        {/* Language Selector */}
        <Tooltip content="Console language" position="bottom">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-8 px-1.5 sm:px-2 text-xs font-sans font-medium bg-surface-raised border border-border rounded-md text-text hover:border-border-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer transition-colors max-w-[62px] sm:max-w-none"
            aria-label="Select console language"
          >
            <option value="en">EN - {t('lang_en') || 'English'}</option>
            <option value="hi">HI - {t('lang_hi') || 'हिंदी'}</option>
            <option value="kn">KN - {t('lang_kn') || 'ಕನ್ನಡ'}</option>
            <option value="ta">TA - {t('lang_ta') || 'தமிழ்'}</option>
            <option value="te">TE - {t('lang_te') || 'తెలుగు'}</option>
            <option value="bn">BN - {t('lang_bn') || 'বাংলা'}</option>
            <option value="mr">MR - {t('lang_mr') || 'मराठी'}</option>
            <option value="gu">GU - {t('lang_gu') || 'ગુજરાતી'}</option>
            <option value="ml">ML - {t('lang_ml') || 'മലയാളം'}</option>
            <option value="pa">PA - {t('lang_pa') || 'ਪੰਜਾਬੀ'}</option>
            <option value="or">OR - {t('lang_or') || 'ଓଡ଼ିଆ'}</option>
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

        {/* Server Telemetry */}
        <Tooltip content="Infrastructure telemetry" position="bottom">
          <button
            type="button"
            onClick={onOpenServer}
            className="hidden sm:flex w-8 h-8 rounded-md items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Infrastructure telemetry"
          >
            <Server className="w-5 h-5" />
          </button>
        </Tooltip>

        {/* User Auth */}
        <Tooltip content="Identity & access" position="bottom">
          <button
            type="button"
            onClick={onOpenAuth}
            className="hidden sm:flex w-8 h-8 rounded-md items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Identity and role access"
          >
            <Users className="w-5 h-5" />
          </button>
        </Tooltip>

        {/* System Settings */}
        <Tooltip content="System settings" position="bottom">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="System configuration"
          >
            <Settings className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>
    </header>
  );
}

export default Header;

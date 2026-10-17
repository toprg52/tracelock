import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  Search,
  LayoutDashboard,
  Upload,
  FolderGit2,
  Globe,
  Settings,
  Terminal,
  Sun,
  Moon,
  Sparkles,
  FileCode,
  ArrowRight,
  X,
} from 'lucide-react';
import { useDemoMode } from '../context/DemoModeContext';
import { useAnalysis } from '../context/AnalysisContext';

export interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setIsOpen = (nextOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  };

  const navigate = useNavigate();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { caseData, feedList } = useAnalysis();

  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectPage = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleToggleTheme = () => {
    const nextTheme = isLightMode ? 'dark' : 'light';
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsLightMode(true);
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setIsLightMode(false);
    }
    setIsOpen(false);
  };

  const handleToggleDemo = () => {
    toggleDemoMode();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Global command palette"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-fast"
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-elevation-4 overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-fast flex flex-col z-10 font-sans">
        <Command
          label="Global Command Palette"
          className="flex flex-col w-full h-full"
          loop
        >
          {/* Header Search Input */}
          <div className="flex items-center px-3.5 border-b border-border bg-surface shrink-0">
            <Search className="w-4 h-4 text-text-muted shrink-0 mr-2.5" aria-hidden="true" />
            <Command.Input
              placeholder="Search views, cases, tools, and actions..."
              className="flex-1 h-12 bg-transparent text-xs font-sans text-text placeholder:text-text-muted outline-none border-none"
              autoFocus
              aria-label="Search command palette"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface-raised border border-border rounded">
                ESC
              </kbd>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised rounded transition-colors cursor-pointer"
                aria-label="Close command palette"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List Area */}
          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-2">
            <Command.Empty className="py-8 text-center text-xs text-text-muted">
              No matching commands or cases found.
            </Command.Empty>

            {/* Navigation Group */}
            <Command.Group
              heading="Navigation"
              className="px-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-text-muted"
            >
              <Command.Item
                onSelect={() => handleSelectPage('/dashboard')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-accent shrink-0" />
                  <span>SOC Dashboard</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">/dashboard</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelectPage('/analyze')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-accent shrink-0" />
                  <span>Analyze APK Gateway</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">/analyze</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelectPage('/cases')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <FolderGit2 className="w-4 h-4 text-accent shrink-0" />
                  <span>Cases Archive</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">/cases</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelectPage('/intelligence')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-accent shrink-0" />
                  <span>Threat Intelligence</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">/intelligence</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelectPage('/settings')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-accent shrink-0" />
                  <span>Platform Settings</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">/settings</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelectPage('/')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-accent shrink-0" />
                  <span>Platform Overview (Landing)</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">/</span>
              </Command.Item>
            </Command.Group>

            {/* Recent Cases Group */}
            <Command.Group
              heading="Recent Cases"
              className="px-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-text-muted"
            >
              {isDemoMode && (
                <Command.Item
                  onSelect={() => handleSelectPage('/cases/case-demo-92')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCode className="w-4 h-4 text-severity-critical shrink-0" />
                    <span className="truncate">demo_sample.apk (Anubis Trojan)</span>
                  </div>
                  <span className="text-[10px] font-mono text-severity-critical shrink-0">92/100</span>
                </Command.Item>
              )}

              {caseData && caseData.id !== 'case-demo-92' && (
                <Command.Item
                  onSelect={() => handleSelectPage(`/cases/${caseData.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCode className="w-4 h-4 text-accent shrink-0" />
                    <span className="truncate">{caseData.fileName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-accent shrink-0">{caseData.riskScore}/100</span>
                </Command.Item>
              )}

              {feedList.slice(0, 3).map((item) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => handleSelectPage(`/cases/${item.caseId}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCode className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="truncate">{item.fileName || item.caseId}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted shrink-0">
                    {item.caseId}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Actions & Toggles Group */}
            <Command.Group
              heading="Actions"
              className="px-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-text-muted"
            >
              <Command.Item
                onSelect={handleToggleDemo}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isDemoMode ? 'Disable Demo Mode' : 'Enable Demo Mode'}</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400">
                  {isDemoMode ? 'Active' : 'Off'}
                </span>
              </Command.Item>

              <Command.Item
                onSelect={handleToggleTheme}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-text cursor-pointer transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-text data-[selected=true]:font-medium"
              >
                <div className="flex items-center gap-2.5">
                  {isLightMode ? (
                    <Moon className="w-4 h-4 text-accent shrink-0" />
                  ) : (
                    <Sun className="w-4 h-4 text-accent shrink-0" />
                  )}
                  <span>{isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  {isLightMode ? 'Light active' : 'Dark active'}
                </span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer Shortcuts Help */}
          <div className="px-4 py-2 border-t border-border bg-surface-raised/40 flex items-center justify-between text-[11px] text-text-muted shrink-0">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="font-mono bg-surface border border-border px-1 py-0.5 rounded text-[10px]">↑</kbd>{' '}
                <kbd className="font-mono bg-surface border border-border px-1 py-0.5 rounded text-[10px]">↓</kbd>{' '}
                Navigate
              </span>
              <span>
                <kbd className="font-mono bg-surface border border-border px-1 py-0.5 rounded text-[10px]">↵</kbd>{' '}
                Select
              </span>
            </div>
            <span>
              <kbd className="font-mono bg-surface border border-border px-1 py-0.5 rounded text-[10px]">ESC</kbd>{' '}
              Close
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}

export default CommandPalette;

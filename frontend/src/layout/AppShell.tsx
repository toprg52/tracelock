import React, { useState } from 'react';
import { Shield, X, Server, Users, Settings } from 'lucide-react';
import SidebarNav from '../components/layout/SidebarNav';
import { Header } from './Header';
import { UserAuthModal } from '../components/auth/UserAuthModal';
import { SystemSettingsModal } from '../components/settings/SystemSettingsModal';
import { ServerTelemetryModal } from '../components/server/ServerTelemetryModal';
import AICopilot from '../components/copilot/AICopilot';
import { Drawer } from '../components/ui/Drawer';

export interface AppShellProps {
  activeView: 'LANDING' | 'DASHBOARD' | 'UPLOAD' | 'ANALYSIS_LAB' | 'DEMO_WALKTHROUGH';
  onViewChange: (view: 'LANDING' | 'DASHBOARD' | 'UPLOAD' | 'ANALYSIS_LAB' | 'DEMO_WALKTHROUGH') => void;
  headerNotify?: string | null;
  children: React.ReactNode;
}

export function AppShell({
  activeView,
  onViewChange,
  headerNotify,
  children,
}: AppShellProps) {
  // Navigation & Drawer states
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isServerOpen, setIsServerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text">
      {/* Modals */}
      <UserAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SystemSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ServerTelemetryModal isOpen={isServerOpen} onClose={() => setIsServerOpen(false)} />

      {/* Analyst Console Drawer */}
      <AICopilot isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        position="left"
        size="sm"
        noPadding
      >
        <div className="flex flex-col h-full bg-surface border-r border-border">
          <div className="p-4 border-b border-border flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-surface-raised border border-border flex items-center justify-center text-accent">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="font-bold tracking-wider text-xs text-text font-sans">
                TRACELOCK
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <SidebarNav
            activeView={activeView}
            onViewChange={onViewChange}
            onItemClick={() => setIsMobileNavOpen(false)}
          />
          {/* Mobile Drawer Quick Tools */}
          <div className="p-3 border-t border-border flex items-center justify-around bg-surface-raised/40 shrink-0 sm:hidden">
            <button
              type="button"
              onClick={() => {
                setIsServerOpen(true);
                setIsMobileNavOpen(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-sans text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Infrastructure telemetry"
            >
              <Server className="w-4 h-4 text-accent" />
              <span>Server</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAuthOpen(true);
                setIsMobileNavOpen(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-sans text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Identity and role access"
            >
              <Users className="w-4 h-4 text-accent" />
              <span>Identity</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen(true);
                setIsMobileNavOpen(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-sans text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="System configuration"
            >
              <Settings className="w-4 h-4 text-accent" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-[260px] bg-surface border-r border-border flex-col shrink-0">
        <div className="p-4 border-b border-border flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-md bg-surface-raised border border-border flex items-center justify-center text-accent">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-xs text-text font-sans">
              TRACELOCK
            </h1>
          </div>
        </div>
        <SidebarNav activeView={activeView} onViewChange={onViewChange} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background text-text">
        {/* Top Header Bar */}
        <Header
          headerNotify={headerNotify}
          onOpenServer={() => setIsServerOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAnalystConsole={() => setIsConsoleOpen(true)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        {/* Dynamic View Panels Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-[1600px] w-full mx-auto min-w-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppShell;

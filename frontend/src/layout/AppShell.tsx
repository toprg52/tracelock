import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Shield, X, Server, Users, Settings } from 'lucide-react';
import SidebarNav from '../components/layout/SidebarNav';
import { Header } from './Header';
import AICopilot from '../components/copilot/AICopilot';
import { Drawer } from '../components/ui/Drawer';
import { Badge } from '../components/ui/Badge';
import { CommandPalette } from '../components/CommandPalette';
import { useDemoMode } from '../context/DemoModeContext';

export interface AppShellProps {
  headerNotify?: string | null;
  children?: React.ReactNode;
}

export function AppShell({
  headerNotify,
  children,
}: AppShellProps) {
  const { isDemoMode, setDemoMode } = useDemoMode();

  // Drawers and Command Palette states
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text">
      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      />

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
            <Link
              to="/"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-md bg-surface-raised border border-border flex items-center justify-center text-accent group-hover:border-accent transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="font-bold tracking-wider text-xs text-text font-sans">
                TRACELOCK
              </h1>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <SidebarNav onItemClick={() => setIsMobileNavOpen(false)} />

          {/* Mobile Drawer Quick Tools -> Link to /settings */}
          <div className="p-3 border-t border-border flex items-center justify-around bg-surface-raised/40 shrink-0 sm:hidden">
            <Link
              to="/settings?section=system"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-sans text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Infrastructure telemetry"
            >
              <Server className="w-4 h-4 text-accent" />
              <span>Server</span>
            </Link>
            <Link
              to="/settings?section=account"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-sans text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Identity and role access"
            >
              <Users className="w-4 h-4 text-accent" />
              <span>Identity</span>
            </Link>
            <Link
              to="/settings?section=appearance"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-sans text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="System configuration"
            >
              <Settings className="w-4 h-4 text-accent" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </Drawer>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-[260px] bg-surface border-r border-border flex-col shrink-0">
        <Link
          to="/"
          className="p-4 border-b border-border flex items-center gap-3 shrink-0 hover:bg-surface-raised/40 transition-colors group"
        >
          <div className="w-8 h-8 rounded-md bg-surface-raised border border-border flex items-center justify-center text-accent group-hover:border-accent transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-xs text-text font-sans">
              TRACELOCK
            </h1>
          </div>
        </Link>
        <SidebarNav />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background text-text">
        {/* Top Header Bar */}
        <Header
          headerNotify={headerNotify}
          onOpenAnalystConsole={() => setIsConsoleOpen(true)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Persistent Demo Data Banner */}
        {isDemoMode && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs text-amber-400 shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="demo" size="sm" className="shrink-0">
                Demo data
              </Badge>
              <span className="truncate">
                Showing simulated malware forensics and sample telemetry. Live incident streaming paused.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDemoMode(false)}
              className="text-[11px] font-sans font-medium text-amber-300 hover:text-white underline cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1"
            >
              Exit demo mode
            </button>
          </div>
        )}

        {/* Dynamic View Panels Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-[1600px] w-full mx-auto min-w-0">
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppShell;

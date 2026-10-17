import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DEMO_MODE_STORAGE_KEY = 'tracelock_demo_mode';

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('demo') === '1') {
        localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true');
        return true;
      }
      const saved = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
    }
    // Default to true so initial visitor sees hydrated sample telemetry
    return true;
  });

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
  };

  const toggleDemoMode = () => {
    setDemoMode(!isDemoMode);
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DEMO_MODE_STORAGE_KEY) {
        setIsDemoMode(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, setDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

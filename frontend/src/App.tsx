import React, { useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { AnalysisProvider } from "./context/AnalysisContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppShell } from "./layout/AppShell";
import { LandingPage } from "./pages/LandingPage";
import { DemoWalkthroughPage } from "./pages/DemoWalkthroughPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalysisLabPage } from "./pages/AnalysisLabPage";
import { UploadPage } from "./pages/UploadPage";
import { DesignPreview } from "./components/DesignPreview";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type ActiveView = "LANDING" | "DASHBOARD" | "UPLOAD" | "ANALYSIS_LAB" | "DEMO_WALKTHROUGH";

function MainAppShell() {
  const [activeView, setActiveView] = useState<ActiveView>("LANDING");

  return (
    <AppShell activeView={activeView} onViewChange={setActiveView}>
      {activeView === "LANDING" && (
        <LandingPage
          onLaunchDashboard={() => setActiveView("DASHBOARD")}
          onUploadApk={() => setActiveView("UPLOAD")}
        />
      )}

      {activeView === "DASHBOARD" && (
        <DashboardPage
          onNavigateToUpload={() => setActiveView("UPLOAD")}
        />
      )}

      {activeView === "DEMO_WALKTHROUGH" && (
        <DemoWalkthroughPage
          onGoToLiveLab={() => setActiveView("ANALYSIS_LAB")}
        />
      )}

      {activeView === "UPLOAD" && (
        <UploadPage onViewLab={() => setActiveView("ANALYSIS_LAB")} />
      )}

      {activeView === "ANALYSIS_LAB" && (
        <AnalysisLabPage />
      )}
    </AppShell>
  );
}

export default function App() {
  const [isDesignPreview, setIsDesignPreview] = useState(() => window.location.hash === '#design-preview');

  useEffect(() => {
    const handleHashChange = () => {
      setIsDesignPreview(window.location.hash === '#design-preview');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isDesignPreview) {
    return (
      <ErrorBoundary>
        <DesignPreview onExit={() => { window.location.hash = ''; }} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <AnalysisProvider>
              <MainAppShell />
            </AnalysisProvider>
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

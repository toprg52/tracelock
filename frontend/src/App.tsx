import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { AnalysisProvider } from "./context/AnalysisContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppShell } from "./layout/AppShell";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { CasesPage } from "./pages/CasesPage";
import { CaseDetailsPage } from "./pages/CaseDetailsPage";
import { IntelligencePage } from "./pages/IntelligencePage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { DesignPreview } from "./components/DesignPreview";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
              <BrowserRouter>
                <AppShell>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/analyze" element={<AnalyzePage />} />
                    <Route path="/cases" element={<CasesPage />} />
                    <Route path="/cases/:caseId" element={<CaseDetailsPage />} />
                    <Route path="/intelligence" element={<IntelligencePage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* Legacy redirects */}
                    <Route path="/platform-overview" element={<Navigate to="/" replace />} />
                    <Route path="/overview" element={<Navigate to="/" replace />} />
                    <Route path="/soc-dashboard" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/upload" element={<Navigate to="/analyze" replace />} />
                    <Route path="/upload-apk" element={<Navigate to="/analyze" replace />} />
                    <Route path="/analysis-lab" element={<Navigate to="/analyze" replace />} />
                    <Route path="/lab" element={<Navigate to="/analyze" replace />} />
                    <Route path="/demo" element={<Navigate to="/dashboard?demo=1" replace />} />
                    <Route path="/demo-walkthrough" element={<Navigate to="/dashboard?demo=1" replace />} />

                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </AppShell>
              </BrowserRouter>
            </AnalysisProvider>
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

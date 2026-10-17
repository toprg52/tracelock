"use client";

import React from "react";
import { LayoutDashboard, Upload, FlaskConical, Terminal, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/Badge";

interface SidebarNavProps {
  activeView: "LANDING" | "DASHBOARD" | "UPLOAD" | "ANALYSIS_LAB" | "DEMO_WALKTHROUGH";
  onViewChange: (view: "LANDING" | "DASHBOARD" | "UPLOAD" | "ANALYSIS_LAB" | "DEMO_WALKTHROUGH") => void;
  onItemClick?: () => void;
}

export default function SidebarNav({ activeView, onViewChange, onItemClick }: SidebarNavProps) {
  const { t } = useTranslation();

  const navItems = [
    {
      id: "LANDING" as const,
      label: "Platform overview",
      icon: Terminal,
      badge: null,
    },
    {
      id: "DASHBOARD" as const,
      label: t('soc_dashboard') || "SOC dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "DEMO_WALKTHROUGH" as const,
      label: "Demo walkthrough",
      icon: Activity,
      badge: "Demo",
    },
    {
      id: "UPLOAD" as const,
      label: t('upload_apk') || "Upload APK",
      icon: Upload,
      badge: null,
    },
    {
      id: "ANALYSIS_LAB" as const,
      label: t('analysis_lab') || "Analysis lab",
      icon: FlaskConical,
      badge: null,
    },
  ];

  return (
    <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto bg-surface" aria-label="Main navigation">
      <div>
        <div className="px-3 mb-2 text-xs font-sans font-medium text-text-muted">
          Operations
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onViewChange(item.id);
                  onItemClick?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans font-medium transition-colors border-l-[3px] text-left rounded-r-md cursor-pointer outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? "border-accent bg-accent/12 text-text font-semibold"
                    : "border-transparent text-text-muted hover:text-text hover:bg-surface-raised/60"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? "text-accent" : "text-text-muted"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge === "Demo" && (
                  <Badge variant="demo" size="sm" className="shrink-0 ml-auto">
                    Demo
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

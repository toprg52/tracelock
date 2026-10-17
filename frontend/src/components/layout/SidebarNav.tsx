import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Upload, FolderGit2, Globe, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SidebarNavProps {
  onItemClick?: () => void;
}

export default function SidebarNav({ onItemClick }: SidebarNavProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    {
      to: "/dashboard",
      label: t("soc_dashboard") || "Dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      to: "/analyze",
      label: "Analyze",
      icon: Upload,
      isActive: pathname === "/analyze",
    },
    {
      to: "/cases",
      label: "Cases",
      icon: FolderGit2,
      isActive: pathname.startsWith("/cases"),
    },
    {
      to: "/intelligence",
      label: "Intelligence",
      icon: Globe,
      isActive: pathname.startsWith("/intelligence"),
    },
    {
      to: "/settings",
      label: "Settings",
      icon: Settings,
      isActive: pathname.startsWith("/settings"),
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
            const isActive = item.isActive;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onItemClick}
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
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Globe, ShieldAlert, Radio, Activity } from "lucide-react";
import { Badge } from "./ui/Badge";
import { DemoBadge } from "./ui/DemoBadge";
import { Card } from "./ui/Card";

// ─── Mercator helpers (1000×520 viewbox) ─────────────────────────────────────
const W = 1000,
  H = 520;
function mx(lon: number) {
  return ((lon + 180) / 360) * W;
}
function my(lat: number) {
  return ((90 - lat) / 180) * H;
}

// ─── Simplified continent SVG paths ──────────────────────────────────────────
const CONTINENTS = [
  // North America
  "M 160,62 L 188,52 L 232,58 L 270,72 L 294,96 L 310,128 L 296,164 L 272,182 L 252,178 L 238,192 L 212,200 L 206,182 L 218,158 L 228,132 L 210,112 L 180,100 L 158,86 Z",
  // South America
  "M 234,218 L 264,212 L 292,222 L 308,254 L 312,292 L 298,334 L 282,358 L 260,352 L 244,328 L 238,294 L 232,262 L 228,238 Z",
  // Europe
  "M 478,80 L 512,72 L 548,78 L 562,98 L 558,118 L 540,124 L 516,120 L 497,128 L 482,118 L 476,102 Z",
  // Africa
  "M 490,142 L 532,136 L 566,148 L 582,176 L 588,218 L 578,262 L 558,302 L 532,322 L 510,312 L 492,282 L 486,242 L 490,192 L 486,166 Z",
  // Asia (combined Russia + Asia)
  "M 558,38 L 652,28 L 752,33 L 824,44 L 862,62 L 866,98 L 858,148 L 832,164 L 800,170 L 762,172 L 718,158 L 678,154 L 640,162 L 602,158 L 564,142 L 553,116 L 556,72 L 554,52 Z",
  // India peninsula
  "M 714,162 L 734,162 L 750,185 L 742,218 L 724,232 L 710,218 L 704,195 Z",
  // SE Asia / Indochina
  "M 780,155 L 808,148 L 820,165 L 816,188 L 800,196 L 782,182 Z",
  // Australia
  "M 832,298 L 880,286 L 922,296 L 938,322 L 924,352 L 886,362 L 854,352 L 834,326 Z",
  // Greenland
  "M 348,28 L 382,22 L 408,36 L 404,62 L 382,70 L 356,60 Z",
  // Japan
  "M 862,110 L 876,102 L 888,116 L 878,132 L 866,128 Z",
  // UK
  "M 468,84 L 478,80 L 482,96 L 472,100 Z",
];

// ─── Threat nodes ─────────────────────────────────────────────────────────────
interface ThreatLocation {
  id: string;
  label: string;
  sublabel: string;
  role: "origin" | "c2" | "victim";
  lon: number;
  lat: number;
  volume: number; // attack volume 0-100
  confidence: number; // 0-100
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
}

const LOCATIONS: ThreatLocation[] = [
  { id: "russia", label: "Russia", sublabel: "Moscow", role: "origin", lon: 37, lat: 55.7, volume: 87, confidence: 94, severity: "CRITICAL" },
  { id: "netherlands", label: "Netherlands", sublabel: "Amsterdam C2", role: "c2", lon: 4.9, lat: 52.4, volume: 62, confidence: 88, severity: "HIGH" },
  { id: "usa-c2", label: "USA", sublabel: "Bulletproof Proxy", role: "c2", lon: -77, lat: 38.9, volume: 71, confidence: 82, severity: "HIGH" },
  { id: "china", label: "China", sublabel: "Origin Node", role: "origin", lon: 116, lat: 39.9, volume: 91, confidence: 96, severity: "CRITICAL" },
  { id: "india", label: "India", sublabel: "Target Region", role: "victim", lon: 78.9, lat: 20.6, volume: 96, confidence: 97, severity: "CRITICAL" },
  { id: "singapore", label: "Singapore", sublabel: "Transit Relay", role: "c2", lon: 103.8, lat: 1.3, volume: 44, confidence: 78, severity: "MEDIUM" },
];

// ─── Attack routes ────────────────────────────────────────────────────────────
interface AttackRoute {
  from: string;
  to: string;
  label: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
}

const ROUTES: AttackRoute[] = [
  { from: "russia", to: "india", label: "SMS Intercept Vector", severity: "CRITICAL" },
  { from: "netherlands", to: "india", label: "C2 Command Relay", severity: "HIGH" },
  { from: "usa-c2", to: "india", label: "Phishing Infrastructure", severity: "HIGH" },
  { from: "china", to: "india", label: "Banking Trojan Drop", severity: "CRITICAL" },
  { from: "china", to: "singapore", label: "Transit Tunnel", severity: "MEDIUM" },
  { from: "singapore", to: "india", label: "Relay Forward", severity: "MEDIUM" },
];

const ROLE_CONFIG = {
  origin: {
    fill: "var(--color-critical, #f05d6c)",
    label: "Origin Infrastructure",
    badge: "CRITICAL",
  },
  c2: {
    fill: "var(--color-high, #f59e4b)",
    label: "C2 Server Node",
    badge: "HIGH",
  },
  victim: {
    fill: "var(--color-accent, #3ddc97)",
    label: "Target Victim Region",
    badge: "TARGET",
  },
};

// ─── Quadratic bezier midpoint arc helper ────────────────────────────────────
function arcPath(x1: number, y1: number, x2: number, y2: number, bulge = 0.32): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1,
    dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const cx = mx - dy * bulge;
  const cy = my + dx * bulge - len * 0.08;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function pathLength(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 1.4;
}

export default function WorldThreatMap() {
  const [tick, setTick] = useState(0);
  const [hoveredLoc, setHoveredLoc] = useState<ThreatLocation | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<AttackRoute | null>(null);
  const [activeEvents, setActiveEvents] = useState<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 40);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
      const key = `${route.from}-${route.to}`;
      setActiveEvents((prev) => [...prev.filter((k) => k !== key), key]);
      setTimeout(() => setActiveEvents((prev) => prev.filter((k) => k !== key)), 2000);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const locCoords = Object.fromEntries(
    LOCATIONS.map((l) => [l.id, { x: mx(l.lon), y: my(l.lat) }])
  );

  const criticalCount = LOCATIONS.filter((l) => l.severity === "CRITICAL").length;
  const avgConf = Math.round(
    LOCATIONS.reduce((a, l) => a + l.confidence, 0) / LOCATIONS.length
  );

  return (
    <Card className="p-0 overflow-hidden shadow-card border-border">
      {/* Header with Title, Demo Badge, and Clear Legend */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-surface-raised">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text">
            Global Threat Infrastructure Map
          </h3>
          <DemoBadge />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 flex-wrap text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: ROLE_CONFIG.origin.fill, boxShadow: `0 0 6px ${ROLE_CONFIG.origin.fill}` }}
            />
            <span className="text-text-muted">Origin Host</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: ROLE_CONFIG.c2.fill, boxShadow: `0 0 6px ${ROLE_CONFIG.c2.fill}` }}
            />
            <span className="text-text-muted">C2 Server</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: ROLE_CONFIG.victim.fill, boxShadow: `0 0 6px ${ROLE_CONFIG.victim.fill}` }}
            />
            <span className="text-text-muted">Target Region</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 rounded-full bg-accent" />
            <span className="text-text-muted">Accent Arcs</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas + Sidebar */}
      <div className="flex flex-col lg:flex-row">
        {/* SVG Map Canvas */}
        <div className="relative flex-1 min-h-[440px] bg-bg overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full block">
            <defs>
              {/* Arrow markers for accent arcs */}
              <marker
                id="arrowAccent"
                markerWidth="5"
                markerHeight="5"
                refX="4"
                refY="2.5"
                orient="auto"
              >
                <path d="M0,0 L5,2.5 L0,5 Z" fill="var(--color-accent, #3ddc97)" opacity="0.95" />
              </marker>
              <marker
                id="arrowCritical"
                markerWidth="5"
                markerHeight="5"
                refX="4"
                refY="2.5"
                orient="auto"
              >
                <path d="M0,0 L5,2.5 L0,5 Z" fill="var(--color-critical, #f05d6c)" opacity="0.95" />
              </marker>
            </defs>

            {/* Continents: Muted land colour */}
            {CONTINENTS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="var(--color-surface-raised, #182234)"
                stroke="var(--color-border, #283548)"
                strokeWidth="0.85"
                opacity="0.9"
                className="transition-colors"
              />
            ))}

            {/* Latitude / Longitude graticule lines */}
            {[-60, -30, 0, 30, 60].map((lat) => (
              <line
                key={`lat${lat}`}
                x1={0}
                y1={my(lat)}
                x2={W}
                y2={my(lat)}
                stroke="var(--color-border)"
                strokeWidth="0.5"
                strokeDasharray="4 8"
                opacity="0.3"
              />
            ))}
            {[-120, -60, 0, 60, 120].map((lon) => (
              <line
                key={`lon${lon}`}
                x1={mx(lon)}
                y1={0}
                x2={mx(lon)}
                y2={H}
                stroke="var(--color-border)"
                strokeWidth="0.5"
                strokeDasharray="4 8"
                opacity="0.3"
              />
            ))}

            {/* Accent Attack Arcs */}
            {ROUTES.map((route) => {
              const src = locCoords[route.from];
              const dst = locCoords[route.to];
              if (!src || !dst) return null;

              const key = `${route.from}-${route.to}`;
              const isActive = activeEvents.includes(key);
              const isHov = hoveredRoute?.from === route.from && hoveredRoute?.to === route.to;
              const pLen = pathLength(src.x, src.y, dst.x, dst.y);
              const dashLen = 22,
                gapLen = Math.max(10, pLen - dashLen);
              const offset = -((tick * 2.8) % pLen);

              const d = arcPath(src.x, src.y, dst.x, dst.y);
              const isCrit = route.severity === "CRITICAL";

              return (
                <g
                  key={key}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredRoute(route)}
                  onMouseLeave={() => setHoveredRoute(null)}
                >
                  {/* Outer glow stroke */}
                  <path
                    d={d}
                    fill="none"
                    stroke={isCrit ? "var(--color-critical)" : "var(--color-accent)"}
                    strokeWidth={isActive || isHov ? 5 : 2.5}
                    strokeOpacity={isActive ? 0.35 : isHov ? 0.25 : 0.12}
                  />

                  {/* Flowing animated accent pulse */}
                  <path
                    d={d}
                    fill="none"
                    stroke={isCrit ? "var(--color-critical)" : "var(--color-accent)"}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    strokeOpacity={isActive ? 1 : isHov ? 0.9 : 0.75}
                    strokeDasharray={`${dashLen} ${gapLen}`}
                    strokeDashoffset={offset}
                    markerEnd={isCrit ? "url(#arrowCritical)" : "url(#arrowAccent)"}
                  />
                </g>
              );
            })}

            {/* Threat Location Nodes with Readable Labels */}
            {LOCATIONS.map((loc) => {
              const c = locCoords[loc.id];
              const rc = ROLE_CONFIG[loc.role];
              const isHov = hoveredLoc?.id === loc.id;
              const r = loc.role === "victim" ? 10 : 7.5;
              const blink = loc.role !== "victim" && tick % 28 < 7;

              return (
                <g
                  key={loc.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredLoc(loc)}
                  onMouseLeave={() => setHoveredLoc(null)}
                >
                  {/* Hover pulse ring */}
                  {isHov && (
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={r + 14}
                      fill="none"
                      stroke={rc.fill}
                      strokeWidth="1.5"
                      strokeOpacity="0.45"
                      strokeDasharray="3 4"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={r}
                    fill="var(--color-surface, #121826)"
                    stroke={rc.fill}
                    strokeWidth={isHov ? 2.8 : 2}
                    opacity={blink ? 1 : 0.9}
                  />

                  {/* Center dot */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={r * 0.45}
                    fill={rc.fill}
                    opacity={blink ? 1 : 0.8}
                  />

                  {/* Readable label with background pill for 100% legibility */}
                  <rect
                    x={c.x - 34}
                    y={c.y + r + 4}
                    width="68"
                    height="16"
                    rx="4"
                    fill="var(--color-surface, #121826)"
                    stroke="var(--color-border)"
                    strokeWidth="0.8"
                    opacity="0.9"
                  />
                  <text
                    x={c.x}
                    y={c.y + r + 15}
                    textAnchor="middle"
                    fill="var(--color-text, #ffffff)"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {loc.label.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredLoc && (() => {
            const rc = ROLE_CONFIG[hoveredLoc.role];
            return (
              <div className="absolute top-4 left-4 z-30 pointer-events-none w-56 rounded-xl border border-border bg-surface/95 backdrop-blur-md p-3.5 space-y-2 font-mono shadow-card">
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: rc.fill }}>
                    {rc.label}
                  </span>
                  <Badge variant={hoveredLoc.severity === "CRITICAL" ? "critical" : "high"} size="sm">
                    {hoveredLoc.severity}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-text-muted">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <strong className="text-text">{hoveredLoc.label}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span className="text-text">{hoveredLoc.sublabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attack Volume:</span>
                    <strong className="text-accent">{hoveredLoc.volume} / 100</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Intel Confidence:</span>
                    <strong className="text-text">{hoveredLoc.confidence}%</strong>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Sidebar: Threat Indicators & Node Directory */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-surface flex flex-col shrink-0 font-mono text-xs">
          {/* Summary KPIs */}
          <div className="p-4 border-b border-border space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">
              Global Threat Activity
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl p-2.5 text-center border border-border bg-surface-raised">
                <div className="text-severity-critical text-base font-bold font-mono">{criticalCount}</div>
                <div className="text-[9px] uppercase text-text-muted mt-0.5">Critical</div>
              </div>
              <div className="rounded-xl p-2.5 text-center border border-border bg-surface-raised">
                <div className="text-severity-high text-base font-bold font-mono">{ROUTES.length}</div>
                <div className="text-[9px] uppercase text-text-muted mt-0.5">Routes</div>
              </div>
              <div className="rounded-xl p-2.5 text-center border border-border bg-surface-raised">
                <div className="text-accent text-base font-bold font-mono">{avgConf}%</div>
                <div className="text-[9px] uppercase text-text-muted mt-0.5">Avg Conf</div>
              </div>
            </div>
          </div>

          {/* Node Directory List */}
          <div className="p-3 border-b border-border space-y-2 flex-1 max-h-72 overflow-y-auto">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block px-1">
              Active Host Locations ({LOCATIONS.length})
            </span>
            {LOCATIONS.map((loc) => {
              const rc = ROLE_CONFIG[loc.role];
              return (
                <div
                  key={loc.id}
                  className="flex items-center gap-2 rounded-xl p-2 border border-border bg-surface-raised/60 hover:bg-surface-raised transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredLoc(loc)}
                  onMouseLeave={() => setHoveredLoc(null)}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: rc.fill, boxShadow: `0 0 4px ${rc.fill}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate text-text">{loc.label}</div>
                    <div className="text-[10px] truncate text-text-muted">{loc.sublabel}</div>
                  </div>
                  <Badge variant={loc.severity === "CRITICAL" ? "critical" : "high"} size="sm">
                    {loc.severity}
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-3 text-[10px] text-text-muted border-t border-border bg-surface-raised/40">
            Simulated Global Threat Intelligence Telemetry
          </div>
        </div>
      </div>
    </Card>
  );
}

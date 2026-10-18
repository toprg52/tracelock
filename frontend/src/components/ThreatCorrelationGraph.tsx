"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { ZoomIn, ZoomOut, RotateCcw, ShieldAlert, Info, Check, Copy } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
export type NodeSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface ThreatNode {
  id: string;
  label: string;
  sublabel?: string;
  group: "center" | "domain" | "ip" | "family" | "mitre" | "sample";
  severity: NodeSeverity;
  confidence: number;
  x: number;
  y: number;
}

export interface ThreatEdge {
  source: string;
  target: string;
  label: string;
  animated?: boolean;
}

export interface ThreatCorrelationGraphProps {
  fileName: string;
  threatFamily: string | null;
  riskScore: number;
  mitreTags: { id: string; name: string }[];
  iocs: { type: string; value: string; severity: string }[];
}

// ─── Severity Palette ──────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<
  NodeSeverity,
  { stroke: string; fill: string; glow: string; label: string; text: string; bgBadge: string }
> = {
  critical: {
    stroke: "var(--color-critical, #f05d6c)",
    fill: "rgba(240, 93, 108, 0.16)",
    glow: "rgba(240, 93, 108, 0.4)",
    label: "Critical",
    text: "var(--color-critical, #f05d6c)",
    bgBadge: "bg-severity-critical/15 text-severity-critical border-severity-critical/30",
  },
  high: {
    stroke: "var(--color-high, #f59e4b)",
    fill: "rgba(245, 158, 75, 0.16)",
    glow: "rgba(245, 158, 75, 0.4)",
    label: "High",
    text: "var(--color-high, #f59e4b)",
    bgBadge: "bg-severity-high/15 text-severity-high border-severity-high/30",
  },
  medium: {
    stroke: "var(--color-medium, #f2c94c)",
    fill: "rgba(242, 201, 76, 0.16)",
    glow: "rgba(242, 201, 76, 0.4)",
    label: "Medium",
    text: "var(--color-medium, #f2c94c)",
    bgBadge: "bg-severity-medium/15 text-severity-medium border-severity-medium/30",
  },
  low: {
    stroke: "var(--color-low, #4cc38a)",
    fill: "rgba(76, 195, 138, 0.16)",
    glow: "rgba(76, 195, 138, 0.4)",
    label: "Low",
    text: "var(--color-low, #4cc38a)",
    bgBadge: "bg-severity-low/15 text-severity-low border-severity-low/30",
  },
  info: {
    stroke: "var(--color-info, #5b9df5)",
    fill: "rgba(91, 157, 245, 0.16)",
    glow: "rgba(91, 157, 245, 0.4)",
    label: "Informational",
    text: "var(--color-info, #5b9df5)",
    bgBadge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
};

// ─── Node Builder ──────────────────────────────────────────────────────────
function mapIocSeverity(raw: string | undefined): NodeSeverity {
  if (!raw) return "high";
  const s = raw.toLowerCase();
  if (s.includes("crit")) return "critical";
  if (s.includes("high")) return "high";
  if (s.includes("med")) return "medium";
  if (s.includes("low")) return "low";
  return "info";
}

const buildNodes = (
  fileName: string,
  threatFamily: string | null,
  riskScore: number,
  mitreTags: { id: string; name: string }[],
  iocs: { type: string; value: string; severity: string }[]
): ThreatNode[] => {
  const cx = 500;
  const cy = 340;

  // Center node severity determined by riskScore
  const centerSeverity: NodeSeverity =
    riskScore >= 80 ? "critical" : riskScore >= 60 ? "high" : riskScore >= 40 ? "medium" : "low";

  const nodes: ThreatNode[] = [
    {
      id: "center",
      label: fileName || "Target_Binary.apk",
      sublabel: "Target APK",
      group: "center",
      severity: centerSeverity,
      confidence: 100,
      x: cx,
      y: cy,
    },
  ];

  // Domain IOC
  const domainIoc = iocs.find((i) => i.type.toLowerCase() === "domain");
  nodes.push({
    id: "domain-1",
    label: domainIoc?.value ?? "kyc-verification-gateway.net",
    sublabel: "C2 Domain",
    group: "domain",
    severity: domainIoc ? mapIocSeverity(domainIoc.severity) : "high",
    confidence: 94,
    x: cx - 290,
    y: cy - 130,
  });

  // C2 IP
  const ipIoc = iocs.find((i) => i.type.toLowerCase() === "ip");
  nodes.push({
    id: "ip-1",
    label: ipIoc?.value ?? "185.220.101.5",
    sublabel: "C2 Server IP",
    group: "ip",
    severity: ipIoc ? mapIocSeverity(ipIoc.severity) : "critical",
    confidence: 98,
    x: cx + 290,
    y: cy - 130,
  });

  // Threat family
  nodes.push({
    id: "family-1",
    label: threatFamily ?? "Banking Trojan",
    sublabel: "Threat Classification",
    group: "family",
    severity: centerSeverity === "low" ? "medium" : centerSeverity,
    confidence: 92,
    x: cx,
    y: cy - 230,
  });

  // MITRE techniques (up to 3)
  const tags =
    mitreTags.length > 0
      ? mitreTags.slice(0, 3)
      : [
          { id: "T1417", name: "Input Interception" },
          { id: "T1400", name: "Accessibility Abuse" },
          { id: "T1412", name: "Capture SMS" },
        ];

  const mitreAngles = [-35, -90, -145];
  tags.forEach((t, i) => {
    const angle = ((mitreAngles[i] ?? -90 + i * 40) * Math.PI) / 180;
    nodes.push({
      id: `mitre-${i}`,
      label: t.id,
      sublabel: t.name,
      group: "mitre",
      severity: i === 0 ? "critical" : i === 1 ? "high" : "medium",
      confidence: 88 - i * 4,
      x: cx + 250 * Math.cos(angle),
      y: cy + 230 * Math.sin(angle + Math.PI / 2) * -1 + 170,
    });
  });

  // Similar campaign samples
  const samples = ["cedarline_token.apk", "whatsapp_gold_otp.apk"];
  samples.forEach((s, i) => {
    nodes.push({
      id: `sample-${i}`,
      label: s,
      sublabel: "Correlated Sample",
      group: "sample",
      severity: "high",
      confidence: 76 - i * 6,
      x: cx + (i === 0 ? -280 : 280),
      y: cy + 200,
    });
  });

  return nodes;
};

const buildEdges = (nodes: ThreatNode[]): ThreatEdge[] => [
  { source: "center", target: "domain-1", label: "RESOLVES TO", animated: true },
  { source: "center", target: "ip-1", label: "C2 BEACON", animated: true },
  { source: "center", target: "family-1", label: "CLASSIFIED AS", animated: false },
  { source: "center", target: "mitre-0", label: "TECHNIQUE", animated: false },
  { source: "center", target: "mitre-1", label: "TECHNIQUE", animated: false },
  { source: "center", target: "mitre-2", label: "TECHNIQUE", animated: false },
  { source: "center", target: "sample-0", label: "CODE REUSE", animated: true },
  { source: "center", target: "sample-1", label: "CODE REUSE", animated: true },
  { source: "domain-1", target: "ip-1", label: "HOSTED ON", animated: true },
  { source: "family-1", target: "sample-0", label: "SAME FAMILY", animated: false },
  { source: "family-1", target: "sample-1", label: "SAME FAMILY", animated: false },
];

export default function ThreatCorrelationGraph({
  fileName,
  threatFamily,
  riskScore,
  mitreTags,
  iocs,
}: ThreatCorrelationGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes = useMemo(
    () => buildNodes(fileName, threatFamily, riskScore, mitreTags, iocs),
    [fileName, threatFamily, riskScore, mitreTags, iocs]
  );
  const edges = useMemo(() => buildEdges(nodes), [nodes]);

  const [hovered, setHovered] = useState<ThreatNode | null>(null);
  const [selected, setSelected] = useState<ThreatNode | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  // Pan & Zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest(".node-group")) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.min(2.5, Math.max(0.4, Number((t.scale * delta).toFixed(2)))),
    }));
  }, []);

  const zoomIn = () =>
    setTransform((t) => ({ ...t, scale: Math.min(2.5, Number((t.scale * 1.25).toFixed(2))) }));
  const zoomOut = () =>
    setTransform((t) => ({ ...t, scale: Math.max(0.4, Number((t.scale * 0.8).toFixed(2))) }));
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // Animation tick for edge dashes
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const VIEWBOX_W = 1000;
  const VIEWBOX_H = 680;

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-3 select-none">
      {/* ── Toolbar: Legend & Zoom Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-raised border border-border rounded-xl px-4 py-2.5">
        {/* Severity Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 pr-2 border-r border-border">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{
                backgroundColor: SEVERITY_CONFIG.critical.stroke,
                boxShadow: `0 0 6px ${SEVERITY_CONFIG.critical.stroke}`,
              }}
            />
            <span className="text-xs font-mono font-semibold text-text uppercase tracking-wider">
              Severity Legend
            </span>
          </div>

          {(["critical", "high", "medium", "low", "info"] as NodeSeverity[]).map((sev) => {
            const conf = SEVERITY_CONFIG[sev];
            return (
              <div key={sev} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: conf.stroke, boxShadow: `0 0 4px ${conf.stroke}` }}
                />
                <span className="text-[11px] font-mono text-text-muted">{conf.label}</span>
              </div>
            );
          })}
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-text-muted px-2 py-1 bg-surface border border-border rounded-md">
            {Math.round(transform.scale * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border bg-surface text-text hover:bg-surface-raised hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Zoom in (+)"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={zoomOut}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border bg-surface text-text hover:bg-surface-raised hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Zoom out (-)"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="px-2.5 h-7 flex items-center gap-1 rounded-lg border border-border bg-surface text-text hover:bg-surface-raised hover:text-accent text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Reset viewport"
            aria-label="Reset viewport to default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── Main Canvas Viewport ── */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[480px] rounded-xl border border-border overflow-hidden bg-bg shadow-inner"
        style={{ cursor: dragging.current ? "grabbing" : "grab" }}
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Header telemetry watermark */}
        <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-widest text-text-muted pointer-events-none">
          Threat Correlation Matrix · Cedarline Forensics Engine
        </div>
        <div className="absolute top-3 right-3 text-[10px] font-mono text-text-muted pointer-events-none hidden sm:block">
          Use Arrow Keys / Enter to inspect nodes · Drag to pan
        </div>

        {/* ── SVG Canvas ── */}
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
        >
          <defs>
            {/* Dynamic glow filters for each severity */}
            {(["critical", "high", "medium", "low", "info"] as NodeSeverity[]).map((sev) => {
              const conf = SEVERITY_CONFIG[sev];
              return (
                <filter key={sev} id={`glow-${sev}`} x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feFlood floodColor={conf.stroke} floodOpacity="0.6" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              );
            })}

            {/* Edge arrow markers */}
            <marker id="arrowSeverity" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-accent, #3ddc97)" opacity="0.8" />
            </marker>
          </defs>

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
            {/* ── Edges ── */}
            {edges.map((edge, i) => {
              const src = getNodeById(edge.source);
              const tgt = getNodeById(edge.target);
              if (!src || !tgt) return null;

              const srcConf = SEVERITY_CONFIG[src.severity];
              const tgtConf = SEVERITY_CONFIG[tgt.severity];

              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const len = Math.sqrt(dx * dx + dy * dy);

              // Use larger radius offsets so lines dock cleanly at perimeter
              const srcR = src.group === "center" ? 54 : 42;
              const tgtR = tgt.group === "center" ? 54 : 42;

              const x1 = src.x + (dx / len) * srcR;
              const y1 = src.y + (dy / len) * srcR;
              const x2 = tgt.x - (dx / len) * tgtR;
              const y2 = tgt.y - (dy / len) * tgtR;

              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;

              const gradId = `grad-edge-${i}`;
              const dashOffset = edge.animated ? -(tick * 1.5) % 24 : 0;

              return (
                <g key={i}>
                  <defs>
                    <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
                      <stop offset="0%" stopColor={srcConf.stroke} stopOpacity="0.7" />
                      <stop offset="100%" stopColor={tgtConf.stroke} stopOpacity="0.7" />
                    </linearGradient>
                  </defs>

                  {/* Glow edge backing */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={srcConf.stroke}
                    strokeWidth={edge.animated ? 3.5 : 2}
                    strokeOpacity="0.15"
                  />

                  {/* Main stroke line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={`url(#${gradId})`}
                    strokeWidth={edge.animated ? 2 : 1.5}
                    strokeDasharray={edge.animated ? "8 5" : "4 4"}
                    strokeDashoffset={dashOffset}
                    markerEnd="url(#arrowSeverity)"
                  />

                  {/* Edge label */}
                  <text
                    x={mx}
                    y={my - 6}
                    textAnchor="middle"
                    fill="var(--color-text-muted, #8b9bb4)"
                    fontSize="8.5"
                    fontFamily="monospace"
                    className="select-none pointer-events-none"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* ── Larger Nodes with Readable Labels ── */}
            {nodes.map((node) => {
              const conf = SEVERITY_CONFIG[node.severity];
              const isCenter = node.group === "center";
              // Significantly larger node radii: 54px for center, 42px for surrounding nodes
              const r = isCenter ? 54 : 42;
              const isHov = hovered?.id === node.id;
              const isSel = selected?.id === node.id;
              const isFocused = focusedNodeId === node.id;

              return (
                <g
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Node ${node.label}, severity ${conf.label}, group ${node.sublabel || node.group}`}
                  aria-pressed={isSel}
                  className="node-group outline-none focus:outline-none"
                  transform={`translate(${node.x},${node.y})`}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(node)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setFocusedNodeId(node.id)}
                  onBlur={() => setFocusedNodeId(null)}
                  onClick={() => setSelected((prev) => (prev?.id === node.id ? null : node))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected((prev) => (prev?.id === node.id ? null : node));
                    }
                  }}
                >
                  {/* Outer animated pulse ring on hover/center */}
                  {(isCenter || isHov) && (
                    <circle
                      r={r + 12}
                      fill="none"
                      stroke={conf.stroke}
                      strokeWidth="1.5"
                      strokeOpacity={isHov ? "0.45" : "0.22"}
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Keyboard focus or active selection ring */}
                  {(isSel || isFocused) && (
                    <circle
                      r={r + 18}
                      fill="none"
                      stroke={conf.stroke}
                      strokeWidth="2"
                      strokeOpacity="0.8"
                      strokeDasharray="3 3"
                      className="animate-spin"
                      style={{ animationDuration: "8s", transformOrigin: "center" }}
                    />
                  )}

                  {/* Node solid body with severity color fill & glow */}
                  <circle
                    r={r}
                    fill={conf.fill}
                    stroke={conf.stroke}
                    strokeWidth={isHov || isSel || isFocused ? 3 : 2}
                    filter={`url(#glow-${node.severity})`}
                    className="transition-all duration-200"
                  />

                  {/* Confidence circumference arc */}
                  {(() => {
                    const circ = 2 * Math.PI * r;
                    const dash = (node.confidence / 100) * circ;
                    return (
                      <circle
                        r={r}
                        fill="none"
                        stroke={conf.stroke}
                        strokeWidth="3"
                        strokeOpacity="0.75"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset={circ * 0.25}
                        transform="rotate(-90)"
                      />
                    );
                  })()}

                  {/* Node center label: crisp, readable, higher contrast */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--color-text, #ffffff)"
                    fontSize={isCenter ? "10.5" : "9.5"}
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {node.label.length > 20 ? node.label.substring(0, 18) + "…" : node.label}
                  </text>

                  {/* Sublabel below node */}
                  {node.sublabel && (
                    <text
                      x="0"
                      y={r + 16}
                      textAnchor="middle"
                      fill="var(--color-text-muted, #8b9bb4)"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="600"
                      className="select-none pointer-events-none"
                    >
                      {node.sublabel}
                    </text>
                  )}

                  {/* Confidence indicator pill badge */}
                  <rect
                    x={r - 18}
                    y={-r - 6}
                    width="26"
                    height="14"
                    rx="4"
                    fill="var(--color-surface, #121826)"
                    stroke={conf.stroke}
                    strokeWidth="1"
                  />
                  <text
                    x={r - 5}
                    y={-r + 4}
                    textAnchor="middle"
                    fill={conf.stroke}
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {node.confidence}%
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* ── Dark-Themed Minimap ── */}
        <div className="absolute bottom-3 right-3 w-44 h-32 rounded-lg border border-border/80 bg-surface/95 backdrop-blur-md shadow-2xl overflow-hidden pointer-events-none hidden sm:block">
          <div className="px-2 py-1 bg-surface-raised/80 border-b border-border/60 flex items-center justify-between text-[9px] font-mono text-text-muted">
            <span>MINIMAP</span>
            <span>{nodes.length} NODES</span>
          </div>
          <svg className="w-full h-full p-1" viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}>
            {/* Miniature Edges */}
            {edges.map((e, idx) => {
              const src = getNodeById(e.source);
              const tgt = getNodeById(e.target);
              if (!src || !tgt) return null;
              return (
                <line
                  key={idx}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="var(--color-border)"
                  strokeWidth="3"
                />
              );
            })}
            {/* Miniature Nodes */}
            {nodes.map((n) => {
              const conf = SEVERITY_CONFIG[n.severity];
              return (
                <circle
                  key={n.id}
                  cx={n.x}
                  cy={n.y}
                  r={n.group === "center" ? 18 : 12}
                  fill={conf.stroke}
                />
              );
            })}
            {/* Active Viewport Frustum Box */}
            <rect
              x={-transform.x / transform.scale}
              y={-transform.y / transform.scale}
              width={VIEWBOX_W / transform.scale}
              height={VIEWBOX_H / transform.scale}
              fill="rgba(61, 220, 151, 0.08)"
              stroke="var(--color-accent)"
              strokeWidth="4"
              strokeDasharray="8 6"
            />
          </svg>
        </div>

        {/* ── Node Inspector Panel (Shown on Click or Keyboard Enter) ── */}
        {selected && (() => {
          const conf = SEVERITY_CONFIG[selected.severity];
          return (
            <div
              className="absolute top-3 right-3 w-72 rounded-xl border border-border bg-surface/95 backdrop-blur-md p-4 space-y-3.5 shadow-card z-30"
              style={{ borderColor: `${conf.stroke}66` }}
            >
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: conf.stroke, boxShadow: `0 0 4px ${conf.stroke}` }}
                  />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-text">
                    {conf.label} Severity
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
                  aria-label="Close inspector"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-text-muted block uppercase tracking-wider mb-0.5">
                    Entity Identifier
                  </span>
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-surface-raised border border-border">
                    <span className="font-semibold text-text break-all select-all">{selected.label}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selected.label)}
                      className="p-1 rounded text-text-muted hover:text-accent shrink-0"
                      title="Copy entity name"
                      aria-label="Copy entity name"
                    >
                      {copiedValue === selected.label ? (
                        <Check className="w-3.5 h-3.5 text-severity-low" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {selected.sublabel && (
                  <div>
                    <span className="text-[10px] text-text-muted block uppercase tracking-wider">Classification</span>
                    <span className="text-text">{selected.sublabel}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] text-text-muted block uppercase tracking-wider">Group</span>
                    <span className="capitalize text-text font-semibold">{selected.group}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block uppercase tracking-wider">Confidence</span>
                    <span className="font-bold" style={{ color: conf.stroke }}>
                      {selected.confidence}%
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="h-1.5 w-full rounded-full overflow-hidden bg-surface-raised border border-border">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${selected.confidence}%`,
                        backgroundColor: conf.stroke,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

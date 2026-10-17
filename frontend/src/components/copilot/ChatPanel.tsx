"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  X,
  Send,
  Loader2,
  FileText,
  Shield,
  Target,
  AlertTriangle,
  Terminal,
  Activity,
} from "lucide-react";
import ChatMessage from "./ChatMessage";
import { CopilotAction, CopilotCaseContext, CopilotMessage } from "@/types/copilot";

interface ChatPanelProps {
  isOpen: boolean;
  isMinimized?: boolean;
  messages: CopilotMessage[];
  input: string;
  loading: boolean;
  context: CopilotCaseContext;
  suggestedPrompts: string[];
  onClose: () => void;
  onMinimize?: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onAction: (action: CopilotAction) => void;
  onSuggestedPrompt: (prompt: string) => void;
}

const QUICK_ACTIONS: { action: CopilotAction; label: string; icon: React.ElementType }[] = [
  { action: "executive_summary", label: "Executive dossier", icon: FileText },
  { action: "analyst_summary", label: "Forensic synthesis", icon: Shield },
  { action: "explain_mitre", label: "MITRE ATT&CK matrix", icon: Target },
  { action: "explain_iocs", label: "IOC indicators", icon: AlertTriangle },
  { action: "explain_risk", label: "Risk score heuristics", icon: Activity },
  { action: "mitigation", label: "IR action plan", icon: Shield },
];

export default function ChatPanel({
  isOpen,
  messages,
  input,
  loading,
  context,
  suggestedPrompts,
  onClose,
  onInputChange,
  onSend,
  onAction,
  onSuggestedPrompt,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"CONSOLE" | "QUICK_ACTIONS">("CONSOLE");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full bg-surface text-text overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-accent" />
            <span className="text-xs font-sans font-semibold text-text">
              Analyst console
            </span>
          </div>

          <div className="flex gap-2 text-xs font-sans">
            <button
              type="button"
              onClick={() => setActiveTab("CONSOLE")}
              className={`px-2 py-1 border-b-2 text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                activeTab === "CONSOLE"
                  ? "border-accent text-text font-semibold"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              Console
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("QUICK_ACTIONS")}
              className={`px-2 py-1 border-b-2 text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                activeTab === "QUICK_ACTIONS"
                  ? "border-accent text-text font-semibold"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              Quick intel
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
          aria-label="Close analyst console"
          title="Close analyst console"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {activeTab === "QUICK_ACTIONS" && (
        <div className="p-3 border-b border-border bg-surface-raised space-y-2 shrink-0">
          <div className="text-xs font-sans font-medium text-text-muted">
            Synthesis actions
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map(({ action, label, icon: Icon }) => (
              <button
                key={action}
                type="button"
                onClick={() => {
                  onAction(action);
                  setActiveTab("CONSOLE");
                }}
                disabled={loading}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-surface hover:border-accent/40 text-xs font-sans text-text transition-colors text-left disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Icon className="w-4 h-4 text-accent shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-background">
        {messages.length === 0 && (
          <div className="py-4 space-y-4">
            <div className="bg-surface border border-border p-3 text-xs font-sans text-text-muted space-y-1 rounded-lg">
              <div className="text-text font-semibold">Analyst assistant ready</div>
              <div>Ask telemetry questions, request risk breakdowns, or synthesize incident response documentation.</div>
              {context.fileName && (
                <div className="text-accent text-[11px] font-mono mt-1">
                  Target: {context.fileName} ({context.packageName || "N/A"})
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-sans font-medium text-text-muted px-0.5">
                Suggested queries
              </div>
              <div className="space-y-1.5">
                {suggestedPrompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => onSuggestedPrompt(prompt)}
                    className="w-full text-left bg-surface border border-border hover:bg-surface-raised hover:border-border-subtle p-2.5 rounded-lg text-xs font-sans text-text transition-colors cursor-pointer block outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-accent text-xs font-sans p-2.5 bg-surface-raised border border-border rounded-md">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing forensic queries & AI graph heuristics...</span>
          </div>
        )}
      </div>

      {/* Suggested Follow-ups */}
      {messages.length > 0 && suggestedPrompts.length > 0 && !loading && (
        <div className="p-3 border-t border-border bg-surface-raised/40 space-y-1.5 shrink-0">
          <div className="text-xs font-sans font-medium text-text-muted px-0.5">
            Follow-up queries
          </div>
          <div className="space-y-1.5 max-h-24 overflow-y-auto">
            {suggestedPrompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSuggestedPrompt(prompt)}
                className="w-full text-left bg-surface border border-border hover:bg-surface-raised px-2.5 py-1.5 text-xs font-sans text-text transition-colors rounded-md truncate cursor-pointer block outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Field */}
      <div className="p-3 border-t border-border bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter forensic query or command..."
            disabled={loading}
            className="flex-1 bg-surface-raised border border-border rounded-md px-3 py-2 text-xs font-sans text-text placeholder-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            aria-label="Forensic query input"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="h-8 px-3 rounded-md bg-accent hover:bg-accent/90 text-background text-xs font-sans font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Send query"
          >
            <span>Run</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

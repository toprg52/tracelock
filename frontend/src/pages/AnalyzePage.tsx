import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Cpu,
  Activity,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export type PipelineStageId = 'upload' | 'static' | 'scoring' | 'report';
export type StageStatus = 'pending' | 'active' | 'completed' | 'failed';

interface PipelineStageDef {
  id: PipelineStageId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isEstimate: boolean;
  estimatedSec: number;
}

const PIPELINE_STAGES: PipelineStageDef[] = [
  {
    id: 'upload',
    title: 'Upload binary',
    description: 'Ingesting APK package and calculating SHA-256 fingerprint',
    icon: Upload,
    isEstimate: false, // Real network transfer
    estimatedSec: 1,
  },
  {
    id: 'static',
    title: 'Static analysis',
    description: 'Decompiling manifest, analyzing permissions, and YARA matching',
    icon: Cpu,
    isEstimate: true,
    estimatedSec: 3,
  },
  {
    id: 'scoring',
    title: 'Threat scoring',
    description: 'Evaluating behavioral risk heuristics and IOC correlation',
    icon: Activity,
    isEstimate: true,
    estimatedSec: 2,
  },
  {
    id: 'report',
    title: 'Report compilation',
    description: 'Synthesizing forensic dossier, GRC advisory, and MITRE tags',
    icon: FileText,
    isEstimate: true,
    estimatedSec: 1,
  },
];

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

export function AnalyzePage() {
  const navigate = useNavigate();
  const { triggerAnalysis, isLoading: contextLoading } = useAnalysis();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Analysis / Pipeline Progression State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<{ status?: number; message: string } | null>(null);
  const [activeStageId, setActiveStageId] = useState<PipelineStageId>('upload');
  const [stageStatuses, setStageStatuses] = useState<Record<PipelineStageId, StageStatus>>({
    upload: 'pending',
    static: 'pending',
    scoring: 'pending',
    report: 'pending',
  });
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRefs = useRef<number[]>([]);

  // Clear timers on unmount
  const clearTimers = useCallback(() => {
    timerRefs.current.forEach((t) => window.clearTimeout(t));
    timerRefs.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Keyboard accessibility: Escape cancels analysis if in progress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAnalyzing) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnalyzing]);

  // Validate a candidate file
  const validateFile = (file: File): boolean => {
    setValidationError(null);
    setAnalysisError(null);

    // Validate extension
    if (!file.name.toLowerCase().endsWith('.apk')) {
      setValidationError('Invalid file format. Only Android application packages (.apk) are supported.');
      return false;
    }

    // Validate size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setValidationError(`File exceeds the 200MB limit (${sizeMb} MB). Please choose a smaller APK.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Keyboard trigger for dropzone
  const handleDropzoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  // Cancel in-flight analysis
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    clearTimers();
    setIsAnalyzing(false);
    setIsCompleted(false);
    setProgressPercent(0);
    setActiveStageId('upload');
    setStageStatuses({
      upload: 'pending',
      static: 'pending',
      scoring: 'pending',
      report: 'pending',
    });
    setAnalysisError(null);
  };

  // Start analysis pipeline
  const startAnalysis = async () => {
    if (!selectedFile) return;

    clearTimers();
    setAnalysisError(null);
    setIsAnalyzing(true);
    setIsCompleted(false);
    setProgressPercent(10);
    setActiveStageId('upload');
    setStageStatuses({
      upload: 'active',
      static: 'pending',
      scoring: 'pending',
      report: 'pending',
    });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Schedule realistic stage progression estimates while backend processes
    // Stage 1 (upload) -> Stage 2 (static): ~800ms
    const t1 = window.setTimeout(() => {
      if (abortController.signal.aborted) return;
      setActiveStageId('static');
      setProgressPercent(35);
      setStageStatuses((prev) => ({
        ...prev,
        upload: 'completed',
        static: 'active',
      }));
    }, 800);

    // Stage 2 (static) -> Stage 3 (scoring): ~3200ms
    const t2 = window.setTimeout(() => {
      if (abortController.signal.aborted) return;
      setActiveStageId('scoring');
      setProgressPercent(65);
      setStageStatuses((prev) => ({
        ...prev,
        static: 'completed',
        scoring: 'active',
      }));
    }, 3200);

    // Stage 3 (scoring) -> Stage 4 (report): ~5400ms
    const t3 = window.setTimeout(() => {
      if (abortController.signal.aborted) return;
      setActiveStageId('report');
      setProgressPercent(88);
      setStageStatuses((prev) => ({
        ...prev,
        scoring: 'completed',
        report: 'active',
      }));
    }, 5400);

    timerRefs.current = [t1, t2, t3];

    try {
      const caseResult = await triggerAnalysis(selectedFile, abortController.signal);

      // Successfully resolved from backend
      clearTimers();
      setActiveStageId('report');
      setProgressPercent(100);
      setStageStatuses({
        upload: 'completed',
        static: 'completed',
        scoring: 'completed',
        report: 'completed',
      });
      setIsCompleted(true);

      // Brief delay so analyst sees 100% completion before navigation
      const tNav = window.setTimeout(() => {
        navigate(`/cases/${caseResult.id}`);
      }, 700);
      timerRefs.current.push(tNav);
    } catch (err: any) {
      clearTimers();
      if (err?.name === 'AbortError' || abortController.signal.aborted) {
        // User cancelled, state already reset by handleCancel
        return;
      }

      setIsAnalyzing(false);
      setStageStatuses((prev) => ({
        ...prev,
        [activeStageId]: 'failed',
      }));
      setAnalysisError({
        status: err?.status,
        message: err?.message || 'Forensic analysis processing failed on server',
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <Card className="p-6 sm:p-8 space-y-6 shadow-card">
        {/* Card Header */}
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-mono font-medium mb-1">
            <Cpu className="w-3 h-3" />
            <span>Forensic Sandbox</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text">
            Analyze Android Package
          </h2>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Upload an APK binary for bytecode decompilation, signature matching, and heuristic threat classification.
          </p>
        </div>

        {/* VIEW A: Idle / File Selection Dropzone */}
        {!isAnalyzing && !isCompleted && (
          <div className="space-y-5">
            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              id="apk-file-picker"
              accept=".apk"
              className="sr-only"
              onChange={handleFileChange}
              disabled={contextLoading}
            />

            {/* Interactive Drop Zone with full keyboard accessibility */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload APK package. Drop file or press Enter to browse"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={handleDropzoneKeyDown}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                dragOver
                  ? 'border-accent bg-accent/10 shadow-sm scale-[1.01]'
                  : 'border-border hover:border-accent/60 bg-surface-raised/40 hover:bg-surface-raised/70'
              }`}
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-accent shadow-sm mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text">
                  <span>Drop your APK here</span>, or{' '}
                  <span className="text-accent underline underline-offset-2">browse</span>
                </p>
                <p className="text-[11px] font-mono text-text-muted">
                  Supports .apk binaries up to 200MB
                </p>
              </div>
            </div>

            {/* Validation Error (File type or size limit) */}
            {validationError && (
              <div
                role="alert"
                className="p-3.5 bg-critical/10 border border-critical/30 rounded-lg text-xs flex items-start gap-2.5 text-critical"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">Validation error</span>
                  <span className="text-text-muted text-[11px]">{validationError}</span>
                </div>
              </div>
            )}

            {/* Backend / Network Error State */}
            {analysisError && (
              <div
                role="alert"
                className="p-4 bg-critical/10 border border-critical/30 rounded-xl text-xs space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-critical shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="critical" size="sm">
                        {analysisError.status ? `HTTP ${analysisError.status}` : 'Error'}
                      </Badge>
                      <span className="font-semibold text-text">Analysis failed</span>
                    </div>
                    <p className="text-[11px] text-text-muted break-words">
                      {analysisError.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button variant="primary" size="sm" onClick={startAnalysis}>
                    Try again
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAnalysisError(null);
                      setSelectedFile(null);
                    }}
                  >
                    Select different file
                  </Button>
                </div>
              </div>
            )}

            {/* Selected File Card & Start Action */}
            {selectedFile && !analysisError && (
              <div className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-accent shrink-0">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text truncate max-w-[280px] sm:max-w-[340px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] font-mono text-text-muted">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to analyze
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setValidationError(null);
                    }}
                    className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface transition-colors"
                    title="Remove selected file"
                    aria-label="Remove selected file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="primary"
                    className="w-full"
                    iconRight={<ArrowRight className="w-4 h-4" />}
                    onClick={startAnalysis}
                  >
                    Start analysis
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW B: Inline Progress View (Real Pipeline Stages) */}
        {(isAnalyzing || isCompleted) && (
          <div className="space-y-6" aria-live="polite">
            {/* Active File Banner */}
            {selectedFile && (
              <div className="p-3 rounded-lg bg-surface-raised border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCode className="w-4 h-4 text-accent shrink-0" />
                  <span className="font-semibold text-text truncate max-w-[240px] sm:max-w-[320px]">
                    {selectedFile.name}
                  </span>
                  <span className="font-mono text-[11px] text-text-muted shrink-0">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                </div>
                {!isCompleted && (
                  <Badge variant="neutral" size="sm" dot>
                    Active
                  </Badge>
                )}
                {isCompleted && (
                  <Badge variant="low" size="sm">
                    Complete
                  </Badge>
                )}
              </div>
            )}

            {/* Overall Progress Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text flex items-center gap-1.5">
                  {isCompleted ? (
                    <span className="text-accent flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Compilation complete
                    </span>
                  ) : (
                    <>
                      <span>Executing pipeline</span>
                      <span className="text-[11px] font-mono text-text-muted">
                        (estimated ~7s)
                      </span>
                    </>
                  )}
                </span>
                <span className="font-mono text-xs font-semibold text-text tabular-nums">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface-raised border border-border rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Real Pipeline Stage List */}
            <div className="space-y-2.5">
              {PIPELINE_STAGES.map((stage, idx) => {
                const status = stageStatuses[stage.id];
                const IconComponent = stage.icon;

                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                      status === 'active'
                        ? 'bg-accent/5 border-accent/40 shadow-sm'
                        : status === 'completed'
                        ? 'bg-surface-raised/40 border-border/80'
                        : status === 'failed'
                        ? 'bg-critical/10 border-critical/30'
                        : 'bg-surface border-border/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Status Icon */}
                      <div className="mt-0.5 shrink-0">
                        {status === 'completed' && (
                          <div className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {status === 'active' && (
                          <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          </div>
                        )}
                        {status === 'pending' && (
                          <div className="w-5 h-5 rounded-full bg-surface-raised text-text-muted flex items-center justify-center border border-border font-mono text-[10px]">
                            {idx + 1}
                          </div>
                        )}
                        {status === 'failed' && (
                          <div className="w-5 h-5 rounded-full bg-critical/20 text-critical flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Stage Details */}
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-semibold ${
                              status === 'active'
                                ? 'text-text'
                                : status === 'completed'
                                ? 'text-text'
                                : status === 'failed'
                                ? 'text-critical'
                                : 'text-text-muted'
                            }`}
                          >
                            {stage.title}
                          </span>
                          {stage.isEstimate ? (
                            <span className="text-[10px] font-mono text-text-muted px-1.5 py-0.2 rounded bg-surface border border-border/60">
                              Estimated
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-accent px-1.5 py-0.2 rounded bg-accent/10">
                              Actual
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-muted truncate">
                          {status === 'active' && (
                            <span className="text-accent animate-pulse font-medium mr-1.5">
                              In progress:
                            </span>
                          )}
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {/* Stage Status Badge */}
                    <div className="shrink-0 pt-0.5">
                      {status === 'completed' && (
                        <span className="text-[11px] font-mono text-accent">Done</span>
                      )}
                      {status === 'active' && (
                        <span className="text-[11px] font-mono text-accent animate-pulse">
                          Active
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="text-[11px] font-mono text-text-muted">Queued</span>
                      )}
                      {status === 'failed' && (
                        <span className="text-[11px] font-mono text-critical font-medium">Failed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estimated notice */}
            <div className="p-2.5 rounded-lg bg-surface border border-border text-[11px] text-text-muted flex items-center gap-2 font-mono">
              <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>
                Stages advance automatically. Timing reflects estimated pipeline durations.
              </span>
            </div>

            {/* Action Bar (Cancel or Redirecting notification) */}
            <div className="pt-2 flex items-center justify-between border-t border-border">
              {isCompleted ? (
                <div className="w-full flex items-center justify-center gap-2 text-xs font-medium text-accent py-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Redirecting to case dossier...</span>
                </div>
              ) : (
                <>
                  <span className="text-[11px] text-text-muted">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">Esc</kbd> to cancel
                  </span>
                  <Button variant="secondary" size="sm" onClick={handleCancel}>
                    Cancel analysis
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AnalyzePage;

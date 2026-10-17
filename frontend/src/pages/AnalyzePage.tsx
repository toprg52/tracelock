import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, ArrowRight, RefreshCw, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function AnalyzePage() {
  const navigate = useNavigate();
  const { caseData, triggerAnalysis, resetAnalysis, isLoading: contextLoading } = useAnalysis();

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<{ status?: number; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
      setUploadError(null);
    }
  };

  const startUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadStatus('Uploading target APK binary and decompiling manifest & bytecode...');
    try {
      const caseResult = await triggerAnalysis(uploadFile);
      setUploadStatus(`Forensic compilation complete for ${uploadFile.name}. Redirecting to case dossier...`);
      setTimeout(() => {
        navigate(`/cases/${caseResult.id}`);
      }, 600);
    } catch (err: any) {
      setUploadStatus('');
      setIsUploading(false);
      setUploadError({
        status: err?.status,
        message: err?.message || 'Sandbox processing failed',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-text">
          APK Forensic Sandbox Gateway
        </h2>
        <p className="text-xs text-text-muted">
          Decompile Android application packages (.apk) for static heuristic matching, YARA signature verification, and dynamic threat emulation.
        </p>
      </div>

      {/* Active Case Banner (if a case is already loaded in context) */}
      {caseData && (
        <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={caseData.riskScore > 50 ? 'critical' : 'low'} size="sm" dot>
                {caseData.riskScore > 50 ? `Risk Index: ${caseData.riskScore}/100` : `Low Risk: ${caseData.riskScore}/100`}
              </Badge>
              <span className="text-xs font-mono text-text-muted">
                {caseData.packageName}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-text truncate">
              Active case loaded: {caseData.fileName}
            </h3>
            <p className="text-xs text-text-muted">
              Classification: <span className="text-accent font-medium">{caseData.threatFamily || 'Android Binary'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/cases/${caseData.id}`)}
              className="flex-1 sm:flex-initial"
            >
              View dossier
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                resetAnalysis();
                setUploadFile(null);
                setUploadStatus('');
              }}
              title="Reset current case to upload a new APK"
            >
              New APK
            </Button>
          </div>
        </div>
      )}

      {/* Upload Gateway Card */}
      <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-accent/60 bg-surface-raised/40'
          }`}
        >
          <input
            type="file"
            id="apk-upload-file"
            accept=".apk"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading || contextLoading}
          />
          <label
            htmlFor="apk-upload-file"
            onDrop={handleDrop}
            className="cursor-pointer space-y-3 block"
          >
            <div className="mx-auto w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-accent shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-text text-sm font-semibold hover:underline">
                Select Android APK binary
              </span>{' '}
              <span className="text-text-muted text-sm">or drag and drop here</span>
            </div>
            <p className="text-xs text-text-muted">
              Supports .apk application packages up to 200MB
            </p>
          </label>
        </div>

        {/* Selected File Details */}
        {uploadFile && (
          <div className="p-3.5 bg-surface-raised border border-border rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-accent shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text truncate">{uploadFile.name}</p>
                <p className="text-[11px] font-mono text-text-muted">
                  {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={isUploading || contextLoading}
              onClick={startUpload}
            >
              Start analysis
            </Button>
          </div>
        )}

        {/* Error State */}
        {uploadError && (
          <div className="p-4 bg-critical/10 border border-critical/30 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-critical shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="critical" size="sm">
                    {uploadError.status ? `HTTP ${uploadError.status}` : 'Upload error'}
                  </Badge>
                  <span className="text-xs font-semibold text-text">
                    Analysis gateway error
                  </span>
                </div>
                <p className="text-xs text-text-muted">{uploadError.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setUploadError(null);
                  startUpload();
                }}
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* Live Upload & Processing Status */}
        {uploadStatus && (
          <div className="p-3 bg-surface-raised border border-border rounded-lg text-xs font-sans text-text flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}
      </div>

      {/* Information Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-text-muted">
        <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1">
          <span className="font-semibold text-text block">Static heuristics</span>
          <p>Disassembles AndroidManifest.xml and dex bytecode for dangerous permissions.</p>
        </div>
        <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1">
          <span className="font-semibold text-text block">YARA engine</span>
          <p>Scans binary strings against 12,000+ known mobile trojan signatures.</p>
        </div>
        <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1">
          <span className="font-semibold text-text block">Ledger anchor</span>
          <p>Anchors cryptographic proof of analysis on Ethereum blockchain.</p>
        </div>
      </div>
    </div>
  );
}

export default AnalyzePage;

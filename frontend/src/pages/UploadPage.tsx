import React, { useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

export interface UploadPageProps {
  onViewLab: () => void;
}

export function UploadPage({ onViewLab }: UploadPageProps) {
  const { triggerAnalysis } = useAnalysis();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const startUpload = async () => {
    if (!uploadFile) return;
    setUploadStatus('Uploading target APK binary & compiling static/dynamic heuristics...');
    try {
      await triggerAnalysis(uploadFile);
      setUploadStatus(`Forensic compilation complete for ${uploadFile.name}. Opening Analysis Lab...`);
      setTimeout(() => {
        onViewLab();
      }, 800);
    } catch (err: any) {
      setUploadStatus(`Analysis error: ${err?.message || 'Sandbox processing failed'}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          APK Forensic Sandbox Gateway
        </h2>
        <p className="text-xs font-mono text-[var(--text-muted)]">
          Upload target Android binaries (.apk) for static decompilation, YARA matching, and dynamic behavior emulation.
        </p>
      </div>

      <div className="border border-dashed border-[var(--border)] hover:border-[var(--accent)]/60 transition-colors rounded-2xl p-8 text-center bg-[var(--bg-panel)]">
        <input
          type="file"
          id="apk-upload"
          accept=".apk"
          className="hidden"
          onChange={handleFileUpload}
        />
        <label htmlFor="apk-upload" className="cursor-pointer space-y-3 block">
          <div className="mx-auto w-10 h-10 rounded-2xl bg-[var(--bg-panel-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[var(--text-primary)] font-mono text-xs font-bold hover:underline">
              Select Android APK binary file
            </span>{' '}
            <span className="text-[var(--text-muted)] text-xs">or drag and drop</span>
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)]">
            Maximum file size: 200MB (.apk format)
          </div>
        </label>
      </div>

      {uploadFile && (
        <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{uploadFile.name}</p>
            <p className="text-[10px] font-mono text-[var(--text-muted)]">
              Size: {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={startUpload}
            className="bg-[var(--accent)] hover:bg-[var(--primary-hover)] text-[var(--btn-copilot-text)] px-3.5 py-1.5 rounded-2xl text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            START ANALYSIS
          </button>
        </div>
      )}

      {uploadStatus && (
        <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl text-xs font-mono text-[var(--accent)] flex items-center justify-between">
          <span>{uploadStatus}</span>
          <button
            onClick={onViewLab}
            className="flex items-center gap-1 text-xs font-mono text-[var(--text-primary)] hover:underline"
          >
            View Lab <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadPage;

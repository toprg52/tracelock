import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { AnalysisLabPage } from './AnalysisLabPage';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export function CaseDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { caseData, loadCaseById, isLoading: contextLoading } = useAnalysis();

  const [isFetching, setIsFetching] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!caseId) return;

    // If current caseData matches the requested caseId, no fetch needed
    if (caseData && caseData.id === caseId) {
      setLoadFailed(false);
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setLoadFailed(false);

    loadCaseById(caseId)
      .then((success) => {
        if (!isMounted) return;
        setIsFetching(false);
        if (!success) {
          setLoadFailed(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setIsFetching(false);
        setLoadFailed(true);
      });

    return () => {
      isMounted = false;
    };
  }, [caseId, caseData?.id, loadCaseById]);

  // Loading Skeleton State
  if (isFetching || (contextLoading && !caseData)) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto py-2" aria-label="Loading case details" aria-busy="true">
        {/* Header Skeleton Card */}
        <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton width="160px" height="22px" className="rounded-full" />
                <Skeleton width="220px" height="22px" className="rounded-full" />
              </div>
              <Skeleton width="280px" height="28px" />
              <Skeleton width="480px" height="16px" />
            </div>
            <div className="flex items-center gap-6">
              <div className="space-y-1.5 text-right">
                <Skeleton width="100px" height="14px" className="ml-auto" />
                <Skeleton width="60px" height="32px" className="ml-auto" />
              </div>
              <Skeleton width="130px" height="38px" className="rounded-lg" />
            </div>
          </div>
        </div>

        {/* Sub-tabs Skeleton Bar */}
        <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <Skeleton key={idx} width="140px" height="36px" className="rounded-lg shrink-0" />
          ))}
        </div>

        {/* Workspace Panel Skeleton */}
        <div className="bg-surface border border-border rounded-xl p-6 min-h-[460px] space-y-4">
          <Skeleton width="240px" height="20px" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <Skeleton height="140px" className="rounded-xl" />
            <Skeleton height="140px" className="rounded-xl md:col-span-2" />
          </div>
          <Skeleton height="200px" className="rounded-xl mt-4" />
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (loadFailed || (!caseData && !isFetching)) {
    return (
      <div className="py-16 max-w-2xl mx-auto">
        <EmptyState
          icon={<ShieldAlert className="w-8 h-8 text-severity-critical" />}
          title={`Case not found: ${caseId || 'Unknown'}`}
          description={`The requested forensic case could not be retrieved from the backend API or local cache. Verify the case identifier or submit an APK for immediate sandbox decompilation.`}
          action={
            <Button
              variant="primary"
              iconRight={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/analyze')}
            >
              Analyze an APK
            </Button>
          }
          secondaryAction={
            <Button
              variant="secondary"
              iconLeft={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  // Loaded successfully: render Analysis Lab panels
  return <AnalysisLabPage />;
}

export default CaseDetailsPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage as LandingComponent } from '../components/landing/LandingPage';

export interface LandingPageProps {
  onLaunchDashboard?: () => void;
  onUploadApk?: () => void;
  onSelectSampleApk?: (apkName: string) => void;
}

export function LandingPage({ onLaunchDashboard, onUploadApk, onSelectSampleApk }: LandingPageProps) {
  const navigate = useNavigate();

  const handleSelectSample = (apkName: string) => {
    if (onSelectSampleApk) {
      onSelectSampleApk(apkName);
    } else {
      navigate(`/analyze?sample=${encodeURIComponent(apkName)}`);
    }
  };

  return (
    <LandingComponent
      onLaunchDashboard={onLaunchDashboard || (() => navigate('/dashboard'))}
      onUploadApk={onUploadApk || (() => navigate('/analyze'))}
      onSelectSampleApk={handleSelectSample}
    />
  );
}

export default LandingPage;

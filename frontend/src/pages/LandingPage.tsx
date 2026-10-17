import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage as LandingComponent } from '../components/landing/LandingPage';

export interface LandingPageProps {
  onLaunchDashboard?: () => void;
  onUploadApk?: () => void;
}

export function LandingPage({ onLaunchDashboard, onUploadApk }: LandingPageProps) {
  const navigate = useNavigate();

  return (
    <LandingComponent
      onLaunchDashboard={onLaunchDashboard || (() => navigate('/dashboard'))}
      onUploadApk={onUploadApk || (() => navigate('/analyze'))}
    />
  );
}

export default LandingPage;

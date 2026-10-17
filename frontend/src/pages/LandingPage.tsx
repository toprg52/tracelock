import React from 'react';
import { LandingPage as LandingComponent } from '../components/landing/LandingPage';

export interface LandingPageProps {
  onLaunchDashboard: () => void;
  onUploadApk: () => void;
}

export function LandingPage({ onLaunchDashboard, onUploadApk }: LandingPageProps) {
  return (
    <LandingComponent
      onLaunchDashboard={onLaunchDashboard}
      onUploadApk={onUploadApk}
    />
  );
}

export default LandingPage;

import React from 'react';
import { DemoWalkthroughPage as DemoWalkthroughComponent } from '../components/landing/DemoWalkthroughPage';

export interface DemoWalkthroughPageProps {
  onGoToLiveLab: () => void;
}

export function DemoWalkthroughPage({ onGoToLiveLab }: DemoWalkthroughPageProps) {
  return (
    <DemoWalkthroughComponent
      onGoToLiveLab={onGoToLiveLab}
    />
  );
}

export default DemoWalkthroughPage;

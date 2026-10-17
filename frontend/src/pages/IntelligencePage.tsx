import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowRight } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export function IntelligencePage() {
  const navigate = useNavigate();

  return (
    <div className="py-16 max-w-2xl mx-auto">
      <EmptyState
        icon={<Globe className="w-8 h-8 text-accent" />}
        title="Threat Intelligence"
        description="Coming soon: Threat Intelligence. Monitor global malware actor campaigns, cross-case infrastructure correlations, and live IOC feed subscriptions."
        action={
          <Button
            variant="primary"
            iconRight={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        }
      />
    </div>
  );
}

export default IntelligencePage;

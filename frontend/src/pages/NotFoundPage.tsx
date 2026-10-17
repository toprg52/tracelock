import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="py-16 max-w-2xl mx-auto">
      <EmptyState
        icon={<AlertCircle className="w-8 h-8 text-severity-high" />}
        title="404 - Page not found"
        description="The requested route does not exist or has been relocated in the Tracelock navigation architecture."
        action={
          <Button
            variant="primary"
            iconLeft={<Home className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        }
        secondaryAction={
          <Button
            variant="secondary"
            iconLeft={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        }
      />
    </div>
  );
}

export default NotFoundPage;

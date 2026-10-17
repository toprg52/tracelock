import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, ArrowRight } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export function CasesPage() {
  const navigate = useNavigate();

  return (
    <div className="py-16 max-w-2xl mx-auto">
      <EmptyState
        icon={<FolderGit2 className="w-8 h-8 text-accent" />}
        title="Cases"
        description="Coming soon: Cases repository and historical archive. Browse completed forensic investigations, chain-of-custody ledgers, and forensic triage reports."
        action={
          <Button
            variant="primary"
            iconRight={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/analyze')}
          >
            Analyze an APK
          </Button>
        }
      />
    </div>
  );
}

export default CasesPage;

import { useNavigate } from '@tanstack/react-router';
import GamingCard from '../common/GamingCard';
import GamingButton from '../common/GamingButton';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <GamingCard glowColor="none">
        <div className="text-center py-12 space-y-6">
          <ShieldAlert className="text-destructive mx-auto" size={80} />
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the admin panel.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This area is restricted to administrators only.
            </p>
          </div>
          <GamingButton onClick={() => navigate({ to: '/dashboard' })} variant="secondary">
            Back to Dashboard
          </GamingButton>
        </div>
      </GamingCard>
    </div>
  );
}

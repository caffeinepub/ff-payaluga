import { useState, useEffect, ReactNode } from 'react';
import { Lock, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import GamingButton from '../common/GamingButton';
import GamingCard from '../common/GamingCard';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { useActor } from '../../hooks/useActor';

const SESSION_KEY = 'tnff_admin_role';

interface TournamentPasswordGuardProps {
  children: ReactNode;
}

export default function TournamentPasswordGuard({ children }: TournamentPasswordGuardProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [actorError, setActorError] = useState<string | null>(null);
  const { actor, isFetching: actorLoading } = useActor();

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] TournamentPasswordGuard - Checking session authentication`);
    
    const sessionAuth = sessionStorage.getItem(SESSION_KEY);
    if (sessionAuth === 'admin') {
      console.log(`[${timestamp}] TournamentPasswordGuard - Admin role found in session`);
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] TournamentPasswordGuard - Actor state:`, {
      actorAvailable: !!actor,
      actorLoading,
    });

    if (!actorLoading && !actor) {
      const errorMsg = 'Unable to connect to authentication service';
      console.error(`[${timestamp}] TournamentPasswordGuard - ${errorMsg}`);
      setActorError(errorMsg);
    } else if (actor) {
      console.log(`[${timestamp}] TournamentPasswordGuard - Actor initialized successfully`);
      setActorError(null);
    }
  }, [actor, actorLoading]);

  const handleRetry = () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] TournamentPasswordGuard - Manual retry requested`);
    setActorError(null);
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] TournamentPasswordGuard - Authentication attempt started`);

    if (!actor || actorLoading) {
      const errorMsg = 'Actor not available. Please wait for connection to complete.';
      console.error(`[${timestamp}] TournamentPasswordGuard - ${errorMsg}`);
      toast.error(errorMsg);
      setActorError(errorMsg);
      return;
    }

    setIsVerifying(true);

    try {
      console.log(`[${timestamp}] TournamentPasswordGuard - Calling backend isCallerAdmin`);
      
      const isAdmin = await actor.isCallerAdmin();
      
      console.log(`[${timestamp}] TournamentPasswordGuard - Backend response:`, { isAdmin });

      if (isAdmin) {
        console.log(`[${timestamp}] TournamentPasswordGuard - Authentication successful, storing admin role`);
        // Store admin role in session storage BEFORE setting authenticated state
        sessionStorage.setItem(SESSION_KEY, 'admin');
        setIsAuthenticated(true);
        toast.success('Access granted to Tournament Management Portal');
      } else {
        console.warn(`[${timestamp}] TournamentPasswordGuard - Authentication failed - not admin`);
        toast.error('Access denied. Admin privileges required.');
        setPassword('');
      }
    } catch (error: any) {
      const errorTimestamp = new Date().toISOString();
      console.error(`[${errorTimestamp}] TournamentPasswordGuard - Authentication error:`, {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      
      toast.error(error.message || 'Authentication failed. Please try again.');
      setPassword('');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isChecking || actorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gaming-texture">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {actorLoading ? 'Connecting to authentication service...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  if (actorError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gaming-texture p-4">
        <GamingCard glowColor="orange" className="w-full max-w-md">
          <div className="text-center space-y-6">
            <AlertCircle className="text-destructive mx-auto" size={64} />
            <div>
              <h2 className="text-2xl font-bold text-destructive mb-2">Connection Error</h2>
              <p className="text-muted-foreground mb-4">
                Unable to connect to authentication service. Please refresh and try again.
              </p>
              <p className="text-sm text-muted-foreground">
                Error: {actorError}
              </p>
            </div>
            <GamingButton onClick={handleRetry} className="w-full">
              <RefreshCw size={18} className="mr-2" />
              Retry Connection
            </GamingButton>
          </div>
        </GamingCard>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gaming-texture p-4">
        <GamingCard glowColor="orange" className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ff-orange/20 mb-4">
              <Shield className="text-ff-orange" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-ff-orange mb-2">Tournament Admin Portal</h2>
            <p className="text-muted-foreground">Enter password to access tournament management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                <Lock size={16} className="text-ff-orange" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-ff-orange/30 focus:border-ff-orange"
                autoFocus
                required
                disabled={isVerifying || !actor || actorLoading}
              />
            </div>

            <GamingButton 
              type="submit" 
              className="w-full"
              disabled={isVerifying || !actor || actorLoading}
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Unlock Portal'
              )}
            </GamingButton>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              This portal is protected. Only authorized administrators should access this area.
            </p>
          </div>
        </GamingCard>
      </div>
    );
  }

  return <>{children}</>;
}

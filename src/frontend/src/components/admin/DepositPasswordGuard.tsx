import { useState, useEffect, ReactNode } from 'react';
import { Lock, Shield } from 'lucide-react';
import GamingButton from '../common/GamingButton';
import GamingCard from '../common/GamingCard';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

const CORRECT_PASSWORD = 'admin123';
const SESSION_KEY = 'deposit_admin_authenticated';

interface DepositPasswordGuardProps {
  children: ReactNode;
}

export default function DepositPasswordGuard({ children }: DepositPasswordGuardProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem(SESSION_KEY);
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
      toast.success('Access granted to Deposit Management Portal');
    } else {
      toast.error('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gaming-texture">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-cyan"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gaming-texture p-4">
        <GamingCard glowColor="cyan" className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ff-cyan/20 mb-4">
              <Shield className="text-ff-cyan" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-ff-cyan mb-2">Deposit Admin Portal</h2>
            <p className="text-muted-foreground">Enter password to access coin deposit management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                <Lock size={16} className="text-ff-cyan" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-ff-cyan/30 focus:border-ff-cyan"
                autoFocus
                required
              />
            </div>

            <GamingButton type="submit" variant="secondary" className="w-full">
              Unlock Portal
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

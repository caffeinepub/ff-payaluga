import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import GamingButton from '../common/GamingButton';
import GamingCard from '../common/GamingCard';
import { Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

const CORRECT_PASSWORD = 'Niranjan@123';
const SESSION_KEY = 'admin_authenticated';

interface AdminPasswordGuardProps {
  children: React.ReactNode;
}

export default function AdminPasswordGuard({ children }: AdminPasswordGuardProps) {
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
      toast.success('Access granted!');
    } else {
      toast.error('Incorrect password. Access denied.');
      setPassword('');
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <GamingCard glowColor="orange" className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="text-ff-orange" size={48} />
            <Lock className="text-ff-orange" size={36} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-ff-orange mb-2">Admin Access</h2>
            <p className="text-muted-foreground">Enter password to access admin controls</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="admin-password" className="text-foreground">
                Admin Password
              </Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-muted-foreground/20 focus:border-ff-orange text-lg"
                required
                autoFocus
              />
            </div>
            <GamingButton type="submit" className="w-full">
              <Lock size={18} className="mr-2" />
              Unlock Admin Panel
            </GamingButton>
          </form>

          <div className="bg-ff-orange/10 border border-ff-orange/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-ff-orange">Note:</strong> Only authorized administrators can access this panel.
            </p>
          </div>
        </div>
      </GamingCard>
    </div>
  );
}

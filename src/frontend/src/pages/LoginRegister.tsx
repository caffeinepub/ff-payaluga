import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import GamingButton from '../components/common/GamingButton';
import GamingCard from '../components/common/GamingCard';
import { LogIn } from 'lucide-react';

export default function LoginRegister() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <GamingCard>
        <div className="text-center space-y-6">
          <img
            src="/assets/generated/ff-logo.dim_200x200.png"
            alt="FF Logo"
            className="h-24 w-24 mx-auto"
          />
          <div>
            <h1 className="text-3xl font-bold text-ff-orange mb-2">Welcome to FF PAYALUGA</h1>
            <p className="text-muted-foreground">
              Login to access tournaments and manage your wallet
            </p>
          </div>

          <div className="space-y-4">
            <GamingButton
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                'Logging in...'
              ) : (
                <>
                  <LogIn className="mr-2" size={20} />
                  Login with Internet Identity
                </>
              )}
            </GamingButton>

            <p className="text-sm text-muted-foreground">
              New users will be automatically registered upon first login
            </p>
          </div>

          <div className="pt-6 border-t border-border/50">
            <h3 className="font-semibold text-foreground mb-2">What you get:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Unique User ID</li>
              <li>• Personal wallet for deposits</li>
              <li>• Access to 1v1 tournaments</li>
              <li>• Secure payment system</li>
            </ul>
          </div>
        </div>
      </GamingCard>
    </div>
  );
}

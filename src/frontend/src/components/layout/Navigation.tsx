import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, X, Home, Wallet, Trophy, Shield, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import GamingButton from '../common/GamingButton';

export default function Navigation() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-ff-orange/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/assets/generated/ff-logo.dim_200x200.png" alt="FF Logo" className="h-10 w-10" />
            <span className="text-xl font-bold text-ff-orange">FF PAYALUGA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors"
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors"
                >
                  <Trophy size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/wallet"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors"
                >
                  <Wallet size={18} />
                  <span>Wallet</span>
                </Link>
                <Link
                  to="/tournament"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors"
                >
                  <Trophy size={18} />
                  <span>Tournament</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors"
                  >
                    <Shield size={18} />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
            <GamingButton
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'secondary' : 'primary'}
              size="sm"
            >
              {isLoggingIn ? (
                'Logging in...'
              ) : isAuthenticated ? (
                <>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn size={16} className="mr-2" />
                  Login
                </>
              )}
            </GamingButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground hover:text-ff-orange transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border/50">
            <Link
              to="/"
              className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/wallet"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Wallet size={18} />
                  <span>Wallet</span>
                </Link>
                <Link
                  to="/tournament"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy size={18} />
                  <span>Tournament</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield size={18} />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
            <GamingButton
              onClick={() => {
                handleAuth();
                setMobileMenuOpen(false);
              }}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'secondary' : 'primary'}
              className="w-full"
            >
              {isLoggingIn ? (
                'Logging in...'
              ) : isAuthenticated ? (
                <>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn size={16} className="mr-2" />
                  Login
                </>
              )}
            </GamingButton>
          </div>
        )}
      </div>
    </nav>
  );
}

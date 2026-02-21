import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetPendingDeposits } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, X, Home, Wallet, Trophy, Shield, LogIn, LogOut, Flame } from 'lucide-react';
import { useState } from 'react';
import GamingButton from '../common/GamingButton';

export default function Navigation() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: pendingDeposits } = useGetPendingDeposits();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const pendingCount = pendingDeposits?.length || 0;

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
    <nav className="bg-card/90 backdrop-blur-md border-b-2 border-ff-orange/40 sticky top-0 z-50 shadow-lg shadow-ff-orange/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Owner Name & Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="/assets/generated/ff-logo.dim_200x200.png" 
                  alt="FF Logo" 
                  className="h-10 w-10 group-hover:scale-110 transition-transform duration-200" 
                />
                <div className="absolute inset-0 bg-ff-orange/20 rounded-full blur-md group-hover:bg-ff-orange/30 transition-all"></div>
              </div>
              <span className="text-xl font-bold text-ff-orange font-gaming">TN FF BATTLE</span>
            </Link>
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-ff-orange/20 to-ff-gold/20 border border-ff-orange/40 rounded-lg">
              <Flame className="w-4 h-4 text-ff-orange" />
              <span className="text-sm font-bold text-ff-orange text-shadow-ff tracking-wider uppercase">
                NIRANJAN
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors font-medium"
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors font-medium"
                >
                  <Trophy size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/wallet"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors font-medium"
                >
                  <Wallet size={18} />
                  <span>Wallet</span>
                </Link>
                <Link
                  to="/tournament"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors font-medium"
                >
                  <Trophy size={18} />
                  <span>Tournament</span>
                </Link>
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors font-medium relative"
                >
                  <Shield size={18} />
                  <span>Admin Panel</span>
                  {isAdmin && pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-ff-orange text-background rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse shadow-ff-orange">
                      {pendingCount}
                    </span>
                  )}
                </Link>
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
            {/* Owner Name Mobile */}
            <div className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-ff-orange/20 to-ff-gold/20 border border-ff-orange/40 rounded-lg mb-3">
              <Flame className="w-4 h-4 text-ff-orange" />
              <span className="text-sm font-bold text-ff-orange text-shadow-ff tracking-wider uppercase">
                NIRANJAN
              </span>
            </div>
            
            <Link
              to="/"
              className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/wallet"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Wallet size={18} />
                  <span>Wallet</span>
                </Link>
                <Link
                  to="/tournament"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy size={18} />
                  <span>Tournament</span>
                </Link>
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-foreground hover:text-ff-orange transition-colors py-2 font-medium relative"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield size={18} />
                  <span>Admin Panel</span>
                  {isAdmin && pendingCount > 0 && (
                    <span className="ml-2 bg-ff-orange text-background rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-ff-orange">
                      {pendingCount}
                    </span>
                  )}
                </Link>
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

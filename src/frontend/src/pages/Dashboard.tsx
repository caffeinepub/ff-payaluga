import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetUserBalance, useGetTournamentInfo } from '../hooks/useQueries';
import GamingCard from '../components/common/GamingCard';
import GamingButton from '../components/common/GamingButton';
import { Wallet, Trophy, User, Coins } from 'lucide-react';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: balance, isLoading: balanceLoading } = useGetUserBalance();
  const { data: tournamentInfo, isLoading: tournamentLoading } = useGetTournamentInfo();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ff-orange mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {userProfile?.name || 'Player'}!</p>
      </div>

      {/* User Info Card */}
      <GamingCard glowColor="cyan">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-ff-cyan/20 rounded-full">
            <User className="text-ff-cyan" size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground">{userProfile?.name}</h3>
            <p className="text-muted-foreground">{userProfile?.email}</p>
            <p className="text-sm text-ff-cyan mt-1">User ID: {userProfile?.userId.toString()}</p>
          </div>
        </div>
      </GamingCard>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Wallet Balance */}
        <GamingCard glowColor="orange">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Coins className="text-ff-orange" size={24} />
                <h3 className="text-lg font-semibold text-foreground">Wallet Balance</h3>
              </div>
              {balanceLoading ? (
                <p className="text-2xl font-bold text-muted-foreground">Loading...</p>
              ) : (
                <p className="text-4xl font-bold text-ff-orange">{balance?.toString() || '0'} Coins</p>
              )}
            </div>
            <img src="/assets/generated/wallet-icon.dim_128x128.png" alt="Wallet" className="h-16 w-16 opacity-50" />
          </div>
          <GamingButton
            onClick={() => navigate({ to: '/wallet' })}
            className="w-full mt-4"
            variant="secondary"
          >
            <Wallet className="mr-2" size={18} />
            Manage Wallet
          </GamingButton>
        </GamingCard>

        {/* Tournament Status */}
        <GamingCard glowColor="cyan">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="text-ff-cyan" size={24} />
                <h3 className="text-lg font-semibold text-foreground">Tournament Status</h3>
              </div>
              {tournamentLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : (
                <>
                  <p className={`text-2xl font-bold ${tournamentInfo?.status ? 'text-green-500' : 'text-red-500'}`}>
                    {tournamentInfo?.status ? 'OPEN' : 'CLOSED'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Entry Fee: {tournamentInfo?.entryFee.toString()} Coins
                  </p>
                </>
              )}
            </div>
            <img src="/assets/generated/tournament-icon.dim_128x128.png" alt="Tournament" className="h-16 w-16 opacity-50" />
          </div>
          <GamingButton
            onClick={() => navigate({ to: '/tournament' })}
            className="w-full mt-4"
            disabled={!tournamentInfo?.status}
          >
            <Trophy className="mr-2" size={18} />
            {tournamentInfo?.status ? 'Join Tournament' : 'Tournament Closed'}
          </GamingButton>
        </GamingCard>
      </div>

      {/* Quick Actions */}
      <GamingCard>
        <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <GamingButton onClick={() => navigate({ to: '/wallet' })} variant="secondary">
            <Wallet className="mr-2" size={18} />
            Deposit Coins
          </GamingButton>
          <GamingButton
            onClick={() => navigate({ to: '/tournament' })}
            disabled={!tournamentInfo?.status}
          >
            <Trophy className="mr-2" size={18} />
            View Tournaments
          </GamingButton>
        </div>
      </GamingCard>
    </div>
  );
}

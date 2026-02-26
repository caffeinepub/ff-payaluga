import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsAdmin,
  useGetAllUsers,
  useGetPendingDepositRequests,
  useGetAllTournamentJoinRequests,
  useGetTotalBalance,
  useGetTournamentInfo,
  useGetTournamentEntries,
} from '../hooks/useQueries';
import type { TournamentEntryRecord } from '../hooks/useQueries';
import GamingCard from '../components/common/GamingCard';
import GamingButton from '../components/common/GamingButton';
import { Users, Coins, Trophy, TrendingUp, Shield, AlertCircle, CreditCard, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const MAX_SLOTS = 50;

function StatusBadge({ status }: { status: string }) {
  const upper = status.toUpperCase();
  if (upper === 'CONFIRMED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-ff-green/20 text-ff-green border border-ff-green/40">
        <CheckCircle className="w-3 h-3" />
        CONFIRMED
      </span>
    );
  }
  if (upper === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-ff-gold/20 text-ff-gold border border-ff-gold/40">
        <Clock className="w-3 h-3" />
        PENDING
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-muted/40 text-muted-foreground border border-border/40">
      {upper}
    </span>
  );
}

export default function AdminDashboard() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsAdmin();
  const { data: allUsers, isLoading: usersLoading } = useGetAllUsers();
  const { data: pendingDeposits, isLoading: depositsLoading } = useGetPendingDepositRequests();
  const { data: tournamentRequests, isLoading: tournamentLoading } = useGetAllTournamentJoinRequests();
  const { data: totalBalance, isLoading: balanceLoading } = useGetTotalBalance();
  const { data: tournamentInfo, isLoading: tournamentInfoLoading } = useGetTournamentInfo();
  const { data: tournamentEntries, isLoading: entriesLoading, error: entriesError } = useGetTournamentEntries();

  const isAuthenticated = !!identity;

  // Show loading state while checking authentication and admin status
  if (isInitializing || adminLoading || !adminFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <GamingCard glowColor="orange" className="max-w-2xl mx-auto text-center">
          <div className="p-8">
            <Shield className="w-16 h-16 text-ff-orange mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-ff-orange mb-4 font-gaming">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              You must be logged in to access the admin dashboard.
            </p>
            <Link to="/login">
              <GamingButton variant="primary">
                Go to Login
              </GamingButton>
            </Link>
          </div>
        </GamingCard>
      </div>
    );
  }

  // Not authorized (authenticated but not admin)
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <GamingCard glowColor="orange" className="max-w-2xl mx-auto text-center">
          <div className="p-8">
            <AlertCircle className="w-16 h-16 text-ff-red mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-ff-red mb-4 font-gaming">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You do not have permission to access the admin dashboard.
            </p>
            <Link to="/dashboard">
              <GamingButton variant="secondary">
                Back to Dashboard
              </GamingButton>
            </Link>
          </div>
        </GamingCard>
      </div>
    );
  }

  // Admin dashboard content
  const userCount = allUsers?.length || 0;
  const pendingDepositCount = pendingDeposits?.length || 0;
  const tournamentRequestCount = tournamentRequests?.length || 0;
  const totalCoins = totalBalance ? Number(totalBalance) : 0;

  const confirmedEntries = tournamentEntries?.filter(
    (e: TournamentEntryRecord) => e.status.toUpperCase() === 'CONFIRMED'
  ) ?? [];
  const confirmedCount = confirmedEntries.length;
  const totalEntryCount = tournamentEntries?.length ?? 0;
  const slotsFilled = confirmedCount;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ff-orange mb-2 font-gaming text-shadow-ff">
          ADMIN DASHBOARD
        </h1>
        <p className="text-muted-foreground">
          System overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GamingCard glowColor="orange" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Users</p>
              <p className="text-3xl font-bold text-ff-orange font-gaming">
                {usersLoading ? '...' : userCount}
              </p>
            </div>
            <Users className="w-12 h-12 text-ff-orange/50" />
          </div>
        </GamingCard>

        <GamingCard glowColor="cyan" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Deposits</p>
              <p className="text-3xl font-bold text-ff-cyan font-gaming">
                {depositsLoading ? '...' : pendingDepositCount}
              </p>
            </div>
            <Coins className="w-12 h-12 text-ff-cyan/50" />
          </div>
        </GamingCard>

        <GamingCard glowColor="orange" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tournament Requests</p>
              <p className="text-3xl font-bold text-ff-gold font-gaming">
                {tournamentLoading ? '...' : tournamentRequestCount}
              </p>
            </div>
            <Trophy className="w-12 h-12 text-ff-gold/50" />
          </div>
        </GamingCard>

        <GamingCard glowColor="cyan" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Coins</p>
              <p className="text-3xl font-bold text-ff-green font-gaming">
                {balanceLoading ? '...' : totalCoins}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-ff-green/50" />
          </div>
        </GamingCard>
      </div>

      {/* Tournament Status */}
      <GamingCard glowColor="orange" className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-ff-orange mb-4 font-gaming">Tournament Status</h2>
          {tournamentInfoLoading ? (
            <p className="text-muted-foreground">Loading tournament info...</p>
          ) : tournamentInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Entry Fee</p>
                <p className="text-xl font-bold text-ff-cyan">₹{Number(tournamentInfo.entryFee)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className={`text-xl font-bold ${tournamentInfo.status ? 'text-ff-green' : 'text-ff-red'}`}>
                  {tournamentInfo.status ? 'OPEN' : 'CLOSED'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Match Count</p>
                <p className="text-xl font-bold text-ff-gold">{Number(tournamentInfo.matchCount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Match Time</p>
                <p className="text-xl font-bold text-foreground">
                  {tournamentInfo.matchTime > 0 
                    ? new Date(Number(tournamentInfo.matchTime) / 1000000).toLocaleString()
                    : 'Not set'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No tournament info available</p>
          )}
        </div>
      </GamingCard>

      {/* ── ZAP Payment Tournament Entries ── */}
      <GamingCard glowColor="cyan" className="mb-8">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-ff-cyan font-gaming flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                ZAP PAYMENT ENTRIES
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Players registered via ZAP UPI payment gateway
              </p>
            </div>
            {/* Slot usage stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-ff-green font-gaming">
                  {entriesLoading ? '...' : confirmedCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Slot Usage</p>
                <p className={`text-2xl font-bold font-gaming ${slotsFilled >= MAX_SLOTS ? 'text-ff-red' : 'text-ff-cyan'}`}>
                  {entriesLoading ? '...' : `${slotsFilled}/${MAX_SLOTS}`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-ff-gold font-gaming">
                  {entriesLoading ? '...' : totalEntryCount}
                </p>
              </div>
            </div>
          </div>

          {/* Slot progress bar */}
          {!entriesLoading && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Slots filled</span>
                <span>{slotsFilled} / {MAX_SLOTS}</span>
              </div>
              <div className="w-full bg-background/50 rounded-full h-2.5 border border-border/50">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    slotsFilled >= MAX_SLOTS
                      ? 'bg-ff-red'
                      : slotsFilled > MAX_SLOTS * 0.8
                      ? 'bg-ff-gold'
                      : 'bg-ff-cyan'
                  }`}
                  style={{ width: `${Math.min(100, (slotsFilled / MAX_SLOTS) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Entries table */}
          {entriesLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading entries...</span>
            </div>
          ) : entriesError ? (
            <div className="flex items-center gap-3 p-4 bg-ff-red/10 border border-ff-red/30 rounded-lg text-ff-red">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                {(entriesError as Error)?.message?.includes('not available') || (entriesError as Error)?.message?.includes('getTournamentEntries')
                  ? 'Tournament entries feature requires a backend update. Please deploy the updated backend with getTournamentEntries support.'
                  : (entriesError as Error)?.message || 'Failed to load tournament entries.'}
              </p>
            </div>
          ) : !tournamentEntries || tournamentEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tournament entries yet</p>
              <p className="text-sm mt-1">Entries will appear here once players register via ZAP UPI payment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ff-cyan/20">
                    <th className="text-left py-3 px-3 text-ff-cyan font-gaming text-xs uppercase tracking-wider">#</th>
                    <th className="text-left py-3 px-3 text-ff-cyan font-gaming text-xs uppercase tracking-wider">Name</th>
                    <th className="text-left py-3 px-3 text-ff-cyan font-gaming text-xs uppercase tracking-wider">Game ID</th>
                    <th className="text-left py-3 px-3 text-ff-cyan font-gaming text-xs uppercase tracking-wider">Payment ID</th>
                    <th className="text-left py-3 px-3 text-ff-cyan font-gaming text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-3 text-ff-cyan font-gaming text-xs uppercase tracking-wider">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {tournamentEntries.map((entry: TournamentEntryRecord, idx: number) => (
                    <tr
                      key={entry.id ?? idx}
                      className="border-b border-border/20 hover:bg-ff-cyan/5 transition-colors"
                    >
                      <td className="py-3 px-3 text-muted-foreground font-mono">{entry.id}</td>
                      <td className="py-3 px-3 font-medium text-foreground">{entry.name}</td>
                      <td className="py-3 px-3 font-mono text-ff-gold">{entry.game_id}</td>
                      <td className="py-3 px-3 font-mono text-xs text-muted-foreground max-w-[160px] truncate" title={entry.payment_id}>
                        {entry.payment_id || <span className="italic opacity-50">—</span>}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        {entry.created_at
                          ? new Date(entry.created_at).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </GamingCard>

      {/* Quick Actions */}
      <GamingCard glowColor="cyan" className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-ff-cyan mb-4 font-gaming">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/admin/deposits" className="block">
              <GamingButton variant="primary" className="w-full">
                Manage Deposits
              </GamingButton>
            </a>
            <a href="/admin/tournament" className="block">
              <GamingButton variant="secondary" className="w-full">
                Manage Tournament
              </GamingButton>
            </a>
            <a href="/admin/users" className="block">
              <GamingButton variant="primary" className="w-full">
                View All Users
              </GamingButton>
            </a>
          </div>
        </div>
      </GamingCard>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Deposits */}
        <GamingCard glowColor="orange">
          <div className="p-6">
            <h3 className="text-xl font-bold text-ff-orange mb-4 font-gaming">Recent Deposit Requests</h3>
            {depositsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : pendingDeposits && pendingDeposits.length > 0 ? (
              <div className="space-y-3">
                {pendingDeposits.slice(0, 5).map((deposit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-ff-orange/20">
                    <div>
                      <p className="text-sm font-medium">User ID: {Number(deposit.userId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(deposit.timestamp) / 1000000).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-ff-cyan">₹{Number(deposit.amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending deposits</p>
            )}
          </div>
        </GamingCard>

        {/* Tournament Requests */}
        <GamingCard glowColor="cyan">
          <div className="p-6">
            <h3 className="text-xl font-bold text-ff-cyan mb-4 font-gaming">Recent Tournament Joins</h3>
            {tournamentLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : tournamentRequests && tournamentRequests.length > 0 ? (
              <div className="space-y-3">
                {tournamentRequests.slice(0, 5).map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-ff-cyan/20">
                    <div>
                      <p className="text-sm font-medium">UID: {request.freeFireUid}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(request.joinTimestamp) / 1000000).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-ff-gold">₹{Number(request.entryFeePaid)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No tournament requests</p>
            )}
          </div>
        </GamingCard>
      </div>
    </div>
  );
}

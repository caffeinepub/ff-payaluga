import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetEntryCount, useCreateOrder } from '../hooks/useQueries';
import GamingCard from '../components/common/GamingCard';
import GamingButton from '../components/common/GamingButton';
import { Link } from '@tanstack/react-router';
import { Trophy, User, Gamepad2, AlertCircle, CheckCircle, Loader2, Lock, CreditCard } from 'lucide-react';

const MAX_SLOTS = 50;

export default function TournamentEntry() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [formError, setFormError] = useState('');

  const { data: entryCount, isLoading: countLoading } = useGetEntryCount();
  const createOrderMutation = useCreateOrder();

  const currentCount = entryCount ?? 0;
  const slotsLeft = Math.max(0, MAX_SLOTS - currentCount);
  const isFull = currentCount >= MAX_SLOTS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter your player name.');
      return;
    }
    if (!gameId.trim()) {
      setFormError('Please enter your Free Fire Game ID.');
      return;
    }
    if (isFull) {
      setFormError('All slots are filled. No more entries allowed.');
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({ name: name.trim(), gameId: gameId.trim() });
      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create payment order. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <GamingCard glowColor="orange" className="max-w-lg mx-auto text-center">
          <div className="p-8">
            <Lock className="w-16 h-16 text-ff-orange mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-ff-orange mb-4 font-gaming">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              You must be logged in to register for the tournament.
            </p>
            <Link to="/login">
              <GamingButton variant="primary">Go to Login</GamingButton>
            </Link>
          </div>
        </GamingCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <img
            src="/assets/generated/tournament-icon.dim_128x128.png"
            alt="Tournament"
            className="h-16 w-16 mr-4"
          />
          <div>
            <h1 className="text-4xl font-bold text-ff-orange font-gaming text-shadow-ff">
              TOURNAMENT ENTRY
            </h1>
            <p className="text-muted-foreground mt-1">Register & Pay ₹50 to Secure Your Slot</p>
          </div>
        </div>
      </div>

      {/* Slot Availability Banner */}
      <GamingCard glowColor={isFull ? 'none' : 'cyan'} className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className={`w-8 h-8 ${isFull ? 'text-ff-red' : 'text-ff-cyan'}`} />
            <div>
              <p className="text-sm text-muted-foreground">Slot Availability</p>
              <p className={`text-2xl font-bold font-gaming ${isFull ? 'text-ff-red' : 'text-ff-cyan'}`}>
                {countLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                  </span>
                ) : (
                  `${currentCount} / ${MAX_SLOTS} Filled`
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Slots Left</p>
            <p className={`text-3xl font-bold font-gaming ${isFull ? 'text-ff-red' : 'text-ff-green'}`}>
              {countLoading ? '...' : slotsLeft}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-background/50 rounded-full h-3 border border-border/50">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-ff-red'
                  : currentCount > MAX_SLOTS * 0.8
                  ? 'bg-ff-gold'
                  : 'bg-ff-cyan'
              }`}
              style={{ width: `${Math.min(100, (currentCount / MAX_SLOTS) * 100)}%` }}
            />
          </div>
        </div>
      </GamingCard>

      {/* Full Slots Warning */}
      {isFull && (
        <div className="mb-6 p-4 bg-ff-red/10 border-2 border-ff-red/40 rounded-xl flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-ff-red shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-ff-red font-gaming">ALL SLOTS FILLED</p>
            <p className="text-sm text-muted-foreground mt-1">
              The tournament is full. No more entries are being accepted at this time.
            </p>
          </div>
        </div>
      )}

      {/* Entry Form */}
      <GamingCard glowColor="orange">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-ff-orange font-gaming flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            REGISTER & PAY
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Entry fee: <span className="text-ff-gold font-bold">₹50</span> — Secure payment via ZAP UPI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Player Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <User className="w-4 h-4 text-ff-orange" />
              Player Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your player name"
              disabled={isFull || createOrderMutation.isPending}
              className="w-full px-4 py-3 bg-background/60 border-2 border-ff-orange/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ff-orange/70 focus:ring-2 focus:ring-ff-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={50}
            />
          </div>

          {/* Free Fire Game ID */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Gamepad2 className="w-4 h-4 text-ff-cyan" />
              Free Fire Game ID
            </label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter your Free Fire Game ID (UID)"
              disabled={isFull || createOrderMutation.isPending}
              className="w-full px-4 py-3 bg-background/60 border-2 border-ff-cyan/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ff-cyan/70 focus:ring-2 focus:ring-ff-cyan/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={20}
            />
          </div>

          {/* Form Error */}
          {formError && (
            <div className="flex items-start space-x-2 p-3 bg-ff-red/10 border border-ff-red/40 rounded-lg">
              <AlertCircle className="w-5 h-5 text-ff-red shrink-0 mt-0.5" />
              <p className="text-sm text-ff-red">{formError}</p>
            </div>
          )}

          {/* Success hint */}
          {createOrderMutation.isSuccess && (
            <div className="flex items-start space-x-2 p-3 bg-ff-green/10 border border-ff-green/40 rounded-lg">
              <CheckCircle className="w-5 h-5 text-ff-green shrink-0 mt-0.5" />
              <p className="text-sm text-ff-green">Order created! Redirecting to payment...</p>
            </div>
          )}

          {/* Submit Button */}
          <GamingButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isFull || createOrderMutation.isPending || countLoading}
          >
            {createOrderMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Order...
              </span>
            ) : isFull ? (
              'SLOTS FULL — REGISTRATION CLOSED'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />
                PAY ₹50 & REGISTER
              </span>
            )}
          </GamingButton>
        </form>

        {/* Info Footer */}
        <div className="mt-6 pt-4 border-t border-border/30">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <span className="text-ff-orange font-bold">💳 Secure Payment</span>
              <span>ZAP UPI Gateway</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-ff-cyan font-bold">🏆 Entry Fee</span>
              <span>₹50 per player</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-ff-gold font-bold">🎮 Max Players</span>
              <span>50 slots only</span>
            </div>
          </div>
        </div>
      </GamingCard>
    </div>
  );
}

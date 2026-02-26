import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetTournamentInfo, useGetUserBalance, useJoinTournament } from '../hooks/useQueries';
import GamingCard from '../components/common/GamingCard';
import GamingButton from '../components/common/GamingButton';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Trophy, Coins, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function TournamentPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: tournamentInfo, isLoading: tournamentLoading } = useGetTournamentInfo();
  const { data: balance } = useGetUserBalance();
  const joinTournament = useJoinTournament();
  const [freeFireUid, setFreeFireUid] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const isAuthenticated = !!identity;
  const isTournamentOpen = tournamentInfo?.status || false;
  const entryFee = Number(tournamentInfo?.entryFee || 0n);
  const userBalance = Number(balance || 0n);
  const hasInsufficientBalance = userBalance < entryFee;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeFireUid.trim() || !whatsappNumber.trim()) return;

    joinTournament.mutate(
      { freeFireUid: freeFireUid.trim(), whatsappNumber: whatsappNumber.trim() },
      {
        onSuccess: () => {
          setFreeFireUid('');
          setWhatsappNumber('');
        },
      }
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ff-orange mb-2">Tournament</h1>
        <p className="text-muted-foreground">Free Fire Clash Squad 1v1</p>
      </div>

      {/* Tournament Status Banner */}
      <GamingCard glowColor={isTournamentOpen ? 'cyan' : 'none'}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className={isTournamentOpen ? 'text-ff-cyan' : 'text-muted-foreground'} size={28} />
              <h2 className="text-2xl font-bold text-foreground">Tournament Status</h2>
            </div>
            {tournamentLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <>
                <p className={`text-4xl font-bold ${isTournamentOpen ? 'text-green-500' : 'text-red-500'}`}>
                  {isTournamentOpen ? 'OPEN' : 'CLOSED'}
                </p>
                <p className="text-muted-foreground mt-2">
                  Entry Fee: <span className="text-ff-orange font-semibold">{entryFee} Coins</span>
                </p>
                <p className="text-muted-foreground">
                  Your Balance: <span className="text-ff-cyan font-semibold">{userBalance} Coins</span>
                </p>
              </>
            )}
          </div>
          <img src="/assets/generated/tournament-icon.dim_128x128.png" alt="Tournament" className="h-24 w-24 opacity-50" />
        </div>
      </GamingCard>

      {/* Join Tournament Form */}
      {isTournamentOpen ? (
        <GamingCard glowColor="orange">
          <h2 className="text-2xl font-bold text-foreground mb-4">Join Tournament</h2>

          {hasInsufficientBalance && (
            <Alert className="mb-4 border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                Insufficient balance! You need {entryFee} coins to join. Please deposit more coins.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="freeFireUid" className="text-foreground">
                Free Fire UID
              </Label>
              <Input
                id="freeFireUid"
                type="text"
                placeholder="Enter your Free Fire UID"
                value={freeFireUid}
                onChange={(e) => setFreeFireUid(e.target.value)}
                className="bg-background border-muted-foreground/20 focus:border-ff-orange"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-foreground">
                WhatsApp Number
              </Label>
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="Enter your WhatsApp number"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="bg-background border-muted-foreground/20 focus:border-ff-orange"
                required
              />
              <p className="text-sm text-muted-foreground">
                Include country code (e.g., +91 for India)
              </p>
            </div>

            <div className="bg-ff-orange/10 border border-ff-orange/30 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>Entry Fee:</strong> {entryFee} Coins will be deducted from your wallet
              </p>
            </div>

            <GamingButton
              type="submit"
              className="w-full"
              disabled={joinTournament.isPending || hasInsufficientBalance || !freeFireUid.trim() || !whatsappNumber.trim()}
            >
              {joinTournament.isPending ? 'Joining...' : `Join Tournament (${entryFee} Coins)`}
            </GamingButton>

            {hasInsufficientBalance && (
              <GamingButton
                type="button"
                onClick={() => navigate({ to: '/wallet' })}
                variant="secondary"
                className="w-full"
              >
                <Coins className="mr-2" size={18} />
                Deposit Coins
              </GamingButton>
            )}
          </form>
        </GamingCard>
      ) : (
        <GamingCard>
          <div className="text-center py-8">
            <Trophy className="text-muted-foreground mx-auto mb-4" size={64} />
            <h3 className="text-2xl font-bold text-foreground mb-2">Tournament Closed</h3>
            <p className="text-muted-foreground mb-6">
              The tournament is currently closed. Please check back later or contact admin for more information.
            </p>
            <GamingButton onClick={() => navigate({ to: '/dashboard' })} variant="secondary">
              Back to Dashboard
            </GamingButton>
          </div>
        </GamingCard>
      )}

      {/* Tournament Info */}
      <GamingCard>
        <h3 className="text-xl font-bold text-foreground mb-4">Tournament Details</h3>
        <div className="space-y-3 text-muted-foreground">
          <p>
            <strong className="text-foreground">Game Mode:</strong> Free Fire Clash Squad 1v1
          </p>
          <p>
            <strong className="text-foreground">Entry Fee:</strong> {entryFee} Coins
          </p>
          <p>
            <strong className="text-foreground">How to Play:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Join the tournament by providing your Free Fire UID and WhatsApp number</li>
            <li>Entry fee will be automatically deducted from your wallet</li>
            <li>Admin will create a custom room and send details via WhatsApp</li>
            <li>Join the room using the provided Room ID and Password</li>
            <li>Compete in 1v1 Clash Squad match</li>
          </ol>
        </div>
      </GamingCard>
    </div>
  );
}

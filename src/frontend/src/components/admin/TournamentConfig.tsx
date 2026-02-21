import { useState, useEffect } from 'react';
import {
  useGetTournamentInfo,
  useSetTournamentEntryOpen,
  useSetEntryFee,
  useSetMatchTime,
  useSetMatchCount,
} from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import GamingButton from '../common/GamingButton';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Settings, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SESSION_KEY = 'tnff_admin_role';

export default function TournamentConfig() {
  const { data: tournamentInfo, isLoading } = useGetTournamentInfo();
  const { actor, isFetching: actorLoading } = useActor();
  const setTournamentStatus = useSetTournamentEntryOpen();
  const setEntryFee = useSetEntryFee();
  const setMatchTime = useSetMatchTime();
  const setMatchCount = useSetMatchCount();

  const [entryFeeInput, setEntryFeeInput] = useState('');
  const [matchCountInput, setMatchCountInput] = useState('');
  const [matchTimeInput, setMatchTimeInput] = useState('');

  // Check session storage for admin role
  useEffect(() => {
    const sessionRole = sessionStorage.getItem(SESSION_KEY);
    if (sessionRole !== 'admin') {
      console.warn('TournamentConfig - Admin role not found in session');
      toast.error('Admin session expired. Please re-authenticate.');
    }
  }, []);

  // Verify actor availability before operations
  const checkActorAvailability = (): boolean => {
    if (!actor || actorLoading) {
      toast.error('Connection not ready. Please wait and try again.');
      return false;
    }
    return true;
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading tournament config...</div>;
  }

  const handleToggleStatus = () => {
    if (!checkActorAvailability()) return;
    setTournamentStatus.mutate(!tournamentInfo?.status);
  };

  const handleUpdateEntryFee = () => {
    if (!checkActorAvailability()) return;
    const fee = parseInt(entryFeeInput);
    if (fee > 0) {
      setEntryFee.mutate(fee);
      setEntryFeeInput('');
    }
  };

  const handleUpdateMatchCount = () => {
    if (!checkActorAvailability()) return;
    const count = parseInt(matchCountInput);
    if (count >= 0) {
      setMatchCount.mutate(count);
      setMatchCountInput('');
    }
  };

  const handleUpdateMatchTime = () => {
    if (!checkActorAvailability()) return;
    const time = new Date(matchTimeInput).getTime() * 1000000;
    if (time > 0) {
      setMatchTime.mutate(BigInt(time));
      setMatchTimeInput('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center">
        <Settings className="mr-2 text-ff-orange" size={24} />
        Tournament Configuration
      </h2>

      {(!actor || actorLoading) && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-destructive" size={20} />
          <p className="text-sm text-destructive">
            Connection not ready. Please wait for actor initialization.
          </p>
        </div>
      )}

      {/* Current Status */}
      <div className="bg-background/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground">Current Settings</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Status:</p>
            <p className={`font-bold ${tournamentInfo?.status ? 'text-green-500' : 'text-red-500'}`}>
              {tournamentInfo?.status ? 'OPEN' : 'CLOSED'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Entry Fee:</p>
            <p className="font-bold text-ff-orange">{tournamentInfo?.entryFee.toString()} Coins</p>
          </div>
          <div>
            <p className="text-muted-foreground">Match Count:</p>
            <p className="font-bold text-foreground">{tournamentInfo?.matchCount.toString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Match Time:</p>
            <p className="font-bold text-foreground">
              {tournamentInfo?.matchTime
                ? new Date(Number(tournamentInfo.matchTime) / 1000000).toLocaleString()
                : 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle Tournament Status */}
      <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
        <div>
          <Label htmlFor="tournament-status" className="text-foreground font-semibold">
            Tournament Status
          </Label>
          <p className="text-sm text-muted-foreground">Open or close tournament entry</p>
        </div>
        <Switch
          id="tournament-status"
          checked={tournamentInfo?.status || false}
          onCheckedChange={handleToggleStatus}
          disabled={setTournamentStatus.isPending || !actor || actorLoading}
        />
      </div>

      {/* Update Entry Fee */}
      <div className="space-y-2">
        <Label htmlFor="entry-fee" className="text-foreground">
          Update Entry Fee
        </Label>
        <div className="flex space-x-2">
          <Input
            id="entry-fee"
            type="number"
            min="1"
            placeholder="Enter new entry fee"
            value={entryFeeInput}
            onChange={(e) => setEntryFeeInput(e.target.value)}
            className="bg-background border-muted-foreground/20"
            disabled={!actor || actorLoading}
          />
          <GamingButton
            onClick={handleUpdateEntryFee}
            disabled={setEntryFee.isPending || !entryFeeInput || !actor || actorLoading}
            variant="secondary"
          >
            Update
          </GamingButton>
        </div>
      </div>

      {/* Update Match Count */}
      <div className="space-y-2">
        <Label htmlFor="match-count" className="text-foreground">
          Update Match Count
        </Label>
        <div className="flex space-x-2">
          <Input
            id="match-count"
            type="number"
            min="0"
            placeholder="Enter match count"
            value={matchCountInput}
            onChange={(e) => setMatchCountInput(e.target.value)}
            className="bg-background border-muted-foreground/20"
            disabled={!actor || actorLoading}
          />
          <GamingButton
            onClick={handleUpdateMatchCount}
            disabled={setMatchCount.isPending || !matchCountInput || !actor || actorLoading}
            variant="secondary"
          >
            Update
          </GamingButton>
        </div>
      </div>

      {/* Update Match Time */}
      <div className="space-y-2">
        <Label htmlFor="match-time" className="text-foreground">
          Update Match Time
        </Label>
        <div className="flex space-x-2">
          <Input
            id="match-time"
            type="datetime-local"
            value={matchTimeInput}
            onChange={(e) => setMatchTimeInput(e.target.value)}
            className="bg-background border-muted-foreground/20"
            disabled={!actor || actorLoading}
          />
          <GamingButton
            onClick={handleUpdateMatchTime}
            disabled={setMatchTime.isPending || !matchTimeInput || !actor || actorLoading}
            variant="secondary"
          >
            Update
          </GamingButton>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useGetPendingTournaments, useSetMatch, useUpdateMatch } from '../../hooks/useQueries';
import GamingButton from '../common/GamingButton';
import GamingCard from '../common/GamingCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Trophy, Plus, Edit, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import type { MatchInfo } from '../../backend';

export default function MatchManagement() {
  const { data: matches, isLoading } = useGetPendingTournaments();
  const setMatch = useSetMatch();
  const updateMatch = useUpdateMatch();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    matchId: '',
    playerUID: '',
    whatsappNumber: '',
    matchTime: '',
  });

  const filteredMatches = matches?.filter(
    (match) =>
      match.playerUID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.whatsappNumber.includes(searchTerm)
  );

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const matchInfo: MatchInfo = {
      playerUID: formData.playerUID,
      whatsappNumber: formData.whatsappNumber,
      matchTime: BigInt(new Date(formData.matchTime).getTime() * 1000000),
    };

    await setMatch.mutateAsync({
      matchId: BigInt(formData.matchId),
      matchInfo,
    });

    setIsCreateDialogOpen(false);
    setFormData({ matchId: '', playerUID: '', whatsappNumber: '', matchTime: '' });
  };

  const handleUpdateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMatchId === null) return;

    const matchInfo: MatchInfo = {
      playerUID: formData.playerUID,
      whatsappNumber: formData.whatsappNumber,
      matchTime: BigInt(new Date(formData.matchTime).getTime() * 1000000),
    };

    await updateMatch.mutateAsync({
      matchId: BigInt(selectedMatchId),
      matchInfo,
    });

    setIsEditDialogOpen(false);
    setSelectedMatchId(null);
    setFormData({ matchId: '', playerUID: '', whatsappNumber: '', matchTime: '' });
  };

  const openEditDialog = (matchId: number, match: MatchInfo) => {
    setSelectedMatchId(matchId);
    setFormData({
      matchId: matchId.toString(),
      playerUID: match.playerUID,
      whatsappNumber: match.whatsappNumber,
      matchTime: new Date(Number(match.matchTime) / 1000000).toISOString().slice(0, 16),
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading matches...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-foreground flex items-center">
          <Trophy className="mr-2 text-ff-orange" size={24} />
          Tournament Matches ({matches?.length || 0})
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search by UID or WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-muted-foreground/20 w-64"
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <GamingButton size="sm">
                <Plus size={16} className="mr-1" />
                Create Match
              </GamingButton>
            </DialogTrigger>
            <DialogContent className="bg-card border-ff-orange/30">
              <DialogHeader>
                <DialogTitle className="text-ff-orange">Create New Match</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div>
                  <Label htmlFor="matchId">Match ID</Label>
                  <Input
                    id="matchId"
                    type="number"
                    value={formData.matchId}
                    onChange={(e) => setFormData({ ...formData, matchId: e.target.value })}
                    required
                    className="bg-background border-muted-foreground/20"
                  />
                </div>
                <div>
                  <Label htmlFor="playerUID">Player Free Fire UID</Label>
                  <Input
                    id="playerUID"
                    value={formData.playerUID}
                    onChange={(e) => setFormData({ ...formData, playerUID: e.target.value })}
                    required
                    className="bg-background border-muted-foreground/20"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    required
                    className="bg-background border-muted-foreground/20"
                  />
                </div>
                <div>
                  <Label htmlFor="matchTime">Match Time</Label>
                  <Input
                    id="matchTime"
                    type="datetime-local"
                    value={formData.matchTime}
                    onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                    required
                    className="bg-background border-muted-foreground/20"
                  />
                </div>
                <GamingButton type="submit" disabled={setMatch.isPending} className="w-full">
                  {setMatch.isPending ? 'Creating...' : 'Create Match'}
                </GamingButton>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!filteredMatches || filteredMatches.length === 0 ? (
        <GamingCard glowColor="cyan">
          <div className="text-center py-8">
            <Trophy className="text-muted-foreground mx-auto mb-4" size={48} />
            <p className="text-muted-foreground">No tournament matches found</p>
          </div>
        </GamingCard>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match ID</TableHead>
                <TableHead>Player UID</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Match Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatches.map((match, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-ff-orange">{index}</TableCell>
                  <TableCell>{match.playerUID}</TableCell>
                  <TableCell>{match.whatsappNumber}</TableCell>
                  <TableCell>
                    {new Date(Number(match.matchTime) / 1000000).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <GamingButton
                      size="sm"
                      variant="secondary"
                      onClick={() => openEditDialog(index, match)}
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </GamingButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-ff-cyan/30">
          <DialogHeader>
            <DialogTitle className="text-ff-cyan">Edit Match</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateMatch} className="space-y-4">
            <div>
              <Label htmlFor="edit-playerUID">Player Free Fire UID</Label>
              <Input
                id="edit-playerUID"
                value={formData.playerUID}
                onChange={(e) => setFormData({ ...formData, playerUID: e.target.value })}
                required
                className="bg-background border-muted-foreground/20"
              />
            </div>
            <div>
              <Label htmlFor="edit-whatsappNumber">WhatsApp Number</Label>
              <Input
                id="edit-whatsappNumber"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                required
                className="bg-background border-muted-foreground/20"
              />
            </div>
            <div>
              <Label htmlFor="edit-matchTime">Match Time</Label>
              <Input
                id="edit-matchTime"
                type="datetime-local"
                value={formData.matchTime}
                onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                required
                className="bg-background border-muted-foreground/20"
              />
            </div>
            <GamingButton type="submit" disabled={updateMatch.isPending} className="w-full" variant="secondary">
              {updateMatch.isPending ? 'Updating...' : 'Update Match'}
            </GamingButton>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

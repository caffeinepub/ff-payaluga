import { useEffect } from 'react';
import { useGetTournamentJoinRequests } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Trophy, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

const SESSION_KEY = 'tnff_admin_role';

export default function JoinRequestsList() {
  const { data: joinRequests, isLoading } = useGetTournamentJoinRequests();
  const [searchTerm, setSearchTerm] = useState('');

  // Check session storage for admin role
  useEffect(() => {
    const sessionRole = sessionStorage.getItem(SESSION_KEY);
    if (sessionRole !== 'admin') {
      console.warn('JoinRequestsList - Admin role not found in session');
      toast.error('Admin session expired. Please re-authenticate.');
    }
  }, []);

  const filteredRequests = joinRequests?.filter(
    (request) =>
      request.freeFireUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.whatsappNumber.includes(searchTerm) ||
      request.userId.toString().includes(searchTerm)
  );

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading join requests...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center">
          <Trophy className="mr-2 text-ff-cyan" size={24} />
          Tournament Join Requests ({joinRequests?.length || 0})
        </h2>
        <Input
          type="text"
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs bg-background border-muted-foreground/20"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User UID</TableHead>
              <TableHead>Free Fire UID</TableHead>
              <TableHead>WhatsApp Number</TableHead>
              <TableHead>Entry Fee</TableHead>
              <TableHead>Join Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests && filteredRequests.length > 0 ? (
              filteredRequests.map((request, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-ff-cyan">{request.userId.toString()}</TableCell>
                  <TableCell>{request.freeFireUid}</TableCell>
                  <TableCell>{request.whatsappNumber}</TableCell>
                  <TableCell className="text-ff-orange">{request.entryFeePaid.toString()} Coins</TableCell>
                  <TableCell>
                    {new Date(Number(request.joinTimestamp) / 1000000).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No join requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

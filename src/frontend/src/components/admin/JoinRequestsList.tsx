import { useGetAllTournamentJoinRequests } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Trophy } from 'lucide-react';
import { Input } from '../ui/input';
import { useState } from 'react';

export default function JoinRequestsList() {
  const { data: joinRequests, isLoading } = useGetAllTournamentJoinRequests();
  const [searchTerm, setSearchTerm] = useState('');

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
                  <TableCell className="font-medium text-ff-orange">{request.userId.toString()}</TableCell>
                  <TableCell className="font-mono">{request.freeFireUid}</TableCell>
                  <TableCell className="font-medium">{request.whatsappNumber}</TableCell>
                  <TableCell>{request.entryFeePaid.toString()} Coins</TableCell>
                  <TableCell>{new Date(Number(request.joinTimestamp) / 1000000).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
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

import { useGetPendingDeposits, useApproveDeposit, useRejectDeposit } from '../../hooks/useQueries';
import GamingButton from '../common/GamingButton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function DepositVerification() {
  const { data: pendingDeposits, isLoading } = useGetPendingDeposits();
  const approveDeposit = useApproveDeposit();
  const rejectDeposit = useRejectDeposit();

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading pending deposits...</div>;
  }

  if (!pendingDeposits || pendingDeposits.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="text-muted-foreground mx-auto mb-4" size={48} />
        <p className="text-muted-foreground">No pending deposit requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Pending Deposit Requests</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingDeposits.map((request, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{request.userId.toString()}</TableCell>
                <TableCell>₹{request.amount.toString()}</TableCell>
                <TableCell>{new Date(Number(request.timestamp) / 1000000).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <GamingButton
                      size="sm"
                      onClick={() => approveDeposit.mutate(BigInt(index))}
                      disabled={approveDeposit.isPending}
                      variant="secondary"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </GamingButton>
                    <GamingButton
                      size="sm"
                      onClick={() => rejectDeposit.mutate(BigInt(index))}
                      disabled={rejectDeposit.isPending}
                      variant="danger"
                    >
                      <XCircle size={16} className="mr-1" />
                      Reject
                    </GamingButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

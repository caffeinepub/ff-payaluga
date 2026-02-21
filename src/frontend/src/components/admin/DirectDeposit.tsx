import { useState } from 'react';
import { useGetAllUsers, useAdminDirectDeposit, useGetDirectDepositHistory } from '../../hooks/useQueries';
import GamingButton from '../common/GamingButton';
import GamingCard from '../common/GamingCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Coins, Search, History } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function DirectDeposit() {
  const { data: users, isLoading: usersLoading } = useGetAllUsers();
  const { data: transactions, isLoading: transactionsLoading } = useGetDirectDepositHistory();
  const adminDirectDeposit = useAdminDirectDeposit();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [coinsAmount, setCoinsAmount] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toString().includes(searchTerm)
  );

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !coinsAmount) {
      return;
    }

    const coins = parseInt(coinsAmount);
    if (coins <= 0 || isNaN(coins)) {
      return;
    }

    await adminDirectDeposit.mutateAsync({
      userId: BigInt(selectedUserId),
      amount: BigInt(coins),
    });

    setSelectedUserId('');
    setCoinsAmount('');
  };

  if (usersLoading) {
    return <div className="text-center text-muted-foreground">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Coins className="mr-2 text-ff-cyan" size={24} />
        <h2 className="text-xl font-bold text-foreground">Direct Coin Deposit</h2>
      </div>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">Add Coins</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-6">
          <GamingCard glowColor="cyan">
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <Label htmlFor="user-search">Search User</Label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="user-search"
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-muted-foreground/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="user-select">Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="bg-background border-muted-foreground/20">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-ff-cyan/30 max-h-60">
                    {filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <SelectItem key={user.userId.toString()} value={user.userId.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {user.userId.toString()} • {user.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">No users found</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="coins-amount">Coins Amount</Label>
                <Input
                  id="coins-amount"
                  type="number"
                  min="1"
                  placeholder="Enter amount of coins to add..."
                  value={coinsAmount}
                  onChange={(e) => setCoinsAmount(e.target.value)}
                  required
                  className="bg-background border-muted-foreground/20"
                />
                <p className="text-xs text-muted-foreground mt-1">Must be a positive integer</p>
              </div>

              <GamingButton
                type="submit"
                variant="secondary"
                disabled={!selectedUserId || !coinsAmount || adminDirectDeposit.isPending}
                className="w-full"
              >
                {adminDirectDeposit.isPending ? 'Adding Coins...' : 'Add Coins to User'}
              </GamingButton>
            </form>
          </GamingCard>
        </TabsContent>

        <TabsContent value="history">
          {transactionsLoading ? (
            <div className="text-center text-muted-foreground">Loading transactions...</div>
          ) : !transactions || transactions.length === 0 ? (
            <GamingCard glowColor="cyan">
              <div className="text-center py-8">
                <History className="text-muted-foreground mx-auto mb-4" size={48} />
                <p className="text-muted-foreground">No direct deposit transactions yet</p>
              </div>
            </GamingCard>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Coins Added</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>{transaction.userId.toString()}</TableCell>
                      <TableCell className="text-ff-cyan font-bold">
                        +{transaction.amount.toString()} coins
                      </TableCell>
                      <TableCell>
                        {new Date(Number(transaction.timestamp) / 1000000).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

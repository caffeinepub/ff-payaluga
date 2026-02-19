import { useGetAllUsers } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Users } from 'lucide-react';
import { Input } from '../ui/input';
import { useState } from 'react';

export default function UserManagement() {
  const { data: users, isLoading } = useGetAllUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toString().includes(searchTerm)
  );

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center">
          <Users className="mr-2 text-ff-cyan" size={24} />
          Registered Users ({users?.length || 0})
        </h2>
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs bg-background border-muted-foreground/20"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.userId.toString()}>
                  <TableCell className="font-medium text-ff-orange">{user.userId.toString()}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

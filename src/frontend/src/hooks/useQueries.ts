import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, AdminDepositRequest, TournamentJoinRequest, TournamentInfo, MatchInfo, DirectDeposit } from '../backend';
import { toast } from 'sonner';
import { getDepositErrorMessage } from '../utils/errorMessages';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetCallerUserProfile - Fetching profile`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetCallerUserProfile - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const profile = await actor.getCallerUserProfile();
      console.log(`[${timestamp}] useGetCallerUserProfile - Profile fetched:`, !!profile);
      return profile;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useSaveCallerUserProfile - Saving profile`);
      
      if (!actor) {
        console.error(`[${timestamp}] useSaveCallerUserProfile - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.saveCallerUserProfile(profile);
      console.log(`[${timestamp}] useSaveCallerUserProfile - Profile saved successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully!');
    },
    onError: (error: Error) => {
      console.error('useSaveCallerUserProfile - Error:', error);
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

export function useGetUserBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['userBalance'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetUserBalance - Fetching balance`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetUserBalance - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const balance = await actor.getUserBalance();
      console.log(`[${timestamp}] useGetUserBalance - Balance fetched:`, balance.toString());
      return balance;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useDeposit - Starting deposit mutation:`, { 
        amount,
        actor: !!actor 
      });
      
      if (!actor) {
        console.error(`[${timestamp}] useDeposit - Actor not available`);
        throw new Error('Actor not available');
      }

      try {
        console.log(`[${timestamp}] useDeposit - Calling actor.deposit with amount:`, amount);
        const result = await actor.deposit(BigInt(amount));
        console.log(`[${timestamp}] useDeposit - Deposit successful, result:`, result.toString());
        return result;
      } catch (error: any) {
        console.error(`[${timestamp}] useDeposit - Backend error:`, {
          message: error?.message,
          stack: error?.stack,
          name: error?.name
        });
        throw error;
      }
    },
    onSuccess: () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useDeposit - Invalidating queries after successful deposit`);
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      queryClient.invalidateQueries({ queryKey: ['pendingDeposits'] });
    },
    onError: (error: Error) => {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] useDeposit - Mutation error:`, {
        message: error.message,
        stack: error.stack
      });
      
      const errorMessage = getDepositErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

export function useGetPendingDeposits() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdminDepositRequest[]>({
    queryKey: ['pendingDeposits'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetPendingDeposits - Fetching pending deposits`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetPendingDeposits - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const deposits = await actor.getPendingDepositRequests();
      console.log(`[${timestamp}] useGetPendingDeposits - Fetched ${deposits.length} pending deposits`);
      return deposits;
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useApproveDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useApproveDeposit - Approving deposit:`, requestId.toString());
      
      if (!actor) {
        console.error(`[${timestamp}] useApproveDeposit - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.approveDeposit(requestId);
      console.log(`[${timestamp}] useApproveDeposit - Deposit approved successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDeposits'] });
      toast.success('Deposit approved successfully!');
    },
    onError: (error: Error) => {
      console.error('useApproveDeposit - Error:', error);
      toast.error(error.message || 'Failed to approve deposit');
    },
  });
}

export function useRejectDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useRejectDeposit - Rejecting deposit:`, requestId.toString());
      
      if (!actor) {
        console.error(`[${timestamp}] useRejectDeposit - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.rejectDeposit(requestId);
      console.log(`[${timestamp}] useRejectDeposit - Deposit rejected successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDeposits'] });
      toast.success('Deposit rejected successfully!');
    },
    onError: (error: Error) => {
      console.error('useRejectDeposit - Error:', error);
      toast.error(error.message || 'Failed to reject deposit');
    },
  });
}

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetAllUsers - Fetching all users`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetAllUsers - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const users = await actor.getAllUsers();
      console.log(`[${timestamp}] useGetAllUsers - Fetched ${users.length} users`);
      return users;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTournamentInfo() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TournamentInfo>({
    queryKey: ['tournamentInfo'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetTournamentInfo - Fetching tournament info`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetTournamentInfo - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const info = await actor.getTournamentInfo();
      console.log(`[${timestamp}] useGetTournamentInfo - Tournament info fetched`);
      return info;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useJoinTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ freeFireUid, whatsappNumber }: { freeFireUid: string; whatsappNumber: string }) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useJoinTournament - Joining tournament:`, { freeFireUid, whatsappNumber });
      
      if (!actor) {
        console.error(`[${timestamp}] useJoinTournament - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.joinTournament(freeFireUid, whatsappNumber);
      console.log(`[${timestamp}] useJoinTournament - Tournament joined successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      queryClient.invalidateQueries({ queryKey: ['tournamentJoinRequests'] });
      toast.success('Successfully joined the tournament!');
    },
    onError: (error: Error) => {
      console.error('useJoinTournament - Error:', error);
      toast.error(error.message || 'Failed to join tournament');
    },
  });
}

export function useGetTournamentJoinRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TournamentJoinRequest[]>({
    queryKey: ['tournamentJoinRequests'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetTournamentJoinRequests - Fetching join requests`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetTournamentJoinRequests - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const requests = await actor.getAllTournamentJoinRequests();
      console.log(`[${timestamp}] useGetTournamentJoinRequests - Fetched ${requests.length} join requests`);
      return requests;
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useIsCallerAdmin - Checking admin status`);
      
      if (!actor) {
        console.error(`[${timestamp}] useIsCallerAdmin - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const isAdmin = await actor.isCallerAdmin();
      console.log(`[${timestamp}] useIsCallerAdmin - Admin status:`, isAdmin);
      return isAdmin;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSetTournamentEntryOpen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isOpen: boolean) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useSetTournamentEntryOpen - Setting tournament status:`, isOpen);
      
      if (!actor) {
        console.error(`[${timestamp}] useSetTournamentEntryOpen - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.setTournamentEntryOpen(isOpen);
      console.log(`[${timestamp}] useSetTournamentEntryOpen - Tournament status updated`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournamentInfo'] });
      toast.success('Tournament status updated!');
    },
    onError: (error: Error) => {
      console.error('useSetTournamentEntryOpen - Error:', error);
      toast.error(error.message || 'Failed to update tournament status');
    },
  });
}

export function useSetEntryFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryFee: number) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useSetEntryFee - Setting entry fee:`, entryFee);
      
      if (!actor) {
        console.error(`[${timestamp}] useSetEntryFee - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.setEntryFee(BigInt(entryFee));
      console.log(`[${timestamp}] useSetEntryFee - Entry fee updated`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournamentInfo'] });
      toast.success('Entry fee updated!');
    },
    onError: (error: Error) => {
      console.error('useSetEntryFee - Error:', error);
      toast.error(error.message || 'Failed to update entry fee');
    },
  });
}

export function useSetMatchTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchTime: bigint) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useSetMatchTime - Setting match time:`, matchTime.toString());
      
      if (!actor) {
        console.error(`[${timestamp}] useSetMatchTime - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.setMatchTime(matchTime);
      console.log(`[${timestamp}] useSetMatchTime - Match time updated`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournamentInfo'] });
      toast.success('Match time updated!');
    },
    onError: (error: Error) => {
      console.error('useSetMatchTime - Error:', error);
      toast.error(error.message || 'Failed to update match time');
    },
  });
}

export function useSetMatchCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchCount: number) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useSetMatchCount - Setting match count:`, matchCount);
      
      if (!actor) {
        console.error(`[${timestamp}] useSetMatchCount - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.setMatchCount(BigInt(matchCount));
      console.log(`[${timestamp}] useSetMatchCount - Match count updated`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournamentInfo'] });
      toast.success('Match count updated!');
    },
    onError: (error: Error) => {
      console.error('useSetMatchCount - Error:', error);
      toast.error(error.message || 'Failed to update match count');
    },
  });
}

export function useGetPendingTournaments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MatchInfo[]>({
    queryKey: ['pendingTournaments'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetPendingTournaments - Fetching pending tournaments`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetPendingTournaments - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const tournaments = await actor.getPendingTournaments();
      console.log(`[${timestamp}] useGetPendingTournaments - Fetched ${tournaments.length} pending tournaments`);
      return tournaments;
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useSetMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, matchInfo }: { matchId: bigint; matchInfo: MatchInfo }) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useSetMatch - Setting match:`, { matchId: matchId.toString(), matchInfo });
      
      if (!actor) {
        console.error(`[${timestamp}] useSetMatch - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.setMatch(matchId, matchInfo);
      console.log(`[${timestamp}] useSetMatch - Match set successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingTournaments'] });
      toast.success('Match created successfully!');
    },
    onError: (error: Error) => {
      console.error('useSetMatch - Error:', error);
      toast.error(error.message || 'Failed to create match');
    },
  });
}

export function useUpdateMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, matchInfo }: { matchId: bigint; matchInfo: MatchInfo }) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useUpdateMatch - Updating match:`, { matchId: matchId.toString(), matchInfo });
      
      if (!actor) {
        console.error(`[${timestamp}] useUpdateMatch - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.updateMatch(matchId, matchInfo);
      console.log(`[${timestamp}] useUpdateMatch - Match updated successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingTournaments'] });
      toast.success('Match updated successfully!');
    },
    onError: (error: Error) => {
      console.error('useUpdateMatch - Error:', error);
      toast.error(error.message || 'Failed to update match');
    },
  });
}

export function useAdminDirectDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, amount }: { userId: bigint; amount: bigint }) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useAdminDirectDeposit - Direct deposit:`, { 
        userId: userId.toString(), 
        amount: amount.toString() 
      });
      
      if (!actor) {
        console.error(`[${timestamp}] useAdminDirectDeposit - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.adminDirectDeposit(userId, amount);
      console.log(`[${timestamp}] useAdminDirectDeposit - Direct deposit successful`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['directDepositHistory'] });
      toast.success('Coins added successfully!');
    },
    onError: (error: Error) => {
      console.error('useAdminDirectDeposit - Error:', error);
      toast.error(error.message || 'Failed to add coins');
    },
  });
}

export function useGetDirectDepositHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DirectDeposit[]>({
    queryKey: ['directDepositHistory'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetDirectDepositHistory - Fetching deposit history`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetDirectDepositHistory - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const history = await actor.getDirectDepositHistory();
      console.log(`[${timestamp}] useGetDirectDepositHistory - Fetched ${history.length} deposit records`);
      return history;
    },
    enabled: !!actor && !actorFetching,
  });
}

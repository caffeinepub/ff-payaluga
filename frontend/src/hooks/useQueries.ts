import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, TournamentInfo, MatchInfo, AdminDepositRequest, TournamentJoinRequest } from '../backend';
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
      console.log(`[${timestamp}] useGetTournamentInfo - Tournament info fetched:`, info);
      return info;
    },
    enabled: !!actor && !actorFetching,
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
      console.log(`[${timestamp}] useGetPendingTournaments - Tournaments fetched:`, tournaments.length);
      return tournaments;
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
      console.log(`[${timestamp}] useJoinTournament - Joining tournament`);
      
      if (!actor) {
        console.error(`[${timestamp}] useJoinTournament - Actor not available`);
        throw new Error('Actor not available');
      }
      
      await actor.joinTournament(freeFireUid, whatsappNumber);
      console.log(`[${timestamp}] useJoinTournament - Tournament joined successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      queryClient.invalidateQueries({ queryKey: ['tournamentInfo'] });
      toast.success('Successfully joined tournament!');
    },
    onError: (error: Error) => {
      console.error('useJoinTournament - Error:', error);
      toast.error(error.message || 'Failed to join tournament');
    },
  });
}

// Admin hooks
export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useIsAdmin - Checking admin status`);
      
      if (!actor) {
        console.error(`[${timestamp}] useIsAdmin - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const isAdmin = await actor.isAdmin();
      console.log(`[${timestamp}] useIsAdmin - Admin status:`, isAdmin);
      return isAdmin;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
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
      console.log(`[${timestamp}] useGetAllUsers - Users fetched:`, users.length);
      return users;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPendingDepositRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdminDepositRequest[]>({
    queryKey: ['pendingDepositRequests'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetPendingDepositRequests - Fetching pending deposits`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetPendingDepositRequests - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const deposits = await actor.getPendingDepositRequests();
      console.log(`[${timestamp}] useGetPendingDepositRequests - Deposits fetched:`, deposits.length);
      return deposits;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllTournamentJoinRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TournamentJoinRequest[]>({
    queryKey: ['allTournamentJoinRequests'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetAllTournamentJoinRequests - Fetching tournament requests`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetAllTournamentJoinRequests - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const requests = await actor.getAllTournamentJoinRequests();
      console.log(`[${timestamp}] useGetAllTournamentJoinRequests - Requests fetched:`, requests.length);
      return requests;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTotalBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalBalance'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] useGetTotalBalance - Fetching total balance`);
      
      if (!actor) {
        console.error(`[${timestamp}] useGetTotalBalance - Actor not available`);
        throw new Error('Actor not available');
      }
      
      const balance = await actor.getTotalBalance();
      console.log(`[${timestamp}] useGetTotalBalance - Total balance fetched:`, balance.toString());
      return balance;
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Tournament Entry / ZAP Payment hooks ────────────────────────────────────

export interface TournamentEntryRecord {
  id: number;
  name: string;
  game_id: string;
  payment_id: string;
  status: string;
  created_at: string;
}

/**
 * Fetches the current number of confirmed tournament entries.
 * Calls backend `getEntryCount` query (publicly accessible).
 */
export function useGetEntryCount() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['entryCount'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore – getEntryCount will be added to the backend
      const count = await actor.getEntryCount();
      return Number(count);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30_000, // refresh every 30 s so slot count stays fresh
  });
}

/**
 * Creates a ZAP UPI payment order via the backend.
 * On success, returns { paymentUrl: string } and redirects the user.
 */
export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<{ paymentUrl: string }, Error, { name: string; gameId: string }>({
    mutationFn: async ({ name, gameId }) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore – createOrder will be added to the backend
      const result = await actor.createOrder(name, gameId);
      if (!result || !result.paymentUrl) {
        throw new Error('Invalid response from payment gateway');
      }
      return result as { paymentUrl: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entryCount'] });
      toast.success('Order created! Redirecting to payment...');
    },
    onError: (error: Error) => {
      const msg = error.message || 'Failed to create payment order';
      if (msg.toLowerCase().includes('slot') || msg.toLowerCase().includes('full') || msg.toLowerCase().includes('50')) {
        toast.error('All 50 slots are filled. Registration is closed.');
      } else {
        toast.error(msg);
      }
    },
  });
}

/**
 * Admin-only hook: fetches all tournament entries from the backend.
 * Calls backend `getTournamentEntries` query.
 */
export function useGetTournamentEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TournamentEntryRecord[]>({
    queryKey: ['tournamentEntries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore – getTournamentEntries will be added to the backend
      const entries = await actor.getTournamentEntries();
      return entries as TournamentEntryRecord[];
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

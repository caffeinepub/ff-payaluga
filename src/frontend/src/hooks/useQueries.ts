import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, AdminDepositRequest, TournamentJoinRequest, TournamentInfo } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
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
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

export function useGetUserBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['userBalance'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserBalance();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deposit(BigInt(amount));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      toast.success('Deposit request submitted! Please complete payment and wait for admin approval.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit deposit');
    },
  });
}

export function useGetTournamentInfo() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TournamentInfo>({
    queryKey: ['tournamentInfo'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTournamentInfo();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useJoinTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ freeFireUid, whatsappNumber }: { freeFireUid: string; whatsappNumber: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.joinTournament(freeFireUid, whatsappNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      toast.success('Successfully joined tournament! Admin will contact you via WhatsApp.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to join tournament');
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPendingDepositRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdminDepositRequest[]>({
    queryKey: ['pendingDepositRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingDepositRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useApproveDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.approveDeposit(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDepositRequests'] });
      toast.success('Deposit approved successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve deposit');
    },
  });
}

export function useRejectDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rejectDeposit(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDepositRequests'] });
      toast.success('Deposit rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject deposit');
    },
  });
}

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllTournamentJoinRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TournamentJoinRequest[]>({
    queryKey: ['allTournamentJoinRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTournamentJoinRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetTournamentEntryOpen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isOpen: boolean) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setTournamentEntryOpen(isOpen);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournamentInfo'] });
      toast.success('Tournament status updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update tournament status');
    },
  });
}

export function useSetEntryFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryFee: number) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setEntryFee(BigInt(entryFee));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournamentInfo'] });
      toast.success('Entry fee updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update entry fee');
    },
  });
}

export function useSetMatchTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchTime: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setMatchTime(matchTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournamentInfo'] });
      toast.success('Match time updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update match time');
    },
  });
}

export function useSetMatchCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchCount: number) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setMatchCount(BigInt(matchCount));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournamentInfo'] });
      toast.success('Match count updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update match count');
    },
  });
}

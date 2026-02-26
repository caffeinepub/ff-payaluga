import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface TournamentJoinRequest {
    freeFireUid: string;
    joinTimestamp: Time;
    userId: UserId;
    whatsappNumber: string;
    entryFeePaid: bigint;
    userPrincipal: Principal;
}
export interface AdminTournamentMatchUpdate {
    matchId: bigint;
    matchInfo: MatchInfo;
}
export interface MatchInfo {
    playerUID: string;
    matchTime: Time;
    whatsappNumber: string;
}
export interface AdminDepositRequest {
    status: Variant_pending_approved_rejected;
    userId: UserId;
    userPrincipal: Principal;
    timestamp: Time;
    amount: bigint;
}
export type UserId = bigint;
export interface DirectDeposit {
    userId: UserId;
    timestamp: Time;
    amount: bigint;
}
export interface AdminUpdateTournamentRequest {
    matchTime?: Time;
    status?: boolean;
    matchCount?: bigint;
    entryFee?: bigint;
}
export interface TournamentInfo {
    matchTime: Time;
    status: boolean;
    matchCount: bigint;
    entryFee: bigint;
}
export interface UserProfile {
    principal: Principal;
    userId: UserId;
    name: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    adminDirectDeposit(userId: UserId, amount: bigint): Promise<void>;
    adminDirectDepositByPrincipal(userPrincipal: Principal, amount: bigint): Promise<void>;
    approveDeposit(requestId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deposit(amount: bigint): Promise<bigint>;
    getAllTournamentJoinRequests(): Promise<Array<TournamentJoinRequest>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getBalanceByPrincipalId(principalId: Principal): Promise<bigint>;
    getBalanceByUserId(userId: UserId): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDirectDepositHistory(): Promise<Array<DirectDeposit>>;
    getEntryFee(): Promise<bigint>;
    getPendingDepositRequests(): Promise<Array<AdminDepositRequest>>;
    getPendingTournaments(): Promise<Array<MatchInfo>>;
    getTotalBalance(): Promise<bigint>;
    getTournamentInfo(): Promise<TournamentInfo>;
    getUserBalance(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasOpenTournaments(): Promise<boolean>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isTournamentEntryOpen(): Promise<boolean>;
    joinTournament(freeFireUid: string, whatsappNumber: string): Promise<void>;
    rejectDeposit(requestId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setEntryFee(entryFee: bigint): Promise<void>;
    setMatch(matchId: bigint, matchInfo: MatchInfo): Promise<void>;
    setMatchCount(matchCount: bigint): Promise<void>;
    setMatchTime(matchTime: Time): Promise<void>;
    setTournamentEntryOpen(isOpen: boolean): Promise<void>;
    updateMatch(matchId: bigint, matchInfo: MatchInfo): Promise<void>;
    updateMatchTime(matchId: bigint, newTime: Time): Promise<void>;
    updateTournament(updateRequest: AdminUpdateTournamentRequest): Promise<TournamentInfo>;
    updateTournamentMatches(matchUpdates: Array<AdminTournamentMatchUpdate>): Promise<Array<MatchInfo>>;
}

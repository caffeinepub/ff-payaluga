import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Option "mo:core/Option";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type definitions
  public type UserId = Nat;

  public type UserProfile = {
    userId : UserId;
    email : Text;
    name : Text;
  };

  public type CoinBalance = {
    userId : UserId;
    balance : Nat;
  };

  public type AdminDepositRequest = {
    userId : UserId;
    userPrincipal : Principal;
    amount : Nat;
    timestamp : Time.Time;
    status : { #pending; #approved; #rejected };
  };

  public type TournamentJoinRequest = {
    userId : UserId;
    userPrincipal : Principal;
    freeFireUid : Text;
    whatsappNumber : Text;
    joinTimestamp : Time.Time;
    entryFeePaid : Nat;
  };

  public type MatchInfo = {
    playerUID : Text;
    whatsappNumber : Text;
    matchTime : Time.Time;
  };

  public type TournamentInfo = {
    entryFee : Nat;
    status : Bool;
    matchCount : Nat;
    matchTime : Time.Time;
  };

  public type AdminTournamentMatchUpdate = {
    matchId : Nat;
    matchInfo : MatchInfo;
  };

  public type AdminUpdateTournamentRequest = {
    entryFee : ?Nat;
    status : ?Bool;
    matchCount : ?Nat;
    matchTime : ?Time.Time;
  };

  var nextUserId = 1 : UserId;

  module CoinBalance {
    public func compare(balance1 : CoinBalance, balance2 : CoinBalance) : Order.Order {
      Nat.compare(balance1.balance, balance2.balance);
    };
  };

  module AdminDepositRequest {
    public func compare(request1 : AdminDepositRequest, request2 : AdminDepositRequest) : Order.Order {
      Int.compare(request1.timestamp, request2.timestamp);
    };
  };

  module MatchInfo {
    public func compare(match1 : MatchInfo, match2 : MatchInfo) : Order.Order {
      Text.compare(match1.playerUID, match2.playerUID);
    };
  };

  // Stable data structures
  let userProfiles = Map.empty<Principal, UserProfile>();
  let principalToUserId = Map.empty<Principal, UserId>();
  let coinBalances = Map.empty<UserId, Nat>();
  let depositRequests = Map.empty<Nat, AdminDepositRequest>();
  var nextDepositRequestId = 1 : Nat;
  let tournamentJoinRequests = Map.empty<Nat, TournamentJoinRequest>();
  var nextTournamentJoinId = 1 : Nat;
  let matches = Map.empty<Nat, MatchInfo>();
  var tournamentInfo : TournamentInfo = {
    entryFee = 50;
    status = false;
    matchCount = 0;
    matchTime = 0;
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Assign userId if this is a new user
    switch (principalToUserId.get(caller)) {
      case (null) {
        let userId = nextUserId;
        nextUserId += 1;
        principalToUserId.add(caller, userId);
        let updatedProfile = {
          profile with userId = userId;
        };
        userProfiles.add(caller, updatedProfile);
        // Initialize balance for new user
        coinBalances.add(userId, 0);
      };
      case (?existingUserId) {
        let updatedProfile = {
          profile with userId = existingUserId;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Queries - Public access
  public query func getEntryFee() : async Nat {
    tournamentInfo.entryFee;
  };

  public query func isTournamentEntryOpen() : async Bool {
    tournamentInfo.status;
  };

  public query func getTournamentInfo() : async TournamentInfo {
    tournamentInfo;
  };

  // Admin-only queries
  public query ({ caller }) func getPendingTournaments() : async [MatchInfo] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view pending tournaments");
    };
    matches.values().toArray().sort();
  };

  public query ({ caller }) func hasOpenTournaments() : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can check tournament status");
    };
    matches.size() > 0;
  };

  public query ({ caller }) func getAllTournamentJoinRequests() : async [TournamentJoinRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view tournament join requests");
    };
    tournamentJoinRequests.values().toArray();
  };

  public query ({ caller }) func getPendingDepositRequests() : async [AdminDepositRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view deposit requests");
    };

    depositRequests.values().toArray().filter(func(req : AdminDepositRequest) : Bool {
      switch (req.status) {
        case (#pending) { true };
        case (_) { false };
      };
    });
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.values().toArray();
  };

  // Balance functionality - User access
  public query ({ caller }) func getUserBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check balance");
    };
    let userId = getUserIdOrTrap(caller);
    getUserBalanceInternal(userId);
  };

  func getUserBalanceInternal(userId : UserId) : Nat {
    coinBalances.get(userId).get(0);
  };

  // Admin balance queries
  public query ({ caller }) func getBalanceByUserId(userId : UserId) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    getUserBalanceInternal(userId);
  };

  public query ({ caller }) func getBalanceByPrincipalId(principalId : Principal) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (principalToUserId.get(principalId)) {
      case (null) { 0 };
      case (?userId) { getUserBalanceInternal(userId) };
    };
  };

  public query ({ caller }) func getTotalBalance() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    var total = 0;
    for (balance in coinBalances.values()) {
      total += balance;
    };
    total;
  };

  // Deposit functionality - User access
  public shared ({ caller }) func deposit(amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can make deposits");
    };

    // Validate deposit amount (₹10 to ₹100)
    if (amount < 10 or amount > 100) {
      Runtime.trap("Invalid deposit amount: Must be between ₹10 and ₹100");
    };

    let userId = getUserIdOrTrap(caller);
    let depositRequest : AdminDepositRequest = {
      userId;
      userPrincipal = caller;
      amount;
      timestamp = Time.now();
      status = #pending;
    };

    let requestId = nextDepositRequestId;
    nextDepositRequestId += 1;
    depositRequests.add(requestId, depositRequest);

    amount;
  };

  // Admin deposit approval
  public shared ({ caller }) func approveDeposit(requestId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve deposits");
    };

    switch (depositRequests.get(requestId)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?request) {
        switch (request.status) {
          case (#pending) {
            // Update request status
            let approvedRequest = {
              request with status = #approved;
            };
            depositRequests.add(requestId, approvedRequest);

            // Add coins to user balance (1₹ = 1 Coin)
            let currentBalance = getUserBalanceInternal(request.userId);
            updateBalance(request.userId, currentBalance + request.amount);
          };
          case (_) {
            Runtime.trap("Deposit request already processed");
          };
        };
      };
    };
  };

  public shared ({ caller }) func rejectDeposit(requestId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject deposits");
    };

    switch (depositRequests.get(requestId)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?request) {
        switch (request.status) {
          case (#pending) {
            let rejectedRequest = {
              request with status = #rejected;
            };
            depositRequests.add(requestId, rejectedRequest);
          };
          case (_) {
            Runtime.trap("Deposit request already processed");
          };
        };
      };
    };
  };

  // Tournament join functionality - User access
  public shared ({ caller }) func joinTournament(freeFireUid : Text, whatsappNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join tournaments");
    };

    // Check if tournament is open
    if (not tournamentInfo.status) {
      Runtime.trap("Tournament entry is currently closed");
    };

    let userId = getUserIdOrTrap(caller);
    let currentBalance = getUserBalanceInternal(userId);

    // Check if user has sufficient balance
    if (currentBalance < tournamentInfo.entryFee) {
      Runtime.trap("Insufficient balance: Please deposit coins to join tournament");
    };

    // Deduct entry fee from user balance
    updateBalance(userId, currentBalance - tournamentInfo.entryFee);

    // Create tournament join request
    let joinRequest : TournamentJoinRequest = {
      userId;
      userPrincipal = caller;
      freeFireUid;
      whatsappNumber;
      joinTimestamp = Time.now();
      entryFeePaid = tournamentInfo.entryFee;
    };

    let requestId = nextTournamentJoinId;
    nextTournamentJoinId += 1;
    tournamentJoinRequests.add(requestId, joinRequest);
  };

  // Coin system functionality
  func updateBalance(userId : UserId, newBalance : Nat) {
    coinBalances.add(userId, newBalance);
  };

  // Helper functions
  func getUserIdOrTrap(principalId : Principal) : UserId {
    switch (principalToUserId.get(principalId)) {
      case (null) { Runtime.trap("User not registered: Please create a profile first") };
      case (?userId) { userId };
    };
  };

  // Admin-only setters
  public shared ({ caller }) func setEntryFee(entryFee : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    tournamentInfo := {
      tournamentInfo with entryFee;
    };
  };

  public shared ({ caller }) func setTournamentEntryOpen(isOpen : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    tournamentInfo := {
      tournamentInfo with status = isOpen;
    };
  };

  public shared ({ caller }) func setMatchCount(matchCount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    tournamentInfo := {
      tournamentInfo with matchCount;
    };
  };

  public shared ({ caller }) func setMatchTime(matchTime : Time.Time) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    tournamentInfo := {
      tournamentInfo with matchTime;
    };
  };

  public shared ({ caller }) func setMatch(matchId : Nat, matchInfo : MatchInfo) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    matches.add(matchId, matchInfo);
  };

  public shared ({ caller }) func updateMatch(matchId : Nat, matchInfo : MatchInfo) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    matches.add(matchId, matchInfo);
  };

  public shared ({ caller }) func updateMatchTime(matchId : Nat, newTime : Time.Time) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?existingMatch) {
        let updatedMatch = {
          existingMatch with matchTime = newTime;
        };
        matches.add(matchId, updatedMatch);
      };
    };
  };

  public shared ({ caller }) func updateTournament(updateRequest : AdminUpdateTournamentRequest) : async TournamentInfo {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let updatedTournament : TournamentInfo = {
      tournamentInfo with
      entryFee = updateRequest.entryFee.get(tournamentInfo.entryFee);
      status = updateRequest.status.get(tournamentInfo.status);
      matchCount = updateRequest.matchCount.get(tournamentInfo.matchCount);
      matchTime = updateRequest.matchTime.get(tournamentInfo.matchTime);
    };
    tournamentInfo := updatedTournament;
    updatedTournament;
  };

  public shared ({ caller }) func updateTournamentMatches(matchUpdates : [AdminTournamentMatchUpdate]) : async [MatchInfo] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    for (update in matchUpdates.values()) {
      matches.add(update.matchId, update.matchInfo);
    };
    matches.values().toArray();
  };
};

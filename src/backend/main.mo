import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";



actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  public type DirectDeposit = {
    userId : UserId;
    amount : Nat;
    timestamp : Time.Time;
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
      match1.playerUID.compare(match2.playerUID);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let principalToUserId = Map.empty<Principal, UserId>();
  let coinBalances = Map.empty<UserId, Nat>();
  let depositRequests = Map.empty<Nat, AdminDepositRequest>();
  var nextDepositRequestId = 1;
  var nextUserId = 1;

  let tournamentJoinRequests = Map.empty<Nat, TournamentJoinRequest>();
  var nextTournamentJoinId = 1;
  let matches = Map.empty<Nat, MatchInfo>();
  var tournamentInfo : TournamentInfo = {
    entryFee = 50;
    status = false;
    matchCount = 0;
    matchTime = 0;
  };

  let directDepositHistory = Map.empty<Nat, DirectDeposit>();
  var nextDirectDepositId = 1;

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

    switch (principalToUserId.get(caller)) {
      case (null) {
        let userId = nextUserId;
        nextUserId += 1;
        principalToUserId.add(caller, userId);
        let updatedProfile = {
          profile with userId = userId;
        };
        userProfiles.add(caller, updatedProfile);
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

  public query func getEntryFee() : async Nat {
    tournamentInfo.entryFee;
  };

  public query func isTournamentEntryOpen() : async Bool {
    tournamentInfo.status;
  };

  public query func getTournamentInfo() : async TournamentInfo {
    tournamentInfo;
  };

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

  public shared ({ caller }) func deposit(amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can make deposits");
    };

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

  public shared ({ caller }) func approveDeposit(requestId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve deposits");
    };

    switch (depositRequests.get(requestId)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?request) {
        switch (request.status) {
          case (#pending) {
            let approvedRequest = {
              request with status = #approved;
            };
            depositRequests.add(requestId, approvedRequest);
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

  public shared ({ caller }) func adminDirectDeposit(userId : UserId, amount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform direct deposits");
    };

    if (amount == 0) {
      Runtime.trap("Invalid deposit amount: Must be greater than 0");
    };

    let currentBalance = getUserBalanceInternal(userId);
    updateBalance(userId, currentBalance + amount);

    let depositRecord : DirectDeposit = {
      userId;
      amount;
      timestamp = Time.now();
    };

    let depositId = nextDirectDepositId;
    nextDirectDepositId += 1;
    directDepositHistory.add(depositId, depositRecord);
  };

  public shared ({ caller }) func adminDirectDepositByPrincipal(userPrincipal : Principal, amount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform direct deposits");
    };

    if (amount == 0) {
      Runtime.trap("Invalid deposit amount: Must be greater than 0");
    };

    switch (principalToUserId.get(userPrincipal)) {
      case (null) { Runtime.trap("User not found") };
      case (?userId) {
        let currentBalance = getUserBalanceInternal(userId);
        updateBalance(userId, currentBalance + amount);

        let depositRecord : DirectDeposit = {
          userId;
          amount;
          timestamp = Time.now();
        };

        let depositId = nextDirectDepositId;
        nextDirectDepositId += 1;
        directDepositHistory.add(depositId, depositRecord);
      };
    };
  };

  public query ({ caller }) func getDirectDepositHistory() : async [DirectDeposit] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view direct deposit history");
    };
    directDepositHistory.values().toArray();
  };

  public shared ({ caller }) func joinTournament(freeFireUid : Text, whatsappNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join tournaments");
    };

    if (not tournamentInfo.status) {
      Runtime.trap("Tournament entry is currently closed");
    };

    let userId = getUserIdOrTrap(caller);
    let currentBalance = getUserBalanceInternal(userId);

    if (currentBalance < tournamentInfo.entryFee) {
      Runtime.trap("Insufficient balance: Please deposit coins to join tournament");
    };

    updateBalance(userId, currentBalance - tournamentInfo.entryFee);

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

  func updateBalance(userId : UserId, newBalance : Nat) {
    coinBalances.add(userId, newBalance);
  };

  func getUserIdOrTrap(principalId : Principal) : UserId {
    switch (principalToUserId.get(principalId)) {
      case (null) { Runtime.trap("User not registered: Please create a profile first") };
      case (?userId) { userId };
    };
  };

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

# Specification

## Summary
**Goal:** Add a secure tournament entry payment system using the ZAP UPI API, including backend data storage, payment order creation, webhook verification, and frontend entry/admin UI.

**Planned changes:**
- Add a stable `tournament_entries` data structure in the Motoko backend with fields: id, name, game_id, payment_id, status, and created_at
- Add a `createOrder` backend function that validates slot availability (max 50), calls the ZAP UPI API to create a payment order (₹50, INR), stores a PENDING entry, and returns the payment URL
- Add a `handleWebhook` backend function that verifies the HMAC SHA256 ZAP signature, and on successful payment marks the matching entry as CONFIRMED
- Store ZAP API key and Secret Key as private backend constants only; add `getEntryCount` (public) and `getTournamentEntries` (admin-only) query functions
- Create a `TournamentEntry` frontend page with a form for player name and Free Fire Game ID, slot availability display, and redirect to the ZAP payment URL on success
- Add a `/tournament-entry` route in App.tsx and a navigation link for authenticated users
- Add a tournament entries section to the Admin Dashboard showing the entries table, total confirmed count, and slot usage (X/50)

**User-visible outcome:** Authenticated users can enter a tournament by submitting their name and Game ID, paying ₹50 via UPI through ZAP, with slots capped at 50. Admins can view all entries and payment statuses in the Admin Dashboard.

# Specification

## Summary
**Goal:** Set a permanent admin email that automatically receives admin role upon login.

**Planned changes:**
- Store 'niranjanniranjan88464@gmail.com' as a constant in the backend main actor
- Automatically assign role = 'admin' when a user logs in with the permanent admin email
- Update admin authentication flow to recognize the permanent admin without manual role assignment

**User-visible outcome:** The user with email 'niranjanniranjan88464@gmail.com' will have immediate access to all admin panels (AdminPanel, TournamentAdminPage, DepositAdminPage) upon login without requiring any manual role setup.

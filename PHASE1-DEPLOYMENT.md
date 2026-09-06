# Phase 1 production deployment gate

The intended production path is a same-origin Cloudflare Worker at
`https://esportkiller.com`. The Worker serves the existing frontend, verifies
Clerk session tokens server-side, protects research assets and APIs, and uses the
existing `DB` D1 binding.

## Required configuration names

- `CLERK_PUBLISHABLE_KEY` — public Clerk key; returned by `/api/auth/config`
- `CLERK_SECRET_KEY` — Worker secret; never returned or bundled
- `CLERK_AUTHORIZED_PARTIES` — exact allowed origins
- `LOL_ESPORTS_API_KEY` — server-only provider key

Other provider keys remain optional and server-only as documented in
`server/.env.example`.

## Non-destructive migration order

1. Confirm the Clerk production instance permits public sign-up.
2. Inventory the production D1 database, especially legacy `users` and
   `sessions`, without changing rows.
3. Back up D1 before applying migrations.
4. Apply `0001_core.sql` only if the existing database migration history
   confirms it has not already been applied.
5. Apply `0002_clerk_users.sql`. It creates a separate Clerk identity table
   and does not delete or rewrite legacy accounts.
6. Configure Worker secrets and build assets with
   `pnpm --dir server build:cloudflare`.
7. Deploy to a non-production Worker hostname and verify the complete security
   matrix.
8. Attach `esportkiller.com` only after the preview passes. Preserve the
   existing route so rollback remains possible.

## Rollback

Keep the current production deployment and DNS unchanged until the Worker
preview passes. Rollback is switching the route to the prior deployment; no D1
tables are removed in Phase 1.

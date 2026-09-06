# Authentication migration status — 2026-09-06

## Controlling product policy

Free Clerk accounts are now the target production policy. Clerk remains the
single authentication provider; Supabase Auth and the legacy D1 password flow
are not production alternatives. Preserve existing history, branding, research,
schedules and patch features. Never present archives as live props or hit rates
as model probability. Support actual provider match/map scopes without
inference.

Full owner specification: C:/Users/arman/.codex/attachments/bc809a17-dfc9-4456-a32c-449681503292/pasted-text.txt

## Evidence from current audit

- Existing frontend is vanilla JavaScript, with auth.js loading research scripts
  only after Clerk and the protected Worker test route verify the session.
- server/cloudflare/auth.mjs is retained only to prevent destructive loss before
  the production D1 user inventory. The Worker no longer imports or routes to it.
- Clerk public signup must be enabled in the production Clerk dashboard before
  release. That external setting is not verified by source tests.
- The integrated Clerk surface now offers free account creation and sign-in in
  the existing navy/gold visual system.
- Existing Sites manifest is static-only. Private data must not be published as unprotected static assets. Cloudflare worker code exists but deployment wiring and production status require verification.
- Clerk dashboard is accessible; inspected instance explicitly identifies itself as development. Production configuration remains unverified.

## Required release gates

Update: the official @clerk/backend SDK now verifies session tokens for the
Cloudflare Worker. Exact authorized origins, banned/locked account rejection,
protected asset/API enforcement, CORS, security headers and D1 Clerk identity
persistence have local boundary tests. These are not production end-to-end
tests. Production remains unchanged pending the release gates below.

1. Verify the Clerk production instance and enable public account creation there.
2. Inventory and back up production D1 before any migration; do not silently
   discard legacy identities or session records.
3. Configure the exact production origin, Clerk keys and D1 binding.
4. Verify signup, sign-in, refresh persistence, logout, revoked/expired sessions,
   direct API bypass, protected assets, CORS and mobile auth against a preview Worker.
5. Verify live provider response through normalization and authenticated rendering;
   retain stale last-good data with explicit health states.
6. Move the production route only after the preview passes. No production
   publication was performed for this change.

Remaining Phase 1 work requires production account access: Clerk dashboard
configuration, D1 inventory/backup, Worker preview deployment, end-to-end auth
tests and a reversible route cutover. Later product phases remain out of scope.

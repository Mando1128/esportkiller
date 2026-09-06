# Private community access — 2026-09-05

## Controlling product policy

Free, invite-only accounts. Clerk remains the authentication provider. No payments, public signup, or replacement with Supabase Auth. Preserve existing history, branding, research, schedules and patch features. Never present archives as live props or hit rates as model probability. Primary champion summaries use three champions from verified relevant history. Support actual provider match/map scopes without inference.

Full owner specification: C:/Users/arman/.codex/attachments/bc809a17-dfc9-4456-a32c-449681503292/pasted-text.txt

## Evidence from current audit

- Existing frontend is vanilla JavaScript, with auth.js loading research scripts after a session response.
- server/cloudflare/auth.mjs uses custom password hashes and D1 sessions, not Clerk. Do not describe it as Clerk authentication.
- Local legacy signup is now rejected with 403 INVITE_REQUIRED before storage access. GET, POST, PUT rejection tests pass. This is containment, not completed Clerk integration.
- Public landing copy now describes free invite-required access; no open signup CTA.
- Existing Sites manifest is static-only. Private data must not be published as unprotected static assets. Cloudflare worker code exists but deployment wiring and production status require verification.
- Clerk dashboard is accessible; inspected instance explicitly identifies itself as development. Production configuration remains unverified.

## Required release gates

Update: Clerk development access mode was saved and verified Invite-only. Added official @clerk/backend SDK and server/clerk-access.mjs with session-token validation, explicit authorized origins and server-owned active membership checks. Its nine mocked boundary tests and three legacy-signup rejection tests pass (12 total). The helper is not yet wired to deployed routes; these are not end-to-end Clerk tests. No credentials or membership grants were created. Production stays unchanged.

1. Verify Clerk invite-only setting and production instance; securely configure backend SDK/session verification and membership authorization.
2. Preserve existing accounts during migration; do not silently discard identities or grant access to all authenticated users.
3. Add persistent campaign records with hashed secure tokens, atomic usage reservations, expiration/revocation and admin-only controls; use Clerk-supported invitations for registration.
4. Test valid, invalid, expired, exhausted and manipulated invites; direct hosted signup bypass; logged-out API/assets; session expiry and logout. Do not claim these tests passed yet.
5. Verify live provider response through normalization and authenticated rendering; retain stale last-good data with explicit health states.
6. Verify preview before production. No production publication performed for this change.

Remaining requested work: full inventory/classification, campaign management, premium invite page, Clerk integration, persistence, provider diagnostics, map scopes, primary-three champion calculations, research evidence/risk presentation, PostHog attribution, hosting validation. No validated probability or edge model has been established by this audit.

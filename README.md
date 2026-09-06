# Pulse Esports Lines

Esport Killer is an existing vanilla-JavaScript research frontend served by a
Cloudflare Worker. Clerk is the production authentication provider and D1
stores protected server-side state.

For local backend tests, run `pnpm --dir server install` and
`pnpm --dir server test`. Prepare the Worker asset directory with
`pnpm --dir server build:cloudflare`.

The application does not place bets or handle money. Provider availability and
licensing must be verified before any line is described as current.

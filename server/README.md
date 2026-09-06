# Live data setup

Pulse is designed to use a server-side provider key—never place a live data key in the browser.

1. Create an account with PandaScore or GRID and request an API key appropriate for your product and territory.
2. Copy `.env.example` to `.env` and fill in the values.
3. Run `npm install`, then `node --env-file=.env server.mjs` from this folder with Node 18 or newer.
4. Open `http://localhost:8787`.

The included API returns the demo board until a provider key and a licensed projections feed are connected. PrizePicks does not provide a public developer API; use a provider with rights to redistribute projections rather than scraping private endpoints.

Without a PandaScore key, `GET /api/public/dota` uses OpenDota's free public API to return a real Dota pro-player directory, recent pro matches, and hero statistics. It is a temporary no-key data source, not a substitute for licensed multi-esport live props.

`providers/sportradar.mjs` is an optional licensed market adapter for Sportradar pre-match player props. It needs a contracted `SPORTRADAR_API_KEY`, access level, and provider event ID; only activate it after confirming esports coverage and redistribution rights for your plan.

`providers/riot-lol.mjs` powers a separate non-betting LoL research endpoint: `GET /api/research/lol?gameName=NAME&tagLine=TAG`. It needs `RIOT_API_KEY` in `.env`. Do not use or describe it as a props or gambling data source; Riot's API policy prohibits betting/gambling functionality.

`providers/pandascore-live.mjs` discovers open Frames and Events streams, attaches the token on the server only, and exposes a normalized subscription hub. Frames are the live game snapshots; events are individual in-game actions. Use the provider's plan limits when deciding how many feeds to subscribe to.

`providers/pandascore-replay.mjs` supports PandaScore's LoL and CS2 replay sandboxes for testing. For LoL supply a game ID, optional in-game timestamp, and speed; for CS2 use an optional game ID, round number, and speed. The server exposes this through `POST /api/replay`, never directly from the browser.

The combined `PandaScoreRuntime` facade handles live feed discovery/subscriptions and either sandbox replay flow from one provider token.

When opened through the local server, the website automatically connects to `/api/live-events`. It stays in demo mode if no key is configured, then switches its status to live as the server discovers authorized feeds.

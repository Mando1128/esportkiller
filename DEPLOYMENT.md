# Put Pulse live

This app is ready for a Node or Docker host. A deployment needs these private environment variables:

```
PANDASCORE_TOKEN=your_private_key
PORT=8787
```

Use a host that supports an always-on Node service and WebSocket/SSE connections. Deploy the `esports-lines` folder as the service root; the Dockerfile starts `server/server.mjs` and serves both the website and its API from one address.

After deployment, share the resulting HTTPS URL. Every visitor sees start times in their own timezone, while provider credentials stay on the server.

Before presenting data as PrizePicks lines, add a licensed source permitted to redistribute those current projections. The PandaScore connection provides esports schedules, rosters, results, historical stats, and live event data; it does not grant rights to PrizePicks projections.

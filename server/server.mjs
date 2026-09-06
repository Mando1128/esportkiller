import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchUpcomingMatches, fetchPlayers, fetchTeams } from './providers/pandascore.mjs';
import { fetchDotaProPlayers, fetchDotaProMatches, fetchDotaHeroStats } from './providers/opendota.mjs';
// PandaScore's websocket runtime is optional. Keep the core League history,
// schedule, and live-event server runnable when the websocket package is absent.
const PandaScoreRuntime = null;
import { fetchLolResearch } from './providers/riot-lol.mjs';
import { fetchCitoLive, fetchCitoScheduleToday, fetchCitoScheduleUpcoming, fetchCitoLiveStats, fetchCitoLiveBoard, fetchCitoLiveMap, fetchCitoCoverage } from './providers/cito-lol.mjs';
import { fetchLolEsportsLive, fetchLolEsportsSchedule, fetchLolEsportsLeagues } from './providers/lol-esports.mjs';
import { fetchPrizePicksLol } from './providers/prizepicks-unofficial.mjs';
import { fetchRiotPatchNotes } from './providers/riot-patch-notes.mjs';
import { createApi } from './api-v1.mjs';
import { publicPath } from './public-path.mjs';
import { createFeedCache } from './feed-cache.mjs';

// Load local provider keys when the app is started directly. Production hosts
// inject the same values as secrets, so credentials never enter browser code.
try {
  const envText = await readFile(fileURLToPath(new URL('./.env', import.meta.url)), 'utf8');
  for (const rawLine of envText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
    if (!(key in process.env)) process.env[key] = value;
  }
} catch {
  // The UI handles missing providers explicitly; do not invent replacement data.
}

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 8788);
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webmanifest':'application/manifest+json' };
const liveClients = new Set();
const liveHub = process.env.PANDASCORE_TOKEN && PandaScoreRuntime ? new PandaScoreRuntime(process.env.PANDASCORE_TOKEN) : null;
let liveFeeds = [], liveError = null;

function broadcast(update) { const body = `data: ${JSON.stringify(update)}\n\n`; for (const client of liveClients) client.write(body); }
async function refreshLiveFeeds() {
  if (!liveHub) return;
  try { liveFeeds = await liveHub.sync(); liveError = null; broadcast({ type:'feed-status', feeds:liveFeeds, at:new Date().toISOString() }); }
  catch (error) { liveError = error.message; broadcast({ type:'feed-error', message:liveError }); }
}
if (liveHub) { liveHub.subscribe(update => broadcast({ type:'game-update', update })); refreshLiveFeeds(); setInterval(refreshLiveFeeds, 60_000).unref(); }

async function board() {
  try {
    const matches = await fetchUpcomingMatches(process.env.PANDASCORE_TOKEN);
    return { updatedAt: new Date().toISOString(), source: matches.length ? 'PandaScore fixtures' : 'unavailable', matches, message: matches.length ? undefined : 'No current PandaScore fixtures were returned.' };
  } catch (error) {
    return { updatedAt: new Date().toISOString(), source: 'unavailable', matches: [], message: `PandaScore is temporarily unavailable: ${error.message}` };
  }
}

const feeds = {
  props: createFeedCache(fetchPrizePicksLol, { intervalMs: 30000 }),
  schedule: createFeedCache(fetchLolEsportsSchedule),
  live: createFeedCache(fetchLolEsportsLive, { intervalMs: 30000 }),
  patches: createFeedCache(fetchRiotPatchNotes, { intervalMs: 3600000 }),
};
const feedStatus = () => Object.fromEntries(Object.entries(feeds).map(([key, feed]) => [key, feed.status()]));
const apiV1 = createApi({ ...Object.fromEntries(Object.entries(feeds).map(([key, feed]) => [key, feed.get])), status: feedStatus });
// Opt-in on a hosted backend. Disabled locally unless explicitly configured.
if (process.env.BACKGROUND_REFRESH === 'true') {
  const refresh = () => Promise.allSettled(Object.values(feeds).map(feed => feed.get()));
  void refresh();
  setInterval(() => { void refresh(); }, 30000).unref();
}
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/v1' || url.pathname.startsWith('/api/v1/')) {
    const response = await apiV1(new Request(url, { method: req.method }));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    return res.end(await response.text());
  }
  if (url.pathname === '/api/health') return res.end(JSON.stringify({ ok:true, at:new Date().toISOString() }));
  if (url.pathname === '/api/board') { res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(await board())); }
  if (url.pathname === '/api/catalog/lol/players' && req.method === 'GET') {
    try { const players = await fetchPlayers(process.env.PANDASCORE_TOKEN, { page:Number(url.searchParams.get('page')||1), videogame:'lol', search:url.searchParams.get('search')||undefined }); res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify({ source:'PandaScore global League player catalog', players })); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/catalog/lol/teams' && req.method === 'GET') {
    try { const teams = await fetchTeams(process.env.PANDASCORE_TOKEN, { page:Number(url.searchParams.get('page')||1), videogame:'lol', search:url.searchParams.get('search')||undefined }); res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify({ source:'PandaScore global League team catalog', teams })); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/public/dota') {
    try { const [players, matches, heroes] = await Promise.all([fetchDotaProPlayers(), fetchDotaProMatches(), fetchDotaHeroStats()]); res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify({ source:'OpenDota', updatedAt:new Date().toISOString(), players, matches, heroes })); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/live') { res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify({ enabled:Boolean(liveHub), feeds:liveFeeds, error:liveError })); }
  if (url.pathname === '/api/research/lol' && req.method === 'GET') {
    try {
      const result = await fetchLolResearch(process.env.RIOT_API_KEY, url.searchParams.get('gameName'), url.searchParams.get('tagLine'));
      res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(result));
    } catch (error) { res.writeHead(400); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/cito/lol/live' && req.method === 'GET') {
    try { res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(await fetchCitoLive(process.env.CITO_API_KEY))); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/cito/lol/schedule' && req.method === 'GET') {
    try {
      const [today, upcoming] = await Promise.all([
        fetchCitoScheduleToday(process.env.CITO_API_KEY),
        fetchCitoScheduleUpcoming(process.env.CITO_API_KEY)
      ]);
      res.setHeader('Content-Type','application/json');
      return res.end(JSON.stringify({ source:'CitoAPI', today, upcoming }));
    } catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/lol-esports/live' && req.method === 'GET') {
    try { res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(await fetchLolEsportsLive())); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/lol-esports/schedule' && req.method === 'GET') {
    try { res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(await fetchLolEsportsSchedule(url.searchParams.get('leagueId')))); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/lol-esports/leagues' && req.method === 'GET') {
    try { res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(await fetchLolEsportsLeagues())); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/prizepicks/lol' && req.method === 'GET') {
    try { res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(await fetchPrizePicksLol())); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/riot/patch' && req.method === 'GET') {
    try { res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(await fetchRiotPatchNotes())); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  const liveMatch = url.pathname.match(/^\/api\/cito\/lol\/live\/([^/]+)\/(stats|board|map)$/);
  if (liveMatch && req.method === 'GET') {
    const [, gameId, view] = liveMatch;
    const loaders = { stats:fetchCitoLiveStats, board:fetchCitoLiveBoard, map:fetchCitoLiveMap };
    try { res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(await loaders[view](process.env.CITO_API_KEY, gameId))); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  const coverage = url.pathname.match(/^\/api\/cito\/lol\/matches\/([^/]+)\/coverage$/);
  if (coverage && req.method === 'GET') {
    try { res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(await fetchCitoCoverage(process.env.CITO_API_KEY, coverage[1]))); }
    catch (error) { res.writeHead(502); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/replay' && req.method === 'POST') {
    if (!liveHub) { res.writeHead(409); return res.end(JSON.stringify({ error:'Configure PANDASCORE_TOKEN first.' })); }
    let body = ''; for await (const chunk of req) body += chunk;
    try { const replay = await liveHub.startReplay(JSON.parse(body || '{}')); res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(replay)); }
    catch (error) { res.writeHead(400); return res.end(JSON.stringify({ error:error.message })); }
  }
  if (url.pathname === '/api/live-events') {
    res.writeHead(200, { 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache, no-transform', Connection:'keep-alive' });
    res.write(`data: ${JSON.stringify({ type:'connected', enabled:Boolean(liveHub), feeds:liveFeeds })}\n\n`);
    liveClients.add(res); req.on('close', () => liveClients.delete(res)); return;
  }
  const path = publicPath(root, url.pathname);
  if (!path) { res.writeHead(404); return res.end('Not found'); }
  try { const file = await readFile(path); res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream'); res.end(file); }
  catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, () => console.log(`Pulse running at http://localhost:${port}`));

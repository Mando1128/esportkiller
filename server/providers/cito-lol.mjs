const base = 'https://api.citoapi.com/api/v1/lol';
const cache = new Map();
const pending = new Map();

async function request(key, path) {
  if (!key) throw new Error('Configure CITO_API_KEY on the server first.');
  const ttl = path.includes('/stats') ? 2000 : 30000;
  const existing = cache.get(path);
  if (existing && Date.now() - existing.at < ttl) return existing.data;
  if (pending.has(path)) return pending.get(path);
  const work = (async () => {
    const response = await fetch(`${base}${path}`, { headers: { 'x-api-key': key, accept: 'application/json' }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`Cito API unavailable (${response.status})`);
    const data = await response.json();
    if (data.success === false) throw new Error('Cito API reported unavailable data');
    cache.set(path, { at: Date.now(), data });
    return data;
  })();
  pending.set(path, work);
  try { return await work; } finally { pending.delete(path); }
}

export const fetchCitoLive = key => request(key, '/live');
export const fetchCitoScheduleToday = key => request(key, '/schedule/today');
export const fetchCitoScheduleUpcoming = key => request(key, '/schedule/upcoming');
export const fetchCitoLiveStats = (key, gameId) => request(key, `/live/${encodeURIComponent(gameId)}/stats`);
export const fetchCitoLiveBoard = (key, gameId) => request(key, `/live/${encodeURIComponent(gameId)}/board`);
export const fetchCitoLiveMap = (key, gameId) => request(key, `/live/${encodeURIComponent(gameId)}/map`);
export const fetchCitoCoverage = (key, matchId) => request(key, `/matches/${encodeURIComponent(matchId)}/coverage`);

// Public partner feed referenced by open-source PrizePicks projects. It is
// unofficial, so the UI identifies it as a third-party feed.
const ORIGINS = ['https://partner-api.prizepicks.com', 'https://api.prizepicks.com'];
const LOL_LEAGUE_ID = '121';
// Match the public board's refresh cadence without hammering the upstream feed.
const CACHE_MS = 30_000;
let cached = { at: 0, value: null };

async function get(path, params = {}) {
  let lastError;
  for (const origin of ORIGINS) {
    const url = new URL(`${origin}${path}`);
    for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json', Referer: 'https://app.prizepicks.com/' } });
      if (!response.ok) throw new Error(`PrizePicks feed returned ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload?.data)) throw new Error('PrizePicks response did not contain projections');
      return payload;
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error('PrizePicks endpoints unavailable');
}

function records(payload) { return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []; }
function attributes(record) { return record?.attributes || record || {}; }

function normalizeProjections(payload) {
  const included = new Map(records({ data: payload?.included }).map(item => [`${item.type}:${item.id}`, item]));
  return records(payload).map(item => {
    const attrs = attributes(item);
    const playerRef = item?.relationships?.new_player?.data || item?.relationships?.player?.data;
    const player = playerRef ? attributes(included.get(`${playerRef.type}:${playerRef.id}`)) : {};
    const leagueRef = item?.relationships?.league?.data;
    const league = leagueRef ? attributes(included.get(`${leagueRef.type}:${leagueRef.id}`)) : {};
    return {
      id: item.id, player: player.name || attrs.description || 'Unknown player',
      line: attrs.line_score ?? attrs.line ?? null, market: attrs.stat_type || attrs.market || 'Projection',
      allowedWagers: Array.isArray(attrs.allowed_wager_types) ? attrs.allowed_wager_types : (attrs.allowed_wager_types ? [attrs.allowed_wager_types] : ['over','under']),
      variant: attrs.odds_type || 'standard',
      startTime: attrs.start_time || attrs.startTime || null, description: attrs.description || '',
      league: league.name || 'League of Legends',
    };
  }).filter(item => item.player !== 'Unknown player' && item.line !== null);
}

export async function fetchPrizePicksLol() {
  if (cached.value && Date.now() - cached.at < CACHE_MS) return cached.value;
  try {
    const projections = await get('/projections', { league_id: LOL_LEAGUE_ID, per_page: 250, single_stat: true });
    const value = { source: 'Unofficial PrizePicks partner-feed integration', fetchedAt: new Date().toISOString(), leagueId: LOL_LEAGUE_ID, projections: normalizeProjections(projections), stale:false };
    cached = { at: Date.now(), value };
    return value;
  } catch (error) {
    if (cached.value) return { ...cached.value, stale:true, source:`${cached.value.source} · last verified snapshot` };
    throw error;
  }
}

const base = 'https://api.opendota.com/api';

async function get(path) {
  const response = await fetch(`${base}${path}`);
  if (!response.ok) throw new Error(`OpenDota request failed: ${response.status}`);
  return response.json();
}

/** Free public Dota sources: current pro directory, recent pro games, and hero stats. */
export const fetchDotaProPlayers = () => get('/proPlayers');
export const fetchDotaProMatches = () => get('/proMatches');
export const fetchDotaHeroStats = () => get('/heroStats');
export const fetchDotaPlayerMatches = accountId => get(`/players/${encodeURIComponent(accountId)}/matches`);
export const fetchDotaMatch = matchId => get(`/matches/${encodeURIComponent(matchId)}`);

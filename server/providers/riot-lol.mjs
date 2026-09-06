const platform = process.env.RIOT_PLATFORM || 'na1';
const regional = process.env.RIOT_REGIONAL || 'americas';

function keyHeaders(apiKey) {
  if (!apiKey) throw new Error('RIOT_API_KEY is required for LoL research');
  return { 'X-Riot-Token': apiKey };
}

async function riot(url, apiKey) {
  const response = await fetch(url, { headers: keyHeaders(apiKey) });
  if (!response.ok) throw new Error(`Riot API request failed: ${response.status}`);
  return response.json();
}

/** Non-betting research data only: player profile, ranked entries, and recent match IDs. */
export async function fetchLolResearch(apiKey, gameName, tagLine) {
  if (!gameName || !tagLine) throw new Error('gameName and tagLine are required');
  const account = await riot(`https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`, apiKey);
  const [summoner, ranked, matchIds] = await Promise.all([
    riot(`https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(account.puuid)}`, apiKey),
    riot(`https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(account.puuid)}`, apiKey),
    riot(`https://${regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(account.puuid)}/ids?start=0&count=20`, apiKey),
  ]);
  return { source: 'Riot Games API', purpose: 'non-betting LoL research', account: { gameName: account.gameName, tagLine: account.tagLine, puuid: account.puuid }, summoner, ranked, matchIds, updatedAt: new Date().toISOString() };
}

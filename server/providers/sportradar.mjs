const base = 'https://api.sportradar.com';

/** Fetches licensed pre-match player props. Keep the Sportradar key server-side. */
export async function fetchPlayerProps(apiKey, { accessLevel, languageCode = 'en', sportEventId, format = 'json' } = {}) {
  if (!apiKey) throw new Error('SPORTRADAR_API_KEY is required');
  if (!accessLevel || !sportEventId) throw new Error('accessLevel and sportEventId are required');
  const path = `/oddscomparison-player-props/${encodeURIComponent(accessLevel)}/v2/${encodeURIComponent(languageCode)}/sport_events/${encodeURIComponent(sportEventId)}/players_props.${encodeURIComponent(format)}`;
  const response = await fetch(`${base}${path}?api_key=${encodeURIComponent(apiKey)}`);
  if (!response.ok) throw new Error(`Sportradar player props request failed: ${response.status}`);
  return format === 'xml' ? response.text() : response.json();
}

/** Maps provider payloads to the fields the Pulse market panel needs. */
export function normalizeSportradarProps(payload) {
  const markets = payload?.sport_event_player_props?.markets || payload?.markets || [];
  return markets.flatMap(market => (market.outcomes || []).map(outcome => ({
    provider: 'Sportradar', market: market.name, player: outcome.player?.name || outcome.player_name,
    line: outcome.line ?? outcome.specifiers, odds: outcome.odds, side: outcome.name,
    updatedAt: payload?.generated_at || null,
  })));
}

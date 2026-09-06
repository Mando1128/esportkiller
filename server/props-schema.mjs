// Esport Killer's schema is independent of the upstream JSON:API envelope.
export function normalizeProps(payload, now = Date.now()) {
  if (!Array.isArray(payload?.data)) throw new Error('INVALID_SCHEMA');
  const included = new Map((payload.included || []).map(r => [`${r.type}:${r.id}`, r.attributes || {}]));
  const counts = { received: payload.data.length, mapped: 0, league: 0, kills: 0, valid: 0, current: 0, unique: 0 };
  const rejected = { missingPlayer: 0, otherLeague: 0, otherMarket: 0, invalidLine: 0, invalidTime: 0, started: 0, duplicate: 0 };
  const seen = new Set(), projections = [];
  for (const item of payload.data) {
    const a = item.attributes || {}, relations = item.relationships || {};
    const ref = relations.new_player?.data || relations.player?.data;
    const player = included.get(`${ref?.type}:${ref?.id}`) || {};
    const leagueRef = relations.league?.data;
    const league = included.get(`${leagueRef?.type}:${leagueRef?.id}`) || {};
    const name = player.name || player.display_name;
    if (!name) { rejected.missingPlayer++; continue; } counts.mapped++;
    if (String(leagueRef?.id || player.league_id || '') !== '121' && !/^(lol|league of legends)$/i.test(league.name || '')) { rejected.otherLeague++; continue; } counts.league++;
    const market = a.stat_type || a.market || '';
    if (!/\bkills?\b/i.test(market)) { rejected.otherMarket++; continue; } counts.kills++;
    const rawLine = a.line_score ?? a.line;
    const line = Number(rawLine);
    if (rawLine === null || rawLine === undefined || rawLine === '' || !Number.isFinite(line) || line < 0) { rejected.invalidLine++; continue; } counts.valid++;
    const start = Date.parse(a.start_time || a.startTime);
    if (!Number.isFinite(start)) { rejected.invalidTime++; continue; }
    if (start <= now) { rejected.started++; continue; } counts.current++;
    const providerId = String(item.id || '');
    const id = `ek:prop:prizepicks:${providerId}`;
    if (!providerId || seen.has(id)) { rejected.duplicate++; continue; } seen.add(id); counts.unique++;
    const wager = a.allowed_wager_types;
    projections.push({ id, provider: 'prizepicks', providerId, playerId: ref?.id ? `ek:player:prizepicks:${ref.id}` : null,
      player: name, team: player.team || '', line, market, league: 'League of Legends', leagueId: 'ek:game:lol',
      startTime: new Date(start).toISOString(), variant: a.odds_type || 'standard',
      allowedWagers: Array.isArray(wager) ? wager : wager ? [wager] : ['over', 'under'] });
  }
  return { schemaVersion: 1, source: 'PrizePicks partner feed (unofficial)', fetchedAt: new Date(now).toISOString(), projections, diagnostics: { counts, rejected }, stale: false };
}

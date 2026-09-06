/**
 * Provider-neutral records used by the research UI. Save the raw provider
 * payload alongside this record so corrections can be replayed later.
 */
export function normalizeGame({ provider, game, matchId, gameId, patch, startedAt, durationSeconds, teams, players }) {
  return {
    provider, game, matchId, gameId, patch, startedAt, durationSeconds,
    teams: teams.map(team => ({ id: team.id, name: team.name, side: team.side })),
    players: players.map(player => ({
      id: player.id, handle: player.handle, teamId: player.teamId, role: player.role,
      isStarter: Boolean(player.isStarter), isSubstitute: Boolean(player.isSubstitute),
      replacedPlayerId: player.replacedPlayerId || null, stats: player.stats || {},
    })),
  };
}

export function lineupChange(previous, current) {
  const before = new Set(previous.players.filter(p => p.isStarter).map(p => p.id));
  const after = new Set(current.players.filter(p => p.isStarter).map(p => p.id));
  return {
    added: [...after].filter(id => !before.has(id)),
    removed: [...before].filter(id => !after.has(id)),
    hasChange: [...after].some(id => !before.has(id)) || [...before].some(id => !after.has(id)),
  };
}

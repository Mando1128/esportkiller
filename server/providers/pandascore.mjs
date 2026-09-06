const games = ['csgo', 'lol', 'dota2', 'valorant'];

/** Fetches public match metadata only; player stats require the plan level selected with PandaScore. */
export async function fetchUpcomingMatches(token) {
  if (!token) return [];
  const calls = games.map(async game => {
    const response = await fetch(`https://api.pandascore.co/${game}/matches/upcoming?token=${encodeURIComponent(token)}&per_page=100`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.map(match => ({
      id: `${game}:${match.id}`,
      game,
      startAt: match.begin_at,
      league: match.league?.name || 'Unknown league',
      teams: match.opponents?.map(item => item.opponent?.name).filter(Boolean) || [],
      status: match.status,
    }));
  });
  return (await Promise.all(calls)).flat().sort((a,b) => new Date(a.startAt) - new Date(b.startAt));
}

/** Resolves any PandaScore player ID or slug for a full player-profile card. */
export async function fetchPlayer(token, idOrSlug) {
  if (!token || !idOrSlug) return null;
  const response = await fetch(`https://api.pandascore.co/players/${encodeURIComponent(idOrSlug)}?token=${encodeURIComponent(token)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`PandaScore player request failed: ${response.status}`);
  return response.json();
}

/** Paged global player catalog, optionally narrowed to a title or handle search. */
export async function fetchPlayers(token, { page = 1, videogame, search } = {}) {
  if (!token) return [];
  const query = new URLSearchParams({ token, page: String(page), per_page: '100', sort: 'name' });
  if (videogame) query.set('videogame', videogame);
  if (search) query.set('search[name]', search);
  const response = await fetch(`https://api.pandascore.co/players?${query}`);
  if (!response.ok) throw new Error(`PandaScore players request failed: ${response.status}`);
  return response.json();
}

/** Paged team catalog; query by game or name upstream when building the roster index. */
export async function fetchTeams(token, { page = 1, videogame, search } = {}) {
  if (!token) return [];
  const query = new URLSearchParams({ token, page: String(page), per_page: '100', sort: 'name' });
  if (videogame) query.set('videogame', videogame);
  if (search) query.set('search[name]', search);
  const response = await fetch(`https://api.pandascore.co/teams?${query}`);
  if (!response.ok) throw new Error(`PandaScore teams request failed: ${response.status}`);
  return response.json();
}

/** General match catalog for upcoming, running, or completed research windows. */
export async function fetchMatches(token, { status = 'upcoming', page = 1, videogame, from, to } = {}) {
  if (!token) return [];
  const query = new URLSearchParams({ token, page: String(page), per_page: '100' });
  if (videogame) query.set('videogame', videogame);
  if (from) query.set('range[begin_at]', `${from},${to || from}`);
  const suffix = ['upcoming', 'running', 'past'].includes(status) ? `/${status}` : '';
  const response = await fetch(`https://api.pandascore.co/matches${suffix}?${query}`);
  if (!response.ok) throw new Error(`PandaScore matches request failed: ${response.status}`);
  return response.json();
}

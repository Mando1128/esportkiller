const BASE_URL = 'https://esports-api.lolesports.com/persisted/gw';
// This is the public client key used by the open-source wrapper selected for this project.
// Keep it server-side so the browser never handles upstream credentials directly.
const PUBLIC_CLIENT_KEY = process.env.LOL_ESPORTS_API_KEY;

async function request(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { 'x-api-key': process.env.LOL_ESPORTS_API_KEY || PUBLIC_CLIENT_KEY } });
  if (!response.ok) throw new Error(`League esports feed returned ${response.status}`);
  return response.json();
}

export const fetchLolEsportsLive = () => request('/getLive', { hl: 'en-US' });
export async function fetchLolEsportsSchedule(leagueId) {
  const first = await request('/getSchedule', { hl: 'en-US', leagueId });
  const schedule = first?.data?.schedule;
  if (!schedule?.events) return first;
  const eventKey = event => event.id || event.match?.id || `${event.league?.slug}:${event.startTime}:${event.type}`;
  const events = [...schedule.events], seen = new Set(events.map(eventKey));
  let pageToken = schedule.pages?.newer;
  for (let page = 0; page < 5 && pageToken; page += 1) {
    const next = await request('/getSchedule', { hl:'en-US', leagueId, pageToken });
    for (const event of next?.data?.schedule?.events || []) {
      if (!seen.has(eventKey(event))) { seen.add(eventKey(event)); events.push(event); }
    }
    const newer = next?.data?.schedule?.pages?.newer;
    if (!newer || newer === pageToken) break;
    pageToken = newer;
  }
  events.sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
  return { ...first, data:{ ...first.data, schedule:{ ...schedule, events } } };
}
export const fetchLolEsportsLeagues = () => request('/getLeagues', { hl: 'en-US' });

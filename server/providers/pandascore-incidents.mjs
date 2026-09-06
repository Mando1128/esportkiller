const base = 'https://api.pandascore.co';

export async function listIncidents(token, { kind = 'incidents', type, videogame, page = 1 } = {}) {
  if (!token) return [];
  const query = new URLSearchParams({ token, page: String(page), per_page: '100' });
  if (type) query.set('type', type);
  if (videogame) query.set('videogame', videogame);
  const response = await fetch(`${base}/${kind}?${query}`);
  if (!response.ok) throw new Error(`PandaScore ${kind} request failed: ${response.status}`);
  return response.json();
}

/** Keeps an in-memory checkpoint. Replace with a database checkpoint in production. */
export class IncidentCursor {
  #seen = new Set();
  async poll(token, options = {}) {
    const incidents = await listIncidents(token, options);
    const fresh = incidents.filter(incident => {
      const key = `${incident.change_type}:${incident.type}:${incident.id}:${incident.modified_at}`;
      if (this.#seen.has(key)) return false;
      this.#seen.add(key); return true;
    });
    if (this.#seen.size > 10_000) this.#seen = new Set([...this.#seen].slice(-5_000));
    return fresh;
  }
}

const base = 'https://api.pandascore.co';

/** Retrieves the official PandaScore Dota hero catalog for pick/patch context. */
export async function listDotaHeroes(token, page = 1) {
  if (!token) return [];
  const query = new URLSearchParams({ token, page: String(page), per_page: '100', sort: 'localized_name' });
  const response = await fetch(`${base}/dota2/heroes?${query}`);
  if (!response.ok) throw new Error(`PandaScore Dota hero request failed: ${response.status}`);
  return response.json();
}

export async function findDotaHeroes(token, name) {
  if (!token || !name) return [];
  const query = new URLSearchParams({ token, 'search[localized_name]': name, per_page: '20' });
  const response = await fetch(`${base}/dota2/heroes?${query}`);
  if (!response.ok) throw new Error(`PandaScore hero search failed: ${response.status}`);
  return response.json();
}

/** LoL champion catalog includes combat/base-stat metadata useful for patch context. */
export async function listLolChampions(token, page = 1) {
  if (!token) return [];
  const query = new URLSearchParams({ token, page: String(page), per_page: '100', sort: 'name' });
  const response = await fetch(`${base}/lol/champions?${query}`);
  if (!response.ok) throw new Error(`PandaScore LoL champion request failed: ${response.status}`);
  return response.json();
}

export async function findLolChampions(token, name) {
  if (!token || !name) return [];
  const query = new URLSearchParams({ token, 'search[name]': name, per_page: '20' });
  const response = await fetch(`${base}/lol/champions?${query}`);
  if (!response.ok) throw new Error(`PandaScore champion search failed: ${response.status}`);
  return response.json();
}

const ROOT = 'https://www.leagueoflegends.com/en-us/news/game-updates/';
const HOUR = 60 * 60 * 1000;
let cached = { at: 0, value: null };

const text = value => String(value || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const category = value => {
  if (/giving .* buff|make it up with|bringing .* buff|buffing|increase|more damage|underwhelming/i.test(value)) return 'Buff';
  if (/light nerf|due .* nerf|soften|too strong|tone down|tapping down|constrain|reducing|reduce .* power/i.test(value)) return 'Nerf';
  return 'Adjustment';
};

export async function fetchRiotPatchNotes() {
  if (cached.value && Date.now() - cached.at < HOUR) return cached.value;
  const index = await fetch(ROOT, { headers: { Accept: 'text/html' } });
  if (!index.ok) throw new Error(`Riot patch index returned ${index.status}`);
  const indexHtml = await index.text();
  const slug = indexHtml.match(/league-of-legends-patch-(\d+-\d+)-notes/i)?.[0];
  if (!slug) throw new Error('Riot patch index did not contain a current patch article.');
  const pageUrl = `${ROOT}${slug}/`;
  const page = await fetch(pageUrl, { headers: { Accept: 'text/html' } });
  if (!page.ok) throw new Error(`Riot patch notes returned ${page.status}`);
  const html = await page.text();
  const versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(response => response.json());
  const championData = await fetch(`https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/champion.json`).then(response => response.json());
  const championNames = new Set(Object.values(championData?.data || {}).map(champion => champion.name));
  const changes = [...html.matchAll(/<h3 class="change-title"[^>]*>\s*<a[^>]*>([^<]+)<\/a><\/h3>[\s\S]{0,1800}?<blockquote[^>]*>\s*<p>([\s\S]*?)<\/p>/gi)].map(match => {
    const champion = text(match[1]), summary = text(match[2]);
    return { champion, category: category(summary), summary };
  }).filter(change => championNames.has(change.champion) && change.summary);
  const value = { source: 'Riot Games official patch notes', patch: slug.match(/(\d+-\d+)/)?.[1]?.replace('-', '.') || slug, pageUrl, fetchedAt: new Date().toISOString(), changes };
  cached = { at: Date.now(), value };
  return value;
}

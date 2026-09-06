import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=join(root,'cloudflare-dist');
const files=[
  'index.html','auth.js','manifest.webmanifest','sw.js',
  'privacy.html','terms.html','responsible-play.html','data-sources.html','welcome.html',
  'reliability.js','board-snapshot.js','lol-focus.js','player-readability.js',
  'live-scoreboard.js','game-center.js','prop-filters.js','apify-review.js',
  'detail-tabs.js','index-rosters.js','roster-board.js','catalog-profiles.js',
  'player-catalog.js','research-detail.js','riot-research.js','public-dota.js',
  'model-odds.js','prizepicks-snapshot.js','schedule-board.js','app.js','styles.css',
  'games.html','players.html','schedule.html','sources.html','riot-patch.json',
  'lol-history.part0','lol-history.part1','lol-history.part2','lol-history.part3'
];

await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const file of files)await cp(join(root,file),join(output,file));
await cp(join(root,'assets'),join(output,'assets'),{recursive:true});
console.log(`Prepared ${files.length} frontend files and branded assets for the protected Worker deployment.`);

import { normalizeProps } from '../props-schema.mjs';
const KEY = 'lol-props-v1';
export async function readJson(response, limit = 4 * 1024 * 1024) {
  const reader=response.body.getReader();let size=0;const chunks=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw Error('RESPONSE_TOO_LARGE');}chunks.push(value);}
  return JSON.parse(await new Blob(chunks).text());
}
function visible(row, now) {
  const feed = row?.body ? JSON.parse(row.body) : {schemaVersion:1,source:'PrizePicks partner feed (unofficial)',projections:[],fetchedAt:null};
  const stale = !row?.updated_at || row.failures>0 || now-row.updated_at>=30000;
  // A cached pre-game line must not remain available after its event starts.
  const projections = now-(row?.updated_at||0)>300000 ? [] : feed.projections.filter(p=>Date.parse(p.startTime)>now);
  return {...feed,projections,stale,diagnostics:{...feed.diagnostics,request:row?.diagnostic?JSON.parse(row.diagnostic):{stage:'not_requested'},cache:{updatedAt:row?.updated_at||null,attemptedAt:row?.attempted_at||null,failures:row?.failures||0,nextAttempt:row?.next_attempt||0,expired:now-(row?.updated_at||0)>300000},served:projections.length,removedSinceFetch:(feed.projections||[]).length-projections.length}};
}
export async function getProps(env, fetcher = fetch, now = Date.now()) {
  const db = env.DB;
  await db.prepare('INSERT OR IGNORE INTO feed_cache(key) VALUES(?)').bind(KEY).run();
  let row=await db.prepare('SELECT * FROM feed_cache WHERE key=?').bind(KEY).first();
  if (row.next_attempt>now) return visible(row,now);
  // Atomic lease shares refreshes across Worker instances without global state.
  const lease=await db.prepare('UPDATE feed_cache SET next_attempt=?,attempted_at=? WHERE key=? AND next_attempt<=?').bind(now+30000,now,KEY,now).run();
  if(!lease.meta.changes)return visible(await db.prepare('SELECT * FROM feed_cache WHERE key=?').bind(KEY).first(),now);
  let status=null;const started=Date.now();
  try {
    const response=await fetcher('https://partner-api.prizepicks.com/projections?league_id=121&per_page=250&single_stat=true',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});
    status=response.status;
    if(!response.ok){await response.body?.cancel();throw Error(status===401||status===403?'PROVIDER_ACCESS_DENIED':status===429?'PROVIDER_RATE_LIMITED':'PROVIDER_HTTP_ERROR');}
    const payload=await readJson(response);
    if(Number(payload.meta?.total_pages||1)>1)throw Error('PAGINATION_REQUIRED');
    const feed=normalizeProps(payload,now),diagnostic={stage:'normalized',httpStatus:status,durationMs:Date.now()-started};
    await db.prepare('UPDATE feed_cache SET body=?,updated_at=?,failures=0,diagnostic=? WHERE key=?').bind(JSON.stringify(feed),now,JSON.stringify(diagnostic),KEY).run();
    console.log(JSON.stringify({event:'props_refresh',...diagnostic,...feed.diagnostics}));
  } catch(error) {
    const failures=(row.failures||0)+1;
    const known=['PROVIDER_ACCESS_DENIED','PROVIDER_RATE_LIMITED','PROVIDER_HTTP_ERROR','INVALID_SCHEMA','PAGINATION_REQUIRED','RESPONSE_TOO_LARGE'];
    const code=known.includes(error.message)?error.message:error.name==='TimeoutError'?'PROVIDER_TIMEOUT':error instanceof SyntaxError?'INVALID_JSON':'PROVIDER_NETWORK_ERROR';
    const diagnostic={stage:'request_failed',code,httpStatus:status,durationMs:Date.now()-started};
    await db.prepare('UPDATE feed_cache SET failures=?,next_attempt=?,diagnostic=? WHERE key=?').bind(failures,now+Math.min(30000*2**Math.min(failures,5),900000),JSON.stringify(diagnostic),KEY).run();
    console.log(JSON.stringify({event:'props_refresh',...diagnostic}));
  }
  row=await db.prepare('SELECT * FROM feed_cache WHERE key=?').bind(KEY).first();
  return visible(row,now);
}

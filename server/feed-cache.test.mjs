import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedCache } from './feed-cache.mjs';
import { createApi } from './api-v1.mjs';
test('coalesces requests, retains last good result and backs off', async () => {
  let clock=100, calls=0, fail=false;
  const feed=createFeedCache(async()=>{calls++;await Promise.resolve();if(fail)throw Error('private');return {events:[]};},{intervalMs:100,now:()=>clock});
  await Promise.all([feed.get(),feed.get(),feed.get()]);assert.equal(calls,1);
  clock=201;fail=true;assert.deepEqual(await feed.get(),{events:[]});assert.equal(feed.status().stale,true);
  await feed.get();assert.equal(calls,2);
  clock=402;fail=false;await feed.get();assert.equal(feed.status().stale,false);
});
test('first failure rejects and throttles retries',async()=>{
  let calls=0;const feed=createFeedCache(async()=>{calls++;throw Error('secret');});
  await assert.rejects(feed.get(),/Feed unavailable/);await assert.rejects(feed.get());assert.equal(calls,1);
});
test('API exposes freshness without changing data shape',async()=>{
  const api=createApi({schedule:async()=>({events:[]}),status:()=>({schedule:{stale:true,updatedAt:100}})});
  const r=await api(new Request('http://local/api/v1/lol/schedule'));assert.equal(r.headers.get('X-Data-Stale'),'true');assert.deepEqual(await r.json(),{events:[]});
  assert.equal(await api(new Request('http://local/api/v10')),null);
});

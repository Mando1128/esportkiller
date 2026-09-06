(() => {
  const host=document.createElement('section');host.className='live-scoreboard';
  host.innerHTML='<h2>Live game scoreboard</h2><p role="status" class="live-feed-status">Checking live game coverage…</p><label>Game <select aria-label="Choose live game"><option value="">Looking for games…</option></select></label><div class="live-player-grid"></div><p class="live-age"></p>';
  document.querySelector('.live-strip')?.after(host);
  const css=document.createElement('style');css.textContent='.live-scoreboard{margin:18px 0;padding:22px;background:#0c1b2b;border:1px solid #d6ba6555;border-radius:16px}.live-scoreboard h2{font-size:22px;margin:0}.live-scoreboard p{color:#bbccd7;font-size:14px}.live-scoreboard select{max-width:100%;padding:10px;background:#122a3c;color:white;border:1px solid #8da3b5;border-radius:8px}.live-player-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:18px}.live-player{padding:14px;border-left:4px solid #6ebfff;background:#13273a;border-radius:8px;display:flex;gap:12px;align-items:center}.live-player.red{border-color:#ee899c}.live-player img{width:48px;height:48px;border-radius:8px}.live-player strong{display:block;font-size:18px;font-weight:850;color:#fff;overflow-wrap:anywhere}.live-player .champion-name{font-size:16px;font-weight:800;color:#e9cf87}.live-kda{font-size:19px;font-weight:850;white-space:nowrap;margin-left:auto}.live-kda small{display:block;font-size:12px;font-weight:600;color:#adc1d0}@media(max-width:650px){.live-player-grid{grid-template-columns:1fr}.live-player strong{font-size:17px}}';document.head.append(css);
  const status=host.querySelector('[role=status]'),select=host.querySelector('select'),grid=host.querySelector('.live-player-grid');
  let generation=0,timer,lastFrame=null,lastReceived=null,version=null;
  const get=async path=>{const r=await fetch(path,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Feed unavailable');const data=await r.json();if(data.success===false)throw Error('Feed unavailable');return data;};
  fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(r=>r.json()).then(v=>version=v[0]).catch(()=>{});
  const text=(tag,value,className)=>{const e=document.createElement(tag);e.textContent=value;if(className)e.className=className;return e;};
  async function stats(id,token){
    if(!id)return;
    try {
      const result=await get(`/api/cito/lol/live/${encodeURIComponent(id)}/stats`);if(token!==generation)return;
      const data=result.data;if(!Array.isArray(data?.players)||!data.players.length)throw Error('No player coverage');
      grid.replaceChildren(...data.players.map(p=>{
        const card=document.createElement('article');card.className=`live-player ${p.side==='red'?'red':''}`;
        if(version && /^[A-Za-z0-9]+$/.test(String(p.championId||''))){const img=document.createElement('img');img.src=`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${p.championId}.png`;img.alt='';img.onerror=()=>img.remove();card.append(img);}
        const names=document.createElement('div');names.append(text('strong',p.summonerName||'Player name unavailable'),text('div',p.championId||'Champion unavailable','champion-name'));
        const kda=text('div',[p.kills,p.deaths,p.assists].map(v=>Number.isFinite(v)?v:'—').join(' / '),'live-kda');kda.append(text('small','KILLS / DEATHS / ASSISTS'));card.append(names,kda);return card;
      }));
      lastFrame=result.frameTimestamp||null;lastReceived=Date.now();status.textContent=`${data.state==='in_game'?'In progress':'Game state: '+(data.state||'unknown')} · ${data.players.length} players · Patch ${data.patchVersion||'unavailable'}`;
      if(data.state==='completed'||data.state==='finished'){status.textContent+=' · Final stats';return;}
      timer=setTimeout(()=>stats(id,token),Math.max(2000,Number(result.recommendedPollSeconds||2)*1000));
    } catch {if(token!==generation)return;status.textContent=grid.childElementCount?'Connection interrupted · Last received stats retained':'Live player stats unavailable for this game.';timer=setTimeout(()=>stats(id,token),30000);}
  }
  select.onchange=()=>{clearTimeout(timer);generation++;grid.replaceChildren();lastFrame=null;lastReceived=null;status.textContent='Loading game stats…';stats(select.value,generation);};
  async function discover(){
    try {const response=await get('/api/cito/lol/live'),games=Array.isArray(response.data)?response.data:[];
      const playable=games.filter(g=>g.gameId);const previous=select.value;
      select.replaceChildren(...playable.map(g=>{const o=document.createElement('option');o.value=g.gameId;o.textContent=(g.teams||[]).map(t=>t.name).join(' vs ')||`Game ${g.gameId}`;return o;}));
      if(playable.some(g=>String(g.gameId)===previous)){select.value=previous;}
      else if(playable.length)select.onchange();
      else {clearTimeout(timer);generation++;status.textContent=games.length?'Live matches found; the provider has not supplied a game ID for player stats.':'No live games returned by the provider.';if(!grid.childElementCount)grid.textContent='Player and champion stats will appear when live coverage is available.';}
    }catch{status.textContent='Live game provider unavailable · Retrying in 30 seconds.';}
    setTimeout(discover,30000);
  }
  setInterval(()=>{host.querySelector('.live-age').textContent=lastReceived?`Received ${Math.floor((Date.now()-lastReceived)/1000)}s ago${lastFrame?' · Source frame '+new Date(lastFrame).toLocaleString():' · Source timestamp unavailable'}`:'Waiting for verified live stats.';},1000);
  discover();
})();

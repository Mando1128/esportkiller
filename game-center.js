(() => {
  const strip=document.querySelector('.live-strip');if(!strip)return;
  strip.hidden=true;
  const host=document.createElement('section');host.className='game-center';
  host.innerHTML='<h2>League games</h2><div class="gc-tabs" role="tablist" aria-label="Game status"><button role="tab" data-kind="upcoming" aria-selected="true">Upcoming</button><button role="tab" data-kind="live" aria-selected="false">Live</button><button role="tab" data-kind="past" aria-selected="false">Past</button></div><p class="gc-status" role="status">Loading schedule…</p><div class="gc-list" role="tabpanel"></div><div class="gc-pager"><button data-page="-1">Previous</button><span></span><button data-page="1">Next</button></div>';
  strip.after(host);
  const style=document.createElement('style');style.textContent=`.live-strip[hidden]{display:none!important}.game-center{background:#0c1c2b;border:1px solid #c4a96955;border-radius:16px;padding:20px;margin-bottom:18px;min-width:0}.game-center h2{font-size:22px;margin:0 0 14px}.gc-tabs{display:flex;gap:8px}.gc-tabs button,.gc-pager button{min-height:44px;padding:10px 16px;color:#f1e3c5;background:#152d40;border:1px solid #90abb855;border-radius:8px;font-weight:800;font-size:14px;cursor:pointer}.gc-tabs button[aria-selected=true]{background:#d4b76b;color:#081422}.gc-status{font-size:14px;color:#b8cbd4}.gc-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gc-game{min-width:0;background:#142739;border-radius:10px;padding:14px}.gc-game strong{display:block;font-size:17px;overflow-wrap:anywhere;color:#f3f6fa}.gc-game small{display:block;font-size:14px;line-height:1.6;color:#b8cbd4}.gc-pager{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:14px;font-size:14px}.gc-pager button:disabled{opacity:.4;cursor:default}.live-scoreboard,.live-player,.live-player-grid,.detail,.panel{min-width:0}.live-player>div{min-width:0}.live-kda{flex-shrink:0}.detail{overflow-x:hidden}.modal .champ{flex-wrap:wrap}.modal .champ-left{max-width:100%}.modal .champ-left>span{overflow-wrap:anywhere}.modal .tools{flex-wrap:wrap}.view-tabs{flex-wrap:wrap}.view-tabs button{min-height:44px}.gc-tabs button:focus-visible,.gc-pager button:focus-visible{outline:2px solid #fff;outline-offset:2px}@media(max-width:650px){.gc-list{grid-template-columns:1fr}.game-center{padding:14px}.gc-tabs button{flex:1;padding:10px 8px}.live-player{flex-wrap:wrap}.live-kda{margin-left:0;width:100%}.live-scoreboard select{width:100%;font-size:16px}.gc-pager{flex-wrap:wrap}.modal{padding:8px}.modal .detail{padding:16px;max-height:94dvh}.pf-line{flex-wrap:wrap}.pf-picks{display:flex;flex-wrap:wrap}.pf-filters{display:flex;flex-wrap:wrap}.pf-filters select{max-width:100%;min-width:0}.tools input{width:100%;min-width:0!important}.view-tabs a{overflow-wrap:anywhere}}`;
  document.head.append(style);
  let events=[],kind='upcoming',page=0,checked=null,failed=false;
  const state=e=>String(e.state||e.status||e.match?.state||'').toLowerCase().replaceAll('-','_');
  const group=e=>{const s=state(e);if(['completed','finished','ended','closed'].includes(s))return 'past';if(['in_progress','inprogress','in_game','live','running'].includes(s))return 'live';if(['unstarted','scheduled','not_started','upcoming',''].includes(s)&&Date.parse(e.startTime)>Date.now())return 'upcoming';return 'unknown';};
  const time=value=>Number.isFinite(Date.parse(value))?new Date(value).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}):'Time unavailable';
  function render(){
    const list=events.filter(e=>group(e)===kind).sort((a,b)=>kind==='past'?Date.parse(b.startTime)-Date.parse(a.startTime):Date.parse(a.startTime)-Date.parse(b.startTime));
    const pages=Math.max(1,Math.ceil(list.length/8));page=Math.min(page,pages-1);
    const panel=host.querySelector('.gc-list');panel.replaceChildren();
    for(const e of list.slice(page*8,page*8+8)){
      const card=document.createElement('article');card.className='gc-game';const teams=e.match?.teams||e.teams||[];
      const name=document.createElement('strong');name.textContent=teams.map(t=>t.name||t.code||'TBD').join(' vs ')||'Teams to be announced';
      const meta=document.createElement('small');meta.textContent=`${e.league?.name||e.leagueName||'League of Legends'} · ${e.blockName||state(e)||'Scheduled'}`;
      const date=document.createElement('small');date.textContent=time(e.startTime);card.append(name,meta,date);
      if(kind==='past'){const score=document.createElement('small');score.textContent=teams.map(t=>t.result?.gameWins??t.score??'—').join(' – ');card.append(score);}
      panel.append(card);
    }
    if(!list.length){const p=document.createElement('p');p.textContent=failed?'Schedule unavailable. Please check again shortly.':`No ${kind} games returned by the connected schedule.`;panel.append(p);}
    host.querySelector('.gc-status').textContent=failed?`Connection unavailable${checked?' · Last successful check '+time(checked):''}`:`${list.length} ${kind} games · ${checked?'Checked '+time(checked):'Loading'} · Times use your device timezone`;
    host.querySelector('.gc-pager span').textContent=`${page+1} / ${pages}`;host.querySelector('[data-page="-1"]').disabled=page===0;host.querySelector('[data-page="1"]').disabled=page===pages-1;
    host.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.kind===kind)));
  }
  host.onclick=e=>{const tab=e.target.closest('[data-kind]'),pager=e.target.closest('[data-page]');if(tab){kind=tab.dataset.kind;page=0;render();}if(pager){page=Math.max(0,page+Number(pager.dataset.page));render();}};
  async function refresh(){try{const r=await fetch('/api/lol-esports/schedule',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const data=await r.json(),items=data?.data?.schedule?.events;if(!Array.isArray(items))throw Error();events=items;checked=new Date().toISOString();failed=false;}catch{failed=true;}render();setTimeout(refresh,30000);}
  refresh();
})();

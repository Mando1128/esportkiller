// Verified visible output of Apify run G64x23PqFgmjFMpXa. Not a live feed.
(() => {
  const rows = [
    ['14495974','Theshy + Wei + Rookie',29,'standard','IG',true],
    ['14497927','TheShy',10.5,'demon','IG'],
    ['14495914','TheShy',8.5,'standard','IG'],
    ['14497926','TheShy',5.5,'goblin','IG'],
    ['14495975','Rookie + JiaQi',23.5,'standard','IG',true],
    ['14497922','Player 287549 (name unverified)',12.5,'demon','IG'],
    ['14495915','Player 287549 (name unverified)',10,'standard','IG'],
    ['14497921','Player 287549 (name unverified)',7.5,'goblin','IG'],
    ['14495976','ZUIAN + Tian + Creme',31.5,'standard','TES',true],
    ['14497934','Rookie',13.5,'demon','IG']
  ];
  const panel=document.createElement('section');
  panel.className='verified-import';
  panel.innerHTML=`<details open><summary>PrizePicks · Imported lines <span>10 historical observations</span></summary><p>Source: Apify completed run · Sept 4, 10:51 PM Pacific. Maps 1–3 kills, IG vs TES. These are saved observations, not currently available picks. Match start: <time></time>.</p><label>Filter imported lines <select><option value="all">All variants</option><option>standard</option><option>demon</option><option>goblin</option><option value="combo">Combos</option></select></label><div class="import-grid"></div></details>`;
  panel.querySelector('time').textContent=new Date('2026-09-05T06:00:00Z').toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
  const grid=panel.querySelector('.import-grid');
  function render(){const filter=panel.querySelector('select').value;grid.replaceChildren();for(const [id,name,line,tier,team,combo] of rows){if(filter!=='all'&&(filter==='combo'?!combo:tier!==filter))continue;const card=document.createElement('article');card.innerHTML=`<strong>${name}</strong><small>${team} · MAPS 1–3 Kills${combo?' · Combo':''}</small><b>${line}</b><span>${tier.toUpperCase()}</span><small>Historical line · ID ${id}</small>`;grid.append(card);}}
  panel.querySelector('select').addEventListener('change',render);render();
  document.querySelector('main').append(panel);
  const style=document.createElement('style');style.textContent='.verified-import{margin:24px auto;padding:24px;max-width:1370px;background:#131b2b;color:#edf2fc;border:1px solid #334259;border-radius:16px;font:16px/1.6 Segoe UI,sans-serif}.verified-import summary{font-size:21px;font-weight:750;cursor:pointer}.verified-import summary span{font-size:14px;color:#b7c4d9}.verified-import p,.verified-import small{color:#b7c4d9}.verified-import select{padding:10px;background:#202d43;color:white;border:1px solid #657895;border-radius:8px}.import-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:16px}.import-grid article{padding:18px;border:1px solid #344158;border-radius:10px;background:#192338;display:grid;gap:4px}.import-grid strong{font-size:18px}.import-grid b{font-size:28px;color:#e6c975}.import-grid small{font-size:14px}@media(max-width:600px){.verified-import{margin:12px;padding:16px}.import-grid{grid-template-columns:1fr}}';document.head.append(style);
})();

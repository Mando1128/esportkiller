(() => {
  // Captured from the publicly visible PrizePicks board on 2026-09-01. This is a manual snapshot, not a live feed.
  const decode = (sport, market, match, text) => text.split(';').filter(Boolean).map(item => { const [player, line] = item.split(':'); return { sport, market, match, player, line }; });
  const rows = [
    ...decode('LoL','Maps 1–3 Kills','HLE vs T1 · Wed 1:00am','Zeus:9.5;Kanavi:11.5;Zeka:12.5;Gumayusi:12.5;Delight:2.5;Doran:7;Oner:9;Faker:9;Peyz:14;Keria:2.5'),
    ...decode('LoL','Maps 1–3 Kills','BW vs SU · Wed 8:00am','Aytekn:7.5;Osman123:11;Camana:12.5;Ruep:14;IlllIma:9.5;Rames:11.5;Vetheo:13.5;Cimpo:13.5'),
    ...decode('LoL','Maps 1–3 Kills','KOIA vs UCAM · Wed 8:00am','NightSlayer:9;XnS:11;Fresskowy:12.5;13:15.5;Kozi:9.5;bluerzor:10.5;ESCIK:11.5;Andariel:14.5'),
    ...decode('LoL','Maps 1–3 Kills','GL vs TLNP · Wed 9:00am','Carlsen:11.5;Thayger:13.5;OMON:15.5;Harpoon:16.5;Spooder:5.5;Stefan:7;Toffe:7.5;Axelent:9.5'),
    ...decode('LoL','Maps 1–3 Kills','DK vs BFX · Thu 1:00am','Siwoo:9;Lucid:11;ShowMaker:12;Smash:15.5;Career:2.5;Clear:6.5;Raptor:8.5;VicLa:8.5;Taeyoon:11.5;Kellin:2.5'),
    ...decode('LoL','Maps 1–3 Kills','WE vs BLG · Thu 2:00am','Cube:6;Monki:9;Karis:9;About:11;Erha:1.5;Bin:10;Xun:12;knight:16.5;Viper:16.5;ON:2.5'),
    ...decode('LoL','Maps 1–3 Kills','KHK vs BIG · Thu 8:00am','BODA:10;Densi:8.5;Abbedagge:9.5;UNFORGIVEN:12.5;Irrelevant:10;113:12.5;Reeker:13.5;Patrik:14.5'),
    ...decode('LoL','Maps 1–3 Kills (Combo)','HLE vs T1 · Wed 1:00am','Zeus + Kanavi + Zeka:32.5;Zeka + Gumayusi:25;Doran + Oner + Faker:25.5;Faker + Peyz:23'),
    ...decode('LoL','Maps 1–3 Kills (Combo)','DK vs BFX · Thu 1:00am','Siwoo + Lucid + ShowMaker:32;ShowMaker + Smash:27.5;Clear + Raptor + VicLa:24.5;VicLa + Taeyoon:20.5'),
    ...decode('LoL','Maps 1–3 Kills (Combo)','WE vs BLG · Thu 2:00am','Cube + Monki + Karis:24;Karis + About:20;Bin + Xun + knight:38.5;knight + Viper:33'),
    ...decode('CS2','Maps 1–2 Kills','Magic Esport vs K27 · Wed 2:00am','tenzy:33.5'),
    ...decode('CS2','Maps 1–2 Kills','BIG vs Nemiga Gaming · Wed 5:00am','gr1ks:33.5'),
    ...decode('CS2','Maps 1–2 Kills','Eyeballers vs DENDELE CS · Wed 5:00am','KRIMZ:28.5'),
    ...decode('CS2','Maps 1–2 Kills','5star vs Rare Atom · Wed 5:30am','hoolig4n:29.5'),
    ...decode('CS2','Maps 1–2 Headshots','Magic Esport vs K27 · Wed 2:00am','tenzy:21.5'),
    ...decode('CS2','Maps 1–2 Headshots','GamerLegion vs Nuclear Tigers · Wed 2:00am','FL4MUS:19.5;Tauson:14.5;REZ:17.5'),
    ...decode('CS2','Maps 1–2 Headshots','Eternal Fire vs MIBR · Wed 2:00am','jottAAA:17.5'),
    ...decode('CS2','Maps 1–2 Headshots','3DMAX vs Heroic · Wed 2:00am','Graviti:17'),
    ...decode('CS2','Maps 1–2 Headshots','DENDELE CS vs Eyeballers · Wed 5:00am','doc:18'),
    ...decode('CS2','Maps 1–2 Headshots','HOTU vs Nuclear TigeRES · Wed 1:00am','n0rb3r7:15.5'),
    ...decode('CS2','Maps 1–2 Headshots','BIG vs Nemiga Gaming · Wed 5:00am','JDC:16.5')
  ];
  const tabs = document.querySelector('#snapshotTabs'), list = document.querySelector('#snapshotList'), status = document.querySelector('#snapshotStatus');
  if (!tabs || !list || !status) return;
  let selected = 'All';
  const render = () => {
    const visible = selected === 'All' ? rows : rows.filter(row => row.sport === selected);
    status.textContent = `${visible.length} lines captured`;
    list.innerHTML = visible.map((row, i) => `<article class="snapshot-row" data-id="${i}"><div><strong>${row.player}</strong><small>${row.match}</small></div><span class="snapshot-market">${row.market}</span><span class="snapshot-line">${row.line}</span><small>${row.sport}</small><div class="snapshot-actions"><button class="snapshot-side less">Less</button><button class="snapshot-side more">More</button></div></article>`).join('');
  };
  ['All','LoL','CS2'].forEach(name => { const button=document.createElement('button'); button.textContent=name; button.classList.toggle('active',name===selected); button.onclick=()=>{selected=name;[...tabs.children].forEach(item=>item.classList.toggle('active',item===button));render()};tabs.append(button); });
  list.onclick = event => {
    const button = event.target.closest('.snapshot-side');
    if (button) { button.closest('.snapshot-actions').querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button)); const toast=document.querySelector('#toast'); if(toast){toast.textContent=`${button.textContent} selected for research`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)} return; }
    const card = event.target.closest('.snapshot-row'); if (!card) return;
    const row = rows[Number(card.dataset.id)], drawer = document.querySelector('#drawer'), content = document.querySelector('#drawerContent');
    if (!row || !drawer || !content) return;
    const gameIcon = row.sport === 'CS2' ? 'cs2' : 'lol';
    content.innerHTML = `<div class="drawer-title"><span class="game-icon ${gameIcon}">${row.sport === 'CS2' ? 'CS' : 'LoL'}</span><div><h2>${row.player}</h2><p>${row.match}</p></div></div><div class="prop-summary"><div><strong>${row.line} ${row.market}</strong><small>PrizePicks visible-board snapshot · 2026-09-01</small></div><div class="choice-group"><button class="choice under">Less</button><button class="choice over">More</button></div></div><div class="detail-tabs"><button class="active">Performance</button><button>Matchup</button><button>Market</button></div><div class="stats-grid"><div class="stat"><span>L5</span><b>—</b></div><div class="stat"><span>L10</span><b>—</b></div><div class="stat"><span>L20</span><b>—</b></div><div class="stat"><span>H2H</span><b>—</b></div><div class="stat"><span>LINE</span><b>${row.line}</b></div></div><div class="chart-card"><div class="card-title"><h3>Past games</h3><small>Match history pending</small></div><p style="margin:0;color:var(--muted);line-height:1.6">Past-game results and H2H cannot be derived from a projection board alone. They will populate when a verified match-history provider is connected.</p></div><div class="insight-card"><div class="card-title"><h3>Matchup & player context</h3><small>Source status</small></div><div class="splits"><div class="split">Current market<b>Captured</b></div><div class="split">Matchup<b>${row.match.split(' · ')[0]}</b></div><div class="split">Champion / weapon pool<b>Pending</b></div><div class="split">Play style / sniper rate<b>Pending</b></div></div></div><div class="book-card"><div class="card-title"><h3>Market</h3><small>Captured board line</small></div><div class="book-row"><span>PrizePicks snapshot</span><strong>${row.line} ${row.market}</strong></div></div>`;
    drawer.classList.add('open');
  };
  render();
})();

const detailData = {
  aspas:{short:'34.8',long:'42.6',pace:'+8.2%',usage:'29.4%',patch:'V11.04',replacement:'nzr → artzin',impact:'+3.7 kills',style:'High-tempo attack side. aspas carries the largest first-contact share when MIBR play a substitute initiator.'},
  donk:{short:'18.1',long:'22.7',pace:'+5.4%',usage:'31.8%',patch:'CS2 Aug',replacement:'No change',impact:'Stable five',style:'Spirit create early duels for donk. Longer maps increase his opening-duel volume and kill ceiling.'},
  Chovy:{short:'9.2',long:'13.8',pace:'+6.1%',usage:'27.1%',patch:'15.17',replacement:'No change',impact:'Stable five',style:'Gen.G funnel mid-lane resources in slower games; gold share and late-fight participation trend upward.'},
  Derke:{short:'21.3',long:'27.4',pace:'+9.7%',usage:'28.6%',patch:'V11.04',replacement:'crashies → kaajak',impact:'+2.1 HS',style:'FNATIC play more aggressively with their replacement controller; Derke receives more first-duel opportunities.'},
  ZywOo:{short:'35.4',long:'42.8',pace:'+4.9%',usage:'28.9%',patch:'CS2 Aug',replacement:'No change',impact:'Stable five',style:'Vitality’s economy stabilizes in extended maps, supporting more full-buy rifle rounds for ZywOo.'},
  Gumayusi:{short:'642',long:'756',pace:'+7.8%',usage:'30.2%',patch:'15.17',replacement:'No change',impact:'Stable five',style:'T1’s bot-side farm allocation rises in longer series, particularly when the team plays front-to-back compositions.'},
  t3xture:{short:'16.5',long:'20.8',pace:'+8.9%',usage:'27.8%',patch:'V11.04',replacement:'No change',impact:'Stable five',style:'GEN.G’s fast retake style creates repeated duel volume for t3xture on defensive rounds.'},
  m0NESY:{short:'6.9',long:'8.6',pace:'+3.1%',usage:'24.6%',patch:'CS2 Aug',replacement:'huNter → malbs',impact:'−0.4 HS',style:'G2’s replacement lineup shifts more opening rifles away from m0NESY, reducing headshot share slightly.'}
};
const content = document.querySelector('#drawerContent');
const gameMeta = {
  aspas:{label:'Signature agent',value:'Jett',patch:'VALORANT 11.04',note:'Current patch context: duelist entry patterns and map rotation are tracked separately from all-time results.'},
  donk:{label:'Preferred weapon',value:'AK-47',patch:'CS2 August build',note:'Current build context: weapon and map pool splits are stored per match for patch-aware comparisons.'},
  Chovy:{label:'Champion focus',value:'Azir',patch:'LoL 15.17',note:'Current patch context: champion choice, lane role, and composition are filtered separately from general form.'},
  Derke:{label:'Signature agent',value:'Raze',patch:'VALORANT 11.04',note:'Current patch context: agent selection and team composition are shown with their own sample size.'},
  ZywOo:{label:'Preferred weapon',value:'AWP',patch:'CS2 August build',note:'Current build context: AWP economy and map-side splits are handled independently from aggregate kills.'},
  Gumayusi:{label:'Champion focus',value:'Jinx',patch:'LoL 15.17',note:'Current patch context: ADC champion performance is segmented by lane matchup, composition, and patch.'},
  t3xture:{label:'Signature agent',value:'Jett',patch:'VALORANT 11.04',note:'Current patch context: first-duel rate is compared within the same agent and patch sample.'},
  m0NESY:{label:'Preferred weapon',value:'AWP',patch:'CS2 August build',note:'Current build context: weapon usage, map-side, and opponent economy splits are tracked separately.'}
};
const loadoutImages = {
  Chovy:{name:'Azir',url:'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/Azir.png'},
  Gumayusi:{name:'Jinx',url:'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/Jinx.png'}
};
new MutationObserver(() => {
  const name = content.querySelector('.drawer-title h2')?.textContent;
  if (!name || content.dataset.player === name) return;
  content.dataset.player = name;
  const d = detailData[name]; if (!d) return;
  content.insertAdjacentHTML('beforeend', `<div class="insight-card"><div class="card-title"><h3>Team style & game length</h3><span class="patch-chip">Patch ${d.patch}</span></div><div class="context-grid"><div class="context-metric"><span>SHORT GAME AVG</span><b>${d.short}</b><small>team games below title threshold</small></div><div class="context-metric"><span>LONG GAME AVG</span><b>${d.long}</b><small>${d.pace} pace vs. league</small></div><div class="context-metric"><span>PLAYER USAGE</span><b>${d.usage}</b><small>share of team output</small></div><div class="context-metric"><span>TEAM PACE</span><b>${d.pace}</b><small>rolling 10-game profile</small></div></div></div><div class="insight-card"><div class="card-title"><h3>Last-game replacement</h3><small>Expected lineup check</small></div><div class="roster-row"><span>Roster / role change</span><b>${d.replacement}</b><i class="roster-status">${d.impact}</i></div><p>${d.style}</p></div>`);
}).observe(content,{childList:true,subtree:true});
new MutationObserver(() => {
  const name = content.querySelector('.drawer-title h2')?.textContent;
  const asset = loadoutImages[name];
  if (!name || !asset || content.dataset.assetPlayer === name) return;
  content.dataset.assetPlayer = name;
  content.insertAdjacentHTML('beforeend', `<div class="champion-art"><img src="${asset.url}" alt="${asset.name} champion artwork" /><div><span>Champion image</span><strong>${asset.name}</strong><small>Current champion focus for this player card</small></div></div>`);
}).observe(content,{childList:true,subtree:true});
new MutationObserver(() => {
  const name = content.querySelector('.drawer-title h2')?.textContent;
  if (!name || content.dataset.metaPlayer === name) return;
  const meta = gameMeta[name]; if (!meta) return;
  content.dataset.metaPlayer = name;
  content.insertAdjacentHTML('beforeend', `<div class="insight-card"><div class="card-title"><h3>Game loadout & patch</h3><span class="patch-chip">${meta.patch}</span></div><div class="meta-grid"><div><span>${meta.label}</span><b>${meta.value}</b></div><div><span>Patch sample</span><b>Tracked separately</b></div></div><p>${meta.note}</p></div>`);
}).observe(content,{childList:true,subtree:true});

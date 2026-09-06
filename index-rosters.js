(() => {
  const rosters = [
    ['MIBR', 'IEM Beijing 2026 Closed Qualifier', ['tomaszin','insani','nqz','venomzera','LNZ']],
    ['Eternal Fire', 'IEM Beijing 2026 Closed Qualifier', ['soulfly','regali','Kvem','jottAAA','MisteM']],
    ['3DMAX', 'IEM Beijing 2026 Closed Qualifier', ['Maka','Lucky','Graviti','misutaaa','Kursy']],
    ['HEROIC', 'IEM Beijing 2026 Closed Qualifier', ['Brollan','MartinezSa','nilo','Chr1zN','susp']],
  ];
  const target = document.querySelector('#homeRosters');
  if (!target) return;
  target.innerHTML = rosters.map(([team, event, players]) => `<article class="home-roster"><h3>${team}</h3><p>${event}</p><div class="home-roster-members">${players.map(player => `<span>${player}<b>STARTER</b></span>`).join(' · ')}</div></article>`).join('');
})();

(() => {
  const groups = {
    'CS2': [
      ['tomaszin','MIBR'],['insani','MIBR'],['nqz','MIBR'],['venomzera','MIBR'],['LNZ','MIBR'],
      ['soulfly','Eternal Fire'],['regali','Eternal Fire'],['Kvem','Eternal Fire'],['jottAAA','Eternal Fire'],['MisteM','Eternal Fire'],
      ['Maka','3DMAX'],['Lucky','3DMAX'],['Graviti','3DMAX'],['misutaaa','3DMAX'],['Kursy','3DMAX'],
      ['Brollan','HEROIC'],['MartinezSa','HEROIC'],['nilo','HEROIC'],['Chr1zN','HEROIC'],['susp','HEROIC'],
    ],
    'League of Legends': [
      ['Selenex','Barça Esports · Top'],['Koldo','Barça Esports · Jungle'],['Macaquiño','Barça Esports · Mid'],['Legolas','Barça Esports · ADC'],['Oscure','Barça Esports · Support'],
      ['Kozi','UCAM Esports · Top'],['bluerzor','UCAM Esports · Jungle'],['ESCIK','UCAM Esports · Mid'],['ANDARIEL','UCAM Esports · Bot'],['iLevi','UCAM Esports · Support'],['Crusher','UCAM Esports · Substitute'],['Gaio','UCAM Esports · Substitute'],
      ['Papiteero','Team Heretics Academy · Top'],['Lurox','Team Heretics Academy · Jungle'],['Mercy9','Team Heretics Academy · Mid'],['Lure','Team Heretics Academy · Bot'],['Batuuu','Team Heretics Academy · Support'],
      ['Tracyn','Team Heretics · Top'],['Daglas','Team Heretics · Jungle'],['Serin','Team Heretics · Mid'],['Hype','Team Heretics · Bot'],['Way','Team Heretics · Support'],
      ['SLT','Nightbirds · Top'],['MrJackson','Nightbirds · Jungle'],['Vasco','Nightbirds · Mid'],['Strode','Nightbirds · Bot'],['denyk','Nightbirds · Support'],
      ['Chan','Partizan Sangal · Top'],['Ferret','Partizan Sangal · Jungle'],['Ruby','Partizan Sangal · Mid'],['Shy Carry','Partizan Sangal · Bot'],['Erdote','Partizan Sangal · Support'],
    ],
    'Dota 2': [], 'VALORANT': [], 'Call of Duty': [],
  };
  const buttons = document.querySelector('#catalogControls');
  const output = document.querySelector('#playerCatalog');
  const status = document.querySelector('#catalogStatus');
  const propControls = document.querySelector('#catalogPropControls');
  let selectedSide = 'Over';
  if (!buttons || !output) return;
  const paint = (game, players) => {
    status.textContent = `${players.length} players loaded`;
    output.innerHTML = players.length ? players.map(([name, team]) => `<article class="catalog-player" data-player="${name}" data-team="${team}" data-game="${game}"><strong>${name}</strong><small>${team}</small><em>Open ${selectedSide} kills profile →</em></article>`).join('') : '<div class="empty">No verified roster catalog is loaded for this sport yet.</div>';
  };
  const loadDota = async () => {
    status.textContent = 'Loading Dota pros…'; output.innerHTML = '<div class="empty">Loading current OpenDota pro-player directory…</div>';
    try {
      const data = await fetch('https://api.opendota.com/api/proPlayers').then(response => response.ok ? response.json() : Promise.reject());
      const players = data.filter(player => player.name).slice(0, 250).map(player => [player.name, player.team_name || 'Independent / team unknown']);
      groups['Dota 2'] = players; paint('Dota 2', players);
    } catch { status.textContent = 'OpenDota unavailable'; output.innerHTML = '<div class="empty">Could not load the current Dota directory.</div>'; }
  };
  Object.keys(groups).forEach(game => { const button = document.createElement('button'); button.textContent = game; button.onclick = () => { [...buttons.children].forEach(item => item.classList.toggle('active', item === button)); game === 'Dota 2' && !groups['Dota 2'].length ? loadDota() : paint(game, groups[game]); }; buttons.append(button); });
  propControls?.addEventListener('click', event => {
    const button = event.target.closest('[data-catalog-side]'); if (!button) return;
    selectedSide = button.dataset.catalogSide;
    propControls.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    propControls.querySelectorAll('button').forEach(item => item.classList.toggle('over', item.dataset.catalogSide === 'Over'));
    propControls.querySelectorAll('button').forEach(item => item.classList.toggle('under', item.dataset.catalogSide === 'Under'));
    const active = buttons.querySelector('.active'); if (active) paint(active.textContent, groups[active.textContent]);
  });
  output.addEventListener('click', event => {
    const card = event.target.closest('[data-player]'); if (!card) return;
    window.dispatchEvent(new CustomEvent('pulse:openPlayer', { detail: { player: card.dataset.player, team: card.dataset.team, game: card.dataset.game, side: selectedSide } }));
  });
  buttons.firstElementChild.click();
})();

(() => {
  const container = document.querySelector('#dotaList');
  const status = document.querySelector('#dotaStatus');
  const fromServer = /^https?:$/.test(location.protocol);
  const request = fromServer
    ? fetch('/api/public/dota').then(r => r.ok ? r.json() : Promise.reject())
    : Promise.all([
        fetch('https://api.opendota.com/api/proPlayers').then(r => r.ok ? r.json() : Promise.reject()),
        fetch('https://api.opendota.com/api/proMatches').then(r => r.ok ? r.json() : Promise.reject()),
      ]).then(([players, matches]) => ({ players, matches, source:'OpenDota' }));
  status.textContent = 'Loading OpenDota…';
  request.then(data => {
    const playing = new Set(data.matches.flatMap(match => [match.radiant_name, match.dire_name]).filter(Boolean));
    const players = data.players.filter(player => player.name).slice(0, 30);
    status.textContent = `${players.length} current pros loaded`;
    container.innerHTML = players.map(player => `<article class="dota-player"><div class="dota-avatar">${(player.name || '?').slice(0,1).toUpperCase()}</div><div><strong>${player.name}</strong><small>${player.team_name || 'Independent / team unknown'}</small></div><span>${player.personaname || ''}</span><b class="${playing.has(player.team_name) ? 'active-pro' : ''}">${playing.has(player.team_name) ? 'Active match team' : 'Pro directory'}</b></article>`).join('');
  }).catch(() => { status.textContent = 'OpenDota unavailable'; container.innerHTML = '<div class="empty">The public Dota directory could not load. Try Refresh, or open the app through the local server.</div>'; });
})();

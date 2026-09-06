(() => {
  const drawer = document.querySelector('#drawer');
  const content = document.querySelector('#drawerContent');
  if (!drawer || !content) return;

  window.addEventListener('pulse:openPlayer', event => {
    const { player, team, game, side } = event.detail;
    const badge = game === 'CS2' ? 'CS' : game === 'VALORANT' ? 'V' : game === 'Dota 2' ? 'D2' : game === 'Call of Duty' ? 'COD' : 'LoL';
    const icon = game === 'CS2' ? 'cs2' : game === 'VALORANT' ? 'valorant' : 'lol';
    content.innerHTML = `<div class="drawer-title"><span class="game-icon ${icon}">${badge}</span><div><h2>${player}</h2><p>${team}</p></div></div><div class="prop-summary"><div><strong>${side} · Kills</strong><small>Player profile selected</small></div><div class="choice-group"><button class="choice active ${side.toLowerCase()}">${side}</button></div></div><div class="chart-card"><div class="card-title"><h3>Line status</h3><small>Provider check</small></div><p style="margin:0;color:var(--muted);line-height:1.6">No verified kills line is currently loaded for ${player}. The player is in the roster directory, but a real market line must come from a licensed projections provider before it can be displayed.</p></div><div class="insight-card"><div class="card-title"><h3>What is available</h3></div><div class="splits"><div class="split">Roster entry<b>Loaded</b></div><div class="split">Selected side<b>${side}</b></div><div class="split">Market<b>Kills only</b></div><div class="split">Line feed<b>Pending</b></div></div></div><button class="outline-button" id="profileBoard">View current board</button>`;
    drawer.classList.add('open');
    document.querySelector('#profileBoard')?.addEventListener('click', () => {
      drawer.classList.remove('open');
      document.querySelector('#lines')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

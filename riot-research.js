(() => {
  const form = document.getElementById('riotForm');
  const input = document.getElementById('riotId');
  const result = document.getElementById('riotResult');
  const status = document.getElementById('riotStatus');
  if (!form || location.protocol === 'file:') return;
  status.textContent = 'Ready for lookup';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const [gameName, tagLine] = input.value.trim().split('#');
    if (!gameName || !tagLine) { result.className = 'riot-result error'; result.textContent = 'Use a Riot ID in the form Name#TAG.'; return; }
    result.className = 'riot-result'; result.textContent = 'Loading Riot research…';
    try {
      const response = await fetch(`/api/research/lol?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Lookup failed');
      const ranks = data.ranked?.map(rank => `${rank.queueType.replace('RANKED_','')} ${rank.tier} ${rank.rank} · ${rank.leaguePoints} LP`).join(' / ') || 'No ranked queues returned';
      result.innerHTML = `<strong>${data.account.gameName}#${data.account.tagLine}</strong><br>Ranked: ${ranks}<br>Recent matches available: ${data.matchIds?.length || 0}<br><small>Updated in your local time: ${new Date(data.updatedAt).toLocaleString()}</small>`;
    } catch (error) { result.className = 'riot-result error'; result.textContent = error.message; }
  });
})();

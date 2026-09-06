(() => {
  const content = document.querySelector('#drawerContent');
  if (!content) return;
  const american = probability => probability >= .5
    ? `-${Math.round(100 * probability / (1 - probability))}`
    : `+${Math.round(100 * (1 - probability) / probability)}`;
  const render = () => {
    const card = content.querySelector('.book-card');
    const player = content.querySelector('.drawer-title h2')?.textContent;
    const item = typeof lines !== 'undefined' && lines.find(line => line.player === player);
    if (!card || !item) return;
    const overWins = item.values.filter(value => value > item.line).length;
    const overProbability = (overWins + 1) / (item.values.length + 2); // smoothing avoids 0%/100% claims
    const underProbability = 1 - overProbability;
    card.innerHTML = `<div class="card-title"><h3>Model fair odds</h3><small>Research estimate · not a betting offer</small></div><div class="book-row"><span>Over ${item.line}</span><strong>${Math.round(overProbability * 100)}% · ${american(overProbability)}</strong><i class="best">MODEL</i></div><div class="book-row"><span>Under ${item.line}</span><strong>${Math.round(underProbability * 100)}% · ${american(underProbability)}</strong><i class="best">MODEL</i></div><div class="book-row"><span>Evidence</span><strong>${overWins}/${item.values.length} recent results above the line</strong></div>`;
  };
  new MutationObserver(render).observe(content, { childList:true, subtree:true });
})();

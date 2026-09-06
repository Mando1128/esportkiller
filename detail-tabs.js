(() => {
  const content = document.querySelector('#drawerContent');
  if (!content) return;
  content.addEventListener('click', event => {
    const tab = event.target.closest('.detail-tabs button');
    if (!tab) return;
    const tabs = [...content.querySelectorAll('.detail-tabs button')];
    tabs.forEach(button => button.classList.toggle('active', button === tab));
    const target = tab.textContent.trim() === 'Performance' ? content.querySelector('.chart-card')
      : tab.textContent.trim() === 'Matchup' ? content.querySelector('.insight-card')
      : content.querySelector('.book-card');
    target?.scrollIntoView({ behavior:'smooth', block:'start' });
  });
})();

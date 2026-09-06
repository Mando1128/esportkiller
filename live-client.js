(() => {
  const status = document.querySelector('.live-status');
  if (!/^https?:$/.test(location.protocol)) return;
  fetch('/api/live').then(r => r.ok ? r.json() : null).then(state => {
    if (!state) return;
    status.innerHTML = state.enabled ? `<i></i> Live data ready · ${state.feeds.length} open feed${state.feeds.length === 1 ? '' : 's'}` : '<i></i> Demo mode · add provider key for live feeds';
  }).catch(() => {});
  const stream = new EventSource('/api/live-events');
  stream.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.type === 'game-update') status.innerHTML = '<i></i> Live game update received';
    if (message.type === 'feed-status') status.innerHTML = `<i></i> Live data ready · ${message.feeds.length} open feeds`;
    if (message.type === 'feed-error') status.innerHTML = '<i></i> Live feed reconnecting';
  };
})();

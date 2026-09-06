// Stable, provider-independent API for Esport Killer clients.
export function createApi({ props, schedule, live, patches, status = () => ({}) }) {
  const routes = {
    '/api/v1/lol/props': props,
    '/api/v1/lol/schedule': schedule,
    '/api/v1/lol/live': live,
    '/api/v1/lol/patches': patches,
    '/api/v1/status': status,
  };
  return async request => {
    const path = new URL(request.url).pathname;
    if (path !== '/api/v1' && !path.startsWith('/api/v1/')) return null;
    const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
    if (request.method !== 'GET') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
    if (path === '/api/v1' || path === '/api/v1/') return json({ name: 'Esport Killer API', version: 1, endpoints: ['/api/v1/health', ...Object.keys(routes)], refreshSeconds: 30 });
    if (path === '/api/v1/health') return json({ ok: true, at: new Date().toISOString(), note: 'Server health does not indicate provider availability.' });
    if (!routes[path]) return json({ error: 'NOT_FOUND' }, 404);
    try {
      const data = await routes[path]();
      const response = json(data);
      const key = path.split('/').pop();
      const freshness = status()[key];
      if (freshness) {
        response.headers.set('X-Data-Stale', String(freshness.stale));
        if (freshness.updatedAt !== null) response.headers.set('X-Data-Updated-At', new Date(freshness.updatedAt).toISOString());
      }
      return response;
    } catch {
      return json({ error: 'PROVIDER_UNAVAILABLE', message: 'The data provider is unavailable. Please retry later.', retryAfterSeconds: 30 }, 503);
    }
  };
}

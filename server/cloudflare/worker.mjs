import { auth, session, json } from './auth.mjs';
import { getProps, readJson } from './props.mjs';
const publicFiles = new Set(['/','/index.html','/auth.js','/sw.js','/manifest.webmanifest','/privacy.html','/terms.html','/responsible-play.html','/data-sources.html','/welcome.html']);
export default {
  async fetch(request, env) {
    try {
      const url=new URL(request.url), path=decodeURIComponent(url.pathname);
      if(path==='/api/health'||path==='/api/v1/health')return json({ok:true,service:'Esport Killer',databaseConfigured:Boolean(env.DB)});
      const authResponse=await auth(request,env);if(authResponse)return authResponse;
      if(publicFiles.has(path)||path.startsWith('/assets/'))return env.ASSETS.fetch(request);
      if(!env.DB)return json({error:'BACKEND_NOT_CONFIGURED'},503);
      const user=await session(request,env.DB);
      if(!user)return json({error:'LOGIN_REQUIRED'},401);
      if(request.method!=='GET'&&request.method!=='HEAD')return json({error:'METHOD_NOT_ALLOWED'},405);
      if(['/api/v1/lol/props','/api/prizepicks/lol','/api/v1/lol/diagnostics'].includes(path)) {
        const feed=await getProps(env);
        return json(path.endsWith('/diagnostics')?{schemaVersion:1,...feed.diagnostics}:feed,feed.fetchedAt?200:503,{'X-Data-Stale':String(feed.stale)});
      }
      // Preserve schedule and live functionality behind owned API routes.
      const lolRoutes={'/api/v1/lol/schedule':'getSchedule','/api/lol-esports/schedule':'getSchedule','/api/v1/lol/live':'getLive','/api/lol-esports/live':'getLive','/api/lol-esports/leagues':'getLeagues'};
      if(lolRoutes[path]){
        const endpoint=new URL('https://esports-api.lolesports.com/persisted/gw/'+lolRoutes[path]);endpoint.searchParams.set('hl','en-US');
        const response=await fetch(endpoint,{headers:{'x-api-key':env.LOL_ESPORTS_API_KEY},signal:AbortSignal.timeout(12000)});
        if(!response.ok)return json({error:'SCHEDULE_UNAVAILABLE'},502);
        return json(await readJson(response));
      }
      if(path.startsWith('/api/'))return json({error:'ENDPOINT_UNAVAILABLE'},404);
      // No authenticated asset, historical line or research response enters a shared browser cache.
      const response=await env.ASSETS.fetch(request);
      const headers=new Headers(response.headers);headers.set('Cache-Control','private, no-store');headers.set('Vary','Cookie');
      return new Response(response.body,{status:response.status,headers});
    }catch(error){console.error(JSON.stringify({event:'request_failed',type:error.name}));return json({error:'SERVICE_UNAVAILABLE'},503);}
  },
  async scheduled(controller, env) {
    await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE expires_at<=?').bind(Date.now()),env.DB.prepare('DELETE FROM rate_limits WHERE expires_at<=?').bind(Date.now())]);
  }
};

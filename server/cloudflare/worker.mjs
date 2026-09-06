import { verifyMember } from '../clerk-access.mjs';
import { getProps, readJson } from './props.mjs';

const publicFiles = new Set([
  '/', '/index.html', '/auth.js', '/manifest.webmanifest',
  '/privacy.html', '/terms.html', '/responsible-play.html',
  '/data-sources.html', '/welcome.html',
]);

const securityHeaders = {
  'Cache-Control': 'private, no-store',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://cdn.jsdelivr.net https://*.clerk.accounts.dev",
    "connect-src 'self' https://*.clerk.accounts.dev https://api.clerk.com",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data: https:",
    "frame-src https://*.clerk.accounts.dev",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.clerk.accounts.dev",
  ].join('; '),
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function configuredOrigins(env, request) {
  const configured=String(env.CLERK_AUTHORIZED_PARTIES||'').split(',').map(value=>value.trim()).filter(Boolean);
  return new Set([new URL(request.url).origin,...configured]);
}

function corsHeaders(request, env) {
  const origin=request.headers.get('origin');
  if(!origin || !configuredOrigins(env,request).has(origin)) return {};
  return {
    'Access-Control-Allow-Credentials':'true',
    'Access-Control-Allow-Headers':'Authorization, Content-Type',
    'Access-Control-Allow-Methods':'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Origin':origin,
    'Access-Control-Max-Age':'600',
    'Vary':'Origin',
  };
}

function json(body,status=200,headers={}) {
  return Response.json(body,{status,headers:{...securityHeaders,...headers}});
}

function secured(response, request, env) {
  const headers=new Headers(response.headers);
  for(const [key,value] of Object.entries(securityHeaders)) headers.set(key,value);
  for(const [key,value] of Object.entries(corsHeaders(request,env))) headers.set(key,value);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

async function rememberClerkUser(db,user,now=Date.now()) {
  await db.prepare(`INSERT INTO clerk_users(clerk_user_id,email,role,created_at,last_seen_at)
    VALUES(?,?,?,?,?)
    ON CONFLICT(clerk_user_id) DO UPDATE SET email=excluded.email,role=excluded.role,last_seen_at=excluded.last_seen_at`)
    .bind(user.id,user.email,user.role,now,now).run();
}

export function createWorker({verify=verifyMember}={}) {
  return {
    async fetch(request, env) {
      try {
        const url=new URL(request.url), path=decodeURIComponent(url.pathname);
        const cors=corsHeaders(request,env);
        if(request.method==='OPTIONS') {
          if(request.headers.get('origin')&&!cors['Access-Control-Allow-Origin']) return json({error:'ORIGIN_REJECTED'},403);
          return new Response(null,{status:204,headers:{...securityHeaders,...cors}});
        }
        if(path==='/api/health'||path==='/api/v1/health') {
          return json({ok:true,service:'Esport Killer',databaseConfigured:Boolean(env.DB),authConfigured:Boolean(env.CLERK_SECRET_KEY&&env.CLERK_PUBLISHABLE_KEY)},200,cors);
        }
        if(path==='/api/auth/config') {
          if(!env.CLERK_PUBLISHABLE_KEY)return json({error:'AUTH_NOT_CONFIGURED'},503,cors);
          return json({publishableKey:env.CLERK_PUBLISHABLE_KEY},200,cors);
        }
        if(publicFiles.has(path)||path.startsWith('/assets/')) return secured(await env.ASSETS.fetch(request),request,env);
        if(!env.DB)return json({error:'BACKEND_NOT_CONFIGURED'},503,cors);

        const auth=await verify(request,env);
        if(auth.status!==200)return json({error:auth.error},auth.status,cors);
        await rememberClerkUser(env.DB,auth.user);

        if(path==='/api/v1/auth-test')return json({ok:true,user:{id:auth.user.id,role:auth.user.role},databaseConfigured:true},200,cors);
        if(request.method!=='GET'&&request.method!=='HEAD')return json({error:'METHOD_NOT_ALLOWED'},405,cors);
        if(['/api/v1/lol/props','/api/prizepicks/lol','/api/v1/lol/diagnostics'].includes(path)) {
          const feed=await getProps(env);
          return json(path.endsWith('/diagnostics')?{schemaVersion:1,...feed.diagnostics}:feed,feed.fetchedAt?200:503,{'X-Data-Stale':String(feed.stale),...cors});
        }
        const lolRoutes={'/api/v1/lol/schedule':'getSchedule','/api/lol-esports/schedule':'getSchedule','/api/v1/lol/live':'getLive','/api/lol-esports/live':'getLive','/api/lol-esports/leagues':'getLeagues'};
        if(lolRoutes[path]){
          const endpoint=new URL('https://esports-api.lolesports.com/persisted/gw/'+lolRoutes[path]);endpoint.searchParams.set('hl','en-US');
          const response=await fetch(endpoint,{headers:{'x-api-key':env.LOL_ESPORTS_API_KEY},signal:AbortSignal.timeout(12000)});
          if(!response.ok)return json({error:'SCHEDULE_UNAVAILABLE'},502,cors);
          return json(await readJson(response),200,cors);
        }
        if(path.startsWith('/api/'))return json({error:'ENDPOINT_UNAVAILABLE'},404,cors);
        return secured(await env.ASSETS.fetch(request),request,env);
      }catch(error){
        console.error(JSON.stringify({event:'request_failed',type:error.name}));
        return json({error:'SERVICE_UNAVAILABLE'},503,corsHeaders(request,env));
      }
    },
    async scheduled(controller, env) {
      // Legacy session data is intentionally retained pending a production
      // migration audit. Only expired rate-limit rows are safe to remove.
      await env.DB.prepare('DELETE FROM rate_limits WHERE expires_at<=?').bind(Date.now()).run();
    }
  };
}

export default createWorker();

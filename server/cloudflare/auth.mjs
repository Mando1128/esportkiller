import { randomBytes, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
const hash = value => createHash('sha256').update(value).digest('hex');
const lifetime = 7 * 86400;
export const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
export async function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  const key = await derive(password, salt, 32, { N: 16384, r: 8, p: 5, maxmem: 32 * 1024 * 1024 });
  return `scrypt:16384:8:5:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const parts = encoded.split(':');
  if (parts.length !== 6 || parts.slice(0,4).join(':') !== 'scrypt:16384:8:5') return false;
  const actual = await passwordHash(password, parts[4]);
  return timingSafeEqual(Buffer.from(actual), Buffer.from(encoded));
}
function token(request) {
  return (request.headers.get('cookie') || '').split(';').map(x=>x.trim()).find(x=>x.startsWith('ek_session='))?.slice(11) || '';
}
export async function session(request, db) {
  const value = token(request);
  if (!/^[a-f0-9]{64}$/.test(value)) return null;
  return db.prepare('SELECT users.id, users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>?').bind(hash(value), Date.now()).first();
}
export async function limited(db, key, maximum, seconds) {
  const now = Date.now();
  const row = await db.prepare('INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING count').bind(hash(key), now+seconds*1000, now, now).first();
  return row.count > maximum;
}
function cookie(request, value, age) {
  return `ek_session=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export async function auth(request, env) {
  const path = new URL(request.url).pathname;
  if (!path.startsWith('/api/auth/')) return null;
  // Registration is owned by Clerk's invite-only flow. Never accept local
  // account creation, including while external authentication is unconfigured.
  if (path === '/api/auth/signup') return json({error:'INVITE_REQUIRED',message:'A valid invitation is required. Public registration is closed.'},403);
  if (!env.DB) return json({error:'AUTH_UNAVAILABLE'},503);
  if (path === '/api/auth/session' && request.method === 'GET') return json({ user: await session(request, env.DB) });
  if (!['/api/auth/signup','/api/auth/login','/api/auth/logout'].includes(path)) return json({error:'NOT_FOUND'},404);
  if (request.method !== 'POST') return json({error:'METHOD_NOT_ALLOWED'},405);
  if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') return json({error:'ORIGIN_REJECTED'},403);
  if (path.endsWith('/logout')) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(hash(token(request))).run();
    return json({ok:true},200,{'Set-Cookie':cookie(request,'',0)});
  }
  if (!(request.headers.get('content-type') || '').startsWith('application/json')) return json({error:'JSON_REQUIRED'},415);
  if (await limited(env.DB,`auth-ip:${request.headers.get('cf-connecting-ip') || 'local'}`,20,900)) return json({error:'TOO_MANY_ATTEMPTS'},429,{'Retry-After':'900'});
  let body;
  try { const reader=request.body?.getReader(); if(!reader)throw Error();let size=0,chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return json({error:'BODY_TOO_LARGE'},413);}chunks.push(value);}body=JSON.parse(await new Blob(chunks).text()); } catch { return json({error:'INVALID_REQUEST'},400); }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 || typeof password!=='string' || password.length<12 || password.length>128) return json({error:'INVALID_CREDENTIAL_FORMAT',message:'Use a valid email and a password between 12 and 128 characters.'},400);
  if (await limited(env.DB,`auth-email:${email}`,10,900)) return json({error:'TOO_MANY_ATTEMPTS'},429,{'Retry-After':'900'});
  let user = await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
  if (path.endsWith('/signup')) {
    const encoded = await passwordHash(password);
    if (user) return json({error:'ACCOUNT_EXISTS',message:'An account already uses that email. Sign in instead.'},409);
    user = {id:crypto.randomUUID(),email};
    const result = await env.DB.prepare('INSERT OR IGNORE INTO users(id,email,password_hash,created_at) VALUES(?,?,?,?)').bind(user.id,email,encoded,Date.now()).run();
    if (!result.meta.changes) return json({error:'ACCOUNT_EXISTS'},409);
  } else {
    const valid = user ? await verifyPassword(password,user.password_hash) : (await passwordHash(password),false);
    if (!valid) return json({error:'INVALID_CREDENTIALS',message:'Email or password is incorrect.'},401);
  }
  const value = randomBytes(32).toString('hex');
  await env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(hash(value),user.id,Date.now()+lifetime*1000).run();
  return json({user:{id:user.id,email:user.email}},200,{'Set-Cookie':cookie(request,value,lifetime)});
}

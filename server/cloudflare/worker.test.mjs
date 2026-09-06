import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorker } from './worker.mjs';

function database() {
  const writes=[];
  return {
    writes,
    prepare(sql) {
      return {
        bind(...values) {
          return {run:async()=>{writes.push({sql,values});return {meta:{changes:1}}}};
        }
      };
    }
  };
}
const assets={fetch:async request=>new Response(new URL(request.url).pathname,{headers:{'Content-Type':'text/plain'}})};
const baseEnv={DB:database(),ASSETS:assets,CLERK_SECRET_KEY:'secret-test-value',CLERK_PUBLISHABLE_KEY:'pk_test_value',CLERK_AUTHORIZED_PARTIES:'https://esportkiller.com'};
const signedOut=async()=>({status:401,error:'SIGN_IN_REQUIRED'});
const signedIn=async()=>({status:200,user:{id:'user_test',role:'FREE',email:'member@example.com'}});

test('public health reports configuration without exposing secrets',async()=>{
  const response=await createWorker({verify:signedOut}).fetch(new Request('https://esportkiller.com/api/v1/health'),baseEnv);
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ok:true,service:'Esport Killer',databaseConfigured:true,authConfigured:true});
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  assert.equal(response.headers.get('x-frame-options'),'DENY');
});

test('logged-out and direct bypass requests cannot reach protected routes',async()=>{
  const worker=createWorker({verify:signedOut});
  for(const path of ['/api/v1/auth-test','/api/v1/lol/props','/lol-history.part0']){
    const response=await worker.fetch(new Request('https://esportkiller.com'+path),baseEnv);
    assert.equal(response.status,401,path);
  }
});

test('verified Clerk user reaches protected test route and persists identity',async()=>{
  const env={...baseEnv,DB:database()};
  const response=await createWorker({verify:signedIn}).fetch(new Request('https://esportkiller.com/api/v1/auth-test',{headers:{origin:'https://esportkiller.com'}}),env);
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ok:true,user:{id:'user_test',role:'FREE'},databaseConfigured:true});
  assert.equal(response.headers.get('access-control-allow-origin'),'https://esportkiller.com');
  assert.equal(env.DB.writes.length,1);
  assert.match(env.DB.writes[0].sql,/INSERT INTO clerk_users/);
});

test('revoked or expired Clerk session fails closed',async()=>{
  const revoked=async()=>({status:401,error:'SIGN_IN_REQUIRED'});
  const response=await createWorker({verify:revoked}).fetch(new Request('https://esportkiller.com/api/v1/auth-test',{headers:{authorization:'Bearer expired'}}),baseEnv);
  assert.equal(response.status,401);
  assert.equal((await response.json()).error,'SIGN_IN_REQUIRED');
});

test('CORS permits configured production origin and rejects foreign origin',async()=>{
  const worker=createWorker({verify:signedOut});
  const allowed=await worker.fetch(new Request('https://api.esportkiller.com/api/v1/auth-test',{method:'OPTIONS',headers:{origin:'https://esportkiller.com'}}),baseEnv);
  assert.equal(allowed.status,204);
  assert.equal(allowed.headers.get('access-control-allow-origin'),'https://esportkiller.com');
  const denied=await worker.fetch(new Request('https://api.esportkiller.com/api/v1/auth-test',{method:'OPTIONS',headers:{origin:'https://attacker.example'}}),baseEnv);
  assert.equal(denied.status,403);
  assert.equal(denied.headers.get('access-control-allow-origin'),null);
});

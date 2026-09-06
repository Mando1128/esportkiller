import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyMember} from './clerk-access.mjs';
const request=new Request('https://esportkiller.com/api/v1/lol/props');
const config={CLERK_SECRET_KEY:'test-placeholder',CLERK_PUBLISHABLE_KEY:'test-placeholder',CLERK_AUTHORIZED_PARTIES:'https://esportkiller.com'};
const client=(membership,extra={})=>()=>({authenticateRequest:async(req,options)=>{
  assert.equal(options.acceptsToken,'session_token');
  assert.deepEqual(options.authorizedParties,['https://esportkiller.com']);
  return {isAuthenticated:true,toAuth:()=>({userId:'user_test',sessionId:'sess_test'})};
},users:{getUser:async()=>({id:'user_test',privateMetadata:{esportKiller:membership},...extra})}});
test('missing configuration denies access',async()=>assert.equal((await verifyMember(request,{})).status,503));
test('signed out denies access',async()=>assert.equal((await verifyMember(request,config,()=>({authenticateRequest:async()=>({isAuthenticated:false})}))).status,401));
for(const [label,membership,extra] of [['missing',undefined,{}],['inactive',{active:false,role:'FREE_INVITED'},{}],['unrecognized role',{active:true,role:'PREMIUM'},{}],['banned',{active:true,role:'FREE_INVITED'},{banned:true}],['client metadata',undefined,{unsafeMetadata:{esportKiller:{active:true,role:'ADMIN'}}}]]) {
  test(`${label} membership is denied`,async()=>assert.equal((await verifyMember(request,config,client(membership,extra))).status,403));
}
test('approved member succeeds without leaking private metadata',async()=>assert.deepEqual(await verifyMember(request,config,client({active:true,role:'FREE_INVITED',campaign:'private'})),{status:200,user:{id:'user_test',role:'FREE_INVITED'}}));
test('provider failure fails closed',async()=>assert.deepEqual(await verifyMember(request,config,()=>{throw Error('secret');}),{status:503,error:'AUTH_VERIFICATION_UNAVAILABLE'}));

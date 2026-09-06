import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyMember} from './clerk-access.mjs';
const request=new Request('https://esportkiller.com/api/v1/lol/props');
const config={CLERK_SECRET_KEY:'test-placeholder',CLERK_PUBLISHABLE_KEY:'test-placeholder',CLERK_AUTHORIZED_PARTIES:'https://esportkiller.com'};
const client=(membership,extra={})=>()=>({authenticateRequest:async(req,options)=>{
  assert.equal(options.acceptsToken,'session_token');
  assert.deepEqual(options.authorizedParties,['https://esportkiller.com']);
  return {isAuthenticated:true,toAuth:()=>({userId:'user_test',sessionId:'sess_test'})};
},users:{getUser:async()=>({id:'user_test',primaryEmailAddressId:'email_test',emailAddresses:[{id:'email_test',emailAddress:'member@example.com'}],privateMetadata:{esportKiller:membership},...extra})}});
test('missing configuration denies access',async()=>assert.equal((await verifyMember(request,{})).status,503));
test('signed out denies access',async()=>assert.equal((await verifyMember(request,config,()=>({authenticateRequest:async()=>({isAuthenticated:false})}))).status,401));
test('free Clerk account succeeds without private membership metadata',async()=>assert.deepEqual(await verifyMember(request,config,client(undefined)),{status:200,user:{id:'user_test',role:'FREE',email:'member@example.com'}}));
test('legacy invited membership is accepted as a free account',async()=>assert.equal((await verifyMember(request,config,client({active:true,role:'FREE_INVITED'}))).status,200));
test('admin role is preserved',async()=>assert.equal((await verifyMember(request,config,client({active:true,role:'ADMIN'}))).user.role,'ADMIN'));
test('unrecognized browser metadata cannot grant admin',async()=>assert.equal((await verifyMember(request,config,client(undefined,{unsafeMetadata:{esportKiller:{role:'ADMIN'}}}))).user.role,'FREE'));
for(const [label,extra] of [['banned',{banned:true}],['locked',{locked:true}]]) {
  test(`${label} account is denied`,async()=>assert.deepEqual(await verifyMember(request,config,client(undefined,extra)),{status:403,error:'ACCOUNT_DISABLED'}));
}
test('provider failure fails closed',async()=>assert.deepEqual(await verifyMember(request,config,()=>{throw Error('secret');}),{status:503,error:'AUTH_VERIFICATION_UNAVAILABLE'}));

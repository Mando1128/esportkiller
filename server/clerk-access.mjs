import { createClerkClient } from '@clerk/backend';

// Clerk is the single production identity provider. Authorization is decided
// from the verified Clerk user record, never from browser-supplied metadata.
export async function verifyMember(request, config, makeClient = createClerkClient) {
  const origins = (config.CLERK_AUTHORIZED_PARTIES || '').split(',').map(x=>x.trim()).filter(Boolean);
  if (!config.CLERK_SECRET_KEY || !config.CLERK_PUBLISHABLE_KEY || !origins.length)
    return {status:503,error:'AUTH_NOT_CONFIGURED'};
  try {
    if (origins.some(origin=>new URL(origin).origin!==origin)) return {status:503,error:'AUTH_NOT_CONFIGURED'};
    const client=makeClient({secretKey:config.CLERK_SECRET_KEY,publishableKey:config.CLERK_PUBLISHABLE_KEY});
    const state=await client.authenticateRequest(request,{authorizedParties:origins,acceptsToken:'session_token'});
    if (!state.isAuthenticated) return {status:401,error:'SIGN_IN_REQUIRED'};
    const identity=state.toAuth();
    if (!identity?.userId || !identity?.sessionId) return {status:401,error:'SIGN_IN_REQUIRED'};
    const user=await client.users.getUser(identity.userId);
    if(user.banned || user.locked) return {status:403,error:'ACCOUNT_DISABLED'};
    const membership=user.privateMetadata?.esportKiller;
    const role=membership?.role==='ADMIN'?'ADMIN':'FREE';
    const primary=user.emailAddresses?.find(item=>item.id===user.primaryEmailAddressId)?.emailAddress
      || user.emailAddresses?.[0]?.emailAddress || null;
    return {status:200,user:{id:user.id,role,email:primary}};
  } catch {
    // Never reveal tokens, SDK error contents or account metadata.
    return {status:503,error:'AUTH_VERIFICATION_UNAVAILABLE'};
  }
}

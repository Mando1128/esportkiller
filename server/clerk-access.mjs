import { createClerkClient } from '@clerk/backend';

// Membership is server-owned Clerk privateMetadata, never browser input.
// Account migration and invitation acceptance must grant it explicitly.
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
    const membership=user.privateMetadata?.esportKiller;
    if(user.banned || user.locked || membership?.active!==true || !['FREE_INVITED','ADMIN'].includes(membership?.role))
      return {status:403,error:'INVITATION_REQUIRED'};
    return {status:200,user:{id:user.id,role:membership.role}};
  } catch {
    // Never reveal tokens, SDK error contents or account metadata.
    return {status:503,error:'AUTH_VERIFICATION_UNAVAILABLE'};
  }
}

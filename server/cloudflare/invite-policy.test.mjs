import test from 'node:test';
import assert from 'node:assert/strict';
import { auth } from './auth.mjs';

for (const method of ['GET','POST','PUT']) {
  test(`legacy signup rejects ${method} before accessing storage`, async () => {
    const response=await auth(new Request('https://esportkiller.com/api/auth/signup',{method}),{});
    assert.equal(response.status,403);
    assert.equal((await response.json()).error,'INVITE_REQUIRED');
    assert.equal(response.headers.get('cache-control'),'private, no-store');
  });
}

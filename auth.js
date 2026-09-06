(() => {
  const main=document.querySelector('main');
  const scripts=['reliability.js','board-snapshot.js','lol-focus.js','player-readability.js','live-scoreboard.js','game-center.js','prop-filters.js','apify-review.js'];
  const cleanup=async()=>{if('serviceWorker'in navigator)for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();if('caches'in window)for(const key of await caches.keys())if(key.startsWith('esport-killer'))await caches.delete(key);};
  const call=async(path,body)=>{
    const response=await fetch('/api/auth/'+path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
    let data;try{data=await response.json();}catch{throw Error('The sign-in server is unavailable. Please try again shortly.');}
    if(!response.ok)throw Error(data.message||({TOO_MANY_ATTEMPTS:'Too many attempts. Please wait 15 minutes.'}[data.error])||'Sign-in is temporarily unavailable.');return data;
  };
  const load=async user=>{
    main.replaceChildren();
    const bar=document.createElement('div');bar.className='account-bar';const label=document.createElement('span');label.textContent=user.email;const button=document.createElement('button');button.textContent='Sign out';bar.append(label,button);main.before(bar);
    button.onclick=async()=>{button.disabled=true;try{await call('logout',{});localStorage.removeItem('esport-killer-picks');location.reload();}catch(error){button.disabled=false;label.textContent=error.message;}};
    for(const src of scripts)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.body.append(script);});
  };
  function form(mode='login'){
    mode='login'; // Existing members only; registration belongs to Clerk invitations.
    main.innerHTML=`<section class="auth-card"><p class="eyebrow">ESPORT KILLER</p><h1>${mode==='login'?'Welcome back.':'Create your account.'}</h1><p>Sign in to explore League props and player research.</p><form><label>Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label>Password<input name="password" type="password" autocomplete="${mode==='login'?'current-password':'new-password'}" required minlength="12" maxlength="128"></label><small>Use 12–128 characters.</small><button type="submit">${mode==='login'?'Sign in':'Create account'}</button><p role="status" aria-live="polite"></p></form><button class="switch" type="button">${mode==='login'?'New here? Create an account':'Already registered? Sign in'}</button></section>`;
    const inviteNotice=document.createElement('p');inviteNotice.textContent='INVITE REQUIRED — Private community access is free. You need a valid invite link to create an account.';main.querySelector('.switch').replaceWith(inviteNotice);
    main.querySelector('form').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget,button=form.querySelector('button'),status=form.querySelector('[role=status]');button.disabled=true;status.textContent='Connecting…';try{const data=await call(mode,Object.fromEntries(new FormData(form)));await load(data.user);}catch(error){status.textContent=error.message;button.disabled=false;}};
  }
  const style=document.createElement('style');style.textContent='body{margin:0;background:#07111f;color:#edf2fc;font:16px/1.5 Segoe UI,sans-serif}.auth-card{max-width:420px;margin:10vh auto;padding:32px;background:#101e30;border:1px solid #36516a;border-radius:20px}.auth-card h1{font-size:32px;line-height:1.2}.auth-card label{display:block;margin:18px 0}.auth-card input{box-sizing:border-box;width:100%;display:block;margin-top:6px;padding:13px;background:#07111f;color:white;border:1px solid #73879b;border-radius:8px;font:inherit}.auth-card button,.account-bar button{padding:12px 20px;background:#e6c975;color:#07111f;border:0;border-radius:8px;font:700 16px Segoe UI;cursor:pointer}.auth-card form>button{display:block;width:100%;margin-top:20px}.auth-card .switch{background:none;color:#e6c975;padding-left:0}.auth-card small,.auth-card p{color:#c0ccdb}.account-bar{display:flex;justify-content:flex-end;align-items:center;gap:14px;padding:12px 24px}.eyebrow{letter-spacing:.13em;color:#e6c975}button:disabled{opacity:.6}*:focus-visible{outline:3px solid #e6c975;outline-offset:3px}@media(max-width:500px){.auth-card{margin:30px 16px;padding:24px}.account-bar{flex-wrap:wrap}}';document.head.append(style);
  main.textContent='Checking your session…';
  cleanup().then(()=>call('session')).then(data=>data.user?load(data.user):form()).catch(error=>{form();main.querySelector('[role=status]').textContent=error.message;});
})();

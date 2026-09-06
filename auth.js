(() => {
  const main=document.querySelector('main');
  const scripts=['reliability.js','board-snapshot.js','lol-focus.js','player-readability.js','live-scoreboard.js','game-center.js','prop-filters.js','apify-review.js'];
  const nativeFetch=window.fetch.bind(window);
  const appearance={
    variables:{colorPrimary:'#e6c975',colorBackground:'#101e30',colorText:'#edf2fc',colorTextSecondary:'#c0ccdb',colorInputBackground:'#07111f',colorInputText:'#edf2fc',borderRadius:'0.75rem'},
    elements:{card:'auth-clerk-card',headerTitle:'auth-clerk-title',headerSubtitle:'auth-clerk-subtitle',formButtonPrimary:'auth-clerk-submit',footerActionLink:'auth-clerk-link'}
  };
  let clerk;

  const cleanup=async()=>{if('serviceWorker'in navigator)for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();if('caches'in window)for(const key of await caches.keys())if(key.startsWith('esport-killer'))await caches.delete(key);};
  const loadScript=src=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.crossOrigin='anonymous';script.onload=resolve;script.onerror=()=>reject(new Error('The sign-in service could not load.'));document.head.append(script);});
  const authFetch=async(input,init={})=>{
    const url=new URL(typeof input==='string'?input:input.url,location.href);
    if(url.origin===location.origin&&url.pathname.startsWith('/api/')){
      const token=await clerk?.session?.getToken();
      const headers=new Headers(init.headers||(input instanceof Request?input.headers:undefined));
      if(token)headers.set('Authorization',`Bearer ${token}`);
      return nativeFetch(input,{...init,headers,credentials:'same-origin',cache:init.cache||'no-store'});
    }
    return nativeFetch(input,init);
  };
  const accountBar=user=>{
    const prior=document.querySelector('.account-bar');if(prior)prior.remove();
    const bar=document.createElement('div');bar.className='account-bar';
    const email=user.primaryEmailAddress?.emailAddress||'Signed in';
    bar.innerHTML=`<span>${email.replace(/[&<>"']/g,value=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[value]))}</span><button type="button">Sign out</button>`;
    bar.querySelector('button').onclick=async()=>{bar.querySelector('button').disabled=true;await clerk.signOut();location.reload();};
    main.before(bar);
  };
  const loadProduct=async user=>{
    window.fetch=authFetch;
    const probe=await authFetch('/api/v1/auth-test');
    if(!probe.ok)throw new Error(probe.status===401||probe.status===403?'Your session is no longer active. Please sign in again.':'The protected Esport Killer service is unavailable.');
    main.replaceChildren();accountBar(user);
    for(const src of scripts)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.body.append(script);});
  };
  const authShell=mode=>{
    main.innerHTML=`<section class="auth-shell"><img src="assets/esport-killer-logo.png" alt="Esport Killer" class="auth-logo"><p class="eyebrow">ESPORT KILLER</p><h1>${mode==='signup'?'Create your free account.':'Welcome back.'}</h1><p>${mode==='signup'?'Join Esport Killer to access protected League research.':'Sign in to continue to League props and player research.'}</p><div id="clerk-auth"></div><button class="auth-switch" type="button">${mode==='signup'?'Already have an account? Sign in':'New to Esport Killer? Create a free account'}</button><p class="auth-status" role="status" aria-live="polite"></p></section>`;
    const target=document.querySelector('#clerk-auth');
    const options={appearance,afterSignInUrl:'/',afterSignUpUrl:'/',routing:'hash'};
    if(mode==='signup')clerk.mountSignUp(target,options);else clerk.mountSignIn(target,options);
    main.querySelector('.auth-switch').onclick=()=>{if(mode==='signup')clerk.unmountSignUp(target);else clerk.unmountSignIn(target);authShell(mode==='signup'?'signin':'signup');};
  };
  const styles=document.createElement('style');
  styles.textContent='body{margin:0;background:#07111f;color:#edf2fc;font:16px/1.5 Inter,Segoe UI,sans-serif}.auth-shell{box-sizing:border-box;max-width:480px;margin:5vh auto;padding:30px;background:linear-gradient(145deg,#101e30,#0a1726);border:1px solid #8b7848;border-radius:20px;box-shadow:0 30px 80px #0008;text-align:center}.auth-logo{width:104px;height:104px;object-fit:contain;filter:drop-shadow(0 10px 24px #000)}.auth-shell h1{font:700 32px/1.15 Georgia,serif;color:#f7ebc8;margin:5px 0 10px}.auth-shell>p{color:#c0ccdb}.auth-shell .eyebrow{letter-spacing:.13em;color:#e6c975;font-size:11px;font-weight:800}.auth-switch{border:0;background:transparent;color:#e6c975;font:700 14px Inter,Segoe UI,sans-serif;cursor:pointer;margin-top:18px}.auth-status{min-height:24px;color:#ef9b9b}.account-bar{display:flex;justify-content:flex-end;align-items:center;gap:14px;padding:12px 24px;background:#07111f;color:#c0ccdb;font-size:13px}.account-bar button{padding:9px 15px;background:#e6c975;color:#07111f;border:0;border-radius:8px;font-weight:800;cursor:pointer}.auth-clerk-card{box-shadow:none!important;border:0!important;background:transparent!important}.auth-clerk-title,.auth-clerk-subtitle{display:none!important}.auth-clerk-submit{color:#07111f!important;font-weight:800!important}.auth-clerk-link{color:#e6c975!important}button:disabled{opacity:.6}*:focus-visible{outline:3px solid #e6c975;outline-offset:3px}@media(max-width:520px){.auth-shell{margin:18px 12px;padding:22px 16px}.auth-logo{width:84px;height:84px}.auth-shell h1{font-size:27px}.account-bar{flex-wrap:wrap;padding:10px 14px}}';
  document.head.append(styles);

  async function start(){
    main.textContent='Checking your secure session…';
    try{
      await cleanup();
      const configResponse=await nativeFetch('/api/auth/config',{cache:'no-store'});
      if(!configResponse.ok)throw new Error('Authentication is not configured.');
      const {publishableKey}=await configResponse.json();
      await loadScript('https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js');
      clerk=new window.Clerk(publishableKey);
      await clerk.load();
      if(clerk.user)return await loadProduct(clerk.user);
      authShell(location.hash.includes('sign-up')?'signup':'signin');
      clerk.addListener(async state=>{if(state.user){try{await loadProduct(state.user);}catch(error){const status=document.querySelector('.auth-status');if(status)status.textContent=error.message;}}});
    }catch(error){
      main.innerHTML=`<section class="auth-shell"><img src="assets/esport-killer-logo.png" alt="Esport Killer" class="auth-logo"><h1>Sign-in is unavailable.</h1><p class="auth-status">${String(error.message||'Please try again shortly.').replace(/[&<>]/g,'')}</p><button class="auth-switch" onclick="location.reload()">Try again</button></section>`;
    }
  }
  start();
})();

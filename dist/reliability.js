(()=>{
  const nativeFetch=window.fetch.bind(window);
  const CACHE='esport-killer-live-fallback-v1';
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const eligible=request=>request.method==='GET'&&(/\/api\//.test(new URL(request.url,location.href).pathname)||/\.json(?:$|\?)/.test(request.url));
  const remember=async(request,response)=>{
    if(!response.ok||response.type==='opaque')return;
    try{const cache=await caches.open(CACHE);await cache.put(request,response.clone());}catch(error){console.warn('[reliability] cache write skipped',error?.message||error);}
  };
  const recover=async request=>{
    try{return await caches.match(request);}catch{return null;}
  };
  window.fetch=async(input,init={})=>{
    const request=new Request(input,init);
    if(!eligible(request))return nativeFetch(request);
    let lastError;
    for(let attempt=0;attempt<3;attempt+=1){
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),8000);
      try{
        const response=await nativeFetch(new Request(request,{signal:controller.signal,cache:'no-store'}));
        clearTimeout(timer);
        if(response.ok){void remember(request,response);return response;}
        lastError=new Error(`Provider returned ${response.status}`);
        if(response.status<500&&response.status!==429)break;
      }catch(error){clearTimeout(timer);lastError=error;}
      await sleep(500*(2**attempt));
    }
    const cached=await recover(request);
    if(cached){console.warn('[reliability] serving last verified response',request.url);return cached;}
    throw lastError||new Error('Provider unavailable');
  };
  addEventListener('online',()=>document.dispatchEvent(new CustomEvent('esportkiller:connection-restored')));
  addEventListener('offline',()=>console.warn('[reliability] device offline; cached verified data remains available'));
})();

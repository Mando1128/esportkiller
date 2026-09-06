// API caching belongs to the server. Never replace a 401 with an old response.
(() => {
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async(input,init={})=>{
    const response=await nativeFetch(input,init);
    if(response.status===401 && new URL(typeof input==='string'?input:input.url,location.href).origin===location.origin){
      document.querySelector('main')?.replaceChildren();
      document.querySelector('#modal')?.remove();
      location.reload();
    }
    return response;
  };
})();

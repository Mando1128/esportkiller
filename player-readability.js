(() => {
  const style=document.createElement('style');
  style.textContent=`.lol-focus .row .player-link{display:grid;grid-template-columns:56px minmax(0,1fr);column-gap:14px;align-items:center;min-width:0}.lol-focus .row .player-link strong{font-size:18px;font-weight:800;line-height:1.3;color:#f7f8fb;overflow-wrap:anywhere}.lol-focus .row .player-link small{grid-column:2;font-size:13px;line-height:1.5;color:#bdcdd7}.board-portrait{grid-row:1/3;width:56px;height:56px;object-fit:contain;border:1px solid #d6b45b66;border-radius:12px;background:#142333;padding:3px;display:grid;place-items:center;font-weight:800;color:#edd391}.lol-focus .row .line{font-size:23px;font-weight:850}.lol-focus .row{padding-top:19px;padding-bottom:19px}.lol-focus .row .market{font-size:14px}@media(max-width:760px){.lol-focus .row .player-link{grid-template-columns:46px minmax(0,1fr);gap:10px}.board-portrait{width:46px;height:46px}.lol-focus .row .player-link strong{font-size:17px}}`;
  document.head.append(style);
  const teamImages={IG:'6DfKl42.png',TES:'eYLe5wa.png',GEN:'GenG25.png',HLE:'On0F5Cn.png',JDG:'JDG_jersey3.png',NIP:'R5Jilhq.png',VIT:'VIT25.png',G2:'G22026.png',KC:'KCorp26R.png',GX:'GX_LoL.png'};
  const decorate=()=>document.querySelectorAll('.row .player-link').forEach(button=>{
    if(button.querySelector('.board-portrait'))return;
    const name=button.dataset.player,prop=window.PRIZEPICKS_BOARD_SNAPSHOT?.projections.find(p=>p.player===name),file=teamImages[prop?.team];
    const badge=document.createElement(file?'img':'span');badge.className='board-portrait';
    if(file){badge.src=`https://static.prizepicks.com/images/manual/${file}`;badge.alt=`${prop.team} team image`;badge.loading='lazy';badge.onerror=()=>{const fallback=document.createElement('span');fallback.className='board-portrait';fallback.textContent=prop.team;badge.replaceWith(fallback);};}
    else{badge.textContent=name?.split(/\s+/).map(x=>x[0]).slice(0,2).join('')||'—';badge.setAttribute('aria-label','Player initials');}
    button.prepend(badge);
  });
  decorate();new MutationObserver(decorate).observe(document.querySelector('main'),{childList:true,subtree:true});
})();

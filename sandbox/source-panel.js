// Keep the source beside the case; only its body scrolls, never its close control.
let returnFocus;
export function openSourcePanel(dialog) {
  if (!dialog.open) returnFocus=document.activeElement;
  dialog.classList.add('source-panel');
  dialog.setAttribute('aria-label','Source document');
  document.body.classList.add('source-open');
  if (!dialog.open) dialog.show();
  const body=dialog.querySelector('pre');
  body.scrollTop=0;
  requestAnimationFrame(()=>{
    const target=body.querySelector('.is-on,.source-highlight,mark');
    if(target)body.scrollTop=Math.max(0,target.getBoundingClientRect().top-body.getBoundingClientRect().top+body.scrollTop-70);
  });
}
export function setupSourcePanel(dialog){
  dialog.addEventListener('close',()=>{
    document.body.classList.remove('source-open');
    dialog.classList.remove('source-panel');
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
    returnFocus=null;
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&dialog.open){event.preventDefault();dialog.close();}
  });
}

(()=>{const tabs=[...document.querySelectorAll('.pricing-toggle-btn')];tabs.forEach(button=>{button.setAttribute('aria-pressed',String(button.classList.contains('active')));button.addEventListener('click',()=>{tabs.forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});document.querySelectorAll('.pricing-tab').forEach(panel=>{const active=panel.id==='tab-'+button.dataset.tab;panel.classList.toggle('active',active);if(active)panel.animate([{opacity:.2},{opacity:1}],{duration:220,easing:'ease-out'})})})});const form=document.querySelector('#contact-form');if(!form)return;document.querySelectorAll('#pricing [data-plan]').forEach(a=>a.addEventListener('click',()=>{form.elements.plan.value=a.dataset.plan;form.querySelector('input[value="'+a.dataset.audience+'"]').checked=true;const note=document.querySelector('#plan-note');note.hidden=false;note.textContent='Interested in: '+a.dataset.plan}));
const stage=document.createElement('div');stage.className='delivery-stage';stage.setAttribute('role','dialog');stage.setAttribute('aria-modal','true');stage.setAttribute('aria-label','Message delivery confirmation');stage.hidden=true;stage.innerHTML=`<div class="delivery-note"><span>TO VIOLET</span><strong class="sender-name"></strong><i></i><i></i><i></i></div><svg class="delivery-plane" viewBox="0 0 120 90" aria-hidden="true"><path fill="#eee4ff" d="M5 38 114 5 78 83 53 57Z"/><path fill="#b58be9" d="m5 38 109-33-61 52Z"/><path fill="#fff" d="m53 57 61-52-47 61Z"/><path fill="#8053ba" d="m53 57 5 27 9-18Z"/></svg><div class="delivery-inbox"><span>V.</span><i></i></div><div class="delivery-caption"><strong></strong><p></p><button type="button">Back to form</button></div>`;form.after(stage);
let flightTimer;
function playDelivery(name){clearTimeout(flightTimer);stage.querySelector('.sender-name').textContent=name?'A note from '+name:'A note to start a conversation';stage.querySelector('.delivery-caption strong').textContent='Request received.';stage.querySelector('.delivery-caption p').textContent='We’ll be in touch personally.';form.inert=true;stage.hidden=false;stage.classList.remove('delivered','in-flight');void stage.offsetWidth;stage.classList.add('in-flight');stage.querySelector('.delivery-caption button').focus({preventScroll:true});flightTimer=setTimeout(()=>{stage.classList.add('delivered');stage.querySelector('.delivery-caption button').focus({preventScroll:true})},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:4200)}
stage.querySelector('button').addEventListener('click',()=>{clearTimeout(flightTimer);stage.hidden=true;stage.classList.remove('in-flight','delivered');form.inert=false;form.querySelector('button[type=submit]').focus({preventScroll:true})});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!stage.hidden)stage.querySelector('button').click()});
form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('button[type=submit]'),status=document.querySelector('#contact-status');button.disabled=true;button.textContent='Sending…';status.textContent='';try{const response=await fetch(form.action,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});if(!response.ok)throw Error('Submission failed');status.textContent='Thanks. Your walkthrough request has been sent. Nina will follow up personally.';playDelivery(form.elements.name.value.trim().split(' ')[0]);form.reset();document.querySelector('#plan-note').hidden=true}catch{status.textContent='Your request could not be sent. Please try again or email nina@violetinvestigations.com. Your details are still here.'}finally{button.disabled=false;button.innerHTML='Request a walkthrough <span class="cta-arrow" aria-hidden="true">↗</span>'}})})();

// Reveal each marketing section once, without hiding content before JS is ready.
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const section = entry.target;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      section.animate(reduce ? [{opacity:.35},{opacity:1}] :
        [{opacity:.2,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:reduce?250:550,easing:'cubic-bezier(.2,.7,.2,1)'});
      revealObserver.unobserve(section);
    }
  }, {threshold:.08});
  document.querySelectorAll('#pricing, #faq, #contact').forEach(section => revealObserver.observe(section));
}

document.querySelectorAll('.price-cta').forEach(link => {
  const arrow = document.createElement('span');
  arrow.className = 'cta-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  link.append(arrow);
});

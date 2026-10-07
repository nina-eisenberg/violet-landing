// Quick look: one conversation, start to finish, in five exchanges. Every Violet card and answer is captured from the
// app (sources in FIDELITY-AUDIT.txt); the purple captions are the website's. Plays itself once it's in view, a few seconds
// per step; it holds while the pointer is over the conversation and stops for good once the visitor clicks into it.
import {planView,outlineView,reportView} from './artifact-views.js';
import {conductScope} from './conduct-scope.js';
import {capturedResponses} from './captured-responses.js';
import {capturedCitations} from './captured-citations.js';
import {capturedReview} from './captured-review.js';
import {reportCitations} from './report-citations.js';
const $=s=>document.querySelector(s);
const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t.content;};
const clip=(html,label)=>`<div class="ql-clip" tabindex="-1">${html}</div><button type="button" class="ql-more" data-more>Show the whole ${label}</button>`;
const strip=h=>{const r=tpl(h);r.querySelectorAll('.vt-mode,.vt-stagecard-foot,.journey-foot,.vt-tabs,.vt-summary-panel-acts').forEach(e=>e.remove());const d=document.createElement('div');d.append(r);return d.innerHTML;};
// The scope answer, first two paragraphs shown; the rest behind "Show the whole reply".
const scopeParts=[...tpl(conductScope.html).firstElementChild.children].map(e=>e.outerHTML);
// The report: the paragraph Violet's own check flagged. The sentence opens the flag card beside the report.
const flagged=capturedReview.flaggedSentences[0];
const para=[...tpl(reportView('policy')).querySelectorAll('p')].find(p=>p.textContent.includes(flagged.slice(0,60)));
const paraHtml=(para?.innerHTML||flagged).replace(flagged,`<mark class="ql-flag-mark" role="button" tabindex="0" data-flag title="See why Violet flagged this">${flagged}</mark>`);
const steps=[
 {label:'Plan',you:'Here’s the complaint and our accommodation policy.',files:['Complaint email','Accommodation policy'],
  violet:()=>clip(strip(planView({final:false,framework:'conduct'})),'plan'),
  caption:'<b>Violet drafts the plan</b> from the complaint: allegations, who to interview, what to collect. You edit it and finalize.'},
 {label:'Interview prep',you:'Write Leah’s interview outline.',
  violet:()=>clip(strip(outlineView('leah')),'outline'),
  caption:'<b>Outlines for every interview,</b> tied to the allegations. You run the interview your way.'},
 {label:'Something new',you:'Here’s Leah’s transcript. Does it raise anything outside the plan?',files:['Leah Goldberg interview'],
  violet:()=>`<div class="ql-text">${scopeParts.slice(0,2).join('')}<div class="ql-rest" hidden>${scopeParts.slice(2).join('')}</div></div><button type="button" class="ql-more" data-rest>Show the whole reply</button>${strip(conductScope.card)}<div class="ql-actions" data-decide-host><button type="button" class="vt-chip is-next" data-decide="save">Save this change</button><button type="button" class="vt-chip" data-decide="keep">Keep the plan as is</button></div>`,
  wait:10000,caption:'<b>Violet suggests; you decide.</b> The plan doesn’t change until you save. Try either button.'},
 {label:'Ask the record',you:'Did anyone besides Kim hear the “holy day” remark?',
  violet:()=>`<div class="ql-text">${capturedResponses.hearers.html}</div>`,
  wait:10000,caption:'<b>Ask anything about the case.</b> Every answer points to its source. Click a number to read the transcript line.'},
 {label:'Report',you:'Draft the report.',
  violet:()=>`<div class="ql-report"><h3>Draft report · 157 citations · checked against the record by Violet</h3><p>${paraHtml}</p><p class="ql-flag-hint"><span>1 sentence flagged</span> Click the highlighted sentence to see why.</p></div>`,
  caption:'<b>Violet drafts and checks the report.</b> Sentences that need a look are flagged. You review, edit, and approve. Findings are yours.'},
];
let n=0;
function track(name){try{parent.postMessage({violet:name},'*');}catch{}}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
// The flag card, as the app shows it, with only the action the demo can honour.
const flagCard=(()=>{const r=tpl(capturedReview.flagHtml);r.querySelectorAll('button,dialog').forEach(b=>{if(/fine as is/i.test(b.textContent))b.dataset.flagok='';else b.remove();});const d=document.createElement('div');d.append(r);return d.innerHTML;})();
function show(i){const s=steps[i];const t=document.createElement('div');t.className='ql-turn';
 t.innerHTML=`<div class="ql-you">${s.files?`<div class="ql-files">${s.files.map(f=>`<span>📄 ${esc(f)}</span>`).join('')}</div>`:''}${esc(s.you)}</div><div class="ql-violet"><strong>● Violet</strong>${s.violet()}</div><p class="ql-caption">${s.caption}</p>`;
 t.querySelectorAll('.ql-clip details.vt-plan-sec').forEach(d=>d.open=false); // allegations first; context one click away
 $('.ql-chat').append(t);
 const chat=$('.ql-chat');chat.scrollTo({top:t.offsetTop-chat.offsetTop-10,behavior:'smooth'});
 $('.ql-steps').innerHTML=steps.map((x,j)=>`<li class="${j<=i?'is-done':''}">${j+1}. ${x.label}</li>`).join('');
 const last=i===steps.length-1;$('.ql-next').textContent=last?'Start over':'Next →';
 if(last)t.insertAdjacentHTML('beforeend',`<div class="ql-end"><button type="button" class="vt-chip is-next" data-go="sandbox">Try the full case yourself</button></div>`);
 schedule();
}
function reset(){$('.ql-chat').innerHTML='';closeDock();n=0;show(0);}
function advance(){closeDock();if(n<steps.length-1){n++;show(n);}else reset();}
function openDock(title,html){if(!html)return;const d=$('.ql-dock');d.hidden=false;d.querySelector('b').textContent=title;d.querySelector('.ql-dock-body').innerHTML=html;requestAnimationFrame(()=>{const on=d.querySelector('.is-on');const b=d.querySelector('.ql-dock-body');b.scrollTop=on?on.offsetTop-b.offsetTop-60:0;});}
function closeDock(){$('.ql-dock').hidden=true;document.querySelectorAll('.ql-flag-mark.is-active').forEach(m=>m.classList.remove('is-active'));}
function openFlag(m){openDock('Flagged by Violet’s check',`<div class="ql-flag-dock"><p class="ql-flag-quote">“${esc(flagged)}”</p>${flagCard}</div>`);m.classList.add('is-active');}

// Autoplay: a few seconds per step, shown as a fill on the Next button. Holds while hovered or out of view;
// any click inside the conversation stops it (the visitor is reading), and Play resumes it.
const DEFAULT_WAIT=7000;let playing=true,hover=false,visible=false,left=DEFAULT_WAIT,timer=null,tickAt=0;
function holding(){return !playing||hover||!visible||document.hidden||n===steps.length-1;}
function schedule(){left=steps[n].wait||DEFAULT_WAIT;$('.ql-next').style.setProperty('--fill','0');run();}
function run(){clearTimeout(timer);timer=null;const btn=$('.ql-next');const total=steps[n].wait||DEFAULT_WAIT;
 if(holding()){btn.classList.remove('is-filling');btn.style.setProperty('--fill',String(1-left/total));updatePlay();return;}
 tickAt=performance.now();btn.style.setProperty('--fill',String(1-left/total));btn.style.setProperty('--left',left+'ms');
 requestAnimationFrame(()=>{btn.classList.add('is-filling');});timer=setTimeout(()=>{btn.classList.remove('is-filling');advance();},left);updatePlay();}
function hold(){if(timer){left=Math.max(0,left-(performance.now()-tickAt));}run();}
function updatePlay(){const p=$('.ql-play');p.hidden=n===steps.length-1;p.textContent=playing?'Pause':'Play';p.setAttribute('aria-pressed',String(!playing));}
function stopPlay(){if(!playing)return;playing=false;hold();}
const chatEl=$('.ql-body');
chatEl.addEventListener('mouseenter',()=>{hover=true;hold();});chatEl.addEventListener('mouseleave',()=>{hover=false;run();});
document.addEventListener('visibilitychange',()=>hold());
new IntersectionObserver(es=>{visible=es[0].isIntersecting;hold();},{threshold:.5}).observe(document.querySelector('.ql'));
if(matchMedia('(prefers-reduced-motion: reduce)').matches)playing=false;

let started=false;
document.addEventListener('click',e=>{
 const m=e.target.closest('[data-flag]');if(m){stopPlay();openFlag(m);return;}
 const b=e.target.closest('button');if(!b)return;
 if(!started){started=true;track('quicklook_start');}
 if(b.classList.contains('ql-play')){playing=!playing;if(playing){hover=false;}run();return;}
 if(b.classList.contains('ql-next')){advance();return;}
 if(b.closest('.ql-body'))stopPlay();
 if(b.dataset.more!==undefined){const c=b.previousElementSibling;c.classList.toggle('is-open');b.textContent=c.classList.contains('is-open')?'Show less':b.textContent.replace('Show less','Show the whole');return;}
 if(b.dataset.rest!==undefined){const r=b.previousElementSibling.querySelector('.ql-rest');r.hidden=!r.hidden;b.textContent=r.hidden?'Show the whole reply':'Show less';return;}
 if(b.dataset.decide){const host=b.closest('[data-decide-host]');host.outerHTML=b.dataset.decide==='save'?`<p class="ql-saved">✓ Saved. <span style="color:#282333">${esc(conductScope.savedReply)}</span></p>`:`<p class="ql-saved" style="color:#5f5969">Kept the plan as is. Nothing changed.</p>`;return;}
 if(b.dataset.flagok!==undefined){closeDock();const mk=document.querySelector('.ql-flag-mark');if(mk){mk.classList.add('is-reviewed');mk.removeAttribute('data-flag');mk.removeAttribute('role');mk.removeAttribute('tabindex');mk.title='';}const h=document.querySelector('.ql-flag-hint');if(h)h.innerHTML='<span class="is-ok">✓ Reviewed</span> You decide what stays in the report.';return;}
 if(b.dataset.go){track('open-sandbox');return;}
 if(b.classList.contains('ql-dock-close')){closeDock();return;}
 if(b.dataset.reportCitation){const c=reportCitations[b.dataset.reportCitation];if(c)openDock(c.title,c.html);return;}
 if(b.dataset.cite){const k=(b.getAttribute('title')||'').replace(/^Source \d+: /,'');const c=capturedCitations[k];if(c)openDock(c.title,c.html);}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDock();if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('[data-flag]')){e.preventDefault();stopPlay();openFlag(e.target);}});
show(0);

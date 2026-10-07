// Quick look: one conversation, start to finish, in five exchanges. Every Violet card and answer is captured from the
// app (sources in FIDELITY-AUDIT.txt); the purple captions are the website's. Advances only when the visitor clicks.
import {planView,outlineView,reportView} from './artifact-views.js';
import {conductScope} from './conduct-scope.js';
import {capturedResponses} from './captured-responses.js';
import {capturedCitations} from './captured-citations.js';
import {capturedReview} from './captured-review.js';
const $=s=>document.querySelector(s);
const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t.content;};
const clip=(html,label)=>`<div class="ql-clip" tabindex="-1">${html}</div><button type="button" class="ql-more" data-more>Show the whole ${label}</button>`;
const strip=h=>{const r=tpl(h);r.querySelectorAll('.vt-mode,.vt-stagecard-foot,.journey-foot,.vt-tabs,.vt-summary-panel-acts').forEach(e=>e.remove());const d=document.createElement('div');d.append(r);return d.innerHTML;};
// The scope answer, first two paragraphs shown; the rest behind "Show the whole reply".
const scopeParts=[...tpl(conductScope.html).firstElementChild.children].map(e=>e.outerHTML);
// The report: the paragraph Violet's own check flagged, with the flag card beside it.
const flagged=capturedReview.flaggedSentences[0];
const para=[...tpl(reportView('policy')).querySelectorAll('p')].find(p=>p.textContent.includes(flagged.slice(0,60)));
const paraHtml=(para?.innerHTML||flagged).replace(flagged,`<mark>${flagged}</mark>`);
const steps=[
 {label:'Plan',you:'Here’s the complaint and our accommodation policy.',files:['Complaint email','Accommodation policy'],
  violet:()=>clip(strip(planView({final:false,framework:'conduct'})),'plan'),
  caption:'<b>Violet drafts the plan</b> from the complaint: allegations, who to interview, what to collect. You edit it and finalize.'},
 {label:'Interview prep',you:'Write Leah’s interview outline.',
  violet:()=>clip(strip(outlineView('leah')),'outline'),
  caption:'<b>Outlines for every interview,</b> tied to the allegations. You run the interview your way.'},
 {label:'Something new',you:'Here’s Leah’s transcript. Does it raise anything outside the plan?',files:['Leah Goldberg interview'],
  violet:()=>`<div class="ql-text">${scopeParts.slice(0,2).join('')}<div class="ql-rest" hidden>${scopeParts.slice(2).join('')}</div></div><button type="button" class="ql-more" data-rest>Show the whole reply</button>${strip(conductScope.card)}<div class="ql-actions" data-decide-host><button type="button" class="vt-chip is-next" data-decide="save">Save this change</button><button type="button" class="vt-chip" data-decide="keep">Keep the plan as is</button></div>`,
  caption:'<b>Violet suggests; you decide.</b> The plan doesn’t change until you save. Try either button.'},
 {label:'Ask the record',you:'Did anyone besides Kim hear the “holy day” remark?',
  violet:()=>`<div class="ql-text">${capturedResponses.hearers.html}</div>`,
  caption:'<b>Ask anything about the case.</b> Every answer points to its source. Click a number to read the transcript line.'},
 {label:'Report',you:'Draft the report.',
  violet:()=>`<div class="ql-report"><h3>Draft report · 157 citations · checked against the record by Violet</h3><p>${paraHtml}</p></div><div class="ql-flag">${capturedReview.flagHtml}</div>`,
  caption:'<b>Violet drafts and checks the report.</b> Sentences that need a look are flagged. You review, edit, and approve. Findings are yours.'},
];
let n=0;
function track(name){try{parent.postMessage({violet:name},'*');}catch{}}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function show(i){const s=steps[i];const t=document.createElement('div');t.className='ql-turn';
 t.innerHTML=`<div class="ql-you">${s.files?`<div class="ql-files">${s.files.map(f=>`<span>📄 ${esc(f)}</span>`).join('')}</div>`:''}${esc(s.you)}</div><div class="ql-violet"><strong>● Violet</strong>${s.violet()}</div><p class="ql-caption">${s.caption}</p>`;
 t.querySelectorAll('.ql-flag button').forEach(b=>{if(/fine as is/i.test(b.textContent))b.dataset.flagok='';else b.remove();});
 t.querySelectorAll('.ql-report .cite-sup,.ql-report button').forEach(b=>b.disabled=true);
 t.querySelectorAll('.ql-clip details.vt-plan-sec').forEach(d=>d.open=false); // allegations first; context one click away
 $('.ql-chat').append(t);
 const chat=$('.ql-chat');chat.scrollTo({top:t.offsetTop-chat.offsetTop-10,behavior:'smooth'});
 $('.ql-steps').innerHTML=steps.map((x,j)=>`<li class="${j<=i?'is-done':''}">${j+1}. ${x.label}</li>`).join('');
 const last=i===steps.length-1;$('.ql-next').textContent=last?'Start over':'Next →';
 if(last)t.insertAdjacentHTML('beforeend',`<div class="ql-end"><button type="button" class="vt-chip is-next" data-go="sandbox">Try the full case yourself</button></div>`);
}
function reset(){$('.ql-chat').innerHTML='';closeDock();n=0;show(0);}
function openDock(c){if(!c)return;const d=$('.ql-dock');d.hidden=false;d.querySelector('b').textContent=c.title;d.querySelector('.ql-dock-body').innerHTML=c.html;requestAnimationFrame(()=>{const on=d.querySelector('.is-on');const b=d.querySelector('.ql-dock-body');if(on)b.scrollTop=on.offsetTop-b.offsetTop-60;});}
function closeDock(){$('.ql-dock').hidden=true;}
let started=false;
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(!started){started=true;track('quicklook_start');}
 if(b.classList.contains('ql-next')){closeDock();if(n<steps.length-1){n++;show(n);}else reset();return;}
 if(b.dataset.more!==undefined){const c=b.previousElementSibling;c.classList.toggle('is-open');b.textContent=c.classList.contains('is-open')?'Show less':b.textContent.replace('Show less','Show the whole');return;}
 if(b.dataset.rest!==undefined){const r=b.previousElementSibling.querySelector('.ql-rest');r.hidden=!r.hidden;b.textContent=r.hidden?'Show the whole reply':'Show less';return;}
 if(b.dataset.decide){const host=b.closest('[data-decide-host]');host.outerHTML=b.dataset.decide==='save'?`<p class="ql-saved">✓ Saved. <span style="color:#282333">${esc(conductScope.savedReply)}</span></p>`:`<p class="ql-saved" style="color:#5f5969">Kept the plan as is. Nothing changed.</p>`;return;}
 if(b.dataset.flagok!==undefined){b.closest('.ql-flag').innerHTML='<p class="ql-saved">✓ Marked reviewed. You decide what stays in the report.</p>';return;}
 if(b.dataset.go){track('open-sandbox');return;}
 if(b.classList.contains('ql-dock-close')){closeDock();return;}
 if(b.dataset.cite){const k=(b.getAttribute('title')||'').replace(/^Source \d+: /,'');openDock(capturedCitations[k]);}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDock();});
show(0);

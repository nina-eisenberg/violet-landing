// The four-step preview: ask → revised section in the report → its source beside the sentence → Keep or Undo.
// Real content only: the investigator's request and Violet's reply and section are the saved INV-2026-0096 exchange;
// the original section is the filed report; the source is the cited transcript line. Steps advance only when asked
// (or during one optional play-through, which stops on any click). Nothing scrolls the host page.
import {sectionRevision} from './section-revision.js';
import {reportView} from './artifact-views.js';
const PROMPT=sectionRevision.prompt;
const REPLIES=sectionRevision.replies; // Violet's two real lines in the conversation
const TARGET='He said he heard it himself from about six feet away';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t.content;};
// The original section: the filed report's section VII, first three paragraphs.
const report=tpl(reportView('policy'));const h7=[...report.querySelectorAll('h2')].find(h=>h.textContent.startsWith('VII.'));
const original=[];for(let n=h7?.nextElementSibling;n&&n.tagName!=='H2'&&original.length<3;n=n.nextElementSibling)original.push(n.outerHTML);
// The revision: Violet's section up to and including the sentence the preview opens.
const rev=tpl(sectionRevision.html);const revParts=[];for(const n of [...rev.children]){revParts.push(n.outerHTML);if(n.textContent.includes(TARGET))break;}
const revHtml=revParts.join('').replace(TARGET,`<mark class="pv-hl">${TARGET}`).replace(/(<mark class="pv-hl">[\s\S]*?)(<sup)/,'$1</mark>$2');
const citeN=(revHtml.match(/<mark class="pv-hl">[\s\S]*?<\/mark><sup[^>]*><button[^>]*data-revision-citation="(\d+)"/)||[])[1];
const dock=sectionRevision.docks[citeN];
const steps=[
 {label:'Ask',caption:'The investigator asks Violet, in plain words, to rework one section of the report.'},
 {label:'Revise',caption:'Violet rewrites that section inside the full report. The finding stays the investigator’s.'},
 {label:'Check the source',caption:'Every sentence carries its source. Click a number and the transcript opens beside the text.'},
 {label:'Decide',caption:'Nothing changes until the investigator says so: keep the revision, or undo it. Try either button.'},
];
let step=0,kept=null,timer=null,started=false;
function track(name){try{parent.postMessage({violet:name},'*');}catch{}}
function render(){
 $('.pv-steps').innerHTML=steps.map((s,i)=>`<li><button type="button" role="tab" aria-selected="${i===step}" class="${i===step?'is-on':''} ${i<step?'is-done':''}" data-step="${i}"><span>${i+1}</span>${s.label}</button></li>`).join('');
 $('.pv-caption').textContent=`${step+1} of 4 · ${steps[step].caption}`;
 $('.pv-prev').disabled=step===0;$('.pv-next').textContent=step===3?'Start over':'Next →';
 $('.pv-chat').innerHTML=`<div class="pv-bubble">${esc(PROMPT)}</div>${step>=1?`<div class="pv-reply"><strong>● Violet</strong>${REPLIES.map(r=>`<p>${esc(r)}</p>`).join('')}</div>`:''}`;
 const sec=$('.pv-section');
 if(step===0||kept===false){sec.innerHTML=original.join('')+(kept===false?'<p class="pv-note">Undone: the section is back to the filed version.</p>':'');}
 else{sec.innerHTML=`<div class="pv-revision ${step>=2?'is-checking':''}"><p class="pv-revision-label">${kept?'Kept Violet’s rewrite':'Redrafted just now · what’s new is highlighted'}</p>${step>=2?revHtml:revHtml.replace(/<\/?mark[^>]*>/g,'')}${kept?'':`<div class="pv-actions"><button type="button" class="vt-chip is-next" data-decide="keep" ${step<3?'tabindex="-1"':''}>Keep</button><button type="button" class="vt-chip" data-decide="undo" ${step<3?'tabindex="-1"':''}>Undo</button></div>`}</div>`;
  sec.querySelectorAll('.cite-sup').forEach(b=>{b.tabIndex=-1;b.disabled=true;});
  if(step>=2){sec.querySelector(`[data-revision-citation="${citeN}"]`)?.classList.add('is-active');}}
 if(step===3&&kept===null)$('.pv-actions')?.classList.add('is-live');
 const d=$('.pv-dock');
 if(step===2&&dock){d.classList.add('is-open');d.innerHTML=`<div class="pv-dock-head"><b>${esc(dock.title)}</b></div><div class="pv-dock-body">${dock.html}</div>`;requestAnimationFrame(()=>{const on=d.querySelector('.is-on');const body=d.querySelector('.pv-dock-body');if(on&&body)body.scrollTop=on.offsetTop-body.offsetTop-80;});}
 else{d.classList.remove('is-open');d.innerHTML='';}
 if(step>=2){const toMark=()=>{const m=$('.pv-hl');const box=$('.pv-report');if(m&&box){box.style.scrollBehavior='auto';box.scrollTop=m.getBoundingClientRect().top-box.getBoundingClientRect().top+box.scrollTop-110;}};toMark();$('.pv-dock').addEventListener('transitionend',toMark,{once:true});setTimeout(toMark,900);}else if(step===1){setTimeout(()=>{const n=$('.rev-new');const box=$('.pv-report');if(n&&box){box.style.scrollBehavior='auto';box.scrollTop=n.getBoundingClientRect().top-box.getBoundingClientRect().top+box.scrollTop-90;}},60);}else $('.pv-report').scrollTop=0;
}
function go(i){step=(i+4)%4;if(step===0)kept=null;render();}
function stopPlay(){clearInterval(timer);timer=null;$('.pv-play').setAttribute('aria-pressed','false');$('.pv-play').textContent='Play';}
function start(){if(!started){started=true;track('preview_start');}}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(!b.classList.contains('pv-play')){start();stopPlay();}
 if(b.dataset.step)go(+b.dataset.step);
 if(b.classList.contains('pv-next'))go(step+1);
 if(b.classList.contains('pv-prev'))go(step-1);
 if(b.dataset.decide&&step===3){kept=b.dataset.decide==='keep';render();}
 if(b.classList.contains('pv-play')){if(timer){stopPlay();return;}start();b.setAttribute('aria-pressed','true');b.textContent='Pause';if(step===3)go(0);timer=setInterval(()=>{if(step===3){stopPlay();return;}go(step+1);},5500);}
});
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){start();stopPlay();go(step+1);}if(e.key==='ArrowLeft'){start();stopPlay();go(step-1);}});
render();

// "Show me the highlights": four stops through the same fictional case, using the app's own saved cards.
import {planView,outlineView,summaryView,reportView} from './artifact-views.js';
import {capturedCitations,summaryCitations} from './captured-citations.js';
import {reportCitations} from './report-citations.js';
import {capturedReview} from './captured-review.js';
import {conductPath} from './conduct-path.js';
const $=s=>document.querySelector(s);
const stops=[
 {nav:'Plan',title:'A plan from the complaint',text:'Drop in the complaint and the policy. Violet drafts the investigation plan: the allegations, who to interview and what to gather.',you:'You edit anything, then finalize it.',html:()=>planView({final:false,framework:'conduct'})+`<p class="demo-label">${conductPath.source.plan}</p>`},
 {nav:'Interview prep',title:'Outlines for every interview',text:'For each person, Violet writes an interview outline tied to the allegations, with follow-ups to ask only if the witness doesn’t raise them.',you:'You run the interview your way.',html:()=>outlineView('leah')},
 {nav:'Evidence',title:'Summaries that show their sources',text:'Add the transcripts and Violet summarizes each one. Every point carries a source; click a number to read the transcript beside it.',you:'You weigh the evidence and decide what it supports.',html:()=>summaryView('marcus','bullets')},
 {nav:'Report',title:'A report you review sentence by sentence',text:'Violet drafts the report from the record and checks it. Sentences that need a look are highlighted; every citation opens its source.',you:'You review the flags, make the changes you want, and approve it.',html:()=>{const h=reportView('policy');const s=(capturedReview.flaggedSentences[0]||'').replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+$/,'');return h.replace(s,`<mark class="flag-sentence" title="Violet flagged this sentence">${s}</mark>`);},focus:'.flag-sentence'},
];
let i=0;
function track(name){try{parent.postMessage({violet:name},'*');}catch{}}
function render(){const st=stops[i];
 $('.hl-stops').innerHTML=stops.map((s,j)=>`<li><button type="button" data-stop="${j}" class="${j===i?'is-on':''}" aria-current="${j===i?'step':'false'}">${j+1}. ${s.nav}</button></li>`).join('');
 $('.hl-count').textContent=`${i+1} of ${stops.length}`;$('.hl-title').textContent=st.title;$('.hl-text').textContent=st.text;$('.hl-you').textContent=st.you;
 $('.hl-prev').disabled=i===0;$('.hl-next').textContent=i===stops.length-1?'Try the full case →':'Next →';
 const a=$('.hl-artifact');a.innerHTML=st.html();a.querySelectorAll('.vt-mode,.vt-stagecard-foot,.journey-foot').forEach(e=>e.remove());a.scrollTop=0;closeDock();
 if(st.focus)requestAnimationFrame(()=>{const f=a.querySelector(st.focus);if(f)a.scrollTop=f.offsetTop-a.offsetTop-140;});
}
function openDock(c){if(!c)return;const d=$('.hl-dock');d.hidden=false;d.querySelector('b').textContent=c.title;d.querySelector('.hl-dock-body').innerHTML=c.html;requestAnimationFrame(()=>{const on=d.querySelector('.is-on');const b=d.querySelector('.hl-dock-body');if(on)b.scrollTop=on.offsetTop-b.offsetTop-60;});}
function closeDock(){$('.hl-dock').hidden=true;}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.stop){i=+b.dataset.stop;render();return;}
 if(b.classList.contains('hl-prev')&&i>0){i--;render();return;}
 if(b.classList.contains('hl-next')){if(i<stops.length-1){i++;render();}else track('open-sandbox');return;}
 if(b.classList.contains('hl-dock-close')){closeDock();return;}
 if(b.dataset.reportCitation){openDock(reportCitations[b.dataset.reportCitation]);return;}
 if(b.dataset.summaryCitation){const [p,n]=b.dataset.summaryCitation.split(':');openDock(summaryCitations[p]?.[n]);return;}
 if(b.dataset.cite){const k=(b.getAttribute('title')||'').replace(/^Source \d+: /,'');openDock(capturedCitations[k]);}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDock();});
track('highlights_start');render();

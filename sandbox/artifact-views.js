import {capturedConfidence} from './captured-confidence.js';
import {initialPlan,expandedPlan} from './initial-plan.js';
import {capturedSummaries} from './captured-summaries.js';
import {capturedOutlines} from './captured-outlines.js';
import {conductPath} from './conduct-path.js';
import {conductScope} from './conduct-scope.js';
import {realArtifacts as a} from './real-artifacts.js';
const template=html=>{const t=document.createElement('template');t.innerHTML=html;return t;};
// The app's small violet superscript citation, kept as a button so it opens the source beside the text.
function citeSup(n,attrs){return `<sup class="cite-sup-wrap"><button type="button" class="cite-sup" ${attrs} aria-label="View citation ${n}">${n}</button></sup>`;}
const supNumber=s=>String(s).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c));

// Plan cards are the app's own renders. Editing controls the demo can't honour are removed rather than left dead.
export function planView({final,scope,framework}){
 const t=template(framework==='conduct'?(scope?conductScope.expandedPlan:conductPath.initialPlan):scope?expandedPlan:initialPlan),r=t.content;
 r.querySelector('.vt-eyebrow').textContent='Investigation plan · '+(final?'final':'draft');
 r.querySelectorAll('.vt-icon-btn,.vt-plan-add,.vt-stagecard-foot,.vt-card-tools,select').forEach(e=>e.remove());
 r.querySelectorAll('input[type=checkbox]').forEach(e=>e.remove());
 r.querySelectorAll('button.vt-editable').forEach(b=>{const s=document.createElement('span');s.className='vt-plan-static';s.innerHTML=b.innerHTML;b.replaceWith(s);});
 r.querySelectorAll('.vt-editable').forEach(e=>{e.removeAttribute('role');e.removeAttribute('tabindex');e.classList.remove('vt-editable');});
 r.querySelectorAll('details.vt-plan-sec').forEach(e=>e.open=true);
 // The demo shows the first four documents to gather (the saved plans list eight), so the card stays readable.
 r.querySelectorAll('.vt-plan-checklist').forEach(ul=>{[...ul.children].slice(4).forEach(li=>li.remove());const n=ul.previousElementSibling?.querySelector('.vt-plan-count');if(n)n.textContent=String(ul.children.length);});
 return t.innerHTML;
}
// Summaries are the app's SummaryCard renders. Steers and menus that have no captured result are not shown.
export function summaryView(id,format){
 const html=capturedSummaries[id]?.[format]||'';
 const t=template(html),r=t.content;
 r.querySelectorAll('.vt-stagecard-foot,.vt-summary-foot,.vt-icon-btn,.vt-summary-steers,[data-edit-key] .vt-summary-actions').forEach(e=>e.remove());
 const stats=r.querySelector('.vt-summary-stats');if(stats)stats.textContent=stats.textContent.replace(/\s*·\s*\d+ citations? couldn't be placed/,'');
 r.querySelectorAll('.vt-mode button').forEach((b,i)=>{const f=i?'narrative':'bullets';b.disabled=false;b.dataset.journey='format:'+f;b.dataset.keep='';b.setAttribute('aria-checked',String(format===f));b.classList.toggle('is-on',format===f);});
 r.querySelectorAll('[data-citation-footnote]').forEach(b=>{const n=supNumber(b.textContent);const w=template(citeSup(n,`data-cite="${id}" data-summary-citation="${id}:${format}-${b.dataset.citationFootnote}" data-keep`)).content.firstElementChild;b.replaceWith(w);});
 const lead=[...r.querySelectorAll('strong')].find(e=>e.textContent==='Bottom line:');
 if(lead){const h=document.createElement('h2');h.textContent='Bottom line';lead.closest('p').before(h);lead.remove();}
 r.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
 return t.innerHTML;
}
export function outlineView(id){
 const t=template(capturedOutlines[id]),r=t.content;
 r.querySelectorAll('.vt-stagecard-foot,.vt-icon-btn,.vt-card-tools').forEach(e=>e.remove());
 r.querySelectorAll('button,.vt-tabs,.vt-summary-panel-acts').forEach(b=>b.remove());
 r.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
 // Open at the allegation questions: the header block goes, and the opening, background and general sections fold away.
 const doc=r.querySelector('.vt-doc');const lines=doc?[...doc.children]:[];
 const h2s=lines.filter(e=>e.classList.contains('is-h2'));const first=h2s[0],main=h2s.find(e=>/Allegation/i.test(e.textContent));
 if(doc&&first&&main){const fold=document.createElement('details');fold.className='outline-fold';fold.innerHTML=`<summary>Opening, admonishments and background questions (${h2s.indexOf(main)} sections)</summary>`;
  let on=false;for(const e of lines){if(e===main)break;if(e===first)on=true;if(on)fold.append(e);else e.remove();}main.before(fold);}
 return t.innerHTML;
}
export function policyText(kind){
 const r=template(a.plan).content;const title=kind==='harassment-policy'?'Anti-Harassment Policy':'Anti-Retaliation Policy';
 const group=[...r.querySelectorAll('.vt-plan-group')].find(e=>e.textContent.includes(title));
 return {name:title,text:group?.textContent||title};
}
// Reports are the app's AnnotatedReportView renders; markers become buttons that open the cited passage.
export function reportView(framework='policy'){
 const t=template(framework==='conduct'?conductPath.report:a.report);
 t.content.querySelectorAll('mark[data-flag-mark]').forEach(m=>m.replaceWith(...m.childNodes));
 t.content.querySelectorAll('[data-citation-footnote]').forEach(b=>{const n=b.dataset.citationFootnote;b.replaceWith(template(citeSup(n,`data-report-citation="${n}" data-keep`)).content.firstElementChild);});
 return t.innerHTML;
}
export {a as artifacts};
// The saved three-policy evidence assessment from INV-2026-0096, split into a compact row and its reasoning.
export function policyConfidenceRows(){
 return capturedConfidence.map(row=>{const r=template(row.html).content;const li=r.firstElementChild;
  const suggests=[...li.querySelectorAll('p')].find(p=>p.textContent.startsWith('Evidence suggests:'))?.textContent||'';
  const conf=(suggests.match(/\((\w+) confidence\)/)||[])[1]||'';
  [...li.children].forEach(c=>{if(c.tagName==='H3'||c.tagName==='P')c.remove();});
  li.querySelectorAll('details').forEach(d=>d.open=true);
  return {title:row.title,confidence:conf,detail:li.innerHTML};});
}

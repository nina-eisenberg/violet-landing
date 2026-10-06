import {capturedConfidence} from './captured-confidence.js';
import {initialPlan,expandedPlan} from './initial-plan.js';
import {capturedSummaries} from './captured-summaries.js';
import {capturedOutlines} from './captured-outlines.js';
import {realArtifacts as a} from './real-artifacts.js';
const template=html=>{const t=document.createElement('template');t.innerHTML=html;return t;};
export function planView({final,scope,priya,allegation5}){
 const t=template(scope?expandedPlan:initialPlan),r=t.content;
 r.querySelector('.vt-eyebrow').textContent='Investigation plan · '+(final?'final':'draft');
 r.querySelectorAll('.vt-icon-btn,.vt-plan-add,.vt-stagecard-foot').forEach(e=>e.remove());
 r.querySelectorAll('[disabled]').forEach(e=>{e.removeAttribute('disabled');e.removeAttribute('aria-disabled');});
 r.querySelectorAll('.vt-editable').forEach(e=>{e.contentEditable='true';e.setAttribute('role','textbox');e.setAttribute('aria-label','Edit '+(e.closest('.vt-plan-row')?'allegation':'plan text'));});
 r.querySelectorAll('details.vt-plan-sec').forEach(e=>e.open=true);

 if(priya){const row=document.createElement('p');row.textContent='Priya Anand · Witness · HR Business Partner · Follow-up pending';r.querySelector('.vt-plan-wit')?.parentElement.append(row);}
 if(scope&&allegation5!=='Was the removal connected to the accommodation request or HR complaint?'){const p=document.createElement('p');p.textContent=allegation5;r.querySelectorAll('.vt-plan-group')[2]?.append(p);}
 return t.innerHTML;
}
export function summaryView(id,format){
 const html=capturedSummaries[id]?.[format] || (id==='marcus'?a.interview:'');
 const t=template(html),r=t.content;
 r.querySelectorAll('.vt-stagecard-foot,.vt-summary-foot,.vt-icon-btn,[data-edit-key] .vt-summary-actions').forEach(e=>e.remove());
 r.querySelectorAll('.vt-mode button').forEach((b,i)=>{b.disabled=false;b.dataset.journey='format:'+(i?'narrative':'bullets');b.setAttribute('aria-checked',String(format===(i?'narrative':'bullets')));b.classList.toggle('is-on',format===(i?'narrative':'bullets'));});
 r.querySelectorAll('[data-citation-footnote]').forEach(b=>{const n=document.createElement('button');n.className='source-number';n.dataset.cite=id;n.dataset.summaryCitation=id+':'+format+'-'+b.dataset.citationFootnote;n.textContent=b.textContent;n.setAttribute('aria-label',b.getAttribute('aria-label'));b.replaceWith(n);});
 r.querySelectorAll('[data-cite]').forEach(b=>{if(/^\d+$/.test(b.dataset.cite)){const n=document.createElement('button');n.className='source-number';n.dataset.realCitation=b.dataset.cite;n.textContent=b.textContent;n.setAttribute('aria-label',b.getAttribute('aria-label')||'View citation');b.replaceWith(n);}});
 // Promote the existing lead-in to the same heading level as the other sections.
 const lead=[...r.querySelectorAll('strong')].find(e=>e.textContent==='Bottom line:');
 if(lead){const h=document.createElement('h2');h.textContent='Bottom line';lead.closest('p').before(h);lead.remove();}
 r.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
 return t.innerHTML;
}
export function outlineView(id){
 const t=template(capturedOutlines[id]),r=t.content;
 r.querySelectorAll('.vt-stagecard-foot,.vt-icon-btn').forEach(e=>e.remove());
 r.querySelectorAll('button').forEach(b=>{if(/Conduct|Upload/.test(b.textContent))b.dataset.journey='record:'+id;else b.remove();});
 r.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
 return t.innerHTML;
}
export function policyText(kind){
 const r=template(a.plan).content;const title=kind==='harassment-policy'?'Anti-Harassment Policy':'Anti-Retaliation Policy';
 const group=[...r.querySelectorAll('.vt-plan-group')].find(e=>e.textContent.includes(title));
 return {name:title,text:group?.textContent||title};
}
export function reportView(){const t=template(a.report);t.content.querySelectorAll('mark[data-flag-mark]').forEach(m=>m.replaceWith(...m.childNodes));t.content.querySelectorAll('[data-citation-footnote]').forEach(b=>{const n=document.createElement('button');n.className='source-number';n.dataset.reportCitation=b.dataset.citationFootnote;n.textContent=b.textContent;n.setAttribute('aria-label',b.getAttribute('aria-label'));b.replaceWith(n);});return t.innerHTML;}
export {a as artifacts};

export function confidenceView(findings, indexes, recommendations, reasons={}){
 return capturedConfidence.map((row,j)=>{
  const i=indexes[j],t=template(row.html),r=t.content,li=r.firstElementChild;
  li.className='alignment';
  const paragraphs=[...li.children].filter(e=>e.tagName==='P');
  const aligned=findings[i]===recommendations[i];
  paragraphs[0].textContent=aligned?'Evidence aligned':'Evidence does not align with your finding';
  paragraphs[0].className=aligned?'evidence-aligned':'evidence-differs';
  paragraphs.find(p=>p.textContent.startsWith('Your finding:')).textContent='Your finding: '+findings[i];
  if(!aligned){const action=document.createElement('div');action.className='alignment-choice';const b=document.createElement('button');b.className='vt-chip';b.dataset.journey='align:'+i;b.textContent='Change to '+recommendations[i];action.append(b);const label=document.createElement('label');label.textContent='Your reasoning (optional)';const input=document.createElement('textarea');input.rows=3;input.dataset.confidenceReason=i;input.value=reasons[i]||'';input.dataset.confidenceReason=i;input.value=reasons[i]||'';input.setAttribute('aria-label','Your reasoning for '+row.title);label.append(input);action.append(label);li.append(action);}
  return t.innerHTML;
 }).join('');
}

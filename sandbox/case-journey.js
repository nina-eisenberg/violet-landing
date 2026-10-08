// The case journey after intake: a conversation that keeps everything it has shown. Every card stays where it was;
// each card offers one filled next step; questions are answered in place and the next step is offered after them.
// All Violet content is prepared from saved fictional cases (see FIDELITY-AUDIT.txt). No AI calls are made here.
import {capturedScope} from './captured-scope.js';
import {scopeReview} from './scope-review.js';
import {conductPath} from './conduct-path.js';
import {sectionRevision} from './section-revision.js';
import {conductScope} from './conduct-scope.js';
import {openSourcePanel} from './source-panel.js';
import {capturedCitations,summaryCitations} from './captured-citations.js';
import {reportCitations,conductReportCitations} from './report-citations.js';
import {findingRows,findingsView,overallIndexes} from './findings-view.js';
import {capturedReview} from './captured-review.js';
import {capturedResponses} from './captured-responses.js';
import {complaint} from './complaint.js';
import {planView,summaryView,outlineView,policyText,reportView,policyConfidenceRows,artifacts} from './artifact-views.js';
import {answerFor,caseAnswers,responseAvailable} from './case-answers.js';
import {suggestQuestions} from './question-suggestions.js';
import {typedAnswers,typedAnswerFor,typedAnswerNeeds,guideAnswerFor} from './typed-answers.js';
import {materials} from './materials.js';
import {freshJourney,progress,interviewOrder} from './journey-state.js';

const names={leah:'Leah Goldberg',jordan:'Jordan Kim',carla:'Carla Rivera',marcus:'Marcus Doyle'};
const first={leah:'Leah',jordan:'Jordan',carla:'Carla',marcus:'Marcus'};
const roles={leah:'Complainant',jordan:'Witness',carla:'Witness',marcus:'Subject'};
const policyRecommended=findingRows.map(r=>r.recommended);
const REDRAFT_PROMPT=sectionRevision.prompt;
const SCOPE_PROPOSAL_PROMPT='Keep all three existing allegations and both existing policy groups unchanged. Propose adding a fourth allegation under the Anti-Retaliation Policy: whether Marcus Doyle removed Leah Goldberg from the escalations queue because she requested a religious accommodation or complained to HR. Show the proposed change for my review before saving.';
// The policy report's review citation: footnote 23 (Marcus, transcript line 47). The conduct report's is found by text.
const POLICY_REVIEW_CITATION='23';

// Engagement events go to the host page only (postMessage); the sandbox itself sends nothing anywhere.
export function track(name){try{if(parent!==window)parent.postMessage({violet:name},location.origin);}catch{}}

export function createJourney({reply,user,esc}){
 let s,framework,format,revision,accepted,flagReplacement,scopeDecision,scopeReviewed,answered,reasons,confidenceSeen,reportOpen;
 const root=()=>document.querySelector('#content');
 const conduct=()=>framework==='conduct';
 const reportCites=()=>conduct()?conductReportCitations:reportCitations;
 const recommended=()=>conduct()?conductPath.findings.map(r=>r.recorded):policyRecommended;
 function init(fw='conduct'){framework=fw;s={...freshJourney(fw==='conduct'?conductPath.findings.length:7),framework:fw};format='bullets';revision=false;accepted=false;flagReplacement=null;scopeDecision=null;scopeReviewed=false;answered=new Set();reasons={};confidenceSeen=false;reportOpen=false;}
 init();
 const mutate=(event,id)=>{s={...progress(s,event,id),framework};shelf();};
 const btn=(a,t,cls='')=>`<button type="button" class="vt-chip ${cls}" data-journey="${a}">${t}</button>`;
 const link=(a,t)=>`<button type="button" class="vt-linkish journey-link" data-journey="${a}">${t}</button>`;
 // When one click adds several blocks (an answer, then a card), bring the first into view, so the reply is read from its start.
 let scrollTarget=null;const scroll=e=>{if(scrollTarget)return;scrollTarget=e;requestAnimationFrame(()=>{const t=scrollTarget;scrollTarget=null;t.scrollIntoView({block:'start',behavior:'smooth'});});};
 const norm=v=>String(v||'').toLowerCase().replace('partially substantiated','partially');

 // ── What comes next ─────────────────────────────────────────────────────────────────────────────────────
 function remaining(){return interviewOrder.filter(id=>!s.files.includes(id));}
 function nextStep(){
  if(!s.files.includes('policy'))return ['policy','Add the policy'];
  if(!s.plan)return ['finalize-plan','Finalize the plan'];
  if(s.files.includes('leah')&&!scopeDecision)return root()?.querySelector('.violet-proposal .vt-stagecard')?['scope','Save or keep the proposed change']:scopeReviewed?['propose-scope','Ask Violet to propose the change']:['scope-review',"Check Leah's interview for anything new"];
  // One summary makes the point: after the first is finalized, the rest arrive in one upload and are summarized together.
  const missing=interviewOrder.filter(id=>!s.files.includes(id));
  if(s.summaries.length&&missing.length)return ['upload-all:'+missing.join(','),missing.length===3?'Upload the other transcripts':`Upload the other ${missing.length===1?'transcript':missing.length+' transcripts'}`];
  for(const id of interviewOrder){
   if(!s.files.includes(id))return ['person:'+id,`Prepare ${first[id]}'s interview`];
   if(!s.summaries.includes(id))return ['summary:'+id,`Review ${first[id]}'s summary`];
  }
  if(!['emails','records'].every(id=>s.files.includes(id)))return ['gather','Add the remaining documents'];
  if(s.findings.some(v=>!v))return ['findings','Decide findings'];
  if(!confidenceSeen)return ['confidence','Check evidence alignment'];
  if(s.stage!=='report'&&!s.final)return ['report','Open the report'];
  if(!s.flag)return ['flag','Review the flag'];
  if(!s.citation)return ['citation','Check a citation'];
  if(!s.final)return ['final-report','Finalize the report'];
  return null;
 }

 // ── The conversation ────────────────────────────────────────────────────────────────────────────────────
 // A new card supersedes earlier ones: their step buttons are disabled; citations, reading and copying keep working.
 function retire(){root().querySelectorAll('.stage-live').forEach(c=>{c.classList.remove('stage-live');c.classList.add('stage-past');c.querySelectorAll('[data-journey]:not([data-keep])').forEach(b=>b.disabled=true);});}
 function stage(title,body,{next,extras=[],suggest=true,cls=''}={}){
  retire();
  const e=document.createElement('section');e.className=`vt-stagecard stage-live ${cls}`;
  const foot=(next||extras.length)?`<div class="vt-stagecard-foot journey-foot">${next?btn(next[0],next[1],'is-next'):''}${extras.map(([a,t])=>link(a,t)).join('')}</div>`:'';
  e.innerHTML=`<div class="vt-stagecard-head"><span class="vt-stagecard-dot" style="background:#7043bb"></span><span class="vt-eyebrow">${title}</span></div><div class="vt-ff-body">${body}</div>${foot}`;
  root().append(e);
  if(suggest){const qs=suggestQuestions(s,title,[...answered]).filter(q=>responseAvailable(q,s));
   if(qs.length){const d=document.createElement('div');d.className='question-suggestions';d.innerHTML='<span class="demo-label">Optional · ask Violet</span>'+qs.map(q=>`<button type="button" class="suggestion" data-journey="question:${caseAnswers.indexOf(q)}">${esc(q.question||q.title)}</button>`).join('');e.append(d);}}
  shelf();scroll(e);return e;
 }
 // After an answer or detour: the main journey's next step, offered in place.
 // After an answer, the one next step, as a button in the same thread (no label: there is nowhere to go "back" to).
 function continueLine(){
  const n=nextStep();if(!n)return;
  retire();const e=document.createElement('div');e.className='continue-line stage-live';e.innerHTML=btn(n[0],n[1],'is-next');root().append(e);
 }
 function shelf(){const n=nextStep();document.querySelector('#case-link').innerHTML=`<button class="vt-nav-item is-on" data-journey="resume" data-keep>Marcus Doyle</button><div class="vt-case-sub">${conduct()?'Conduct-based':'Policy-based'} · ${s.final?'Final report':s.stage==='report'?'Report draft':s.plan?'Plan final':'Intake complete'}</div><button class="vt-nav-item" data-journey="plan" data-keep>Plan ${s.plan?'✓':''}</button><button class="vt-nav-item" data-journey="interviews" data-keep>Interviews · ${s.summaries.length}/4</button><button class="vt-nav-item" data-journey="questions" data-keep>Ask about the case</button><button class="vt-nav-item" data-journey="gather" data-keep>Documents · ${s.files.length+1}</button>${s.findings.some(Boolean)||s.summaries.length===4?'<button class="vt-nav-item" data-journey="findings" data-keep>Findings</button>':''}${s.stage==='report'||s.final?'<button class="vt-nav-item" data-journey="report" data-keep>Report</button>':''}${n?`<p class="vt-case-next">Next: ${n[1]}</p>`:''}`;}
 function tray(ids,label){return `<div class="material-drop" data-drop="${ids.join(',')}" tabindex="0" aria-label="${label}"><b>${label}</b><span>Drop a sample file here, or choose one below</span></div><div class="sample-tray"><span class="demo-label">Your demo materials · fictional</span>${ids.map(id=>`<div class="material-item"><button class="sample-file" draggable="true" data-material="${id}">▤ ${materials[id].name}</button>${btn('upload:'+id,'Use this file')}${link('read:'+id,'Read')}</div>`).join('')}${ids.length>1?`<div class="material-all">${btn('upload-all:'+ids.join(','),'Use all '+ids.length+' files')}</div>`:''}</div>`;}
 function dock(title,html){const d=document.querySelector('#document');d.querySelector('h2').textContent=title;d.querySelector('pre').innerHTML=html;openSourcePanel(d);document.body.classList.add('dock-open');}
 function source(id,needle=''){if(id==='synopsis'){const c=capturedCitations['Case synopsis, line 1'];if(c)dock(c.title,c.html);return;}
  const material=id.endsWith('-policy')?policyText(id):id==='complaint'?{name:'01_Complaint_Email_Goldberg.docx',text:complaint}:materials[id];if(!material)return;
  dock(material.name,material.text.split('\n').map(line=>needle&&line.includes(needle)?`<mark>${esc(line)}</mark>`:esc(line)).join('\n'));}

 // ── Stages ──────────────────────────────────────────────────────────────────────────────────────────────
 function start(fw){init(fw);root().querySelectorAll('#draft,.vt-stagecard').forEach(c=>{c.classList.add('stage-past');c.querySelectorAll('[data-do],[data-field],input,select').forEach(b=>b.disabled=true);});shelf();policy();}
 function policy(){stage('Policies',`<p>Before the plan: are the policies at issue in your library? If one is missing, drop it in and I'll add it.</p>${s.files.includes('policy')?'<p>✓ Religious Accommodation Policy HR-114</p>':tray(['policy'],'Add the policy')}<p class="demo-label">HR-114 is supplied with the sample files. The case's library also holds the Anti-Harassment Policy. The Anti-Retaliation Policy text is not in the library, which Violet points out later.</p>`,{next:s.files.includes('policy')?['plan','Draft the investigation plan']:null});}
 function plan(){if(!s.files.includes('policy'))return policy();
  if(!s.plan)track('first_artifact');
  reply(s.plan?"Here's the plan.":`Here's the plan as drafted${conduct()?': conduct allegations, each asking whether something happened':''}. Finalize it when it's right.`);
  const e=stage('Investigation plan',planView({final:s.plan,scope:s.scope,framework})+(conduct()?`<p class="demo-label">${esc(conductPath.source.plan)}</p>`:''),{next:s.plan?nextStep():['finalize-plan','Finalize the plan'],suggest:!s.plan});e.classList.add('artifact-host');}
 function interviews(){if(!s.plan)return plan();
  const rest=remaining();
  stage('Interviews',`<p>${s.summaries.length} of 4 summaries finalized.</p><div class="interview-tiles">${interviewOrder.map(id=>`<button class="person-tile" data-journey="person:${id}" data-keep><b>${names[id]}</b><span>${roles[id]}</span><small>${s.summaries.includes(id)?'✓ Summary finalized':s.files.includes(id)?'Record added · summary ready':s.outlines.includes(id)?'Outline ready':'Not yet interviewed'}</small></button>`).join('')}</div>${bulkOffer(rest)}`,{next:nextStep()});}
 // Add the remaining interview records in one go. On the policy path Leah's comes first, because her interview changes the plan.
 function bulkOffer(rest){if(!rest.length)return '';return `<div class="bulk-offer"><span>For the demo, the interviews have been conducted.</span>${btn('upload-all:'+rest.join(','),rest.length===4?'Upload all interview transcripts':`Upload the other ${rest.length===1?'transcript':rest.length+' transcripts'}`)}</div>`;}
 function person(id){
  stage(names[id]+' · '+roles[id],`<p>${id==='carla'?'Carla’s record is interview notes, not a verbatim transcript.':'Prepare the outline, then bring in the completed interview.'}</p>`,{next:s.files.includes(id)?['summary:'+id,`Review ${first[id]}'s summary`]:s.outlines.includes(id)?['record:'+id,id==='carla'?'Add the interview notes':'Add the transcript']:['outline:'+id,'Write the interview outline'],extras:[...(s.outlines.includes(id)?[['outline:'+id,'View the outline']]:[]),...(!s.files.includes(id)&&!s.outlines.includes(id)?[['record:'+id,id==='carla'?'Upload the interview notes':'Upload the transcript']]:[]),['interviews','All interviews']]});}
 function outline(id){mutate('outline',id);const e=stage('Interview outline · '+names[id],outlineView(id),{next:s.files.includes(id)?['summary:'+id,`Review ${first[id]}'s summary`]:['record:'+id,id==='carla'?'Add the interview notes':'Add the transcript'],extras:[['interviews','All interviews']]});e.classList.add('artifact-host');}
 function record(id){if(s.files.includes(id))return summary(id);stage(names[id]+' · '+(id==='carla'?'Interview notes':'Interview record'),`<p>${id==='carla'?'Add the notes from Carla’s phone interview.':'For the demo, the interview has already been conducted. Add its transcript.'}</p>${tray([id],id==='carla'?'Add interview notes':'Add the transcript')}`,{extras:[['interviews','All interviews']]});}
 function upload(id,quiet=false){if(s.files.includes(id))return false;mutate('upload',id);if(!quiet)user('Added '+materials[id].name);return true;}
 function afterUpload(ids){
  if(ids.includes('policy')){reply('The policy is added.');return plan();}
  const people=ids.filter(id=>interviewOrder.includes(id)),docs=ids.filter(id=>!interviewOrder.includes(id));
  if(people.length&&s.summaries.length){const more=finishSummaries();reply(`${listNames(people)}: ${people.length>1?'interviews':'interview'} added and summarized, finalized for the demo. Open any summary from Interviews.`);const n=nextStep();return n?dispatch(n[0]):interviews();}
  if(people.length){reply(people.length>1?`${people.map(id=>first[id]).join(', ')}: records added; the interviews are marked complete.`:people[0]==='carla'?'The interview notes are added.':'The transcript is added; the interview is marked complete.');
   if(people.includes('leah')&&!scopeDecision){return stage('Interview added',`<p>Leah's account is in the case. Before summarizing, it is worth checking whether her interview raises anything the plan doesn't cover.</p>`,{next:['scope-review',"Check Leah's interview for anything new"],extras:[['summary:leah','Read her summary first']]});}
   if(people.length>1)return interviews();return summary(people[0]);}
  if(docs.length)gather();
 }
 // The scope moment (policy path): Violet finds the escalations removal herself, then proposes the change.
 function reviewScope(){scopeReviewed=true;
  if(conduct()){user(conductScope.question);answerBlock({html:conductScope.html,provenance:'Captured from Violet · INV-2026-0107'});showProposal(conductScope.card,'');return;}
  user(scopeReview.question);answerBlock({html:scopeReview.html+scopeReview.followup.map(t=>`<p class="violet-followup">${esc(t)}</p>`).join(''),provenance:'Captured from Violet · INV-2026-0105'});
  stage('Possible new allegation',`<p>Violet found a possible retaliation issue the plan doesn't cover: the September 16 removal from the escalations queue.</p>`,{next:['propose-scope','Ask Violet to propose the change'],extras:[['keep-scope','Leave the plan as it is']],suggest:false});}
 function proposeScope(){scopeReviewed=true;user(SCOPE_PROPOSAL_PROMPT);showProposal(capturedScope.card,`<div class="reply"><strong>● Violet</strong><div>${esc(capturedScope.caveat.replace(/<[^>]+>/g,''))}</div></div>`,`<details class="full-reply"><summary>Violet's full reply</summary><div class="answer-copy">${tidyLists(tidyScopeBody(capturedScope.body))}</div></details>`);}
 function showProposal(cardHtml,before,after=''){
  const t=document.createElement('template');t.innerHTML=cardHtml;const card=t.content.firstElementChild;
  card.querySelectorAll('.vt-stagecard-foot button').forEach(b=>{b.dataset.journey=b.textContent.includes('Save')?'scope':'keep-scope';});
  card.querySelector('.vt-stagecard-foot button')?.classList.add('is-next');
  retire();const e=document.createElement('section');e.className='violet-proposal stage-live';
  e.innerHTML=`${before}${card.outerHTML}${after}`;
  root().append(e);e.querySelectorAll('.av-cite').forEach((b,i)=>{b.dataset.scopeSource=i;b.dataset.keep='';});shelf();scroll(e);}
 // Display fixes only: the allegation keeps its real number, run-together list items are split, the uncited marker is explained.
 function tidyScopeBody(h){return h.replace(/<ol class="list-decimal pl-6 mb-4 space-y-2">/,'<ol class="list-decimal pl-6 mb-4 space-y-2" start="4">')
  
  ;}
 function decideScope(save){const p=[...root().querySelectorAll('.violet-proposal .vt-stagecard')].pop();
  if(p)p.outerHTML=save?`<div class="vt-plan-change-done">✓ Saved: ${conduct()?'change allegations':'add Anti-Retaliation Policy'}.</div>`:'<div class="vt-plan-change-done is-kept">Kept the plan as it was.</div>';
  scopeDecision=save?'saved':'kept';if(save){mutate('scope');reply(conduct()?conductScope.savedReply:scopeReview.savedReply);}
  else reply(`The plan stays at ${conduct()?'four':'three'} allegations. You can still ask about the escalations removal at any time.`);
  if(save){const n=nextStep();stage('Plan updated',conduct()?`<p>Allegation 5 is now part of the plan:</p><p class="new-allegation">${esc(conductScope.newAllegation)}</p>`:'<p>The Anti-Retaliation Policy is now part of the plan, with the escalations removal as an allegation.</p>',{next:n,suggest:false});return;}
  continueLine();}
 function finishSummaries(){const more=interviewOrder.filter(x=>s.files.includes(x)&&!s.summaries.includes(x));more.forEach(x=>mutate('summary',x));return more;}
 function listNames(ids){const n=ids.map(x=>first[x]);return n.length<2?n.join(''):n.slice(0,-1).join(', ')+' and '+n[n.length-1];}
 function summary(id){if(!s.files.includes(id))return record(id);
  const e=stage('Interview summary · '+names[id],summaryView(id,format),{next:s.summaries.includes(id)?nextStep():['final-summary:'+id,'Finalize this summary'],extras:[['interviews','All interviews']]});e.classList.add('artifact-host');e.dataset.person=id;}
 function gather(){if(!s.plan)return plan();const missing=['emails','records'].filter(id=>!s.files.includes(id));
  stage('Documents',`<p>${s.summaries.length<4?'You can add evidence now and return to the interviews.':'That’s everyone interviewed. Drop in anything else you have: emails, messages, records, notes.'}</p>${missing.length?tray(missing,'Add case documents'):'<p>✓ Email and chat records<br>✓ Workforce and training records</p>'}<details><summary>Files in the case</summary>${['complaint',...s.files].map(id=>link('read:'+id,id==='complaint'?'01_Complaint_Email_Goldberg.docx':materials[id].name)).join('')}</details>`,{next:missing.length>1?['upload-all:'+missing.join(','),'Upload both documents']:missing.length?null:s.summaries.length<4?nextStep():['analysis','That’s everything'],extras:s.summaries.length<4?[['interviews','Return to interviews']]:[]});}
 function ready(){return s.summaries.length===4&&['emails','records'].every(k=>s.files.includes(k));}
 function analysis(){if(!ready())return gather();stage('Analysis',`<p>Next, decide your findings. If you'd like to see the record laid out first, ${conduct()?'the timeline is':'the timeline and the evidence matrix are'} ready.</p>`,{next:['findings','Decide findings'],extras:[['timeline','View the timeline'],...(conduct()?[]:[['matrix:0','View the evidence matrix']])]});}
 function timeline(){if(!ready())return gather();reply("Here's the timeline: every dated event, and what doesn't line up.");stage('Timeline · 20 events',`<ol class="actual-timeline">${artifacts.events.map(e=>`<li><time>${esc(e.date)}</time><details><summary>${esc(e.title)}</summary><p>${esc(e.description)}</p><small>${esc(e.source)}</small>${e.flags.map(f=>`<p class="timeline-flag">⚑ ${esc(typeof f==='string'?f:JSON.stringify(f))}</p>`).join('')}</details></li>`).join('')}</ol>`,{next:['findings','Decide findings'],extras:conduct()?[]:[['matrix:0','View the evidence matrix']]});}
 function matrix(i){if(!ready())return gather();reply("Here's the evidence matrix: who and what supports each allegation.");const g=artifacts.groups[i];
  stage('Evidence matrix',`<nav class="artifact-tabs">${artifacts.groups.map((g,j)=>`<button type="button" class="vt-chip ${j===i?'is-on':''}" data-journey="matrix:${j}" data-keep>${esc(g.title)}</button>`).join('')}</nav><h3>${esc(g.title)}</h3>${g.entries.map(e=>{const id=e.source.includes('Leah')?'leah':e.source.includes('Jordan')?'jordan':e.source.includes('Carla')?'carla':'marcus';return `<section class="matrix-account"><h4>${esc(e.source.replace(/(Complainant|Witness|Subject)/,' · $1'))}</h4><p>${esc(e.text)}</p><button type="button" class="vt-linkish" data-cite="${id}">View source</button></section>`;}).join('')}`,{next:['findings','Decide findings']});}
 function findingsStage(){if(!ready())return gather();
  const body=conduct()?conductFindingsView():findingsView(s.findings);
  stage('Your findings',`<p>${conduct()?'Record whether each allegation is substantiated.':'Record a finding for each allegation, then the overall policy finding.'}</p>${body}${conduct()?`<p class="demo-label">These allegations come from ${esc(conductPath.source.report)}; they are worded a little differently from the plan above.</p>`:''}`,{next:['confidence','Check evidence alignment']});}
 function conductFindingsView(){return '<div class="vt-fx">'+conductPath.findings.map((r,i)=>`<div class="vt-fx-row"><div class="vt-fx-q"><span class="vt-fx-n">${r.n}</span><span>${esc(r.text)}</span></div><div class="vt-fx-opts" role="radiogroup" aria-label="${esc(r.text)}">${['Substantiated','Not Substantiated'].map(v=>`<button type="button" role="radio" aria-checked="${s.findings[i]===v}" class="vt-fx-opt ${s.findings[i]===v?'is-on':''}" data-pick="${i}" data-value="${v}">${s.findings[i]===v?'✓ ':''}${v}</button>`).join('')}</div></div>`).join('')+'</div>';}
 // Evidence alignment: one compact row per question; the reasoning opens on click.
 function confidence(){if(s.findings.some(v=>!v)){notice('Choose a finding for each question first.');return;}confidenceSeen=true;
  const list=items=>`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
  const rows=conduct()?conductPath.findings.map((r,i)=>({i,title:r.text,suggests:r.recommended,conf:r.confidence,detail:`<p class="cf-k">Key factors</p>${list(r.keyFactors)}${r.counterFactors.length?`<p class="cf-k">What cuts the other way</p>${list(r.counterFactors)}`:''}${r.limitations.length?`<p class="cf-k">Limitations</p>${list(r.limitations)}`:''}`}))
   :policyConfidenceRows().map((r,j)=>({i:overallIndexes[j],title:r.title,suggests:policyRecommended[overallIndexes[j]],conf:r.confidence,detail:r.detail}));
  const differs=rows.filter(r=>norm(s.findings[r.i])!==norm(r.suggests)).length;
  stage('Evidence alignment',`<p>${differs?`Your finding differs from what the evidence suggests on ${differs} ${differs===1?'question':'questions'}. You decide; keeping yours is fine, and a reason is optional.`:'Your findings line up with what the evidence suggests.'}</p><div class="cf-table">${rows.map(r=>{const same=norm(s.findings[r.i])===norm(r.suggests);return `<div class="cf-row ${same?'is-same':'is-diff'}"><div class="cf-q">${esc(r.title)}</div><div class="cf-cols"><span><small>Your finding</small>${esc(s.findings[r.i])}</span><span><small>Evidence suggests</small>${esc(r.suggests)}${r.conf?` · ${esc(r.conf)} confidence`:''}</span><span class="cf-badge">${same?'Aligned':'Differs'}</span></div>${same?'':`<div class="cf-choice">${btn('align:'+r.i,'Change to '+r.suggests)}<label>Your reasoning (optional)<textarea rows="2" data-confidence-reason="${r.i}" aria-label="Your reasoning for ${esc(r.title)}">${esc(reasons[r.i]||'')}</textarea></label></div>`}<details class="cf-detail"><summary>Why</summary>${r.detail}</details></div>`;}).join('')}</div>`,{next:['report','Open the report'],extras:[['findings','Review all findings']]});}

 // ── The report ──────────────────────────────────────────────────────────────────────────────────────────
 // The sentence about Marcus not pursuing the swap, cited to his transcript, in whichever report is open.
 function reviewCitationKey(){if(!conduct())return POLICY_REVIEW_CITATION;const paper=document.querySelector('#report-pane .report-paper');if(!paper)return '1';for(const p of paper.querySelectorAll('p,li')){if(!/swap/i.test(p.textContent))continue;for(const b of p.querySelectorAll('[data-report-citation]')){const k=b.dataset.reportCitation;if(conductReportCitations[k]?.title.includes('Marcus Doyle'))return k;}}return '1';}
 function reportFindingsDiffer(){return conduct()?conductPath.findings.some((r,i)=>norm(s.findings[i])!==norm(r.recorded)):overallIndexes.some(i=>s.findings[i]!==policyRecommended[i]);}
 function report(){if(!reportOpen&&s.stage!=='report'&&!s.final){try{mutate('report');}catch(e){notice(e.message);return;}}
  if(conduct()&&!s.flag)s.flag=true; // The conduct report passed verification with no flags.
  if(!reportOpen)track('report_reached');
  reportOpen=true;document.body.classList.add('report-open');
  let panel=document.querySelector('#report-pane');if(!panel){panel=document.createElement('aside');panel.id='report-pane';document.querySelector('.vt-main').append(panel);}
  const steps=[conduct()?{done:true,label:'No flags: verification passed 292 of 292 checks'}:{done:s.flag,label:s.flag?'Flag reviewed':'1 flag to review',action:'flag'},{done:s.citation,label:s.citation?'Citation checked':'1 citation to check',action:'citation'}];
  const n=nextStep();const canFinal=s.flag&&s.citation&&!(revision&&!accepted);
  // One title row, one status line with the single next step, then the report. Provenance sits at the foot.
  const nextBtn=s.final?'':n?btn(n[0],n[0]==='final-report'?'Finalize the report':n[1],'is-next'):'';
  const optional=conduct()||s.final?'':revision?`<li>${accepted?'✓ Revision kept':'Revision waiting: Keep or Undo'}</li>`:`<li class="is-optional"><button type="button" class="vt-linkish" data-journey="redraft" data-keep>Ask Violet to redraft a section</button></li>`;
  panel.innerHTML=`<div class="report-toolbar"><h2>Investigation report <span class="report-state">${s.final?'Final':'Draft'}</span></h2><div class="report-tools">${link('show-chat','Show conversation')}${btn('close-report','Close')}</div></div>
  ${s.final?'':`<div class="report-status"><ol class="report-steps">${steps.map(x=>`<li class="${x.done?'is-done':''}">${x.done?'✓':'○'} ${x.label}</li>`).join('')}${optional}</ol><div class="report-next">${nextBtn}<div class="report-msg" role="status"></div></div></div>`}
  <article class="report-paper"></article><p class="demo-label report-source">${conduct()?esc(conductPath.source.report):'Captured report from INV-2026-0096'} · ${reportFindingsDiffer()?'your findings differ from its conclusions in places':'matches your findings'}</p>`;
  const paper=panel.querySelector('.report-paper');paper.innerHTML=reportView(framework);
  const headings=[...paper.querySelectorAll('h2')].filter(h=>/^[IVX]+\. /.test(h.textContent));headings.forEach((h,i)=>{h.id='report-section-'+i;});
  if(revision&&!conduct()){const h=headings.find(x=>/Anti-Harassment/.test(x.textContent))||headings[6];const nextH=headings[headings.indexOf(h)+1];h.id='revised-section';let x=h.nextElementSibling;while(x&&x!==nextH){const r=x;x=x.nextElementSibling;r.remove();}const note=document.createElement('div');note.className='revision';note.innerHTML=`<div class="rev-banner"><span>${accepted?'✓ Kept Violet\'s rewrite':'Redrafted just now. What\'s new is highlighted.'} · ${sectionRevision.quotesVerified} quotes verified</span>${accepted?'':`<span class="revision-actions">${btn('keep-revision','Keep','is-next')}${btn('undo-revision','Undo')}</span>`}</div><div class="rev-body ${accepted?'is-kept':''}">${sectionRevision.html}</div><div class="rev-note"><p class="revision-label">Violet's note</p><p>${esc(sectionRevision.note)}</p></div>`;h.after(note);}
  if(!conduct()){const flagSentence=(capturedReview.flaggedSentences[0]||'').replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+$/,'');
   for(const p of paper.querySelectorAll('p')){if(p.textContent.includes(flagSentence)){p.innerHTML=flagReplacement!==null?p.innerHTML.replace(flagSentence,esc(flagReplacement)):p.innerHTML.replace(flagSentence,`<mark class="flag-sentence ${s.flag?'is-reviewed':''}" role="button" tabindex="0" data-journey="flag" data-keep title="${s.flag?'Flag reviewed':'Violet flagged this sentence; click to review'}">${flagSentence}</mark>`);break;}}}
  setTimeout(()=>{const h=document.querySelector('.vt-home');if(h)h.scrollTop=h.scrollHeight;},80);
  if(!root().querySelector('.report-narration'))stage('Report',`<p>The report is open beside the conversation. Follow the checklist at the top of it: ${conduct()?'check a citation':'review the flag, check a citation'}, then finalize. You can ask me about any part of it here.</p>`,{cls:'report-narration',suggest:true});
 }
 function closeReport(){document.querySelector('#report-pane')?.remove();document.body.classList.remove('report-open','dock-open','chat-hidden');reportOpen=false;const d=document.querySelector('#document');if(d?.open)d.close();}
 function showInReport(el){if(!el)return;const pane=document.querySelector('#report-pane');const go=()=>{if(!pane||!el.isConnected)return;pane.scrollTop+=el.getBoundingClientRect().top-pane.getBoundingClientRect().top-pane.clientHeight/3;};go();setTimeout(go,120);setTimeout(go,450);el.classList.add('is-focus');setTimeout(()=>el.classList.remove('is-focus'),2400);}
 function review(kind){if(!reportOpen)report();const paper=document.querySelector('#report-pane .report-paper');
  if(kind==='flag'){if(conduct())return;showInReport(paper.querySelector('.flag-sentence'));
   const t=document.createElement('template');t.innerHTML=capturedReview.flagHtml;t.content.querySelectorAll('dialog').forEach(e=>e.remove());
   t.content.querySelectorAll('button').forEach(b=>{b.dataset.journey=b.textContent.includes('Edit')?'edit-flag':b.textContent.includes('Remove')?'remove-flag':'address-flag';b.dataset.keep='';if(b.dataset.journey==='address-flag')b.classList.add('is-primary');});
   dock('Flagged sentence',t.innerHTML);}
  else{const k=reviewCitationKey();showInReport(paper.querySelector(`[data-report-citation="${k}"]`));const c=reportCites()[k];dock(c.title,c.html+`<div class="dock-actions">${btn('review-citation','Mark citation checked','is-next')}</div>`);}}
 function finalizeReport(anyway=false){const msg=document.querySelector('#report-pane .report-msg');
  if(!(s.flag&&s.citation)){notice(conduct()?'Check a citation first.':'Review the flag and check a citation first.',msg);return;}
  if(revision&&!accepted){notice('Keep or undo the revision before finalizing.',msg);return;}
  if(reportFindingsDiffer()&&!anyway){msg.innerHTML=`<p>Your findings differ from this captured report's conclusions. In the app, Violet would redraft those sections to match your findings; that redraft isn't part of this demo.</p>${btn('findings','Review my findings')}${btn('final-report-anyway','Finalize anyway','is-next')}`;return;}
  mutate('finalize');closeReport();celebrate();}
 // Filing the report, as the app celebrates it: Violet cheering, a short burst of confetti, and what it took.
 function celebrate(){retire();const e=document.createElement('section');e.className='vt-stagecard stage-live demo-celebrate';
  e.innerHTML=`<div class="celebrate-top"><img src="violet-welcome.webp" alt="" aria-hidden="true" class="celebrate-figure"><div><b>Report filed. Nice work.</b><span>4 interviews · ${s.findings.length} allegations · every sentence checked against the record</span><span>This was a fictional case; nothing was uploaded or sent.</span></div></div><div class="vt-stagecard-foot journey-foot">${btn('read-final','Read the final report','is-next')}${link('restart','Start the case again')}</div>`;
  root().append(e);shelf();scroll(e);track('sandbox_complete');
  const fire=()=>{e.classList.add('is-cheering');setTimeout(()=>e.classList.remove('is-cheering'),1900);confetti();};
  const io=new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting)){io.disconnect();setTimeout(fire,250);}},{threshold:.4});io.observe(e);}
 function confetti(){const layer=document.createElement('div');layer.className='demo-confetti';layer.setAttribute('aria-hidden','true');
  const colors=['#7043bb','#9b6fe0','#c9b2f2','#f2b8d8','#ffd27a','#5c359e','#8fd3c1'];const w=innerWidth,h=innerHeight;
  for(let i=0;i<120;i++){const p=document.createElement('i');const a=(Math.random()*120+30)*Math.PI/180;const v=.35*h+Math.random()*.3*h;
   p.style.left=`${w/2+(Math.random()-.5)*w*.33}px`;p.style.top=`${h*.45+(Math.random()-.5)*h*.1}px`;p.style.background=colors[i%colors.length];
   if(i%3===0){p.style.width='7px';p.style.height='7px';p.style.borderRadius='50%';}
   p.style.setProperty('--dx',`${Math.cos(a)*v*.9}px`);p.style.setProperty('--dy',`${-Math.sin(a)*v}px`);p.style.setProperty('--fall',`${.55*h+Math.random()*.3*h}px`);p.style.setProperty('--r',`${Math.random()*900-450}deg`);p.style.animationDelay=`${Math.random()*150}ms`;layer.append(p);}
  document.body.append(layer);setTimeout(()=>layer.remove(),2600);}
 // A refusal shows next to what was clicked, in words; otherwise in the conversation.
 let lastClicked=null;
 function notice(msg,where){const host=where||lastClicked?.closest('.vt-stagecard,.continue-line,.source-panel,.answer-tools')?.querySelector?.('.journey-foot,.dock-actions')||lastClicked?.closest('.answer-tools,.continue-line')||null;
  if(host){host.querySelector(':scope > .journey-notice')?.remove();const p=document.createElement('p');p.className='journey-notice';p.setAttribute('role','alert');p.textContent=msg;host.append(p);}else reply(msg);}

 // ── Answers ─────────────────────────────────────────────────────────────────────────────────────────────
 // Display fix only: Violet sometimes runs several list items into one line separated by " - "; split them back out.
 function tidyLists(h){return h.replace(/<li([^>]*)>([\s\S]*?)<\/li>/g,(m,a,inner)=>/ - (?=<strong|[A-Z])/.test(inner)?inner.split(/ - (?=<strong|[A-Z])/).map(x=>`<li${a}>${x}</li>`).join(''):m);}
 function answerBlock({html,provenance,copy}){html=tidyLists(html);retire();const e=document.createElement('div');e.className='reply violet-answer stage-live';e.innerHTML=`<strong>● Violet</strong><div class="answer-copy">${html}</div><div class="answer-tools">${copy?`<button type="button" class="vt-linkish" data-journey="copy:${copy}" data-keep>Copy</button>`:''}<small>${esc(provenance)}</small></div>`;root().append(e);scroll(e);return e;}
 function showAnswer(answer){
  if(!responseAvailable(answer,s)){reply(unavailableReason(answer));continueLine();return;}
  const missing=answer.requires.filter(id=>!s.files.includes(id));
  if(missing.length){reply(`To answer that from the record, I need ${missing.map(id=>materials[id].name).join(', ')}. Add ${missing.length===1?'it':'them'} and ask again.`);stage('More of the record is needed',tray(missing,'Add the missing materials'),{suggest:false,extras:[['resume','Back to the case']]});return;}
  if(answer.needsFindings&&s.findings.some(v=>!v)){reply('Record your findings first so the executive summary reflects your decisions.');return findingsStage();}
  if(answer.id==='executive'&&reportFindingsDiffer())reply('The captured executive summary follows the findings in the saved report, which differ from yours in places.');
  answered.add(answer.id);root().querySelectorAll('.question-suggestions button').forEach(b=>{const q=caseAnswers[Number(b.dataset.journey?.split(':')[1])];if(q&&answered.has(q.id))b.remove();});root().querySelectorAll('.question-suggestions').forEach(e=>{if(!e.querySelector('button'))e.remove();});
  let html=answer.html||esc(answer.text);
  if(answer.id==='client')html=html.replace(/\s*<button[^>]*class="source-number"[^>]*>\d+<\/button>/g,''); // client-facing draft: no citation markers
  answerBlock({html,copy:answer.id,provenance:answer.captureNote.startsWith('Complete live')?'Captured from Violet · earlier-stage scenario':'Captured from Violet · complete response'});
  continueLine();
 }
 function unavailableReason(a){
  if(a.id==='priya')return 'I can add Priya Anand once the plan is final.';
  if(a.id==='email')return "I'll be able to draft that once Marcus's interview is in the case.";
  if(a.id==='client')return 'This demo has the client update Violet drafted at the plan stage; ask for it before the plan is finalized.';
  if(conduct()&&['client','deadline','harassment','finding3'].includes(a.id))return 'That answer was captured on the policy-based version of this case, so it isn’t available on the conduct-based path.';
  if(['reword5','retaliation','gaps','executive','tran','pay','followup'].includes(a.id))return conduct()?'That answer was captured on the policy-based version of this case, so it isn’t available on the conduct-based path.':'That question depends on the escalations allegation, which is added to the plan after Leah’s interview.';
  return 'That answer was captured at a later point in this case. Keep going and ask again.';
 }

 // ── Actions ─────────────────────────────────────────────────────────────────────────────────────────────
 function dispatch(a){try{
  const i=a.indexOf(':'),cmd=i<0?a:a.slice(0,i),id=i<0?undefined:a.slice(i+1);
  switch(cmd){
   case 'resume':{const n=nextStep();if(n)dispatch(n[0]);return;}
   case 'policy':return policy();
   case 'plan':return plan();
   case 'finalize-plan':mutate('plan');reply('The plan is final.');return interviews();
   case 'interviews':return interviews();
   case 'person':return person(id);
   case 'outline':return outline(id);
   case 'record':return record(id);
   case 'upload':if(upload(id))afterUpload([id]);else notice('That file is already in the case.');return;
   case 'upload-all':{const ids=id.split(',').filter(x=>!s.files.includes(x));if(!ids.length)return;user('Added '+ids.map(x=>materials[x].name).join(', '));ids.forEach(x=>upload(x,true));return afterUpload(ids);}
   case 'read':return source(id);
   case 'scope-review':return reviewScope();
   case 'propose-scope':return proposeScope();
   case 'scope':return decideScope(true);
   case 'keep-scope':{if(!root().querySelector('.violet-proposal .vt-stagecard')){scopeDecision='kept';reply('The plan stays as it is.');return continueLine();}return decideScope(false);}
   case 'summary':return summary(id);
   case 'format':{format=id;const host=lastClicked?.closest('.artifact-host');const person=host?.dataset.person;if(host&&person)host.querySelector('.vt-ff-body').innerHTML=summaryView(person,format);return;}
   case 'final-summary':{mutate('summary',id);const more=finishSummaries();reply(`${first[id]}'s summary is finalized.`+(more.length?` For the demo, ${listNames(more)}’s ${more.length>1?'summaries are':'summary is'} finalized too; open any of them from Interviews.`:''));const n=nextStep();return n?dispatch(n[0]):interviews();}
   case 'gather':return gather();
   case 'analysis':return analysis();
   case 'timeline':return timeline();
   case 'matrix':return matrix(Number(id));
   case 'findings':if(reportOpen)closeReport();return findingsStage();
   case 'confidence':return confidence();
   case 'align':mutate('finding',{index:Number(id),value:recommended()[Number(id)]});return confidence();
   case 'report':return report();
   case 'close-report':closeReport();return continueLine();
   case 'show-chat':document.body.classList.toggle('chat-shown');return;
   case 'flag':return review('flag');
   case 'citation':return review('citation');
   case 'address-flag':mutate('flag');document.querySelector('#document').close();report();return;
   case 'edit-flag':document.querySelector('#document pre').innerHTML=`<label class="flag-edit">Edit this sentence<textarea id="flag-edit" rows="5">${esc((capturedReview.flaggedSentences[0]||'').replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+$/,''))}</textarea></label><div class="dock-actions">${btn('save-flag-edit','Save','is-next')}${btn('flag','Cancel')}</div>`;return;
   case 'save-flag-edit':flagReplacement=document.querySelector('#flag-edit').value;return dispatch('address-flag');
   case 'remove-flag':flagReplacement='';return dispatch('address-flag');
   case 'review-citation':mutate('citation');document.querySelector('#document').close();report();return;
   case 'redraft':if(conduct())return;user(REDRAFT_PROMPT);revision=true;accepted=false;sectionRevision.replies.forEach(r=>reply(r));report();showInReport(document.querySelector('#revised-section'));return;
   case 'keep-revision':accepted=true;report();return;
   case 'undo-revision':revision=false;accepted=false;report();return;
   case 'final-report':return finalizeReport(false);
   case 'final-report-anyway':return finalizeReport(true);
   case 'read-final':report();return;
   case 'restart':document.querySelector('#reset')?.click();return;
   case 'questions':{const qs=caseAnswers.filter(q=>responseAvailable(q,s)&&q.requires.every(r=>s.files.includes(r)));stage('Ask about the case',qs.length?`<p>Type any question in the message box, or choose one of these.</p><div class="question-list">${qs.map(q=>`<button type="button" class="suggestion" data-journey="question:${caseAnswers.indexOf(q)}">${esc(q.question)}</button>`).join('')}</div>`:'<p>As more of the record comes in, I can answer questions about it. You can type one any time.</p>',{suggest:false,next:nextStep()});return;}
   case 'question':{const q=caseAnswers[Number(id)];user(q.question||q.title);return showAnswer(q);}
   case 'copy':{const t=capturedResponses[id]?.text||'';const host=lastClicked?.closest('.answer-tools');if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>notice('Copied.',host)).catch(()=>notice('Select the text above to copy it.',host));else notice('Select the text above to copy it.',host);return;}
  }
 }catch(e){notice(e.message);}}
 function route(text){
  const t=text.toLowerCase();
  if(/overview|what is this case|what.?s this case|tell me about.*case|where.*(stand|are we)/.test(t)){const n=nextStep();reply(`This is Leah Goldberg's complaint about her supervisor, Marcus Doyle: a denied Friday-evening accommodation request and remarks about her religious observance${s.scope?', plus her removal from the escalations queue':''}. ${n?'Next: '+n[1].toLowerCase()+'.':'The report is final.'}`);continueLine();return true;}
  if(/redraft|rewrite|severe|pervasive/.test(t)&&reportOpen&&!conduct()){dispatch('redraft');return true;}
  const answer=answerFor(text);if(answer){showAnswer(answer);return true;}
  if(/outside the (current )?plan|anything new|new allegation/.test(t)&&s.files.includes('leah')&&!scopeDecision){reviewScope();return true;}
  const ta=typedAnswerFor(text,s.files);
  if(ta){showTyped(ta);return true;}
  const need=typedAnswerNeeds(text);if(need){reply(`I can answer that from the record once ${need.requires.map(id=>materials[id].name).join(' and ')} ${need.requires.length>1?'are':'is'} in the case.`);continueLine();return true;}
  const g=guideAnswerFor(text);if(g){guide(g.text);continueLine();return true;}
  if(/^(next|what.?s next|what now|continue)/.test(t)){const n=nextStep();if(n){dispatch(n[0]);return true;}}
  if(/\breport\b/.test(t)&&(s.stage==='report'||ready())){dispatch('report');return true;}
  if(/\bplan\b/.test(t)){dispatch('plan');return true;}
  if(/timeline/.test(t)){dispatch('timeline');return true;}
  if(/matrix/.test(t)&&!conduct()){dispatch('matrix:0');return true;}
  if(/alignment|confidence/.test(t)){dispatch('confidence');return true;}
  if(/finding/.test(t)){dispatch('findings');return true;}
  if(/interview|summary|summari[sz]e|outline/.test(t)){const id=interviewOrder.find(k=>t.includes(k)||t.includes(names[k].split(' ')[1].toLowerCase()));if(!id){dispatch('interviews');return true;}dispatch((/outline/.test(t)?'outline:':/summary|summari/.test(t)?'summary:':'person:')+id);return true;}
  if(/upload|document|file|exhibit/.test(t)){dispatch('gather');return true;}
  routeWithJev(text);return true;
 }
 function showTyped(ta){answerBlock({html:ta.html+(ta.extra&&ta.extra.requires.every(id=>s.files.includes(id))?ta.extra.html:''),provenance:'Sample answer written for this demo in Violet’s style · not captured from Violet'});continueLine();}
 function noAnswer(){const qs=suggestQuestions(s,'',[...answered]).filter(q=>responseAvailable(q,s));
  guide(`This demo doesn't have a prepared answer for that. In Violet you can ask anything about the case's record.${qs.length?' Here are questions this demo can answer right now:':''}`,qs.map(q=>`<button type="button" class="suggestion" data-journey="question:${caseAnswers.indexOf(q)}">${esc(q.question)}</button>`).join(''));
  continueLine();}
 // When the keywords don't recognise a question, Jev (via /api/route-question) picks the closest prepared answer from
 // the ones available at this point, or none. It only chooses; every answer shown is still prepared content. If the
 // endpoint isn't there (e.g. a local preview) or isn't confident, the honest no-answer reply is shown.
 function routeWithJev(text){
  const allowed=[...caseAnswers.filter(q=>responseAvailable(q,s)).map(q=>'answer:'+q.id),...typedAnswers.map(t=>'typed:'+t.id),'nav:plan','nav:interviews','nav:next','nav:overview',...(s.stage==='report'||ready()?['nav:report']:[])];
  const wait=document.createElement('div');wait.className='reply thinking';wait.innerHTML='<strong>● Violet</strong><div>…</div>';root().append(wait);scroll(wait);
  fetch('/api/route-question',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text,allowed}),signal:AbortSignal.timeout(5000)})
   .then(r=>r.ok?r.json():null).catch(()=>null).then(res=>{wait.remove();const c=res?.choice;
    if(!c||c==='none'||!(res.p>=0.6))return noAnswer();
    const [kind,id]=c.split(':');
    if(kind==='answer'){const q=caseAnswers.find(a=>a.id===id);if(q)return showAnswer(q);}
    if(kind==='typed'){const t=typedAnswers.find(a=>a.id===id);if(t){const need=t.requires.filter(r=>!s.files.includes(r));if(!need.length)return showTyped(t);reply(`I can answer that from the record once ${need.map(r=>materials[r].name).join(' and ')} ${need.length>1?'are':'is'} in the case.`);return continueLine();}}
    if(kind==='nav'){if(id==='overview')return route('tell me about this case');return dispatch({plan:'plan',report:'report',interviews:'interviews',next:'resume'}[id]||'resume');}
    noAnswer();});
 }
 // The demo guide speaks for the demo itself, never as Violet.
 function guide(text,extra=''){const e=document.createElement('div');e.className='reply demo-guide';e.innerHTML=`<strong>Demo guide</strong><div><p>${esc(text)}</p>${extra?`<div class="question-list">${extra}</div>`:''}</div>`;root().append(e);scroll(e);}

 // ── Events ──────────────────────────────────────────────────────────────────────────────────────────────
 document.addEventListener('click',e=>{const b=e.target.closest('button,[data-journey]');if(!b||!b.closest('#content,#report-pane,#case-link,#document'))return;lastClicked=b;
  if(b.getAttribute('aria-disabled')==='true'&&b.dataset.journey!=='final-report')return;
  if(b.dataset.scopeSource!==undefined){const t=document.createElement('template');t.innerHTML=capturedScope.sources[b.dataset.scopeSource];const aside=t.content.querySelector('aside');dock(aside.getAttribute('aria-label')||'Source',(aside.querySelector('.vt-dock-meta')?.outerHTML||'')+(aside.querySelector('.vt-dock-body')?.innerHTML||''));return;}
  if(b.dataset.reportSection){document.querySelector('#report-section-'+b.dataset.reportSection)?.scrollIntoView({block:'start',behavior:'smooth'});return;}
  if(b.dataset.pick!==undefined){try{mutate('finding',{index:Number(b.dataset.pick),value:b.dataset.value});}catch(err){notice(err.message);return;}b.closest('.vt-fx-opts').querySelectorAll('button').forEach(x=>{const on=x===b;x.classList.toggle('is-on',on);x.setAttribute('aria-checked',String(on));x.textContent=(on?'✓ ':'')+x.dataset.value.replace('Partially Substantiated','Partially');});return;}
  if(b.dataset.reportCitation){const c=reportCites()[b.dataset.reportCitation];if(c)dock(c.title,c.html);return;}
  if(b.dataset.revisionCitation){const c=sectionRevision.docks[b.dataset.revisionCitation];if(c)dock(c.title,c.html);return;}
  if(b.dataset.cite){const key=(b.getAttribute('title')||b.getAttribute('aria-label')||'').replace(/^Source \d+: /,'').replace(/ — open the source$/,'');const [person,num]=(b.dataset.summaryCitation||'').split(':');const c=summaryCitations[person]?.[num]||capturedCitations[key];if(c)dock(c.title,c.html);else source(b.dataset.cite,b.dataset.needle);return;}
  if(b.dataset.journey)dispatch(b.dataset.journey);});
 document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('mark[data-journey]')){e.preventDefault();lastClicked=e.target;dispatch(e.target.dataset.journey);}});
 document.addEventListener('input',e=>{if(e.target.dataset.confidenceReason!==undefined)reasons[e.target.dataset.confidenceReason]=e.target.value;});
 document.addEventListener('dragstart',e=>{const b=e.target.closest('[data-material]');if(b)e.dataTransfer.setData('text/violet-material',b.dataset.material);});
 document.addEventListener('dragover',e=>{const d=e.target.closest('[data-drop]');if(d){e.preventDefault();d.classList.add('is-drag');}});document.addEventListener('dragleave',e=>e.target.closest('[data-drop]')?.classList.remove('is-drag'));
 document.addEventListener('drop',e=>{const d=e.target.closest('[data-drop]');if(!d)return;e.preventDefault();d.classList.remove('is-drag');const id=e.dataTransfer.getData('text/violet-material');if(d.dataset.drop.split(',').includes(id))dispatch('upload:'+id);else reply('Use one of the sample files for this step. No personal files are uploaded.');});
 document.querySelector('#document')?.addEventListener('close',()=>document.body.classList.remove('dock-open'));
 return {start,route,nextStep:()=>nextStep(),reset(){closeReport();init();}};
}

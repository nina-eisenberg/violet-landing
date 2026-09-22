import {outlineHtml} from './outline-data.js';
import {reportHtml,reportReviewHtml,sourceRecords} from './report-data.js';
const chapters=[
 ['TELL VIOLET','A conversation.<br>A starting point.','An employee shares a concern with Violet by voice or chat. The conversation becomes the starting point for triage.','The voice screen shown here follows Tell Violet’s actual interface. This is a simulated call.','Tell Violet · Voice intake'],
 ['INBOX & TRIAGE','From a report<br>to a case.','Review the AI summary, key facts, and parties. Decide whether to open an investigation.','“Convert to Case” moves the report into the investigation workflow.','Inbox · Review and convert'],
 ['INVESTIGATION PLAN','A plan with<br>real substance.','Context, policy allegations, scope questions, witnesses, and documents to collect.','Review the draft plan before it takes effect. Expand the sample to read all four sections.','Investigation · Review the plan'],
 ['INTERVIEW PREPARATION','The right questions.<br>Room to listen.','Prepare a rigorous interview outline and record the conversation for transcription.','Try the recording controls. This demonstration simulates recording without using your microphone.','Interview · Outline, record, transcribe'],
 ['TIMELINE','Every account.<br>In sequence.','Follow the chronology across interviews and documents. Look closely where the accounts differ.','Filter by party, expand the discrepancy, or open an event’s source.','Timeline · Chronology and discrepancies'],
 ['EVIDENCE MATRIX','One question.<br>Every source.','Compare what each witness and document contributes to the allegations under investigation.','The matrix brings the evidence together without choosing the finding for you.','Evidence Matrix · Witnesses and documents'],
 ['DETERMINATIONS','You make<br>the call.','Decide each component question and the overall finding. Violet checks your determinations against the evidence before drafting begins.','Keep your finding, revise it, or add context. The final decision remains yours.','Guided report · Determinations and evidence check'],
 ['GUIDED REPORT','Draft. Verify.<br>Finalize.','Build the report section by section. Violet checks material claims and citations against the record, then puts the source beside the draft for your review.','Edit the language, address each flag, and approve the final report before it leaves Violet.','Guided report · Draft and source review'],
 ['CLOSED CASES → VOICE TRAINING','A closed case.<br>An open conversation.','Turn completed investigations into anonymized scenarios your team can practice with Violet.','You are the manager responding to a concern. Practice listening, explaining the next step, and following through. Preview a scripted example here.','Training · Practice with Violet']
];
function guidedNav(active){return `<div class="guided-nav" aria-label="Guided report stages">${['Report setup','Scope','Determinations','Draft','Flag review','Citation review','Finalize'].map(label=>`<span class="${label===active?'guided-active':''}">${label}</span>`).join('')}</div>`}
const guidedHeader='<div class="guided-header"><strong>✧ Guided report</strong><span class="guided-saved">✓ Saved to this case</span><span class="guided-style">● Your writing style: applied</span></div>';
function hydrateGuidedReport(){
 const determination=document.querySelector('[data-scene="6"]');
 determination.classList.add('guided-scene');
 determination.innerHTML=`${guidedHeader}<div class="guided-body"><button class="app-outline evidence-check" id="check-finding">Check evidence alignment</button>${guidedNav('Determinations')}<section class="guided-panel"><div class="guided-panel-title"><h4>Determinations</h4><span>1 allegation</span></div><div class="allegation-card"><span class="allegation-number">ANTI-DISCRIMINATION POLICY</span><h4>Promotion decision — Elena Marquez</h4><div class="component-question"><p>Did Victor Hale ask whether Elena’s daughter’s school schedule would allow her to be fully committed to the launch lead role?</p><div class="choice-row"><button class="choice selected" type="button">Substantiated</button><button class="choice" type="button">Partially Substantiated</button><button class="choice" type="button">Not Substantiated</button></div></div><div class="component-question"><p>Did Victor ask Daniel Cho a similar question about home or family responsibilities?</p><div class="choice-row"><button class="choice" type="button">Substantiated</button><button class="choice" type="button">Partially Substantiated</button><button class="choice selected" type="button">Not Substantiated</button></div></div><div class="component-question compact-question"><p>Did Victor say the role required someone available “without home constraints”?</p><div class="choice-row"><button class="choice selected" type="button">Substantiated</button><button class="choice" type="button">Partially Substantiated</button><button class="choice" type="button">Not Substantiated</button></div></div><div class="overall-finding"><span>OVERALL POLICY FINDING</span><strong>Substantiated</strong></div></div></section><div id="confidence-result" class="alignment-result" hidden><div><span class="alignment-icon">✓</span><div><h4>Evidence aligned</h4><p>The selected finding is supported by the cited interview and meeting records. You may retain it, revise it, or add context.</p></div></div><button class="app-outline" id="close-alignment" type="button">Keep finding</button></div></div>`;
 const secondChoice=determination.querySelectorAll('.choice-row')[1];secondChoice.querySelectorAll('.choice').forEach((choice,index)=>choice.classList.toggle('selected',index===0));
 const report=document.querySelector('[data-scene="7"]');
 report.classList.add('guided-scene','guided-report-scene');
 report.innerHTML=`${guidedHeader}<div class="guided-body">${guidedNav('Flag review')}<div id="flag-state" class="report-state"><div class="flag-summary"><span>ⓘ 1 item to review · facts and findings shown below</span><button class="app-outline" id="open-full-report" type="button">Open full report</button></div><div class="flag-review-grid"><article class="draft-passage full-report-preview">${reportReviewHtml.replace('Senior Director of Technical Implementation','<mark>Director of Technical Implementation</mark>')}</article><aside class="accuracy-flag"><span class="flag-label">ACCURACY FLAG</span><h4>Daniel Cho’s title needs correction</h4><p>The source identifies Daniel as <strong>Senior Director of Technical Implementation</strong>.</p><div class="source-beside"><span>SOURCE · FINALIST MEETING NOTES</span><blockquote>“Daniel Cho, Senior Director of Technical Implementation, will lead the Northstar launch.”</blockquote></div><div class="flag-actions"><button type="button">Edit this sentence</button><button type="button">Remove the sentence</button><button class="address-flag" type="button">Mark flag addressed</button></div></aside></div></div></div>`;
}
hydrateGuidedReport();
function hydrateHaleCase(){
 const replacements=[
  [/Jordan Lee/g,'Victor Hale'],[/Alex Morgan/g,'Elena Marquez'],[/Alex\b/g,'Elena'],[/Casey Chen/g,'Jonah Reed'],[/INV-2026-0024/g,'INV-2026-0062'],
  [/After I raised a concern, I stopped being invited to the team meetings\./g,'After I questioned the promotion decision, my Northstar summit invitation was canceled.'],[/When did you first notice the invitations had stopped\?/g,'Can you tell me more about questioning the promotion decision?'],
  [/after raising a workplace concern/g,'after questioning a promotion decision'],[/the weekly project meetings/g,'the Northstar executive summit'],[/weekly project meetings/g,'Northstar project meetings'],[/meeting invitations stopped/g,'her summit invitation was canceled'],[/Meeting invitations stopped/g,'Summit invitation canceled'],
  [/March 3/g,'February 12'],[/March 10/g,'February 18'],[/March 18/g,'February 24'],[/March 21, 2026/g,'February 12, 2026'],[/March 3–21/g,'January 26–February 24'],
  [/team reorganization/g,'Northstar launch-lead selection'],[/reorganization proposal/g,'candidate selection matrix'],[/Reorganization proposal/g,'Candidate selection matrix'],[/Invitation changes and team roster/g,'Selection process and matrix history'],
  [/Anti-Retaliation Policy/g,'Anti-Discrimination Policy'],[/Was Elena removed from meetings needed to perform their role\?/g,'Did caregiving assumptions affect Elena’s candidacy?'],[/Was the change connected to Elena’s February 12 report\?/g,'Were different availability standards applied to Elena and Daniel?'],
  [/The invitation change is supported by the calendar record\. The reason for the change requires considering the reorganization records alongside the interviews\./g,'The meeting notes and interviews address the comments made to Elena. The selection matrix shows how the added travel criterion changed the candidates’ scores.'],
  [/The invitation list changes/g,'Travel criterion added to matrix'],[/The invitation change/g,'The selection decision'],[/Revised invitations omit Elena beginning February 18\./g,'Version 8 adds “rapid travel adaptability” after the finalist meeting.'],[/A February 27 proposal lists a smaller meeting group\./g,'Version history records when the criterion and scores changed.']
 ];
 document.querySelectorAll('[data-scene="0"],[data-scene="1"],[data-scene="2"],[data-scene="3"],[data-scene="4"],[data-scene="5"]').forEach(scene=>{let html=scene.innerHTML;for(const [from,to] of replacements)html=html.replace(from,to);scene.innerHTML=html});
 sourceRecords.alex={title:'Interview — Elena Marquez',text:'Elena described Hale’s questions about her daughter’s school schedule, the finalist-meeting comment about “home constraints,” and the explanation given when Daniel Cho was selected.'};
 sourceRecords.jordan={title:'Interview — Victor Hale',text:'Hale said he selected Daniel for enterprise go-live experience and travel flexibility. He denied that Elena’s sex influenced the decision.'};
 sourceRecords.casey={title:'Interview — Jonah Reed',text:'Reed attended the finalist meeting and later reviewed the candidate matrix version history.'};
 sourceRecords.calendar={title:'Selection Matrix — Version History',text:'Version 8 added a rapid travel adaptability criterion after the finalist meeting. Version 9 corrected formulas while retaining the new criterion.'};
 sourceRecords.proposal={title:'Finalist Meeting Notes',text:'Notes record discussion of availability, travel, and the candidates’ experience for the Northstar launch.'};
}
hydrateHaleCase();
function hydrateHaleIntelligence(){
 const shell=(active,content)=>`<div class="product-nav"><b><img src="/assets/mascot/violet.png" alt="" width="22" height="22">violet</b><span>Dashboard</span><span>Inbox</span><span class="nav-active">Cases</span><span>Tasks</span><span>Reports</span><span>More ▾</span></div><div class="product-body"><div class="case-heading"><h3>Victor Hale</h3><span class="case-status">Open ▾</span><span>INV-2026-0062 · opened Mar 24 · 12 days</span></div><div class="case-tabs"><span>Overview</span><span>Intake</span><span class="tab-active">Investigation</span><span>Documents</span><span>Report</span><span>Resolution</span><span class="subtabs"><i>Plan</i><i>Interviews</i><i class="${active==='Evidence Matrix'?'on':''}">Evidence</i><i class="${active==='Timeline'?'on':''}">Timeline</i></span></div>${content}</div>`;
 document.querySelector('[data-scene="4"]').innerHTML=shell('Timeline',`<div class="card-heading"><div><h4>Timeline (4 selected events)</h4><p class="flag-count">△ Key sequence from 47 case events</p></div><button class="app-outline" id="timeline-reset">Reset filters</button></div><div class="timeline-filters"><span>FILTER</span><button class="badge blue" data-party="alex" aria-pressed="false">● Elena Marquez</button><button class="badge green" data-party="jordan" aria-pressed="false">● Victor Hale</button><button class="badge yellow" id="flags-only" aria-pressed="false">△ Flags Only</button></div><div class="alternating-timeline"><article data-party="alex jordan" data-flag="true"><i class="event-dot alex flagged"></i><div class="event-card flagged"><div><time>Jan 26, 2026</time> <span class="badge green">Interview</span></div><h4>“Situation at home” discussed</h4><p>Elena says Victor linked her daughter’s school schedule to being “all in.” Victor recalls discussing availability but disputes the phrasing.</p><span class="badge blue">● Elena Marquez</span><button class="source-button" data-source="alex">View source ↗</button></div></article><article data-party="alex jordan" data-flag="true"><i class="event-dot jordan flagged"></i><div class="event-card flagged"><div><time>Jan 29, 2026</time> <span class="badge orange">Meeting</span></div><h4>Finalists discuss “home constraints”</h4><p>Elena and Jonah recall the phrase; Victor recalls “personal” or “scheduling constraints.”</p><span class="badge green">● Victor Hale</span><button class="source-button" data-source="proposal">View source ↗</button></div></article><article data-party="jordan" data-flag="true"><i class="event-dot jordan flagged"></i><div class="event-card flagged"><div><time>Jan 30–Feb 2</time> <span class="badge orange">Evidence</span></div><h4>Travel criterion changes the ranking</h4><p>“Rapid travel adaptability” is added after the finalist meeting. Version 7 favored Elena 42–40; Version 8 places Daniel ahead.</p><span class="badge green">● Victor Hale</span><button class="source-button" data-source="calendar">View source ↗</button></div></article><article data-party="alex jordan" data-flag="false"><i class="event-dot alex"></i><div class="event-card"><div><time>Feb 3, 2026</time> <span class="badge green">Selection</span></div><h4>Daniel Cho selected</h4><p>Victor cites go-live experience and flexibility. Elena recalls being told she had made clear that her daughter comes first.</p><span class="badge blue">● Elena Marquez</span><button class="source-button" data-source="alex">View source ↗</button></div></article></div><p id="timeline-empty" class="muted" hidden>No events match these filters.</p>`);
 document.querySelector('[data-scene="5"]').innerHTML=shell('Evidence Matrix',`<div class="card-heading"><h4>Evidence Matrix</h4><span class="badge gray">3 witnesses · 2 questions</span></div><p class="matrix-summary">Elena and Jonah corroborate the finalist-meeting language. Victor disputes the wording but acknowledges discussing availability and adding the travel criterion.</p><div class="matrix-scroll"><table class="evidence-matrix"><thead><tr><th>Witness</th><th>Were caregiving assumptions discussed?</th><th>Were different availability standards applied?</th></tr></thead><tbody><tr><th>Elena Marquez<br><span class="badge blue">Complainant</span></th><td>Recalls questions about school pickup and the “home constraints” comment.<button data-source="alex">View source ↗</button></td><td>Says Daniel’s April conflict was treated as solvable while her backup arrangements counted against her.<button data-source="alex">View source ↗</button></td></tr><tr><th>Victor Hale<br><span class="badge">Subject</span></th><td>Disputes the exact phrase, but acknowledges discussing availability and possibly referring to home logistics.<button data-source="jordan">View source ↗</button></td><td>Says Daniel’s deputy could cover his conflict and Elena’s clinical relationships were harder to delegate.<button data-source="jordan">View source ↗</button></td></tr><tr><th>Jonah Reed<br><span class="badge gray">Witness</span></th><td>Recalls “home constraints becoming the team’s constraints” at the finalist meeting.<button data-source="casey">View source ↗</button></td><td>Could not support treating Elena’s school emergency differently from Daniel’s conflicts.<button data-source="casey">View source ↗</button></td></tr><tr class="matrix-doc-label"><th colspan="3">Documentary evidence · Matrix Versions 7–9 and January 30 email</th></tr></tbody></table></div>`);
}
hydrateHaleIntelligence();
document.querySelector('.stage-top span:first-child').lastChild.textContent=' THE NORTHSTAR LAUNCH';
document.querySelector('[data-step="6"] span').textContent='Determinations';
document.querySelector('[data-step="7"] span').textContent='Guided report';
const $=s=>document.querySelector(s);
const journey=$('.journey'),workspace=$('.workspace'),scenes=[...document.querySelectorAll('.scene')],steps=[...document.querySelectorAll('[data-step]')];
const mobile=matchMedia('(max-width:650px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
let current=-1,scheduled=false,recordTimer=null,recordSeconds=0,recordPaused=false;
const pad=n=>String(n).padStart(2,'0');
const wave=$('.wave');for(let i=0;i<12;i++){const b=document.createElement('i');b.style.setProperty('--height',`${9+Math.sin(i*.73)**2*25}px`);b.style.setProperty('--delay',`${-i*.093}s`);wave.append(b)}
function stopSpeech(){}
function stopRecordingTimer(){clearInterval(recordTimer);recordTimer=null}
function setStage(index){if(current===index)return;const previous=current;current=index;const ch=chapters[index];$('.chapter-copy .eyebrow').textContent=`${pad(index+1)} / ${ch[0]}`;$('#chapter-title').innerHTML=ch[1];$('#chapter-description').textContent=ch[2];$('#chapter-detail').textContent=ch[3];$('#chapter-count').textContent=`${pad(index+1)} — ${pad(chapters.length)}`;$('#stage-status').textContent=ch[4];workspace.dataset.stage=index;scenes.forEach((scene,i)=>{scene.classList.toggle('active',i===index);scene.inert=i!==index||(mobile.matches&&!mobileDialog.open);scene.setAttribute('aria-hidden',String(i!==index||(mobile.matches&&!mobileDialog.open)))});steps.forEach((step,i)=>{step.classList.toggle('selected',i===index);step.classList.toggle('passed',i<index);step.setAttribute('aria-current',i===index?'step':'false')});$('#previous').disabled=index===0;$('#next').disabled=index===chapters.length-1;updateMobileView();requestScrollCueUpdate();{if(previous===8)stopSpeech();if(previous===3&&recordTimer){recordPaused=true;stopRecordingTimer();$('#record-state').textContent='Paused';$('#record-pause').textContent='Resume'}}}
function render(){scheduled=false;if(mobile.matches){if(current<0)setStage(0);return}const distance=journey.offsetHeight-innerHeight;const p=Math.min(1,Math.max(0,-journey.getBoundingClientRect().top/distance));setStage(Math.min(chapters.length-1,Math.floor(p*chapters.length)));document.documentElement.style.setProperty('--progress',`${p*100}%`)}
function requestRender(){if(!scheduled){scheduled=true;requestAnimationFrame(render)}}
function go(index){index=Math.min(chapters.length-1,Math.max(0,index));if(mobile.matches){transitionMobileStage(index);return}const y=journey.getBoundingClientRect().top+scrollY+(journey.offsetHeight-innerHeight)*(index/chapters.length+.012);scrollTo({top:y,behavior:reduced.matches?'instant':'smooth'})}
steps.forEach(step=>step.addEventListener('click',()=>go(Number(step.dataset.step))));$('#previous').addEventListener('click',()=>go(current-1));$('#next').addEventListener('click',()=>go(current+1));document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>go(Number(button.dataset.go))));addEventListener('scroll',requestRender,{passive:true});addEventListener('resize',requestRender);mobile.addEventListener('change',()=>{if(mobileDialog.open)mobileDialog.close();restoreMobileScene();current=-1;requestRender()});
const dialog=$('#source-dialog'),productDialog=$('#product-dialog'),productContent=$('#product-dialog-content');
for(const dlg of [dialog,productDialog]){dlg.querySelector('.close-dialog').addEventListener('click',()=>dlg.close());dlg.addEventListener('click',e=>{if(e.target===dlg){const r=dlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close()}})}
function showProduct(content){productContent.innerHTML='<div class="sample-label">VIOLET · FICTIONAL SAMPLE</div>'+content;if(!productDialog.open)productDialog.showModal();productDialog.scrollTop=0}
function openSource(id){const source=sourceRecords[id];if(!source)return;showProduct(`<h2>${source.title}</h2><p class="source-evidence">${source.text}</p><p class="muted">Authored fictional evidence for this walkthrough.</p>`)}
document.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>openSource(b.dataset.source)));
document.querySelectorAll('[data-report-source]').forEach(b=>b.addEventListener('click',()=>openSource(b.dataset.reportSource)));
document.querySelectorAll('[data-open-source]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));
$('[data-plan]').addEventListener('click',()=>showProduct('<h2>Review Investigation Plan</h2>'+$('.plan-long').innerHTML));
$('#outline-content').innerHTML=outlineHtml;
$('[data-outline]').addEventListener('click',()=>showProduct(outlineHtml));
// Simulate recording controls locally; never request microphone access.
function tick(){recordSeconds++;$('#record-time').textContent=`${pad(Math.floor(recordSeconds/60))}:${pad(recordSeconds%60)}`}
$('#record-start').addEventListener('click',()=>{stopRecordingTimer();recordSeconds=0;recordPaused=false;$('#record-time').textContent='00:00';$('#record-idle').hidden=true;$('#record-active').hidden=false;$('#record-transcript').hidden=true;$('#record-state').textContent='Recording';$('#record-pause').textContent='Pause';recordTimer=setInterval(tick,1000)});
$('#record-pause').addEventListener('click',()=>{recordPaused=!recordPaused;$('#record-state').textContent=recordPaused?'Paused':'Recording';$('#record-pause').textContent=recordPaused?'Resume':'Pause';stopRecordingTimer();if(!recordPaused)recordTimer=setInterval(tick,1000)});
$('#record-stop').addEventListener('click',()=>{stopRecordingTimer();$('#record-active').hidden=true;$('#record-idle').hidden=false;$('#record-transcript').hidden=false;$('#record-start').textContent='● Record Again'});
const activeParties=new Set();let flagsOnly=false;
function filterTimeline(){let count=0;document.querySelectorAll('.alternating-timeline article').forEach(row=>{const partyMatch=!activeParties.size||[...activeParties].some(p=>row.dataset.party.split(' ').includes(p));row.hidden=!(partyMatch&&(!flagsOnly||row.dataset.flag==='true'));if(!row.hidden){row.classList.toggle('on-right',count%2===1);count++}});$('#timeline-empty').hidden=count>0;document.querySelectorAll('.timeline-filters [data-party]').forEach(b=>b.setAttribute('aria-pressed',String(activeParties.has(b.dataset.party))));$('#flags-only').setAttribute('aria-pressed',String(flagsOnly))}
document.querySelectorAll('.timeline-filters [data-party]').forEach(b=>b.addEventListener('click',()=>{const p=b.dataset.party;activeParties.has(p)?activeParties.delete(p):activeParties.add(p);filterTimeline()}));$('#flags-only').addEventListener('click',()=>{flagsOnly=!flagsOnly;filterTimeline()});$('#timeline-reset').addEventListener('click',()=>{activeParties.clear();flagsOnly=false;filterTimeline()});filterTimeline();
document.querySelectorAll('.choice-row').forEach(row=>row.addEventListener('click',event=>{const button=event.target.closest('.choice');if(!button)return;row.querySelectorAll('.choice').forEach(choice=>choice.classList.toggle('selected',choice===button))}));
$('#check-finding').addEventListener('click',()=>{$('#confidence-result').hidden=false;$('#close-alignment').focus({preventScroll:true})});
$('#close-alignment').addEventListener('click',()=>{$('#confidence-result').hidden=true;$('#check-finding').focus({preventScroll:true})});
$('#open-full-report').addEventListener('click',openReport);
document.querySelector('.address-flag').addEventListener('click',event=>{event.currentTarget.textContent='✓ Flag addressed';event.currentTarget.closest('.accuracy-flag').classList.add('flag-addressed')});
function openReport(){showProduct(`<div class="report-toolbar"><button class="app-button" id="report-preview">Preview</button><button class="app-outline" id="report-edit">Edit Report</button></div><div class="report-reader"><div class="report-text" id="report-text" role="region" aria-label="Complete fictional report">${reportHtml}</div><aside id="report-source" class="source-evidence" hidden></aside></div><p class="muted">Edits are temporary and disappear when you reopen this sample.</p>`);const report=$('#report-text');productContent.querySelectorAll('[data-report-source]').forEach(b=>b.addEventListener('click',()=>{const s=sourceRecords[b.dataset.reportSource];$('#report-source').hidden=false;$('#report-source').innerHTML=`<h3>${s.title}</h3><p>${s.text}</p><button class="app-outline" id="close-report-source">Close source</button>`;$('.report-reader').classList.add('source-is-open');$('#close-report-source').addEventListener('click',()=>{$('#report-source').hidden=true;$('.report-reader').classList.remove('source-is-open')})}));$('#report-edit').addEventListener('click',()=>{report.contentEditable='true';report.focus()});$('#report-preview').addEventListener('click',()=>report.contentEditable='false')}
// Scripted voice-practice demonstration. Audio begins only on an explicit click.
const practiceLines=[
 ['Violet as Riley','Since I raised that concern, I’m not getting the meeting invitations. I’m worried I’m being pushed out. Please don’t tell anyone I said this.'],
 ['You — Riley’s manager','Thank you for telling me. I can see why that worries you. I don’t want to assume why the invitations changed. I also can’t promise to keep this only between us; I may need to involve the people responsible for reviewing concerns.'],
 ['Violet as Riley','So now everyone is going to know? I just want to do my job without making things worse.'],
 ['You — Riley’s manager','I’ll handle this discreetly and explain the next step. I’ll bring the concern to our designated HR contact. Is there information you need right now to do your work, or anything else that feels urgent?'],
 ['Violet as Riley','I missed a project decision yesterday. I’m also afraid that reporting this will mean even fewer opportunities.'],
 ['You — Riley’s manager','Let’s address access to the project information now. I’ll follow up with you tomorrow about the reporting process. If anything else changes or you feel pressured for speaking up, please tell me or contact HR directly.']
];let practiceIndex=0;
function showPracticeLine(){stopSpeech();const [role,text]=practiceLines[practiceIndex];$('#practice-conversation').innerHTML=`<span>${role}</span><p>${text}</p>`;$('#practice-turn').textContent=`${pad(practiceIndex+1)} / ${pad(practiceLines.length)}`;$('#practice-status').textContent=role;$('#practice-next').textContent=practiceIndex===practiceLines.length-1?'See sample scorecard →':'Next response →'}
function startPractice(){practiceIndex=0;$('#practice-intro').hidden=true;$('#practice-active').hidden=false;$('#practice-score').hidden=true;showPracticeLine();scenes[8].scrollTop=0;$('#practice-next').focus({preventScroll:true})}
$('#start-practice').addEventListener('click',startPractice);$('#practice-again').addEventListener('click',startPractice);
$('#practice-next').addEventListener('click',()=>{stopSpeech();if(practiceIndex<practiceLines.length-1){practiceIndex++;showPracticeLine()}else{$('#practice-active').hidden=true;$('#practice-score').hidden=false}});
addEventListener('pagehide',()=>{stopSpeech();stopRecordingTimer()});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSpeech();if(recordTimer){recordPaused=true;stopRecordingTimer();$('#record-state').textContent='Paused';$('#record-pause').textContent='Resume'}}});

// Keep one compact preview on phones. Move the actual scene into the dialog so
// recordings, filters, findings, and report controls retain their event handlers.
const mobileControls=document.createElement('div');
mobileControls.className='mobile-journey-controls';
mobileControls.innerHTML='<button type="button" class="mobile-explore">Explore this step <span class="cta-arrow" aria-hidden="true">↗</span></button><div class="mobile-step-navigation"><button type="button" class="mobile-previous">← Back</button><span class="mobile-step-count" role="status" aria-live="polite" aria-atomic="true"></span><button type="button" class="mobile-next">Next →</button></div><a href="#pricing" class="mobile-skip">See pricing ↓</a>';
$('.visual-wrap').after(mobileControls);
const mobileDialog=document.createElement('dialog');
mobileDialog.className='mobile-stage-dialog';
mobileDialog.setAttribute('aria-labelledby','mobile-detail-title');
mobileDialog.innerHTML='<div class="mobile-detail-header"><h2 id="mobile-detail-title"></h2><button type="button" class="mobile-detail-close" autofocus>Close ✕</button></div><div class="mobile-detail-content"></div>';
journey.after(mobileDialog);
const mobileContent=mobileDialog.querySelector('.mobile-detail-content');
function restoreMobileScene(){
 const scene=mobileContent.querySelector('.scene');
 if(scene){const following=scenes.slice(scenes.indexOf(scene)+1).find(s=>s.parentElement===workspace);workspace.insertBefore(scene,following||null);}
 document.documentElement.classList.remove('mobile-detail-open');
}
function updateMobileView(){
 $('.mobile-step-count').textContent=`Step ${current+1} of ${chapters.length}`;
 $('.mobile-previous').disabled=current===0;
 $('.mobile-next').disabled=current===chapters.length-1;
 workspace.setAttribute('aria-hidden',String(mobile.matches&&!mobileDialog.open));
 if(mobileDialog.open){restoreMobileScene();mobileContent.append(scenes[current]);scenes[current].inert=false;scenes[current].setAttribute('aria-hidden','false');$('#mobile-detail-title').textContent=chapters[current][0];document.documentElement.classList.add('mobile-detail-open');mobileContent.scrollTop=0;}
}
function openMobileDetail(){
 if(!mobile.matches)return;
 mobileFadeVersion++;mobileFade?.cancel();
 mobileDialog.showModal();updateMobileView();requestScrollCueUpdate();
 mobileDialog.querySelector('.mobile-detail-close').focus({preventScroll:true});
}
$('.mobile-explore').addEventListener('click',openMobileDetail);
$('.mobile-previous').addEventListener('click',()=>go(current-1));
$('.mobile-next').addEventListener('click',()=>go(current+1));
mobileDialog.querySelector('.mobile-detail-close').addEventListener('click',()=>mobileDialog.close());
mobileDialog.addEventListener('close',()=>{restoreMobileScene();if(mobile.matches){scenes[current].inert=true;scenes[current].setAttribute('aria-hidden','true');workspace.setAttribute('aria-hidden','true');$('.mobile-explore').focus({preventScroll:true});}if(recordTimer){recordPaused=true;stopRecordingTimer();$('#record-state').textContent='Paused';$('#record-pause').textContent='Resume';}});
let mobileFade=null,mobileFadeVersion=0;
async function transitionMobileStage(index){
 const version=++mobileFadeVersion;
 mobileFade?.cancel();
 if(mobileDialog.open||index===current){setStage(index);return;}
 // Fade through the change instead of stacking screenshots or duplicate controls.
 const duration=reduced.matches?80:110;
 mobileFade=workspace.animate([{opacity:1},{opacity:0}],{duration,fill:'forwards'});
 try{await mobileFade.finished;}catch{return;}
 if(version!==mobileFadeVersion||!mobile.matches){mobileFade.cancel();return;}
 setStage(index);
 mobileFade.cancel();
 mobileFade=workspace.animate([{opacity:0},{opacity:1}],{duration:reduced.matches?120:180,easing:'ease-out'});
}
let swipeStart=null;
workspace.addEventListener('pointerdown',e=>{if(mobile.matches)swipeStart={x:e.clientX,y:e.clientY};});
workspace.addEventListener('pointercancel',()=>swipeStart=null);
workspace.addEventListener('pointerup',e=>{if(!swipeStart)return;const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)go(current+(dx<0?1:-1));});

// Keep the cue outside the scrolling content so it remains discoverable.
function makeScrollCue(parent){
 const button=document.createElement('button');
 button.type='button';button.className='screen-scroll-cue';button.hidden=true;
 button.innerHTML='More below <span aria-hidden="true">↓</span>';
 button.setAttribute('aria-label','Scroll down within this screen');
 parent.append(button);return button;
}
const desktopScrollCue=makeScrollCue(workspace),mobileScrollCue=makeScrollCue(mobileDialog);
let cueFrame=0,desktopScrollTarget=null;
function hasMoreBelow(element){return element.clientHeight>0&&element.scrollHeight-element.clientHeight-element.scrollTop>8;}
function findScreenScrollTarget(){
 const scene=scenes[current];if(!scene)return null;
 // Prefer the outer screen, then any independently scrolling panel within it.
 return [scene,...scene.querySelectorAll('*')].find(element=>{
  if(!hasMoreBelow(element))return false;
  const style=getComputedStyle(element);
  if(!/auto|scroll/.test(style.overflowY))return false;
  const rect=element.getBoundingClientRect(),frame=workspace.getBoundingClientRect();
  return rect.bottom>frame.top&&rect.top<frame.bottom;
 })||null;
}
function setCueVisible(button,visible){if(button.hidden===visible)button.hidden=!visible;}
function updateScrollCues(){
 cueFrame=0;
 desktopScrollTarget=mobile.matches?null:findScreenScrollTarget();
 setCueVisible(desktopScrollCue,!!desktopScrollTarget);
 setCueVisible(mobileScrollCue,mobile.matches&&mobileDialog.open&&hasMoreBelow(mobileContent));
}
function requestScrollCueUpdate(){if(!cueFrame)cueFrame=requestAnimationFrame(updateScrollCues);}
function scrollScreen(target){if(target)target.scrollBy({top:Math.max(160,target.clientHeight*.7),behavior:reduced.matches?'instant':'smooth'});}
desktopScrollCue.addEventListener('click',()=>scrollScreen(desktopScrollTarget));
mobileScrollCue.addEventListener('click',()=>scrollScreen(mobileContent));
workspace.addEventListener('scroll',requestScrollCueUpdate,true);
mobileContent.addEventListener('scroll',requestScrollCueUpdate,{passive:true});
addEventListener('resize',requestScrollCueUpdate);
mobileDialog.addEventListener('close',requestScrollCueUpdate);
const screenResizeObserver=new ResizeObserver(requestScrollCueUpdate);
[workspace,mobileContent,...scenes].forEach(element=>screenResizeObserver.observe(element));
const screenMutationObserver=new MutationObserver(requestScrollCueUpdate);
[workspace,mobileContent].forEach(element=>screenMutationObserver.observe(element,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','open','class']}));
document.fonts.ready.then(requestScrollCueUpdate);
render();requestScrollCueUpdate();

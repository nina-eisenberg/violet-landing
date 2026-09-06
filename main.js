import {outlineHtml} from './outline-data.js';
import {reportHtml,sourceRecords} from './report-data.js';
const chapters=[
 ['TELL VIOLET','A conversation.<br>A starting point.','An employee shares a concern with Violet by voice or chat. The conversation becomes the starting point for triage.','The voice screen shown here follows Tell Violet’s actual interface. This is a simulated call.','Tell Violet · Voice intake'],
 ['INBOX & TRIAGE','From a report<br>to a case.','Review the AI summary, key facts, and parties. Decide whether to open an investigation.','“Convert to Case” moves the report into the investigation workflow.','Inbox · Review and convert'],
 ['INVESTIGATION PLAN','A plan with<br>real substance.','Context, policy allegations, scope questions, witnesses, and documents to collect.','Review the draft plan before it takes effect. Expand the sample to read all four sections.','Investigation · Review the plan'],
 ['INTERVIEW PREPARATION','The right questions.<br>Room to listen.','Prepare a rigorous interview outline and record the conversation for transcription.','Try the recording controls. This demonstration simulates recording without using your microphone.','Interview · Outline, record, transcribe'],
 ['TIMELINE','Every account.<br>In sequence.','Follow the chronology across interviews and documents. Look closely where the accounts differ.','Filter by party, expand the discrepancy, or open an event’s source.','Timeline · Chronology and discrepancies'],
 ['EVIDENCE MATRIX','One question.<br>Every source.','Compare what each witness and document contributes to the allegations under investigation.','The matrix brings the evidence together without choosing the finding for you.','Evidence Matrix · Witnesses and documents'],
 ['FINDINGS BEFORE DRAFTING','You set<br>the findings.','Confirm your findings and rationale before Violet starts drafting the report.','A confidence check follows. This preview demonstrates the sequence without running an AI assessment.','Documents · Findings and confidence check'],
 ['INVESTIGATION REPORT','From the record<br>to the reasoning.','Violet drafts, cites, and checks. Then you review the report and edit the work.','Watch the draft appear, then open the complete fictional sample and inspect its sources.','Documents · A draft for your review'],
 ['CLOSED CASES → VOICE TRAINING','A closed case.<br>An open conversation.','Turn completed investigations into anonymized scenarios your team can practice with Violet.','You are the manager responding to a concern. Practice listening, explaining the next step, and following through. Preview a scripted example here.','Training · Practice with Violet']
];
const $=s=>document.querySelector(s);
const journey=$('.journey'),workspace=$('.workspace'),scenes=[...document.querySelectorAll('.scene')],steps=[...document.querySelectorAll('[data-step]')];
const mobile=matchMedia('(max-width:650px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
let current=-1,scheduled=false,reportTimer=null,recordTimer=null,recordSeconds=0,recordPaused=false;
const pad=n=>String(n).padStart(2,'0');
const wave=$('.wave');for(let i=0;i<12;i++){const b=document.createElement('i');b.style.setProperty('--height',`${9+Math.sin(i*.73)**2*25}px`);b.style.setProperty('--delay',`${-i*.093}s`);wave.append(b)}
function showReport(){clearTimeout(reportTimer);$('#generation-panel').hidden=true;$('#inline-report').hidden=false}
function runGeneration(){clearTimeout(reportTimer);$('#generation-panel').hidden=false;$('#inline-report').hidden=true;reportTimer=setTimeout(showReport,reduced.matches?0:5200)}
function stopSpeech(){}
function stopRecordingTimer(){clearInterval(recordTimer);recordTimer=null}
function setStage(index){if(current===index)return;const previous=current;current=index;const ch=chapters[index];$('.chapter-copy .eyebrow').textContent=`${pad(index+1)} / ${ch[0]}`;$('#chapter-title').innerHTML=ch[1];$('#chapter-description').textContent=ch[2];$('#chapter-detail').textContent=ch[3];$('#chapter-count').textContent=`${pad(index+1)} — ${pad(chapters.length)}`;$('#stage-status').textContent=ch[4];workspace.dataset.stage=index;scenes.forEach((scene,i)=>{scene.classList.toggle('active',i===index);scene.inert=i!==index||(mobile.matches&&!mobileDialog.open);scene.setAttribute('aria-hidden',String(i!==index||(mobile.matches&&!mobileDialog.open)))});steps.forEach((step,i)=>{step.classList.toggle('selected',i===index);step.classList.toggle('passed',i<index);step.setAttribute('aria-current',i===index?'step':'false')});$('#previous').disabled=index===0;$('#next').disabled=index===chapters.length-1;updateMobileView();{if(index===7)runGeneration();else clearTimeout(reportTimer);if(previous===8)stopSpeech();if(previous===3&&recordTimer){recordPaused=true;stopRecordingTimer();$('#record-state').textContent='Paused';$('#record-pause').textContent='Resume'}}}
function render(){scheduled=false;if(mobile.matches){if(current<0)setStage(0);return}const distance=journey.offsetHeight-innerHeight;const p=Math.min(1,Math.max(0,-journey.getBoundingClientRect().top/distance));setStage(Math.min(chapters.length-1,Math.floor(p*chapters.length)));document.documentElement.style.setProperty('--progress',`${p*100}%`)}
function requestRender(){if(!scheduled){scheduled=true;requestAnimationFrame(render)}}
function go(index){index=Math.min(chapters.length-1,Math.max(0,index));if(mobile.matches){transitionMobileStage(index);return}const y=journey.getBoundingClientRect().top+scrollY+(journey.offsetHeight-innerHeight)*(index/chapters.length+.012);scrollTo({top:y,behavior:reduced.matches?'instant':'smooth'})}
steps.forEach(step=>step.addEventListener('click',()=>go(Number(step.dataset.step))));$('#previous').addEventListener('click',()=>go(current-1));$('#next').addEventListener('click',()=>go(current+1));document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>go(Number(button.dataset.go))));addEventListener('scroll',requestRender,{passive:true});addEventListener('resize',requestRender);mobile.addEventListener('change',()=>{if(mobileDialog.open)mobileDialog.close();restoreMobileScene();current=-1;requestRender()});
const dialog=$('#source-dialog'),productDialog=$('#product-dialog'),productContent=$('#product-dialog-content');
for(const dlg of [dialog,productDialog]){dlg.querySelector('.close-dialog').addEventListener('click',()=>dlg.close());dlg.addEventListener('click',e=>{if(e.target===dlg){const r=dlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close()}})}
function showProduct(content){productContent.innerHTML='<div class="sample-label">VIOLET · FICTIONAL SAMPLE</div>'+content;if(!productDialog.open)productDialog.showModal();productDialog.scrollTop=0}
function openSource(id){const source=sourceRecords[id];if(!source)return;showProduct(`<h2>${source.title}</h2><p class="source-evidence">${source.text}</p><p class="muted">Authored fictional evidence for this walkthrough.</p>`)}
document.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>openSource(b.dataset.source)));
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
$('#check-finding').addEventListener('click',()=>{const field=$('#demo-finding');if(!field.value){field.focus();field.setCustomValidity('Choose a sample finding to continue.');field.reportValidity();return}field.setCustomValidity('');$('#confidence-result').hidden=false});$('#demo-finding').addEventListener('change',e=>e.target.setCustomValidity(''));
document.querySelectorAll('.generation-steps li').forEach((row,i)=>row.style.setProperty('--i',i));$('#skip-generation').addEventListener('click',showReport);$('#replay-generation').addEventListener('click',runGeneration);
function openReport(){showProduct(`<div class="report-toolbar"><button class="app-button" id="report-preview">Preview</button><button class="app-outline" id="report-edit">Edit Report</button></div><div class="report-reader"><div class="report-text" id="report-text" role="region" aria-label="Complete fictional report">${reportHtml}</div><aside id="report-source" class="source-evidence" hidden></aside></div><p class="muted">Edits are temporary and disappear when you reopen this sample.</p>`);const report=$('#report-text');productContent.querySelectorAll('[data-report-source]').forEach(b=>b.addEventListener('click',()=>{const s=sourceRecords[b.dataset.reportSource];$('#report-source').hidden=false;$('#report-source').innerHTML=`<h3>${s.title}</h3><p>${s.text}</p><button class="app-outline" id="close-report-source">Close source</button>`;$('.report-reader').classList.add('source-is-open');$('#close-report-source').addEventListener('click',()=>{$('#report-source').hidden=true;$('.report-reader').classList.remove('source-is-open')})}));$('#report-edit').addEventListener('click',()=>{report.contentEditable='true';report.focus()});$('#report-preview').addEventListener('click',()=>report.contentEditable='false')}
$('#view-report').addEventListener('click',openReport);$('#read-full-report').addEventListener('click',openReport);
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
addEventListener('pagehide',()=>{stopSpeech();stopRecordingTimer();clearTimeout(reportTimer)});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSpeech();if(recordTimer){recordPaused=true;stopRecordingTimer();$('#record-state').textContent='Paused';$('#record-pause').textContent='Resume'}}});
$('.report-page-preview').innerHTML='<button class="app-button" id="expand-report">Open report & sources ↗</button>'+reportHtml.replace(/<button class="report-source-link"[^>]*>(.*?)<\/button>/g,'<span class="inline-citation">$1</span>');$('#expand-report').addEventListener('click',openReport);

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
 mobileDialog.showModal();updateMobileView();
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

render();

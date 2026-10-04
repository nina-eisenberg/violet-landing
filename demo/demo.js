(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const icons = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    folder:'<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    file:'<path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6"/>',
    list:'<path d="m3 6 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2M10 6h10M10 12h10M10 18h10"/>',
    message:'<path d="M4 4h16v13H9l-5 4zM8 8h8M8 12h5"/>',
    layers:'<path d="m3 7 9-4 9 4-9 4zm0 5 9 4 9-4M3 17l9 4 9-4"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zm-4 9 3 3 5-6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    wave:'<path d="M3 10v4M6 7v10M9 4v16M12 8v8M15 5v14M18 8v8M21 10v4"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="m10 3-1 3-3 1-3 3v4l3 3 3 1 1 3h4l1-3 3-1 3-3v-4l-3-3-3-1-1-3z"/>',
    captions:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M10 10H7v4h3m7-4h-3v4h3"/>',
    replay:'<path d="M3 5v5h5M3 10a9 9 0 1 1 2 8"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>'
  };
  function icon(name) { return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.file}</svg>`; }
  function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon); }); }
  const capture = window.VIOLET_CAPTURE;
  const extra = window.VIOLET_EXPANDED;
  const refined=window.VIOLET_REFINED; capture.plan=refined.plan;
  const name = '<div class="violet-name"><span class="small-dot"></span>Violet</div>';
  const bubble = text => `<div class="user-message">${text}</div>`;
  const reply = text => `<p class="violet-message">${text}</p>`;
  const escape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const texts = {
    proposal:"All four interviews are already done, so the plan will be built around the record you have. I've put up the card to draft the plan.",
    drafted:'The plan is drafted: 4 allegations. Click anything to change it, then finalize it.',
    finalized:'Plan finalized: 4 allegations. Next, prepare interview outlines, conduct interviews, and review the summaries.',
    building:'Building the timeline from the record.',
    timeline:'The timeline is built: 20 events. Build the evidence matrix too, or go on to the report.'
  };
  const proposedCard = `<div class="vt-card"><div class="vt-card-head"><span class="vt-card-title">Draft the investigation plan</span></div><div class="vt-card-body"><div class="vt-card-row"><span class="k">What</span><span>Allegations first, then what to gather and who to interview</span></div><div class="vt-card-row"><span class="k">Takes</span><span>About a minute. You review and finalize it.</span></div></div><div class="vt-card-foot"><button class="vt-btn is-p" id="confirm-draft">✓ Draft the plan</button><button class="vt-btn is-ghost" id="dismiss-draft">× Not now</button><span class="vt-card-hint">Nothing is saved until you confirm</span></div></div>`;
  const nextSteps = `<div class="vt-stagecard"><div class="vt-stagecard-head">What next</div><div class="vt-flow-choice"><button class="vt-flow-option" disabled title="Read-only preview"><strong>Generate interview outlines</strong><span>Prepare questions for each person in the plan.</span></button><button class="vt-flow-option" disabled title="Read-only preview"><strong>Conduct interviews</strong><span>Work through the interviews and capture the record.</span></button><button class="vt-flow-option" data-step="3"><strong>Interview summaries</strong><span>Review each account with links to the transcript.</span></button></div></div>`;
  const timelineCard = `<div class="timeline-result"><div>Timeline<span>BUILT</span></div><section>The timeline is built.<button class="vt-btn" data-open="timeline">Open it</button></section></div>`;
  let step=0,mode='proposal',playing=false,muted=false,cue=0,timer=null,previousFocus=null,playToken=0;
  const content=$('#conversation-content'),audio=$('#narration'),dialog=$('#detail-dialog');
  const sceneNames=['Across cases','Ask Violet','Review plan','Interview','Timeline','Evidence','Findings','Report','When things go wrong'];
  const homePrompt='Summarize Marcus Doyle’s interview, and add a note to Maya’s case: I need to review the draft plan.';
  const reportReply="The report is open on the right, ready to draft. Your findings are recorded, and I'll write each section from them. Once it's drafted, you can edit it by talking to me: “tighten the background,” “add Kim's account to allegation 2.”";
  const findingReply='The evidence matrix is built. Ready to draft the report? The findings come first: 7 decisions to make. Pick each one; it saves as you go.';
  const supportSent="I've sent this to Nina. She usually replies within a few hours, and I'll tell you here when it's fixed.";
  const supportFixed="Fixed. There's one step left for you, below.";
  const supportUpdate='From Nina: Thanks for reporting this. “Jordan Kim - witness statement (protected).pdf” is password-protected, so Violet couldn’t open it, and the message wrongly suggested it might be a scan. Violet now says clearly when a PDF is locked; please save or print a copy without the password and upload that one.';
  const cues=[
    {step:0,mode:'home',id:'user-home-natural',speaker:'INVESTIGATOR',text:homePrompt},
    {step:0,mode:'actions',id:'violet-home',speaker:'VIOLET',text:'Summary card is up for the Resolution-stage case.',note:'After selecting the correct Marcus Doyle case · selection and processing shortened'},
    {step:1,mode:'prompt',id:'user-plan',speaker:'INVESTIGATOR',text:'Draft the investigation plan.'},
    {step:1,mode:'proposal',id:'violet-proposal',speaker:'VIOLET',text:texts.proposal},
    {step:1,mode:'drafted',id:'violet-drafted',speaker:'VIOLET',text:texts.drafted,note:'After clicking “Draft the plan” · processing time shortened'},
    {step:2,mode:'final',id:null,speaker:'VIOLET',text:texts.finalized,note:'After investigator review and finalization · current case artifact'},
    {step:3,id:'user-interview',speaker:'INVESTIGATOR',text:"Summarize Marcus Doyle's interview."},
    {step:3,id:'violet-interview',speaker:'VIOLET',text:"The summary card for Marcus Doyle's interview is up."},
    {step:4,mode:'prompt',id:'user-timeline',speaker:'INVESTIGATOR',text:'Build the timeline.'},
    {step:4,mode:'building',id:'violet-building',speaker:'VIOLET',text:texts.building},
    {step:4,mode:'built',id:'violet-timeline',speaker:'VIOLET',text:texts.timeline},
    {step:5,id:'user-matrix',speaker:'INVESTIGATOR',text:'Build the evidence matrix.'},
    {step:5,id:'violet-matrix',speaker:'VIOLET',text:"Building the evidence matrix from the plan's allegations, the interviews and the documents."},
    {step:6,id:'violet-findings',speaker:'VIOLET',text:findingReply},
    {step:7,id:'user-report',speaker:'INVESTIGATOR',text:'Start the report.'},
    {step:7,id:'violet-report',speaker:'VIOLET',text:reportReply},
    {step:8,mode:'ticket',id:'violet-support',speaker:'VIOLET',text:supportSent},
    {step:8,mode:'fixed',id:'violet-fixed-current',speaker:'VIOLET',text:supportFixed,note:'Later · support resolution returned to the same conversation'}
  ];
  const caseHeader=$('.case-header').innerHTML;
  const caseRail=$('.app-sidebar').innerHTML;
  document.addEventListener('click',event=>{
    const toggle=event.target.closest('[data-summary-format]');if(!toggle)return;
    summaryFormat=toggle.dataset.summaryFormat;
    const card=toggle.closest('.vt-summary');card.outerHTML=interviewView();
    document.querySelectorAll(`[data-summary-format="${summaryFormat}"]`).forEach(button=>{if(button.closest('#detail-dialog')?.open||!button.closest('#detail-dialog'))button.focus();});
  });
  let summaryFormat='bullets';
  function interviewView(){
    const template=document.createElement('template');template.innerHTML=extra.interview;
    template.content.querySelectorAll('.vt-summary-body h2').forEach(heading=>{if(/Background|Response to the allegations|Documents and follow-up/.test(heading.textContent)){let next=heading.nextElementSibling;while(next&&next.tagName!=='H2'){const following=next.nextElementSibling;next.remove();next=following;}heading.remove();}});
    template.content.querySelectorAll('.vt-mode button').forEach((button,i)=>{
      const format=i===0?'bullets':'narrative';button.removeAttribute('disabled');
      button.dataset.summaryFormat=format;button.setAttribute('aria-checked',String(summaryFormat===format));
      button.classList.toggle('is-on',summaryFormat===format);
    });
    if(summaryFormat==='narrative')template.content.querySelectorAll('.vt-summary-body ul,.vt-summary-body ol').forEach(list=>{
      const paragraph=document.createElement('p');
      paragraph.innerHTML=Array.from(list.children).map(item=>item.innerHTML).join(' ');
      list.replaceWith(paragraph);
    });
    return template.innerHTML;
  }
  const homeOverview=`<div class="home-intro"><small>SATURDAY, OCTOBER 3</small><h3>Good evening, friend.</h3><p>Your work, across cases.</p><div class="home-start vt-start"><div><strong>Start a case</strong><p>Tell me what you have: files, a complaint you can describe, or just a name. I'll ask you what I need and set it up with you. Drop files here any time.</p></div></div><div class="home-today"><div><span>Inbox</span><p>42 reports are waiting in the inbox<small>Through Tell Violet</small></p></div><div><span>Plan</span><p>Maya Lindgren — Mock Case 6: the plan is waiting for review<small>Drafted, not finalized</small></p></div></div></div>`;
  function render(next,nextMode){
    closeSource();
    step=Math.max(0,Math.min(8,next));mode=nextMode||(step===0?'home':step===1?'proposal':step===2?'final':'built');
    $('#demo-panel').classList.toggle('is-home',step===0);$('#demo-panel').classList.toggle('is-report',step===7);
    $('.app-sidebar').innerHTML=step===0?`<span class="rail-brand">Violet.</span><button class="home-nav-active" data-step="0">${icon('home')} Home</button><span class="home-nav-static">${icon('folder')} Inbox <small>42</small></span><small class="home-cases-label">SELECTED DEMO CASES</small><button class="home-case-link" data-step="1">Marcus Doyle<small>INV-2026-0096</small></button><span class="home-case-link">Maya Lindgren<small>Mock Case 6</small></span><span class="rail-bottom">NE　 Nina Eisenberg</span>`:caseRail;
    $('.case-header').innerHTML=step===0?'<div><h3>Home</h3><p>Across your cases</p></div><span class="case-status">Actual Home · selected items</span>':caseHeader;
    $('.composer>span').textContent=step===0?'Ask about your cases, or tell Violet what you need…':step===7?'Ask, or say what to change…':'Ask about Marcus Doyle, or tell Violet what to do…';
    let html='';
    if(step===0){html=homeOverview;if(mode==='actions'){html=bubble(homePrompt)+name+`<p class="plan-readonly-note">After selecting “The one at Resolution” from three Marcus Doyle cases.</p><div class="vt-card"><div class="vt-card-head"><span class="vt-card-title">Summarize Marcus Doyle’s interview</span></div><div class="vt-card-body"><div class="vt-card-row"><span class="k">Case</span><span>Marcus Doyle</span></div><div class="vt-card-row"><span class="k">Format</span><span>Quick bullets</span></div></div></div>`+reply('Summary card is up for the Resolution-stage case.')+extra.homeNote+`<button class="vt-btn" data-step="3">Inspect Marcus’s interview summary →</button>`;};
    }else if(step===1){
      html=bubble('Draft the investigation plan');
      if(mode!=='prompt')html+=name+(mode==='drafted'?capture.action:proposedCard)+reply('All four interviews are already done, so the plan will be built around the record you have.')+reply("I've put up the card to draft the plan.");
      if(mode==='drafted')html+=reply(texts.drafted)+`<button class="vt-btn" data-step="2">Review the case’s plan →</button>`;
      if(mode==='dismissed')html=bubble('Draft the investigation plan')+name+reply('Not now');
    }else if(step===2){html=name+reply(texts.finalized)+`<p class="plan-readonly-note">Selected plan content · three example documents. Expand sections to inspect.</p>`+capture.plan+nextSteps;
    }else if(step===3){html=bubble("Summarize Marcus Doyle's interview")+name+reply("The summary card for Marcus Doyle's interview is up.")+`<p class="plan-readonly-note">Selected interview summary excerpts · shortened for this demo.</p>`+interviewView()+`<button class="vt-btn" data-open="transcript">Read the source transcript</button>`;
    }else if(step===4){html=bubble('Build the timeline');if(mode!=='prompt')html+=name+reply(texts.building);if(mode==='built')html+=`<div class="open-timeline"><h4>Timeline <small>6 selected events from the 20-event timeline</small></h4>${timelineBody()}</div>`;
    }else if(step===5){html=bubble('Build the evidence matrix')+name+reply("Building the evidence matrix from the plan's allegations, the interviews and the documents.")+matrixView();
    }else if(step===6){html=name+reply(findingReply)+`<p class="plan-readonly-note">Current saved decisions · the investigator makes these selections. Read-only replay.</p>`+extra.findings+confidenceView();
    }else if(step===7){html=bubble(mode==='edit'?'make the summary of findings section shorter':'Start the report')+name+reply(mode==='edit'?"Rewriting “II. Summary of Findings”. Violet's version will show in that section, to use or not.":reportReply)+`<p class="plan-readonly-note">The fictional case report, alongside the conversation.</p><button class="vt-btn" data-open="report">Read report excerpts →</button>`;}else{html=`<div class="uploaded-demo-file">${icon('file')} Jordan Kim - witness statement (protected).pdf</div>`+name+reply("Here's what I found.")+window.VIOLET_SUPPORT+reply(supportSent);if(mode==='fixed'||mode==='built')html+=`<div class="later-divider">LATER · SUPPORT FOLLOW-UP</div>`+reply(supportFixed)+refined.support;}
    content.innerHTML=`<div class="actual-exchange">${html}</div>`;content.scrollTop=mode==='fixed'?content.scrollHeight:0;
    let reportPanel=$('#report-preview');if(!reportPanel){reportPanel=document.createElement('aside');reportPanel.id='report-preview';$('.workspace-body').append(reportPanel);}reportPanel.hidden=step!==7;
    if(step===7)reportPanel.innerHTML=`<div class="report-toolbar"><strong>Investigation report</strong><small>INV-2026-0096 · Marcus Doyle</small><span>1 Draft　　2 Review & finalize</span><p>Showing 2 of 8 drafted sections · demo excerpt</p></div><div class="report-paper">${reportExcerpt()}</div>`;
    document.querySelectorAll('.stage-tabs button').forEach((el,i)=>{el.setAttribute('aria-selected',String(i===step));el.tabIndex=i===step?0:-1;});
    $('#demo-panel').setAttribute('aria-labelledby',`tab-${step}`);$('#scene-label').textContent=`0${step+1} / 09 · ${sceneNames[step]}`;
    $('#capture-caption').textContent=step===0?'Home · across cases':step===2?'Actual finalized plan':step===3?'Interview summary · actual captured artifact':step===7?'Conversation + report workspace':'Selected moments · actual case';
    document.querySelectorAll('.playback-tracks span').forEach((el,i)=>el.classList.toggle('done',i<=step));updatePlayback();
  }
  function updatePlayback(){
    $('#play-label').textContent=playing?'Pause walkthrough':(cue>=cues.length?'Replay with sound':'Play with '+(muted?'captions':'sound'));
    $('#play-symbol').textContent=playing?'Ⅱ':'▶';
    $('#play-button').setAttribute('aria-label',playing?'Pause demonstration':'Play demonstration with '+(muted?'captions':'sound'));
    $('#talk-button').setAttribute('aria-label',playing?'Pause voice reenactment':'Play voice reenactment');
    $('#sound-toggle').textContent=muted?'Sound off':'Sound on';$('#sound-toggle').setAttribute('aria-pressed',String(!muted));
    audio.muted=muted;
  }
  function stop(){$('.composer').classList.remove('is-typing','is-submitting');$('#talk-button').innerHTML=icon('wave');playing=false;playToken++;clearTimeout(timer);timer=null;audio.pause();content.classList.remove('active-speaking');updatePlayback();}
  function showCue(){const current=cues[cue];if(!current){stop();$('#speaker-label').textContent='REPLAY COMPLETE';$('#voice-caption').textContent='Explore the interview, evidence, findings and report, or replay from Home.';return;}
    render(current.step,current.mode);if(cue===0){typeOpening();return;}if(current.note)$('#capture-caption').textContent=current.note;
    $('#speaker-label').textContent=current.speaker;$('#voice-caption').textContent=current.text;content.classList.toggle('active-speaking',current.speaker==='VIOLET');
    if(!current.id){const token=playToken;timer=setTimeout(()=>{if(playing&&token===playToken){cue++;showCue();}},4500);return;}
    audio.src=`audio/${current.id}.mp3`;audio.muted=muted;const token=playToken;
    audio.play().catch(()=>{if(token!==playToken)return;stop();$('#speaker-label').textContent='AUDIO COULD NOT PLAY';$('#voice-caption').textContent='Press play to retry, or turn sound off and explore the scenes.';});
  }
  function typeOpening(){
    const token=playToken, field=$('.composer>span'), composer=$('.composer');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let n=0; composer.classList.add('is-typing'); field.textContent='';
    $('#talk-button').innerHTML='↵';
    $('#speaker-label').textContent='INVESTIGATOR · TYPING';
    $('#voice-caption').textContent='The investigator types a request across two cases.';
    function tick(){
      if(!playing||token!==playToken)return;
      n=Math.min(homePrompt.length,n+(reduced?homePrompt.length:2));field.textContent=homePrompt.slice(0,n);
      if(n<homePrompt.length){timer=setTimeout(tick,45);return;}
      timer=setTimeout(()=>{
        if(!playing||token!==playToken)return;
        composer.classList.remove('is-typing');composer.classList.add('is-submitting');
        $('#speaker-label').textContent='INVESTIGATOR · ENTER';$('#voice-caption').textContent='Presses Enter to send the request.';
        timer=setTimeout(()=>{
          if(!playing||token!==playToken)return;
          composer.classList.remove('is-submitting');$('#talk-button').innerHTML=icon('wave');
          field.textContent='Ask about your cases, or tell Violet what you need…';
          content.innerHTML=bubble(homePrompt);$('#voice-caption').textContent='Violet is working on the request…';
          timer=setTimeout(()=>{if(playing&&token===playToken){cue=1;showCue();}},900);
        },450);
      },650);
    }
    tick();
  }
  function play(){if(playing){stop();return;}playing=true;playToken++;if(cue>=cues.length)cue=0;showCue();updatePlayback();}
  audio.addEventListener('ended',()=>{if(!playing)return;cue++;const token=playToken;timer=setTimeout(()=>{if(playing&&token===playToken)showCue();},cue===4?1800:cue===5?1500:1800);if(cue===4){const b=$('#confirm-draft');b?.classList.add('click-cue');$('#speaker-label').textContent='INVESTIGATOR ACTION';$('#voice-caption').textContent='Clicks “Draft the plan.” Processing time is shortened in this replay.';}});
  audio.addEventListener('error',()=>{if(!playing)return;stop();$('#speaker-label').textContent='AUDIO UNAVAILABLE';$('#voice-caption').textContent='The sound file could not load. You can still explore all nine scenes.';});
  function shortExcerpt(text){
    if(text.length<=340)return text;
    const end=text.lastIndexOf('. ',340);
    return text.slice(0,end>100?end+1: text.lastIndexOf(' ',340))+' …';
  }
  function reportExcerpt(){
    const template=document.createElement('template');template.innerHTML=extra.report;
    const headings=Array.from(template.content.querySelectorAll('h2'));
    if(headings[2]){let node=headings[2];while(node){const next=node.nextSibling;node.remove();node=next;}}
    return '<p class="plan-readonly-note">Selected report sections · shortened for this demo.</p>'+template.innerHTML;
  }
  function matrixView(){return `<div class="matrix-by-allegation"><div class="matrix-heading">Evidence matrix <span>Selected excerpts · by allegation</span></div>${refined.groups.map((g,i)=>`<details class="matrix-allegation" name="matrix-allegation" ${i===0?'open':''}><summary>${escape(g.title)}</summary>${g.entries.slice(0,3).map(e=>`<div class="matrix-account"><strong>${escape(e.source.replace(/(Complainant|Subject|Witness)$/,' · $1'))}</strong><p>${escape(shortExcerpt(e.text))}</p></div>`).join('')}</details>`).join('')}</div>`;}
  function confidenceView(){return `<div class="vt-ccheck"><p class="vt-ccheck-head is-ok"><b>✓ The evidence agrees with all 3 findings</b></p><ul class="vt-ccheck-rows">${refined.confidence.map(c=>`<li class="is-ok"><details><summary><span class="vt-ccheck-q">${escape(c.title)}</span><span class="vt-ccheck-v">${escape(c.finding)} · evidence agrees (${c.confidence})</span></summary><div class="vt-ccheck-more"><b>Limitations</b><p>${escape(c.detail)}</p></div></details></li>`).join('')}</ul><div class="vt-ccheck-foot"><button class="vt-chip is-next" data-step="7">Start the report →</button></div></div>`;}
  let citeFocus=null;
  function alignSource(){
    const panel=$('#source-panel');if(!panel||dialog.open)return;
    if(matchMedia('(max-width:580px)').matches){panel.style.marginTop='';panel.style.height='';return;}
    const summary=content.querySelector('.vt-summary');if(!summary)return;
    const workspace=$('.workspace-body').getBoundingClientRect(), viewport=content.getBoundingClientRect();
    const top=Math.max(viewport.top,summary.getBoundingClientRect().top);
    panel.style.marginTop=Math.max(0,top-workspace.top)+'px';
    panel.style.height=Math.max(280,viewport.bottom-top)+'px';
  }
  content.addEventListener('scroll',alignSource);
  window.addEventListener('resize',alignSource);
  function closeSource(){const source=$('#source-panel');if(source){source.remove();$('#demo-panel').classList.remove('source-open');citeFocus?.focus();}}
  function openSource(id){const c=refined.citations[id];if(!c)return;stop();closeSource();citeFocus=document.activeElement;
    const panel=document.createElement('aside');panel.id='source-panel';panel.className='demo-source';panel.setAttribute('aria-label','Cited interview transcript');
    panel.innerHTML=`<header><strong>${escape(c.title)}</strong><button type="button" id="close-source" aria-label="Close source">×</button><small>${escape(c.meta)}</small></header><div class="source-lines">${c.lines.filter(l=>l.text.trim()).map(l=>`<div class="source-line ${l.on?'is-on':''}"><span>${l.n}</span><p>${escape(l.text)}</p></div>`).join('')}</div>`;
    const target=dialog.open?$('#detail-body'):$('.workspace-body');target.append(panel);$('#demo-panel').classList.add('source-open');if(!dialog.open){const summary=content.querySelector('.vt-summary');if(summary)content.scrollTop+=summary.getBoundingClientRect().top-content.getBoundingClientRect().top;alignSource();}$('#close-source').focus({preventScroll:true});const hit=panel.querySelector('.is-on');if(hit)panel.querySelector('.source-lines').scrollTop=hit.offsetTop-panel.querySelector('header').offsetHeight-35;
  }
  function timelineBody(){return `<label class="timeline-filter"><input type="checkbox" id="flagged-only"> Flagged only</label><ol class="timeline-list">${capture.events.filter((_,i)=>[5,9,12,13,15,19].includes(i)).map(e=>`<li data-flagged="${e.flags.length>0}"><time>${escape(e.date)}</time><h4>${escape(e.title)}</h4><p>${escape(shortExcerpt(e.description))}</p><small>${escape(e.source)}</small>${e.flags.map(f=>`<span class="timeline-flag">${escape(f)}</span>`).join('')}</li>`).join('')}</ol>`;}
  const originalFiles=[['01_Complaint_Email_Goldberg.docx','Complaint · Leah Goldberg','complaint'],['06_Exhibit_A_Emails_and_Chat.pdf','Emails and team chat','email'],['07_Exhibit_B_WFM_and_Training_Records.docx','Workforce Management and certification','records'],['08_Religious_Accommodation_Policy.pdf','Religious Accommodation Policy','policy']];
  const details={
    plan:['Plan · Marcus Doyle',()=>`<div class="vt">${capture.plan}</div>`],
    timeline:['Timeline · Marcus Doyle',timelineBody],
    files:['Documents · Marcus Doyle',()=>`<p>These are the four original case documents. The four interview records appear separately under Interviews. Later file-upload tests are omitted from this replay.</p>${originalFiles.map(([file,label,key])=>`<div class="document-row">${icon('file')}<div><strong>${file}</strong><small>${label}</small></div><button data-open="${key}">Read excerpt</button></div>`).join('')}`],
    intake:['Intake · Marcus Doyle',()=>`<h3>At a glance · exact case synopsis</h3><p>Leah Goldberg, a Member Services Representative II in the Contact Center, filed a complaint on September 15, 2026, alleging that her supervisor Marcus Doyle denied her request for religious accommodation to avoid Friday evening shifts for Shabbat observance, failed to consider a coworker's offered shift swap, and made comments suggesting disrespect for her religious practice.</p>`],
    interviews:['Interview summary · Marcus Doyle',()=>`<div class="vt">${interviewView()}</div><button class="button" data-open="transcript">Read source transcript</button>`],
    transcript:['Marcus Doyle · source transcript',()=>`<pre class="transcript-source">${escape(window.VIOLET_TRANSCRIPT)}</pre>`],
    complaint:['Complaint email · selected excerpt',()=>`<p>September 15, 2026 · Leah Goldberg to Priya Anand</p><blockquote>“On September 4 I emailed Marcus asking not to be scheduled on Friday evenings past 5 PM because I observe Shabbat. The new Q4 rotation puts everyone on a Friday 2–10 PM shift starting September 18. My coworker Jordan offered to swap Fridays with me.”</blockquote><p class="source-review-note">Exact excerpt from the supplied fictional complaint.</p>`],
    email:['Exhibit A · selected email',()=>`<div class="source-meta"><b>From</b><span>Jordan Pierce, Regional Operations Manager</span><b>To</b><span>Contact Center Supervisors</span><b>Date</b><span>Monday, August 24, 2026 · 4:05 PM</span><b>Subject</b><span>Q4 rotation approved</span></div><blockquote>Team, the Q4 rotation is approved: every Member Services Rep works one Friday 2–10 PM shift per week starting September 18. Team supervisors may approve individual shift swaps between reps with the same skills; please log swaps with Workforce Management.</blockquote><p class="source-review-note">Exact text from the supplied fictional Exhibit A.</p>`],
    records:['Exhibit B · selected records',()=>`<h3>September 16, 2026</h3><p>Leah Goldberg, Ngozi Okafor, Kevin Tran and Amy Bell were removed from escalations by M. Doyle. The reason recorded for each was “Cert not on file (LMS pull 9/10).”</p><h3>September 21, 2026</h3><p>Goldberg and Tran were restored by C. Rivera. The reason was “Cert confirmed (LMS re-pull 9/21).”</p><p class="source-review-note">Condensed display of rows from the supplied fictional Exhibit B.</p>`],
    policy:['Religious Accommodation Policy · excerpt',()=>`<p>Harlow & Pine Credit Union · HR-114</p><blockquote>A supervisor who receives a request must respond in writing within five (5) business days. Business days exclude weekends and company holidays.</blockquote><blockquote>Before denying a request, the supervisor must consider reasonable alternatives, including voluntary shift swaps, schedule changes and transfers, and must discuss them with the employee.</blockquote><blockquote>A supervisor who believes a request cannot be granted must consult HR before denying it.</blockquote><p class="source-review-note">Exact selected provisions from the supplied fictional policy.</p>`],
    matrix:['Evidence matrix · Marcus Doyle',matrixView],
    report:['Investigation report · Marcus Doyle',()=>`<div class="report-paper">${reportExcerpt()}</div>`]

  };
  function openDetail(key){if(!details[key])return;stop();if(!dialog.open)previousFocus=document.activeElement;$('#detail-title').textContent=details[key][0];$('#detail-body').innerHTML=details[key][1]();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;$('#close-dialog').focus();}
  function closeDetail(){closeSource();dialog.close();previousFocus?.focus();}
  function selectScene(index){stop();cue=Math.max(0,cues.findIndex(c=>c.step===index));render(index);$('#speaker-label').textContent='VOICE REENACTMENT';$('#voice-caption').textContent='Press play to hear this part of the actual exchange.';}
  document.addEventListener('click',e=>{
    const cite=e.target.closest('[data-cite]');if(cite)return openSource(cite.dataset.cite);
    if(e.target.closest('#close-source'))return closeSource();
    if(e.target.closest('[data-demo-upload]')){e.target.textContent='Demo only · upload in your live case';return;}
    const opener=e.target.closest('[data-open]');if(opener)return openDetail(opener.dataset.open);
    const scene=e.target.closest('[data-step]');if(scene)return selectScene(Number(scene.dataset.step));
    if(e.target.closest('#confirm-draft')){stop();render(1,'drafted');cue=4;play();}
    if(e.target.closest('#dismiss-draft')){stop();render(1,'dismissed');$('#voice-caption').textContent='Demo paused. Replay to start again.';}
    if(e.target.closest('#build-timeline')){stop();cue=8;play();}
    if(e.target.closest('#home-actions')){stop();render(0,'actions');cue=1;play();}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSource();const cite=e.target.closest('[data-cite]');if(cite&&['Enter',' '].includes(e.key)){e.preventDefault();openSource(cite.dataset.cite);}});
  document.addEventListener('change',e=>{if(e.target.id==='flagged-only')document.querySelectorAll('.timeline-list>li').forEach(el=>el.hidden=e.target.checked&&el.dataset.flagged!=='true');});
  $('.stage-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?8:(step+(e.key==='ArrowRight'?1:8))%9;selectScene(next);$(`#tab-${next}`).focus();});
  $('#hero-play')?.addEventListener('click',()=>{stop();cue=0;$('#experience').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});play();});
  $('#play-button').addEventListener('click',play);$('#talk-button').addEventListener('click',play);
  $('#replay-button').addEventListener('click',()=>{stop();cue=0;play();});
  $('#sound-toggle').addEventListener('click',()=>{muted=!muted;updatePlayback();});
  $('#close-dialog').addEventListener('click',closeDetail);$('#back-to-conversation').addEventListener('click',closeDetail);
  dialog.addEventListener('cancel',()=>setTimeout(()=>previousFocus?.focus(),0));
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop();});
  hydrateIcons();render(0);
})();

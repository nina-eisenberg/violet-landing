// Prepared fictional scenario. No generated evidence or product-side writes.
export const freshFlow=()=>({case:null,plan:'none',pending:null,pendingCase:null,suspended:null,person:null,outline:false,transcript:false,summary:false,note:false});
export function transition(s,action){
 const n=structuredClone(s);let screen=action,text='';
 if(n.case==='maya'&&['plan','interviews','outline','summary'].includes(action)){if(action==='plan')return {state:n,screen:'maya',text:''};n.suspended=action;return {state:n,screen:'choose_case',text:''};}
 if(['home','inbox','start'].includes(action))n.case=null;
 if(action==='overview'){screen=n.case==='marcus'?'context':n.case==='maya'?'maya':'choose_case';if(!n.case)n.suspended='context';}
 if(action==='cancel'){n.pending=null;n.pendingCase=null;screen='context';text='All right. Nothing changed.';}
 if(action==='confirm'){
  if(!n.pending)return {state:n,screen:'message',text:'There’s nothing awaiting confirmation. Tell me what you’d like to do.'};
  action=n.pending;n.pending=null;if(n.pendingCase)n.case=n.pendingCase;n.pendingCase=null;
  if(action==='draft_plan'){n.plan='draft';screen='plan';}
  if(action==='draft_outline'){n.outline=true;screen='outline';}
  if(action==='draft_summary'){n.summary=true;screen='summary';}
  if(action==='save_note'){n.note=true;screen='note_saved';}
 }
 if(action==='marcus'){n.case='marcus';screen=n.suspended||'context';n.suspended=null;}
 if(['plan','interviews','outline','summary'].includes(action)&&!n.case){n.suspended=action;screen='choose_case';}
 if(action==='maya'){if(n.case==='marcus')n.suspended='context';n.case='maya';screen='maya';}
 if(action==='note'){n.suspended=n.case==='marcus'?'context':n.suspended;n.pending='save_note';n.pendingCase='maya';screen='note';}
 if(screen==='plan'&&n.case==='marcus'&&n.plan==='none'){n.pending='draft_plan';n.pendingCase='marcus';screen='propose_plan';}
 if(action==='finalize_plan'){if(n.plan==='draft'){n.plan='final';screen='interviews';}else {screen='message';text='Review a draft plan before finalizing it.';}}
 if(screen==='interviews'&&n.plan!=='final'){screen='message';text='Let’s review and finalize the investigation plan first.';}
 if(action==='person'){n.person='Marcus Doyle';screen=n.outline?'outline':'person';}
 if(screen==='outline'){if(!n.person){screen='choose_person';}else if(!n.outline){n.pending='draft_outline';n.pendingCase='marcus';screen='propose_outline';}}
 if(action==='sample_transcript'){n.person='Marcus Doyle';n.transcript=true;screen='transcript';}
 if(screen==='summary'){if(!n.transcript){screen='need_transcript';}else if(!n.summary){n.pending='draft_summary';n.pendingCase='marcus';screen='propose_summary';}}
 if(action==='resume'){n.case='marcus';screen=n.suspended||'context';n.suspended=null;}
 if(action==='next'){screen=!n.case?'home':n.case==='maya'?'maya':n.plan==='none'?'context':n.plan==='draft'?'plan':!n.transcript?'interviews':n.summary?'analysis':'transcript';}
 return {state:n,screen,text};
}

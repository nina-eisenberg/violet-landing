export const interviewOrder=['leah','jordan','carla','marcus'];
export function freshJourney(findingCount=7){return {stage:'policy',files:[],plan:false,scope:false,outlines:[],summaries:[],findings:Array(findingCount).fill(null),flag:false,citation:false,final:false};}
export function progress(s,event,id){
 const n=structuredClone(s),add=(key,v)=>{if(!n[key].includes(v))n[key].push(v);};
 if(event==='upload'){
  if(!['policy',...interviewOrder,'emails','records'].includes(id))throw Error('Unknown sample');
  add('files',id);
 }
 if(event==='plan'){if(!n.files.includes('policy'))throw Error('Add the policy first');n.plan=true;n.stage='interviews';}
 if(event==='outline'){if(!n.plan)throw Error('Finalize the plan first');add('outlines',id);}
 if(event==='summary'){if(!n.files.includes(id))throw Error('Add the interview record first');add('summaries',id);}
 if(event==='scope')n.scope=true;
 if(event==='finding'){if(!(Number.isInteger(id.index)&&id.index>=0&&id.index<n.findings.length)||!['substantiated','not substantiated','partially substantiated'].includes(String(id.value).toLowerCase()))throw Error('Invalid finding');n.findings[id.index]=id.value;n.final=false;n.flag=false;n.citation=false;}
 if(event==='report'){
  if(!interviewOrder.every(k=>n.summaries.includes(k))||!['emails','records'].every(k=>n.files.includes(k)))throw Error('Finish interviews and gather the evidence first');
  if(n.findings.some(v=>!v))throw Error('Record each finding first');n.stage='report';
 }
 if(event==='flag')n.flag=true;
 if(event==='citation')n.citation=true;
 if(event==='finalize'){if(n.stage!=='report'||!n.flag||!n.citation)throw Error('Review the flag and citation first');n.final=true;n.stage='complete';}
 return n;
}

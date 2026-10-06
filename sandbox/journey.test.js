import test from 'node:test';import assert from 'node:assert/strict';import {freshJourney,progress,interviewOrder} from './journey-state.js';import {caseAnswers,answerFor} from './case-answers.js';import {materials} from './materials.js';
test('every supplied standard question selects its own prepared answer',()=>{for(const a of caseAnswers)assert.equal(answerFor(a.question)?.id,a.id,a.question);});
test('citations point to real supplied file passages',()=>{for(const a of caseAnswers)for(const [id,q]of a.cites){assert.ok(materials[id]?.text.includes(q),a.id+': '+q);assert.ok(a.requires.includes(id),a.id+' must require cited material');}});
test('whole case with upload and report guards',()=>{let s=freshJourney();assert.throws(()=>progress(s,'plan'));s=progress(s,'upload','policy');s=progress(s,'plan');assert.throws(()=>progress(s,'summary','leah'));for(const id of interviewOrder){s=progress(s,'upload',id);s=progress(s,'summary',id);}assert.throws(()=>progress(s,'report'));for(const id of ['emails','records'])s=progress(s,'upload',id);for(let i=0;i<7;i++)s=progress(s,'finding',{index:i,value:'Not substantiated'});s=progress(s,'report');assert.throws(()=>progress(s,'finalize'));s=progress(s,'flag');s=progress(s,'citation');s=progress(s,'finalize');assert.equal(s.final,true);});
test('duplicate upload is idempotent and changed finding invalidates final review',()=>{let s=freshJourney();s=progress(s,'upload','policy');s=progress(s,'upload','policy');assert.equal(s.files.length,1);s={...s,final:true,flag:true,citation:true};s=progress(s,'finding',{index:1,value:'Substantiated'});assert.equal(s.final,false);assert.equal(s.citation,false);});

import {suggestQuestions} from './question-suggestions.js';
test('suggestions respect available evidence and change with the stage',()=>{
 const early=freshJourney();
 assert.deepEqual(suggestQuestions(early,'Policies').map(q=>q.id),[]);
 assert.ok(suggestQuestions({...early,files:['policy']},'Investigation plan').some(q=>q.id==='client'));
 const full={...early,files:Object.keys(materials),findings:['Substantiated','Substantiated','Not substantiated']};
 assert.equal(suggestQuestions(full,'Interview summary · Marcus Doyle')[0].id,'credibility');
 assert.ok(suggestQuestions(full,'Report').length>0);
 for(const title of ['Policies','Investigation plan','Leah Goldberg','Jordan Kim','Carla Rivera','Marcus Doyle','Documents','Your findings','Report']){
  for(const state of [early,full]){
   const questions=suggestQuestions(state,title);assert.ok(questions.length<=3);
   for(const q of questions){assert.ok(q.requires.every(id=>state.files.includes(id)));assert.equal(q.verified,true);}
  }
 }
});

import {realArtifacts} from './real-artifacts.js';
test('captured artifacts retain the substantive case record',()=>{
 assert.equal(realArtifacts.events.length,20);
 assert.equal(realArtifacts.groups.length,3);
 assert.equal((realArtifacts.report.match(/>\s*(?:I|II|III|IV|V|VI|VII|VIII)\. /g)||[]).length,8);
 for(const section of ['Context','People to interview','Documents to gather','Anti-Harassment Policy','Anti-Retaliation Policy'])assert.ok(realArtifacts.plan.includes(section));
 for(const section of ['Background','Response to the allegations','Documents and follow-up'])assert.ok(realArtifacts.interview.includes(section));
 for(const id of [...realArtifacts.interview.matchAll(/data-cite="(\d+)"/g)].map(m=>m[1]))assert.ok(realArtifacts.citations[id]?.lines.some(l=>l.on));
});

import {responseAvailable} from './case-answers.js';
import {capturedResponses} from './captured-responses.js';
test('uncaptured answers and wrong-stage client drafts cannot impersonate Violet',()=>{
 const state=freshJourney();
 for(const a of caseAnswers)if(!capturedResponses[a.id])assert.equal(responseAvailable(a,state),false);
 const client=answerFor('Draft a short update for the client.');
 assert.equal(responseAvailable(client,state),false);
 assert.equal(responseAvailable(client,{...state,files:['policy']}),true);
 assert.equal(responseAvailable(client,{...state,plan:true}),false);
 assert.equal(responseAvailable(client,{...state,files:['marcus']}),false);
 assert.ok(client.text.includes('The initial investigation plan is awaiting review'));
 assert.ok(!client.text.includes('four allegations'));
 for(const a of caseAnswers.filter(a=>a.verified))assert.ok(a.source.includes('live Violet'));
});

import {capturedSummaries} from './captured-summaries.js';
import {capturedOutlines} from './captured-outlines.js';
import {capturedCitations} from './captured-citations.js';
import {reportCitations} from './report-citations.js';
import {findingRows} from './findings-view.js';
test('all twenty requested questions have live captured responses',()=>{
 assert.equal(caseAnswers.length,20);
 for(const answer of caseAnswers){assert.equal(answer.verified,true,answer.id);assert.ok(answer.html.length>30);}
});
test('all four people have actual outlines and separately captured formats',()=>{
 for(const person of interviewOrder){assert.ok(capturedOutlines[person].length>3000,person);const versions=capturedSummaries[person];assert.ok(versions.bullets.includes('<ul'));assert.ok(versions.narrative.length>2000);assert.notEqual(versions.bullets,versions.narrative);assert.ok(!versions.narrative.includes('Switching to narrative'));}
});
test('full report citation markers all have captured source passages',()=>{
 for(const m of realArtifacts.report.matchAll(/data-citation-footnote="(\d+)"/g))assert.ok(reportCitations[m[1]]?.html.includes('vt-src-line'),m[1]);
 assert.ok(Object.keys(capturedCitations).length>100);
});
test('factual findings remain distinct from policy findings',()=>{
 assert.equal(findingRows.length,7);assert.equal(findingRows.filter(r=>r.n==='Overall').length,3);
 assert.equal(findingRows[3].recommended,'Partially Substantiated');assert.equal(findingRows[4].recommended,'Not substantiated');
 let s=freshJourney();assert.throws(()=>progress(s,'finding',{index:7,value:'Substantiated'}));assert.throws(()=>progress(s,'finding',{index:1,value:'Inconclusive'}));
});

test('client update retains all four sections and completed detours are not suggested again',()=>{
 const state={...freshJourney(),files:['policy']};
 const client=answerFor('Draft a short update for the client.');
 for(const heading of ['The complaint.','Scope.','Work done.','Status.'])assert.ok(client.html.includes('<strong>'+heading+'</strong>'));
 assert.ok(client.text.includes('three allegations under two policies'));
 assert.ok(!suggestQuestions(state,'Investigation plan',['client']).some(q=>q.id==='client'));
 assert.equal(answerFor('Draft a short update for the client.').id,'client');
});

import {readFileSync} from 'node:fs';
test('every response retains the complete independently saved source body',()=>{
 const sources=JSON.parse(readFileSync(new URL('./response-source-text.json',import.meta.url),'utf8'));
 const clean=s=>s.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
 for(const [id,answer] of Object.entries(capturedResponses))assert.equal(clean(answer.html),sources[id],id+' must not be shortened');
});

import {initialPlan,expandedPlan} from './initial-plan.js';
import {capturedScope} from './captured-scope.js';
import {capturedConfidence} from './captured-confidence.js';
test('initial artifacts exactly retain the fresh live captures',()=>{
 const base=new URL('./reference-captures/final-pass/',import.meta.url);
 assert.equal(initialPlan,readFileSync(new URL('initial-plan.html',base),'utf8'));
 assert.equal(expandedPlan,readFileSync(new URL('expanded-plan.html',base),'utf8'));
 for(const id of interviewOrder)assert.equal(capturedOutlines[id],readFileSync(new URL('outline-'+id+'.html',base),'utf8'));
 assert.ok(!initialPlan.includes('Anti-Retaliation Policy'));
 assert.ok(expandedPlan.includes('Anti-Retaliation Policy'));
});
test('scope proposal preserves the full response, caveats and all six sources',()=>{
 const base=new URL('./reference-captures/final-pass/',import.meta.url);
 assert.equal(capturedScope.body,readFileSync(new URL('scope-response.html',base),'utf8'));
 assert.equal(capturedScope.card,readFileSync(new URL('scope-card.html',base),'utf8'));
 assert.equal(Object.keys(capturedScope.sources).length,6);
 for(const html of Object.values(capturedScope.sources))assert.ok(html.includes('vt-src-line'));
 assert.ok(capturedScope.card.includes('Keep the plan as is'));
});
test('confidence retains every complete saved assessment row',()=>{
 const original=readFileSync(new URL('./reference-captures/final-pass/confidence.html',import.meta.url),'utf8');
 assert.equal(capturedConfidence.length,3);
 for(const row of capturedConfidence){assert.ok(original.includes(row.html));assert.ok(row.html.includes('Assessment limitations'));assert.ok(row.html.includes('Evidence breakdown'));assert.ok(row.html.length>2500);}
});

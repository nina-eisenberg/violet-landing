// Route typed demo questions with Jev (Vercel AI Gateway decision API) and with the demo's own keyword router.
// Reads AI_GATEWAY_API_KEY from caseforge/apps/api/.env without printing it. Cost is fractions of a cent.
import {readFileSync,writeFileSync} from 'node:fs';
const env=readFileSync('/Users/ninaeisenberg/Desktop/caseforge/apps/api/.env','utf8');const key=(env.match(/^AI_GATEWAY_API_KEY=(.*)$/m)||[])[1]?.replace(/^["']|["']$/g,'');
if(!key)throw new Error('no AI_GATEWAY_API_KEY');
const cases=JSON.parse(readFileSync(new URL(process.argv[2]||'./cases.json',import.meta.url)));
const {caseAnswers,answerFor}=await import('../../sandbox/case-answers.js');
const criteria={};
for(const a of caseAnswers)criteria[a.id]=`The visitor asks (in any wording): "${a.question}"`;
Object.assign(criteria,{'nav-plan':'Wants to see the investigation plan','nav-report':'Wants to open or read the investigation report','nav-summary':"Wants a summary of a specific person's interview",'nav-next':'Asks what to do next in the case','nav-overview':'Asks what the case is about, or for an overview','none':'Anything else: a different question about the case, a question about the product, or off-topic'});
const keyword=q=>{const a=answerFor(q);if(a)return a.id;const t=q.toLowerCase();if(/overview|what is this case|what.?s this case|tell me about.*case|where.*(stand|are we)/.test(t))return 'nav-overview';if(/^(next|what.?s next|what should i do next|what now)/.test(t))return 'nav-next';if(/\breport\b/.test(t))return 'nav-report';if(/\bplan\b/.test(t))return 'nav-plan';if(/summary|summari/.test(t))return 'nav-summary';return 'none';};
let cost=0;const rows=[];
for(const [q,want] of cases){
 const r=await fetch('https://ai-gateway.vercel.sh/v1/evaluate',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:'typesafe-ai/jev',state:{case:'Fictional workplace investigation: Leah Goldberg complained that her supervisor Marcus Doyle denied her Shabbat accommodation request and made remarks about her religion; she was later removed from the escalations queue. Witnesses: Jordan Kim, Carla Rivera.',visitorTyped:q},questions:{route:{type:'choice',instructions:'Which prepared demo answer, if any, answers what the visitor typed? Pick none unless one clearly fits.',criteria}},providerOptions:{gateway:{zeroDataRetention:true}}})});
 const j=await r.json();if(!r.ok){rows.push({q,want,error:JSON.stringify(j).slice(0,200)});continue;}
 cost+=Number(j.providerMetadata?.gateway?.cost||0);const ans=j.answers.route;const p=ans.probabilities[ans.choice];
 rows.push({q,want,jev:ans.choice,p:+p.toFixed(2),kw:keyword(q)});
}
writeFileSync(new URL((process.argv[2]||'cases').replace('.json','')+'-results.json',import.meta.url),JSON.stringify(rows,null,1));
const score=f=>rows.filter(r=>r[f]===r.want).length;
console.log('cases',rows.length,'| jev correct',score('jev'),'| keyword correct',score('kw'),'| errors',rows.filter(r=>r.error).length,'| cost $'+cost.toFixed(5));
for(const r of rows)if(r.error||r.jev!==r.want||r.kw!==r.want)console.log((r.jev===r.want?'  ':'J✗')+(r.kw===r.want?'  ':'K✗'),r.want.padEnd(14),'jev:',String(r.jev).padEnd(14),r.p??'','kw:',String(r.kw).padEnd(14),'|',r.q,r.error||'');

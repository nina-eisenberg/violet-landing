// POST /api/route-question — routes a question a visitor typed in the demo to one of the demo's prepared answers,
// using Jev (TypeSafe AI) through the Vercel AI Gateway decision API. It never writes text: it returns one choice from
// a fixed list (question-index.js) and the demo shows that prepared, captured content. About $0.00005 a question.
// Needs AI_GATEWAY_API_KEY in this project's Vercel environment. The question text is not logged or stored here;
// the gateway is asked for zero data retention.
import {options} from './question-index.js';
const CONTEXT='Fictional workplace investigation demo: Leah Goldberg complained that her supervisor Marcus Doyle denied her Shabbat accommodation request and made remarks about her religion; she was later removed from the escalations queue. Witnesses: Jordan Kim, Carla Rivera.';
const hits=new Map(); // best-effort per-instance rate limit: 20 questions a minute per address
function limited(ip){const now=Date.now(),w=(hits.get(ip)||[]).filter(t=>now-t<60000);w.push(now);hits.set(ip,w);if(hits.size>5000)hits.clear();return w.length>20;}
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export async function POST(request){
 const key=process.env.AI_GATEWAY_API_KEY;if(!key)return json({choice:null,reason:'not configured'},503);
 const ip=(request.headers.get('x-forwarded-for')||'').split(',')[0].trim()||'unknown';if(limited(ip))return json({choice:null,reason:'slow down'},429);
 let body;try{body=await request.json();}catch{return json({choice:null},400);}
 const text=String(body?.text||'').slice(0,300).trim();if(!text)return json({choice:null},400);
 // The demo says which destinations make sense right now; anything unknown is ignored.
 const allowed=Array.isArray(body?.allowed)?body.allowed.filter(k=>k in options):Object.keys(options);
 const criteria=Object.fromEntries([...new Set([...allowed,'none'])].map(k=>[k,options[k]]));
 try{
  const r=await fetch('https://ai-gateway.vercel.sh/v1/evaluate',{method:'POST',signal:AbortSignal.timeout(4000),headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
   body:JSON.stringify({model:'typesafe-ai/jev',state:{case:CONTEXT,visitorTyped:text},questions:{route:{type:'choice',instructions:'Which prepared demo answer, if any, answers what the visitor typed? Pick none unless one clearly fits.',criteria}},providerOptions:{gateway:{zeroDataRetention:true}}})});
  if(!r.ok)return json({choice:null},502);
  const j=await r.json();const a=j?.answers?.route;const choice=a?.choice;
  if(!choice||!(choice in criteria))return json({choice:null});
  return json({choice,p:Number(a.probabilities?.[choice]||0)});
 }catch{return json({choice:null},504);}
}

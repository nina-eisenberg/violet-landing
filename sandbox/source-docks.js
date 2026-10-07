// Citation docks, built on demand from shared source texts (each source stored once in source-corpora.js).
// A citation is {c: corpus key, s: first line, e: last line, q: quoted text}; the dock mirrors the app's SourcePanel.
import {corpora} from './source-corpora.js';
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
export function dockHtml({c,s,e,q}){
 const src=corpora[c];if(!src)return '';e=e||s;
 const rows=[];src.lines.forEach((l,i)=>{const n=i+1,on=n>=s&&n<=e;if(!l.trim()&&!on&&i>0&&!src.lines[i-1].trim())return;
  rows.push(`<div class="vt-src-line${on?' is-on':''}${l.trim()?'':' is-blank'}"><span class="vt-src-n" aria-hidden="true">${l.trim()?n:''}</span><span class="vt-src-t">${esc(l)}</span></div>`);});
 return `<div class="vt-dock-meta">${esc(src.id)} · ${e>s?`lines ${s}–${e}`:`line ${s}`} of ${src.lines.length}</div><div class="vt-src">${rows.join('')}</div>${q?`<footer class="vt-dock-foot"><span class="vt-eyebrow">Cited</span> “${esc(q)}”</footer>`:''}`;
}
export function makeDocks(map){const out={};for(const [k,v] of Object.entries(map))out[k]={get title(){return corpora[v.c]?.label||'Source';},get html(){return dockHtml(v);}};return out;}

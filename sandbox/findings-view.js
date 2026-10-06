// FindingsCard.tsx structure and choices, with the captured four-allegation case.
export const findingRows=[
 {group:'Religious Accommodation Policy',n:'1',description:"Did Marcus Doyle fail to respond in writing within five business days to Leah Goldberg’s September 4 request?",recommended:'Not substantiated'},
 {group:'Religious Accommodation Policy',n:'2',description:'Did Doyle deny the request without considering and discussing alternatives and consulting HR?',recommended:'Substantiated'},
 {group:'Religious Accommodation Policy',n:'Overall',description:'Overall finding for Religious Accommodation Policy',recommended:'Substantiated'},
 {group:'Anti-Harassment Policy',n:'3',description:'Did Doyle make the reported remarks about religion or religious observance?',recommended:'Partially Substantiated'},
 {group:'Anti-Harassment Policy',n:'Overall',description:'Overall finding for Anti-Harassment Policy',recommended:'Not substantiated'},
 {group:'Anti-Retaliation Policy',n:'4',description:'Did Doyle remove Goldberg from escalations because she requested an accommodation or raised her complaint?',recommended:'Not substantiated'},
 {group:'Anti-Retaliation Policy',n:'Overall',description:'Overall finding for Anti-Retaliation Policy',recommended:'Not substantiated'}
];
export const overallIndexes=[2,4,6];
export function findingsView(picks){let group='';return '<div class="vt-fx">'+findingRows.map((row,i)=>{const header=row.group!==group?'<div class="vt-fx-grouptitle">'+row.group+'</div>':'';group=row.group;return header+`<div class="vt-fx-row ${row.n==='Overall'?'is-overall':''}"><div class="vt-fx-q"><span class="vt-fx-n">${row.n}</span><span>${row.description}</span></div><div class="vt-fx-opts" role="radiogroup" aria-label="${row.description}">${['Substantiated','Partially Substantiated','Not substantiated'].map(v=>`<button type="button" role="radio" aria-checked="${picks[i]===v}" class="vt-fx-opt ${picks[i]===v?'is-on':''}" data-pick="${i}" data-value="${v}">${picks[i]===v?'✓ ':''}${v==='Partially Substantiated'?'Partially':v}</button>`).join('')}</div></div>`;}).join('')+'</div>';}

const frame=document.querySelector('#violet-tour');
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='violet:demo-height')return;const height=Number(event.data.height);if(Number.isFinite(height)&&height>300&&height<5000)frame.style.height=Math.ceil(height)+'px';});

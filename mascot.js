const mascot = document.querySelector(".violet-mascot");
if (mascot) {

// Only the gaze responds to nearby pointer input. No autoplay, handwriting,
// floating props, or body deformation; the complete illustration is the fallback.
const art=document.querySelector('.violet-mascot img'),canvas=document.querySelector('.violet-gaze'),scene=document.querySelector('.violet-mascot');const reduced=matchMedia('(prefers-reduced-motion: reduce)');let gl,loc,frame=0;let target=[0,0],current=[0,0];
function draw(){gl.uniform2f(loc,current[0]/1536,-current[1]/1024);gl.drawArrays(gl.TRIANGLES,0,6)}
function animate(){frame=0;if(!gl)return;current=current.map((v,i)=>v+(target[i]-v)*.18);if(Math.hypot(current[0]-target[0],current[1]-target[1])<.02)current=[...target];draw();if(current.some((v,i)=>v!==target[i]))frame=requestAnimationFrame(animate)}
function update(x,y){target=[x,y];if(reduced.matches){cancelAnimationFrame(frame);frame=0;current=[...target];if(gl)draw();return}if(!frame&&gl)frame=requestAnimationFrame(animate)}
function resize(){if(!gl)return;const r=art.getBoundingClientRect();canvas.width=Math.round(r.width*Math.min(devicePixelRatio,2));canvas.height=Math.round(r.height*Math.min(devicePixelRatio,2));gl.viewport(0,0,canvas.width,canvas.height);draw()}
function init(){try{gl=canvas.getContext('webgl',{alpha:false});if(!gl)return;function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error('Shader compile');return sh}const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision highp float;varying vec2 uv;uniform sampler2D art;uniform vec2 gaze;void main(){vec2 left=(uv-vec2(748./1536.,1.-443./1024.))/vec2(43./1536.,53./1024.);vec2 right=(uv-vec2(920./1536.,1.-472./1024.))/vec2(43./1536.,53./1024.);float weight=max(exp(-dot(left,left)*1.4),exp(-dot(right,right)*1.4));gl_FragColor=texture2D(art,uv-gaze*weight);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link');gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,art);loc=gl.getUniformLocation(program,'gaze');resize();canvas.style.display='block'}catch(e){canvas.style.display='none';gl=null}}
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;const r=scene.getBoundingClientRect(),dx=(e.clientX-r.left)/r.width-.54,dy=(e.clientY-r.top)/r.height-.44,d=Math.hypot(dx,dy)||1,strength=Math.min(d/.25,1);update(dx/d*15*strength,dy/d*12*strength)});document.documentElement.addEventListener('pointerleave',()=>update(0,0));window.addEventListener('blur',()=>update(0,0));reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(frame);frame=0;target=[0,0];current=[0,0];if(gl)draw()}});new ResizeObserver(resize).observe(art);if(art.complete&&art.naturalWidth)init();else art.addEventListener('load',init,{once:true});

let greetingTimer;
mascot.addEventListener('click',()=>{
const greeting=mascot.querySelector('.violet-greeting');
greeting.textContent='Hello. I’m Violet.';
clearTimeout(greetingTimer);
greetingTimer=setTimeout(()=>{greeting.textContent='';},2500);
});
}

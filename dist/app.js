import * as T from './assets/three.module.js';
import {RoomEnvironment} from './assets/RoomEnvironment.js';
import {createRoadster,createStuntEnvironment} from './model.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=()=>innerWidth<=700;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
const lerp=T.MathUtils.lerp;
const V=(x,y,z)=>new T.Vector3(x,y,z);
const state={mode:'hero',part:null,frame:0,playing:false,speed:1,hoodOpen:false,doorOpen:false,boost:false,wheelSpin:false,steering:false,dragging:false,orbit:0,pitch:0,cabinLook:0,sound:false};
let suspended=false;
let toastTimer,transition=null,transitionId=0,lastTime=performance.now(),elapsed=0,stuntFloat=0;
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){$('#loading').hidden=true;$('#webgl-fallback').hidden=false;throw e;}
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.5:1.8));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
$('#stage').appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color(0x080c0f);scene.fog=new T.FogExp2(0x080c0f,.025);
const camera=new T.PerspectiveCamera(36,innerWidth/innerHeight,.03,180);const look=V(0,.6,0);
const pmrem=new T.PMREMGenerator(renderer);const room=new RoomEnvironment();const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=1.1;room.dispose();pmrem.dispose();
const hemi=new T.HemisphereLight(0xd3e8f1,0x101613,1.2);scene.add(hemi);
const key=new T.DirectionalLight(0xe5f1ff,3.8);key.position.set(4,8,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;key.shadow.normalBias=.025;key.shadow.bias=-.0001;scene.add(key);
const rim=new T.DirectionalLight(0xa4c9db,4);rim.position.set(-6,4,-4);scene.add(rim);
const warm=new T.DirectionalLight(0xe4f4c5,2.0);warm.position.set(6,1,-4);scene.add(warm);
const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.MeshBasicMaterial({color:0x10191e}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
const vehicle=createRoadster();scene.add(vehicle.car);
const runway=createStuntEnvironment();runway.visible=false;scene.add(runway);
// Soft baked contact shadow gives the car weight without expensive reflections.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=512;
const sx=shadowCanvas.getContext('2d');const sg=sx.createRadialGradient(128,256,15,128,256,220);sg.addColorStop(0,'rgba(0,0,0,.95)');sg.addColorStop(.55,'rgba(0,0,0,.55)');sg.addColorStop(1,'rgba(0,0,0,0)');sx.fillStyle=sg;sx.fillRect(0,0,256,512);
const shadow=new T.Mesh(new T.PlaneGeometry(3.1,6.0),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.004;scene.add(shadow);
// Fine concentric studio markings anchor the overview.
const studio=new T.Group();scene.add(studio);
for(const radius of [3.4,3.45,4.7]){const ring=new T.Mesh(new T.RingGeometry(radius,radius+.006,120),new T.MeshBasicMaterial({color:0x293638,transparent:true,opacity:radius>4?.25:.5,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.002;studio.add(ring);}
for(let i=0;i<48;i++){const a=i/48*Math.PI*2;const marker=new T.Mesh(new T.BoxGeometry(.008,.003,i%4===0?.11:.045),new T.MeshBasicMaterial({color:0x465653}));marker.position.set(Math.sin(a)*3.65,.004,Math.cos(a)*3.65);marker.rotation.y=a;studio.add(marker);}

// Original audio: an electric harmonic bed, filtered air and short mechanical accents.
let audio=null;
function initAudio(){
 if(audio)return;
 const C=window.AudioContext||window.webkitAudioContext;if(!C){toast('Sound is not supported by this browser.');return;}
 const ctx=new C(),master=ctx.createGain(),motorGain=ctx.createGain(),airGain=ctx.createGain(),filter=ctx.createBiquadFilter();
 master.gain.value=0;master.connect(ctx.destination);motorGain.gain.value=0;motorGain.connect(master);
 const oscs=[1,2.01,3.02].map((mult,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=i===0?'sine':'triangle';o.frequency.value=52*mult;g.gain.value=[.38,.08,.035][i];o.connect(g);g.connect(motorGain);o.start();return {o,mult}});
 const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate);const d=buffer.getChannelData(0);let brown=0;for(let i=0;i<d.length;i++){brown=(brown+(Math.random()*2-1)*.035)/1.025;d[i]=brown*5;}
 const noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;filter.type='bandpass';filter.frequency.value=450;filter.Q.value=.4;noise.connect(filter);filter.connect(airGain);airGain.connect(master);noise.start();
 audio={ctx,master,motorGain,airGain,filter,oscs};
}
async function soundToggle(){initAudio();if(!audio)return;try{await audio.ctx.resume();state.sound=!state.sound;audio.master.gain.setTargetAtTime(state.sound?.48:0,audio.ctx.currentTime,.2);document.body.classList.toggle('sound-on',state.sound);$('#sound-toggle').setAttribute('aria-pressed',String(state.sound));$('#sound-toggle').setAttribute('aria-label',state.sound?'Mute cinematic sound':'Enable cinematic sound');$('#sound-label').textContent=state.sound?'SOUND ON':'SOUND OFF';if(state.sound)chime(260,.12);}catch(e){toast('Tap again to enable sound.');}}
function chime(freq=350,duration=.15){if(!audio||!state.sound)return;const c=audio.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(freq,c.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.6,c.currentTime+duration);g.gain.setValueAtTime(.10,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g);g.connect(audio.master);o.start();o.stop(c.currentTime+duration);}
function updateAudio(){if(!audio)return;const f=state.frame,cinema=state.mode==='film'&&state.playing;let energy=cinema?(f<180?lerp(.15,.85,f/180):f<340?.78:f<510?.3:f<620?.55:.15):.05;let air=cinema?(f>330&&f<565?.65:.13):state.boost?.65:.015;if(document.hidden){energy=0;air=0;}const now=audio.ctx.currentTime;audio.motorGain.gain.setTargetAtTime(energy,now,.15);audio.airGain.gain.setTargetAtTime(air,now,.2);audio.filter.frequency.setTargetAtTime(300+energy*1300,now,.15);audio.oscs.forEach(({o,mult})=>o.frequency.setTargetAtTime((42+energy*150)*mult,now,.1));}

function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3000);}
function visible(s,v){$(s).hidden=!v;}
function offset(x=0,y=0){camera.setViewOffset(innerWidth,innerHeight,-innerWidth*x,-innerHeight*y,innerWidth,innerHeight);}
function homePose(){return mobile()?{p:V(9,4.8,11.5),l:V(0,.65,0),fov:41,ox:0,oy:.21}:{p:V(6.4,3.0,7.5),l:V(0,.65,0),fov:36,ox:.22,oy:.08};}
function exteriorPose(){return mobile()?{p:V(8.4,5.1,10.8),l:V(0,.7,0),fov:39,ox:0,oy:.045}:{p:V(5.7,3.0,7.2),l:V(0,.65,0),fov:36,ox:.04,oy:.05};}
let currentOffset={x:0,y:0};
function setPose(p){camera.position.copy(p.p);look.copy(p.l);camera.fov=p.fov;currentOffset={x:p.ox||0,y:p.oy||0};offset(currentOffset.x,currentOffset.y);camera.updateProjectionMatrix();camera.lookAt(look);}
function moveTo(p,duration=1500,done){const id=++transitionId;transition={id,from:camera.position.clone(),to:p.p.clone(),fromLook:look.clone(),toLook:p.l.clone(),fov0:camera.fov,fov1:p.fov||36,x0:currentOffset.x,y0:currentOffset.y,x1:p.ox||0,y1:p.oy||0,start:performance.now(),duration:reduced?1:duration,done};}
function resetParts(){wingRaised=false;state.hoodOpen=false;state.doorOpen=false;state.boost=false;state.wheelSpin=false;state.steering=false;state.part=null;state.orbit=0;state.pitch=0;state.cabinLook=0;vehicle.windshield.visible=true;vehicle.roof.visible=true;$$('[data-part]').forEach(b=>b.classList.remove('selected'));}
function modeUI(mode){
 $('.skip-link').href=mode==='film'?'#frame-range':mode==='explore'?'#explorer-toolbar':'#primary-action';
 document.body.classList.toggle('film-mode',mode==='film');document.body.classList.toggle('explore-mode',mode==='explore');document.body.classList.remove('detail-open');
 for(const s of ['#hero-copy','#hero-wordmark','#coordinates','#car-label'])visible(s,mode==='hero');
 for(const s of ['#explore-header','#hotspots','#explorer-toolbar'])visible(s,mode==='explore');
 for(const s of ['#stunt-title','#leave-film','#film-indicator','#timeline'])visible(s,mode==='film');
 for(const s of ['#detail-panel','#exit-cabin','#interior-instruments'])visible(s,false);
 $$('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.nav==='prototype'));
}
function toHero(){state.mode='hero';state.playing=false;resetParts();modeUI('hero');runway.visible=false;studio.visible=true;shadow.visible=true;vehicle.car.position.set(0,0,0);vehicle.car.rotation.set(0,0,0);scene.fog.density=.025;moveTo(homePose(),1700);chime(220);}
function explore(){state.mode='explore';state.playing=false;resetParts();modeUI('explore');runway.visible=false;studio.visible=true;shadow.visible=true;vehicle.car.position.set(0,0,0);vehicle.car.rotation.set(0,0,0);scene.fog.density=.025;moveTo(exteriorPose(),1700);chime(330);}
function film(){state.mode='film';resetParts();vehicle.hood.rotation.x=0;vehicle.doors.forEach(d=>d.rotation.set(0,0,0));vehicle.wing.position.y=0;vehicle.yoke.rotation.z=0;modeUI('film');transition=null;transitionId++;state.frame=0;stuntFloat=0;state.playing=!reduced;state.speed=1;$('#speed-toggle').textContent='1× SPEED';runway.visible=true;studio.visible=false;scene.fog.density=.018;$('#play-pause').textContent=state.playing?'Ⅱ':'▶';$('#play-pause').setAttribute('aria-label',state.playing?'Pause sequence':'Play sequence');if(!state.sound)toast('Enable sound in the top right for the full experience.');renderFilm(0);updateTimeline();}
const details={
 hood:{index:'01',kicker:'BENEATH THE SURFACE',title:'Electric.<br>To the core.',description:'The hood lifts to reveal an imagined front compartment. With electric propulsion, the story is energy, cooling and electronics — there is no combustion engine here.',facts:[['Propulsion','All electric'],['View','Front compartment'],['Assembly','Concept cutaway']],action:'Close the hood',note:'Illustrative internals and opening mechanism. Not an actual service or engineering diagram.',pose:()=>mobile()?{p:V(3.1,3.2,5.2),l:V(0,.9,1),fov:38,ox:0,oy:-.17}:{p:V(3.2,2.9,5.2),l:V(0,.8,1.1),fov:36,ox:-.16,oy:.04}},
 cabin:{index:'02',kicker:'THE DRIVER’S PERSPECTIVE',title:'Outside noise.<br>Left outside.',description:'The door opens. The camera follows you in. A sculpted steering yoke, a central display and focused controls put the driver at the heart of the experience.',facts:[['Control','Steering yoke'],['Interface','Central display'],['View','Immersive cockpit']],action:'Turn the steering yoke',note:'An imagined interior, created for this interactive design study.',pose:()=>mobile()?{p:V(.39,1.19,-.55),l:V(.15,.88,.53),fov:78,ox:0,oy:-.17}:{p:V(.43,1.19,-.52),l:V(.18,.91,.6),fov:78,ox:-.12,oy:.03}},
 rear:{index:'03',kicker:'FORM FOLLOWS AIRFLOW',title:'Leave a<br>lasting impression.',description:'A full-width light signature, sculpted rear shoulders and a deep diffuser. Raise the wing to see how the silhouette changes around the airflow.',facts:[['Signature','Continuous rear light'],['Aero study','Deployable wing'],['Lower body','Diffuser fins']],action:'Raise the rear wing',note:'Wing travel and aero surfaces are artistic interpretations.',pose:()=>mobile()?{p:V(4.3,2.2,-6.2),l:V(0,.8,-1.1),fov:39,ox:0,oy:-.15}:{p:V(4.0,2.2,-5.3),l:V(0,.7,-1.35),fov:39,ox:-.18,oy:.03}},
 wheels:{index:'04',kicker:'WHERE POWER MEETS THE ROAD',title:'Every revolution.<br>Considered.',description:'Get close to the wheel architecture: ten metallic spokes, a vented rotor, drilled details and a contrasting brake caliper. Set the wheel in motion to explore the assembly.',facts:[['Wheel study','Ten-spoke alloy'],['Brakes','Vented disc concept'],['Contact','Performance tire']],action:'Spin the wheels',note:'Visual design study; tire sizes and brake specifications are not claimed.',pose:()=>mobile()?{p:V(3.1,1.35,3),l:V(1,.5,1.45),fov:40,ox:0,oy:-.16}:{p:V(3,1.1,2.8),l:V(1,.5,1.43),fov:38,ox:-.20,oy:.01}},
 thrusters:{index:'05',kicker:'AN EXPERIMENT IN POSSIBILITY',title:'A different<br>kind of thrust.',description:'Meet the cold-gas concept. Compressed air becomes a visible burst of force. Activate the plumes to explore the rear and downward-facing nozzles used in our cinematic sequence.',facts:[['Medium','Compressed gas concept'],['Visual effect','Air plumes'],['Sequence','Inversion · roll · landing']],action:'Activate the thrusters',note:'Stylized effects and nozzle placement. This is a cinematic concept, not a validated flight system.',pose:()=>mobile()?{p:V(3.7,1.7,-6),l:V(0,.5,-1.6),fov:43,ox:0,oy:-.16}:{p:V(3.0,1.4,-5.6),l:V(0,.5,-1.65),fov:42,ox:-.17,oy:0}}
};
let wingRaised=false;
function selectPart(part){
 if(!details[part])return;if(state.mode!=='explore')explore();resetParts();wingRaised=false;state.part=part;document.body.classList.add('detail-open');visible('#hotspots',false);visible('#detail-panel',true);visible('#exit-cabin',part==='cabin');visible('#interior-instruments',part==='cabin');
 const d=details[part];$('#detail-index').textContent=d.index+' / ANATOMY';$('#detail-kicker').textContent=d.kicker;$('#detail-title').innerHTML=d.title.replace('<br>',' <br>');$('#detail-description').textContent=d.description;$('#detail-note').textContent=d.note;$('#detail-action').textContent=d.action+' ↗';$('#detail-facts').replaceChildren(...d.facts.map(([k,v])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;row.append(dt,dd);return row;}));
 $$('[data-part]').forEach(b=>b.classList.toggle('selected',b.dataset.part===part));
 if(part==='hood')state.hoodOpen=true;
 if(part==='cabin'){
  state.doorOpen=true;
  moveTo({p:V(2.7,1.9,.4),l:V(.4,.9,-.1),fov:54,ox:mobile()?0:-.16,oy:mobile()?-.16:0},1100,()=>{
   if(state.part!=='cabin')return;vehicle.windshield.visible=false;vehicle.roof.visible=false;moveTo(d.pose(),1800,()=>{if(state.part==='cabin')state.doorOpen=false;});
  });
 }else moveTo(d.pose(),1600);
 chime(part==='cabin'?180:400,.3);
}
function closeDetail(){
 const wasCabin=state.part==='cabin';if(wasCabin){state.doorOpen=true;vehicle.windshield.visible=true;vehicle.roof.visible=true;}
 const finish=()=>{resetParts();wingRaised=false;document.body.classList.remove('detail-open');visible('#detail-panel',false);visible('#exit-cabin',false);visible('#interior-instruments',false);visible('#hotspots',true);moveTo(exteriorPose(),1400);};
 if(wasCabin){visible('#detail-panel',false);visible('#exit-cabin',false);visible('#interior-instruments',false);moveTo({p:V(3,2,.4),l:V(.2,.9,0),fov:50,ox:0,oy:0},1000,finish);}else finish();chime(210,.2);
}
$('#detail-action').addEventListener('click',()=>{
 if(state.part==='hood'){state.hoodOpen=!state.hoodOpen;$('#detail-action').textContent=(state.hoodOpen?'Close the hood':'Open the hood')+' ↗';}
 if(state.part==='cabin'){state.steering=!state.steering;$('#detail-action').textContent=state.steering?'Center the steering yoke ↗':'Turn the steering yoke ↗';}
 if(state.part==='rear'){wingRaised=!wingRaised;$('#detail-action').textContent=wingRaised?'Lower the rear wing ↗':'Raise the rear wing ↗';}
 if(state.part==='wheels'){state.wheelSpin=!state.wheelSpin;$('#detail-action').textContent=state.wheelSpin?'Stop the wheels ↗':'Spin the wheels ↗';}
 if(state.part==='thrusters'){state.boost=!state.boost;$('#detail-action').textContent=state.boost?'Deactivate the thrusters ↗':'Activate the thrusters ↗';if(state.boost&&!state.sound)toast('Enable sound to hear the air-thrust effect.');}
 chime(280);
});

const chapters=[{from:0,kicker:'01 / THE APPROACH',title:'Break the ordinary.',desc:'A quiet beginning. An extraordinary destination.'},{from:180,kicker:'02 / THE CLIMB',title:'Rewrite the rules.',desc:'The horizon is only a starting point.'},{from:340,kicker:'03 / THE INVERSION',title:'Let gravity wait.',desc:'One moment. Every perspective changed.'},{from:510,kicker:'04 / THE RETURN',title:'Make an entrance.',desc:'Back on earth. Nothing quite the same.'}];
let chapter=-1;
function renderFilm(f){
 let p,q=new T.Quaternion(),cam,target,boost=false;const t=f/30;
 if(f<180){const u=ease(f/180);p=V(0,0,lerp(-14,0,u));q.identity();cam=V(lerp(7,8,u),lerp(2.7,4.6,u),p.z+lerp(7,6,u));target=p.clone().add(V(0,.8,0));}
 else if(f<340){const u=ease((f-180)/160),a=u*Math.PI*.94,R=5.6;p=V(0,R*(1-Math.cos(a)),R*Math.sin(a));q.setFromAxisAngle(V(1,0,0),-a);cam=V(lerp(8,10,u),p.y+lerp(4,-3.0,u),p.z+lerp(8,6,u));target=p.clone().add(V(0,.1,0));}
 else if(f<510){const u=(f-340)/170,roll=ease(clamp(u/.82));p=V(Math.sin(u*Math.PI)*.5,11.10+4.8*u-15.9*u*u,lerp(1.05,-9,u));q.setFromEuler(new T.Euler(-Math.PI+(.06*Math.PI*(1-roll)),0,Math.PI*roll,'XYZ'));cam=V(lerp(10,8,u),p.y+lerp(-3,2.5,ease(u)), p.z+lerp(6,8,u));target=p.clone().add(V(0,.3,0));boost=u<.22||u>.70;}
 else if(f<620){const u=ease((f-510)/110);p=V(0,0,lerp(-9,-15,u));q.setFromAxisAngle(V(0,1,0),Math.PI);cam=V(lerp(8,6,u),lerp(2.8,2.2,u),p.z+8);target=p.clone().add(V(0,.6,0));boost=f<535;}
 else {const u=ease((f-620)/100);p=V(0,0,-15);q.setFromAxisAngle(V(0,1,0),Math.PI);cam=V(lerp(6,-5.5,u),lerp(2.2,2.6,u),p.z+lerp(8,-7,u));target=p.clone().add(V(0,.65,0));}
 vehicle.car.position.copy(p);vehicle.car.quaternion.copy(q);camera.position.copy(cam);look.copy(target);camera.fov=mobile()?60:46;currentOffset={x:mobile()?0:.10,y:mobile()?0:-.06};offset(currentOffset.x,currentOffset.y);camera.updateProjectionMatrix();camera.lookAt(look);
 vehicle.wheels.forEach(w=>w.rotation.x=t*10);vehicle.plumes.forEach((v,i)=>{v.visible=boost&&(f>340||i%3===0);v.scale.set(1,1+.15*Math.sin(f*.7+i),1);v.material.opacity=.13+.09*Math.sin(f*.8+i)**2;});
 shadow.position.set(p.x,.004,p.z);shadow.material.opacity=clamp(1-p.y/12);shadow.scale.setScalar(1+p.y*.12);key.position.set(p.x+4,p.y+8,p.z+5);key.target.position.copy(p);key.target.updateMatrixWorld();
 const ci=chapters.findLastIndex(c=>f>=c.from);if(ci!==chapter){chapter=ci;const c=chapters[ci];$('#chapter-number').textContent=c.kicker;$('#chapter-title').textContent=c.title;$('#chapter-description').textContent=c.desc;$('#sequence-title').textContent=c.kicker.replace(' / ',' — ');$$('[data-frame]').forEach((b,i)=>b.classList.toggle('active',i===ci));}
}
function updateTimeline(){const f=state.frame;$('#frame-range').value=f;$('#frame-display').textContent='FRAME '+String(f).padStart(4,'0')+' / 0720';$('#time-display').textContent='00:'+String(Math.floor(f/30)).padStart(2,'0')+' / 00:24';$('#film-status').textContent=state.playing?'CINEMATIC SEQUENCE':'FRAME-BY-FRAME';}
function pauseToggle(force){if(state.mode!=='film')return;state.playing=typeof force==='boolean'?force:!state.playing;if(state.frame===720&&state.playing){state.frame=0;stuntFloat=0;}$('#play-pause').textContent=state.playing?'Ⅱ':'▶';$('#play-pause').setAttribute('aria-label',state.playing?'Pause sequence':'Play sequence');updateTimeline();}
function seek(f){pauseToggle(false);state.frame=Math.round(clamp(f,0,720));stuntFloat=state.frame;renderFilm(state.frame);updateTimeline();}
$('#frame-range').addEventListener('input',e=>seek(+e.target.value));$('#play-pause').addEventListener('click',()=>pauseToggle());$('#frame-prev').addEventListener('click',()=>seek(state.frame-1));$('#frame-next').addEventListener('click',()=>seek(state.frame+1));$('#replay').addEventListener('click',()=>{seek(0);pauseToggle(true);});$$('[data-frame]').forEach(b=>b.addEventListener('click',()=>seek(+b.dataset.frame)));
$('#speed-toggle').addEventListener('click',()=>{state.speed=state.speed===1?.5:state.speed===.5?.25:1;$('#speed-toggle').textContent=state.speed+'× SPEED';});
$('#sound-toggle').addEventListener('click',soundToggle);$('#primary-action').addEventListener('click',film);$('#explore-action').addEventListener('click',explore);$('#leave-film').addEventListener('click',explore);$('#close-detail').addEventListener('click',closeDetail);$('#exit-cabin').addEventListener('click',closeDetail);$('#reset-view').addEventListener('click',explore);$$('[data-part]').forEach(b=>b.addEventListener('click',()=>selectPart(b.dataset.part)));
document.addEventListener('roadster:dialog',()=>pauseToggle(false));
$$('.swatch').forEach((b,i)=>b.addEventListener('click',()=>{vehicle.paint.color.set(b.dataset.color);$$('.swatch').forEach(s=>{s.classList.toggle('selected',s===b);s.setAttribute('aria-pressed',String(s===b));});$('#paint-name').textContent=['LUNAR SILVER','CRIMSON','OBSIDIAN'][i];chime(500,.08);}));
document.addEventListener('keydown',e=>{
 if(suspended||$$('dialog').some(d=>d.open))return;
 if(e.key==='Escape'){if(state.part)closeDetail();else if(state.mode==='film')explore();}
 if(state.mode==='film'&&!['INPUT','BUTTON'].includes(document.activeElement.tagName)){if(e.code==='Space'){e.preventDefault();pauseToggle();}if(e.key==='ArrowRight'){e.preventDefault();seek(state.frame+1);}if(e.key==='ArrowLeft'){e.preventDefault();seek(state.frame-1);}}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.mode==='film')pauseToggle(false);if(audio)audio.master.gain.setTargetAtTime(state.sound&&!document.hidden&&!suspended?.48:0,audio.ctx.currentTime,.1);});

// Drag the exterior to orbit. The cabin has a deliberately limited head movement.
let pointerX=0,pointerY=0,moved=false;
renderer.domElement.addEventListener('pointerdown',e=>{if(state.mode!=='explore'||transition)return;state.dragging=true;pointerX=e.clientX;pointerY=e.clientY;moved=false;renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!state.dragging)return;const dx=e.clientX-pointerX,dy=e.clientY-pointerY;pointerX=e.clientX;pointerY=e.clientY;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;if(state.part==='cabin'){state.cabinLook=clamp(state.cabinLook+dx*.004,-.55,.55);const p=details.cabin.pose();look.copy(p.l).add(V(state.cabinLook,0,0));camera.lookAt(look);}else if(!state.part){state.orbit+=dx*.006;state.pitch=clamp(state.pitch+dy*.003,-.3,.5);const p=exteriorPose(),rad=Math.hypot(p.p.x,p.p.z),a=Math.atan2(p.p.x,p.p.z)+state.orbit;camera.position.set(Math.sin(a)*rad,p.p.y+state.pitch*3,Math.cos(a)*rad);camera.lookAt(look);}});
renderer.domElement.addEventListener('pointerup',e=>{state.dragging=false;if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointercancel',()=>state.dragging=false);
const hotspots={hood:V(.2,.91,1.63),cabin:V(1.04,.94,-.10),rear:V(-.62,1.17,-1.85),wheels:V(1.13,.48,1.46),thrusters:V(.80,.60,-2.34)};
const projected=new T.Vector3();
function updateHotspots(){if(state.mode!=='explore'||state.part)return;for(const b of $$('#hotspots button')){projected.copy(hotspots[b.dataset.part]).project(camera);const x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight;b.style.left=x+'px';b.style.top=y+'px';b.style.visibility=projected.z<1&&x>15&&x<innerWidth-15&&y>85&&y<innerHeight-150?'visible':'hidden';}}
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.5:1.8));camera.aspect=innerWidth/innerHeight;transition=null;if(state.mode==='hero')setPose(homePose());else if(state.mode==='explore')setPose(state.part?details[state.part].pose():exteriorPose());else renderFilm(state.frame);});

setPose(homePose());camera.position.multiplyScalar(1.12);
moveTo(homePose(),2400);
let rendered=false;
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;if(suspended)return;elapsed+=dt;
 if(state.mode==='film'){
  if(state.playing){stuntFloat=Math.min(720,stuntFloat+dt*30*state.speed);state.frame=Math.floor(stuntFloat);if(state.frame>=720){pauseToggle(false);toast('Experience complete. Replay, scrub, or explore the car.');}updateTimeline();}
  renderFilm(state.frame);
 }else{
  const blend=1-Math.exp(-dt*5);
  vehicle.hood.rotation.x=lerp(vehicle.hood.rotation.x,state.hoodOpen?-1.05:0,blend);
  vehicle.doors.forEach((d,i)=>{const s=i===0?-1:1;d.rotation.z=lerp(d.rotation.z,state.doorOpen?s*1.05:0,blend);d.rotation.y=lerp(d.rotation.y,state.doorOpen?s*.35:0,blend);});
  vehicle.yoke.rotation.z=lerp(vehicle.yoke.rotation.z,state.steering?.65:0,blend);vehicle.wing.position.y=lerp(vehicle.wing.position.y,wingRaised?.20:0,blend);
  if(state.wheelSpin)vehicle.wheels.forEach(w=>w.rotation.x+=dt*2.5);
  vehicle.plumes.forEach((v,i)=>{v.visible=state.boost;v.scale.y=1+.15*Math.sin(elapsed*22+i);v.material.opacity=.15+.08*Math.sin(elapsed*30+i)**2;});
  shadow.position.set(0,.004,0);shadow.material.opacity=1;shadow.scale.setScalar(1);key.position.set(4,8,5);key.target.position.set(0,0,0);key.target.updateMatrixWorld();
  if(transition){const tr=transition,t=ease((now-tr.start)/tr.duration);camera.position.lerpVectors(tr.from,tr.to,t);look.lerpVectors(tr.fromLook,tr.toLook,t);camera.fov=lerp(tr.fov0,tr.fov1,t);currentOffset.x=lerp(tr.x0,tr.x1,t);currentOffset.y=lerp(tr.y0,tr.y1,t);offset(currentOffset.x,currentOffset.y);camera.updateProjectionMatrix();camera.lookAt(look);if(t>=1){transition=null;tr.done?.();}}
  else if(state.mode==='hero'&&!reduced){const p=homePose();camera.position.copy(p.p);camera.position.x+=Math.sin(elapsed*.14)*.20;camera.position.y+=Math.sin(elapsed*.2)*.055;camera.lookAt(look);}
  updateHotspots();
 }
 updateAudio();renderer.render(scene,camera);
 if(!rendered){rendered=true;setTimeout(()=>{$('#loading').style.opacity='0';setTimeout(()=>$('#loading').hidden=true,800);},400);}
}
requestAnimationFrame(animate);
// Read-only diagnostics, useful for verification without changing the experience.
window.roadsterDiagnostics=()=>({mode:state.mode,part:state.part,frame:state.frame,playing:state.playing,sound:state.sound,hoodAngle:vehicle.hood.rotation.x,doorAngles:vehicle.doors.map(d=>d.rotation.z),camera:camera.position.toArray(),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles});

// The reference viewer owns the landing page; only one 3D experience runs at a time.
export function activatePrototype(mode='explore'){
 suspended=false;lastTime=performance.now();
 if(audio)audio.master.gain.setTargetAtTime(state.sound?.48:0,audio.ctx.currentTime,.1);
 if(mode==='film')film();else explore();
}
export function suspendPrototype(){
 suspended=true;state.playing=false;state.dragging=false;transition=null;transitionId++;
 if(audio)audio.master.gain.setTargetAtTime(0,audio.ctx.currentTime,.1);
}

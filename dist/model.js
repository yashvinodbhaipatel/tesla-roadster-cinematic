import * as T from './assets/three.module.js';

export function createRoadster(){
 const car=new T.Group();car.name='Roadster concept';
 const paint=new T.MeshPhysicalMaterial({color:0xbfc8cc,metalness:.84,roughness:.22,clearcoat:1,clearcoatRoughness:.16});
 const carbon=new T.MeshStandardMaterial({color:0x111719,roughness:.48,metalness:.55});
 const rubber=new T.MeshStandardMaterial({color:0x080b0c,roughness:.89});
 const leather=new T.MeshStandardMaterial({color:0x222a2d,roughness:.76});
 const alloy=new T.MeshStandardMaterial({color:0xa5aeb1,metalness:1,roughness:.27});
 const darkAlloy=new T.MeshStandardMaterial({color:0x41484b,metalness:.92,roughness:.3});
 const brake=new T.MeshStandardMaterial({color:0x545e61,metalness:.75,roughness:.55});
 const acid=new T.MeshStandardMaterial({color:0xc2dc78,metalness:.5,roughness:.4});
 const glass=new T.MeshPhysicalMaterial({color:0x101d23,metalness:.25,roughness:.08,clearcoat:1,transparent:true,opacity:.83,side:T.DoubleSide});
 const lamp=new T.MeshStandardMaterial({color:0xe7f5ff,emissive:0xcde8ff,emissiveIntensity:3});
 const tailMat=new T.MeshStandardMaterial({color:0xf33c39,emissive:0xff1212,emissiveIntensity:3});
 const cabin=new T.Group();car.add(cabin);
 function mesh(geo,mat,parent=car,x=0,y=0,z=0){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(w,h,d,mat,parent=car,x=0,y=0,z=0){return mesh(new T.BoxGeometry(w,h,d),mat,parent,x,y,z)}
 function panel(vertices,indices,mat,parent=car){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices.flat(),3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,mat,parent)}
 function quad(a,b,c,d,mat,parent=car){return panel([a,b,c,d],[0,1,2,0,2,3],mat,parent)}
 function tube(points,r,mat,parent=car){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,48,r,8,false),mat,parent)}
 function cylinder(radius,len,mat,parent=car,x=0,y=0,z=0){return mesh(new T.CylinderGeometry(radius,radius,len,40),mat,parent,x,y,z)}

 // A sculpted lower body, lofted from shaped cross-sections.
 const sections=[[-2.35,.70,.68],[-2.16,.94,.87],[-1.65,1.02,.99],[-1.13,.99,.97],[-.35,.94,.82],[.45,.93,.82],[1.13,1.02,.95],[1.6,1,.91],[2.14,.88,.69],[2.38,.66,.57]];
 const profiles=[];for(const [z,w,h] of sections){profiles.push([[-w*.82,.34,z],[-w,.47,z],[-w,h-.08,z],[-w*.84,h,z],[-w*.45,h+.025,z],[0,h+.035,z],[w*.45,h+.025,z],[w*.84,h,z],[w,h-.08,z],[w,.47,z],[w*.82,.34,z]]);}
 const vs=profiles.flat(),ix=[];for(let j=0;j<profiles.length-1;j++)for(let i=0;i<10;i++){const a=j*11+i,b=a+11;ix.push(a,b,a+1,a+1,b,b+1)}
 // Side shell only in the cabin/hood region, leaving functional opening panels.
 const shellIndices=[];for(let j=0;j<profiles.length-1;j++)for(let i=0;i<10;i++){if(i>=3&&i<=6&&j>=2&&j<=7)continue;const a=j*11+i,b=a+11;shellIndices.push(a,b,a+1,a+1,b,b+1)}
 const shell=panel(vs,shellIndices,paint);shell.material.side=T.DoubleSide;
 box(1.65,.14,4.12,carbon,car,0,.28,0);
 // Deep front mouth, lower splitter and angular lamp housings.
 box(1.31,.14,.09,carbon,car,0,.47,2.34);
 const nose=quad([-.67,.64,2.38],[.67,.64,2.38],[.81,.70,2.16],[-.81,.70,2.16],paint);
 box(1.64,.045,.32,carbon,car,0,.31,2.24);
 for(const side of [-1,1]){
  tube([[side*.27,.638,2.37],[side*.59,.674,2.31],[side*.85,.745,2.12]],.017,lamp);
  tube([[side*.30,.607,2.375],[side*.63,.647,2.30],[side*.83,.705,2.13]],.01,lamp);
  const vent=box(.24,.10,.055,carbon,car,side*.70,.45,2.26);vent.rotation.y=side*.26;
  box(.12,.04,3.62,carbon,car,side*.96,.32,-.04);
  // Continuous shoulder creases and front/rear sculpted haunches.
  tube([[side*.72,.66,2.28],[side*.98,.90,1.45],[side*.91,.80,.50],[side*.92,.82,-.45],[side*1.01,1.0,-1.55],[side*.9,.84,-2.13]],.011,darkAlloy);
  quad([side*.97,.68,-.65],[side*1.01,.94,-1.1],[side*1.02,.80,-1.55],[side*.995,.51,-1.01],carbon);
  for(let i=0;i<4;i++)box(.03,.015,.17,carbon,car,side*.91,.945,1.18+i*.07);
  quad([side*.70,.91,.72],[side*.91,.85,.72],[side*.98,.94,1.47],[side*.72,.91,1.37],paint);
  quad([side*.72,.91,1.37],[side*.98,.94,1.47],[side*.85,.70,2.13],[side*.64,.75,2.00],paint);
  quad([side*.72,.96,-1.23],[side*.99,.99,-1.4],[side*.93,.88,-2.10],[side*.79,.88,-2.10],paint);
 }
 // Hood hinged at the windshield; the front compartment remains below it.
 const hood=new T.Group();hood.position.set(0,.90,.72);car.add(hood);
 const hoodMat=paint;
 panel([[-.69,0,0],[.69,0,0],[-.72,-.015,.65],[.72,-.015,.65],[-.65,-.15,1.28],[.65,-.15,1.28],[-.47,-.22,1.48],[.47,-.22,1.48],[0,.045,.50],[0,-.07,1.15]], [0,8,2,0,1,8,1,3,8,2,8,9,2,9,4,8,3,9,3,5,9,4,9,6,9,7,6,9,5,7],hoodMat,hood);
 tube([[-.67,.005,.02],[-.70,-.01,.65],[-.64,-.145,1.25]],.007,carbon,hood);
 tube([[.67,.005,.02],[.70,-.01,.65],[.64,-.145,1.25]],.007,carbon,hood);
 const frunk=new T.Group();car.add(frunk);box(1.34,.12,1.22,carbon,frunk,0,.49,1.24);
 for(let side of [-1,1])box(.06,.28,1.2,carbon,frunk,side*.65,.66,1.25);
 box(1.32,.27,.06,carbon,frunk,0,.64,1.87);
 box(1.05,.12,.59,darkAlloy,frunk,0,.60,1.06);
 for(let i=0;i<12;i++)box(.065,.035,.50,alloy,frunk,-.44+i*.08,.68,1.06);
 box(.35,.08,.28,acid,frunk,.38,.57,1.59);
 tube([[-.4,.64,.85],[-.55,.66,.94],[-.5,.60,1.40],[-.32,.57,1.60]],.017,acid,frunk);
 for(let side of [-1,1])tube([[side*.63,.57,1.7],[side*.59,.68,1.1],[side*.57,.84,.77]],.012,alloy,frunk);

 // Side doors with butterfly pivots and a true visible cabin opening.
 const doors=[];
 for(const s of [-1,1]){
  const door=new T.Group();door.position.set(s*.89,.81,.73);car.add(door);
  const verts=[[0,0,0],[s*.02,-.03,-1.55],[s*.08,-.32,-1.58],[s*.06,-.38,0],[s*-.05,.02,-.25],[s*-.08,.025,-1.3]];
  panel(verts,[0,3,2,0,2,1,0,1,5,0,5,4],paint,door).material.side=T.DoubleSide;
  quad([s*-.015,.03,-.05],[s*-.12,.52,-.39],[s*-.16,.56,-1.13],[s*.015,.04,-1.5],glass,door);
  tube([[0,.04,-.05],[s*-.12,.54,-.39],[s*-.16,.58,-1.1],[s*.015,.04,-1.5]],.022,paint,door);
  const handle=box(.017,.024,.20,darkAlloy,door,s*.035,-.025,-1.1);
  box(.06,.065,1.2,leather,door,s*-.05,-.07,-.76);
  const mirror=box(.19,.07,.24,carbon,door,s*.18,.08,-.06);mirror.rotation.z=s*.15;
  box(.135,.043,.013,alloy,door,s*.21,.08,-.18);
  doors.push(door);
 }
 // Windscreen, removable roof and rear deck. Layered shapes catch studio lights.
 const windshield=quad([-.85,.94,.68],[.85,.94,.68],[.67,1.44,.12],[-.67,1.44,.12],glass);
 tube([[-.86,.92,.70],[-.68,1.45,.11],[.68,1.45,.11],[.86,.92,.70]],.027,paint);
 const roof=quad([-.67,1.45,.12],[.67,1.45,.12],[.67,1.48,-.57],[-.67,1.48,-.57],glass);
 tube([[-.68,1.45,.12],[-.67,1.48,-.57],[.67,1.48,-.57],[.68,1.45,.12]],.025,paint);
 quad([-.67,1.48,-.58],[.67,1.48,-.58],[.86,.96,-1.24],[-.86,.96,-1.24],glass);
 for(const s of [-1,1])quad([s*.67,1.48,-.58],[s*.86,.96,-1.24],[s*1.00,.99,-1.55],[s*.82,1.17,-.69],paint);
 quad([-.86,.98,-1.22],[.86,.98,-1.22],[.91,.86,-2.13],[-.91,.86,-2.13],paint);
 for(let i=0;i<7;i++)box(1.24,.018,.035,carbon,car,0,1.001-i*.011,-1.27-i*.075);
 box(1.54,.18,.075,carbon,car,0,.54,-2.29);
 tube([[-.91,.82,-2.12],[-.62,.78,-2.32],[.62,.78,-2.32],[.91,.82,-2.12]],.019,tailMat);
 const wing=new T.Group();car.add(wing);
 for(let s of [-1,1]){const o=box(.065,.20,.17,carbon,wing,s*.66,1.03,-2.02);o.rotation.x=-.25;}
 const blade=box(1.92,.055,.33,carbon,wing,0,1.14,-2.05);blade.rotation.x=.05;
 for(let s of [-1,1]){const end=box(.035,.14,.39,paint,wing,s*.95,1.14,-2.05);end.rotation.z=s*-.1;}
 for(let i=0;i<7;i++){const fin=box(.025,.20,.54,carbon,car,-.72+i*.24,.29,-2.15);fin.rotation.x=-.17;}

 // Four independent wheels: tread, metallic barrels, spokes, drilled rotors and calipers.
 const wheels=[];
 for(const x of [-1.01,1.01])for(const z of [-1.45,1.46]){
  const side=Math.sign(x),wheel=new T.Group();wheel.position.set(x,.47,z);car.add(wheel);wheels.push(wheel);
  const tire=mesh(new T.TorusGeometry(.35,.115,18,64),rubber,wheel);tire.rotation.y=Math.PI/2;
  const outer=mesh(new T.CylinderGeometry(.332,.332,.215,48,1,true),darkAlloy,wheel);outer.rotation.z=Math.PI/2;
  const rim=mesh(new T.TorusGeometry(.31,.018,8,60),alloy,wheel,side*.12);rim.rotation.y=Math.PI/2;
  const disc=mesh(new T.CylinderGeometry(.26,.26,.025,48),brake,wheel,side*.065);disc.rotation.z=Math.PI/2;
  const hub=mesh(new T.CylinderGeometry(.062,.062,.055,24),alloy,wheel,side*.15);hub.rotation.z=Math.PI/2;
  for(let i=0;i<10;i++){
   const a=i*Math.PI/5;const spoke=box(.043,.27,.038,alloy,wheel,side*.135,Math.cos(a)*.17,Math.sin(a)*.17);spoke.rotation.x=a;
   const inset=box(.047,.20,.02,carbon,wheel,side*.155,Math.cos(a+.06)*.18,Math.sin(a+.06)*.18);inset.rotation.x=a+.06;
  }
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2;const hole=mesh(new T.CircleGeometry(.009,6),carbon,wheel,side*.081,Math.cos(a)*.225,Math.sin(a)*.225);hole.rotation.y=side*Math.PI/2;}
  const caliper=box(.07,.18,.10,acid,car,x+side*.09,.47,z-.20);caliper.rotation.x=-.2;
  for(let i=0;i<48;i++){const a=i/48*Math.PI*2;const tread=box(.175,.008,.019,carbon,wheel,0,Math.cos(a)*.456,Math.sin(a)*.456);tread.rotation.x=a;}
  const wheelArch=[];for(let i=0;i<=32;i++){const a=Math.PI*i/32;wheelArch.push([x*.985,.47+Math.sin(a)*.482,z+Math.cos(a)*.482]);}tube(wheelArch,.019,paint);
 }

 // Interior: floor, two sculpted bucket seats, dash, console and animated steering yoke.
 box(1.55,.09,1.70,carbon,cabin,0,.43,-.13);
 for(const s of [-1,1]){
  const seat=new T.Group();seat.position.set(s*.42,.54,-.39);cabin.add(seat);
  const base=box(.52,.14,.60,leather,seat,0,0,0);base.rotation.x=-.12;
  const back=box(.48,.62,.14,leather,seat,0,.31,-.21);back.rotation.x=-.18;
  const head=box(.29,.21,.14,leather,seat,0,.69,-.27);head.rotation.x=-.14;
  for(let side of [-1,1]){const bolster=box(.08,.47,.20,carbon,seat,side*.23,.27,-.15);bolster.rotation.z=side*.13;}
  tube([[-.16,.03,.23],[-.17,.09,-.14],[-.17,.54,-.17]],.008,acid,seat);
  tube([[.16,.03,.23],[.17,.09,-.14],[.17,.54,-.17]],.008,acid,seat);
 }
 const dash=box(1.65,.18,.35,leather,cabin,0,.90,.52);dash.rotation.x=.08;
 tube([[-.77,.96,.34],[0,.965,.35],[.77,.96,.34]],.009,acid,cabin);
 const yoke=new T.Group();yoke.position.set(.44,.98,.22);yoke.rotation.x=-.25;cabin.add(yoke);
 const yokePts=[[-.23,.10,0],[-.24,-.09,0],[-.16,-.16,0],[.16,-.16,0],[.24,-.09,0],[.23,.10,0]];
 tube(yokePts,.034,leather,yoke);box(.17,.10,.055,carbon,yoke,0,-.035,0);
 for(let s of [-1,1]){const arm=box(.15,.045,.045,darkAlloy,yoke,s*.14,-.045,0);arm.rotation.z=s*.23;box(.025,.015,.007,acid,yoke,s*.135,-.047,-.025);}
 const stalk=cylinder(.035,.23,carbon,cabin,.44,.91,.39);stalk.rotation.x=Math.PI/2;
 box(.24,.17,.70,leather,cabin,0,.61,-.03);
 function makeScreen(){const c=document.createElement('canvas');c.width=512;c.height=768;const x=c.getContext('2d');x.fillStyle='#071216';x.fillRect(0,0,512,768);x.strokeStyle='#263b42';x.lineWidth=1;for(let i=0;i<12;i++){x.beginPath();x.moveTo(0,i*70);x.lineTo(512,i*70+180);x.stroke();}x.fillStyle='#ddf9a3';x.font='22px Arial';x.fillText('ROADSTER',36,58);x.fillStyle='#eff7f1';x.font='110px Arial';x.fillText('0',220,216);x.font='17px Arial';x.fillStyle='#899eaa';x.fillText('KM / H',217,254);x.fillStyle='#b2d477';x.fillRect(38,320,436,3);x.fillStyle='#d0dcd6';x.font='22px Arial';x.fillText('READY TO EXPLORE',105,372);x.font='17px Arial';x.fillStyle='#819ba6';x.fillText('DESIGN STUDY / COCKPIT',105,419);x.strokeStyle='#526861';x.beginPath();x.moveTo(80,672);x.bezierCurveTo(210,580,290,640,410,485);x.stroke();x.fillStyle='#d6ed9c';x.beginPath();x.arc(280,602,6,0,Math.PI*2);x.fill();const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;}
 const screen=mesh(new T.PlaneGeometry(.28,.43),new T.MeshBasicMaterial({map:makeScreen(),side:T.DoubleSide}),cabin,0,.85,.29);screen.rotation.x=-.28;screen.rotation.y=Math.PI;
 box(.31,.46,.021,carbon,cabin,0,.85,.31).rotation.x=-.28;
 const gauge=box(.32,.10,.04,carbon,cabin,.44,1.02,.46);
 tube([[.31,1.035,.43],[.57,1.035,.43]],.008,acid,cabin);

 // Directional cold-gas nozzles, with translucent animated plumes.
 const thrusters=new T.Group();car.add(thrusters);const plumes=[];
 const plumeCanvas=document.createElement('canvas');plumeCanvas.width=64;plumeCanvas.height=128;const pc=plumeCanvas.getContext('2d');const pg=pc.createLinearGradient(0,0,0,128);pg.addColorStop(0,'#000');pg.addColorStop(.25,'#555');pg.addColorStop(.75,'#ddd');pg.addColorStop(1,'#000');pc.fillStyle=pg;pc.fillRect(0,0,64,128);const plumeAlpha=new T.CanvasTexture(plumeCanvas);
 for(const s of [-1,1]){
  const n=cylinder(.105,.16,darkAlloy,thrusters,s*.65,.57,-2.35);n.rotation.x=Math.PI/2;
  const ring=mesh(new T.TorusGeometry(.105,.015,8,32),alloy,thrusters,s*.65,.57,-2.44);
  mesh(new T.CircleGeometry(.08,32),carbon,thrusters,s*.65,.57,-2.455).rotation.y=Math.PI;
  const plumeMat=new T.MeshBasicMaterial({color:0xc2e5ed,alphaMap:plumeAlpha,transparent:true,opacity:.22,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
  const plume=mesh(new T.ConeGeometry(.30,2.0,32,1,true),plumeMat,thrusters,s*.65,.57,-3.45);plume.rotation.x=Math.PI/2;plume.visible=false;plumes.push(plume);
  for(const z of [-1.3,1.3]){const nozzle=cylinder(.068,.08,darkAlloy,thrusters,s*.72,.23,z);const p=mesh(new T.ConeGeometry(.24,1.3,24,1,true),plumeMat.clone(),thrusters,s*.72,-.45,z);p.visible=false;plumes.push(p);}
 }
 // Batch the detailed wheel parts by material; the full wheel remains independently animated.
 for(const wheel of wheels){
  const batches=new Map();for(const child of [...wheel.children]){if(!child.isMesh)continue;child.updateMatrix();const key=child.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(child);}
  for(const children of batches.values()){
   if(children.length<2)continue;const pos=[],norm=[],uv=[],idx=[];let offset=0;
   for(const child of children){const g=child.geometry.clone().applyMatrix4(child.matrix),p=g.getAttribute('position'),n=g.getAttribute('normal'),u=g.getAttribute('uv');for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));norm.push(n.getX(i),n.getY(i),n.getZ(i));uv.push(u?u.getX(i):0,u?u.getY(i):0);}if(g.index)for(const i of g.index.array)idx.push(i+offset);else for(let i=0;i<p.count;i++)idx.push(i+offset);offset+=p.count;g.dispose();wheel.remove(child);child.geometry.dispose();}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(norm,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);mesh(geo,children[0].material,wheel);
  }
 }
 return {car,paint,hood,doors,windshield,roof,cabin,yoke,wheels,wing,plumes,frunk};
}

export function createStuntEnvironment(){
 const group=new T.Group();
 const mat=new T.MeshStandardMaterial({color:0x202c32,roughness:.66,metalness:.5,side:T.DoubleSide});
 const supportMat=new T.MeshStandardMaterial({color:0x131f25,roughness:.7,metalness:.6});
 const lineMat=new T.MeshBasicMaterial({color:0xc0dfa1});
 // A continuous arc from the horizontal road to an inverted exit.
 const R=5.6,verts=[],indices=[];
 for(let i=0;i<=100;i++){const a=i/100*Math.PI*.94;const y=R*(1-Math.cos(a)),z=R*Math.sin(a);verts.push(-2.45,y,z,2.45,y,z);if(i<100){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2)}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();const ramp=new T.Mesh(geo,mat);ramp.receiveShadow=true;ramp.castShadow=true;group.add(ramp);
 for(const s of [-1,1]){
  const points=[];for(let i=0;i<=70;i++){const a=i/70*Math.PI*.94;points.push(new T.Vector3(s*2.42,R*(1-Math.cos(a))+.025,R*Math.sin(a)));}
  const edge=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),100,.025,6,false),lineMat);group.add(edge);
  for(let j=1;j<=6;j++){const a=j/6*Math.PI*.88,y=R*(1-Math.cos(a)),z=R*Math.sin(a);const strut=new T.Mesh(new T.BoxGeometry(.13,y,.13),supportMat);strut.position.set(s*2.52,y/2,z);group.add(strut);}
 }
 // Runway marker lights and dashed center line.
 for(let i=-12;i<10;i++)for(const s of [-1,1]){const b=new T.Mesh(new T.BoxGeometry(.07,.025,.32),lineMat);b.position.set(s*3,.015,i*2);group.add(b);}
 return group;
}

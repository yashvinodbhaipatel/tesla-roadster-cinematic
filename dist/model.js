import * as T from './assets/three.module.js';

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

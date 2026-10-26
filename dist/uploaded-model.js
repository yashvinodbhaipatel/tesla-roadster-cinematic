import * as T from './assets/three.module.js';
import {GLTFLoader} from './assets/loaders/GLTFLoader.js';

// Actual geometry and texture maps from the user's tesla-roadster-20.zip.
// A shared shell and four wheel assemblies are the asset's native components.
export async function loadUploadedRoadster(onProgress) {
  const loader = new GLTFLoader();
  let gltf;
  if ('DecompressionStream' in window) {
    const response = await fetch('./assets/models/roadster.glb.gz');
    if (!response.ok) throw new Error(`Model download failed (${response.status}).`);
    const total=Number(response.headers.get('content-length'));
    const reader=response.body.getReader(),chunks=[];let loaded=0;
    for (;;) {
      const {done,value}=await reader.read(); if(done)break;
      chunks.push(value);loaded+=value.length;onProgress?.({loaded,total});
    }
    const packed=new Uint8Array(loaded);let cursor=0;
    for(const chunk of chunks){packed.set(chunk,cursor);cursor+=chunk.length;}
    // Some hosts decode Content-Encoding automatically; detect the payload.
    const data=packed[0]===0x1f&&packed[1]===0x8b
      ? await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
      : packed.buffer;
    document.querySelector('#loading-status').textContent='PREPARING THE SHOWROOM';
    gltf=await loader.parseAsync(data,'./assets/models/');
  } else {
    gltf=await loader.loadAsync('./assets/models/roadster.glb',onProgress);
  }
  const car = new T.Group();
  car.name = 'Uploaded Tesla Roadster';
  gltf.scene.updateMatrixWorld(true);
  const bounds = new T.Box3().setFromObject(gltf.scene);
  const size = bounds.getSize(new T.Vector3());
  const center = bounds.getCenter(new T.Vector3());
  const scale = 4.8 / size.z;
  const normalization = new T.Matrix4().makeScale(scale, scale, scale)
    .multiply(new T.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));
  const wheelGroups = new Map();
  let body;
  gltf.scene.traverse(object => {
    if (!object.isMesh) return;
    object.geometry.applyMatrix4(new T.Matrix4().multiplyMatrices(normalization, object.matrixWorld));
    object.position.set(0, 0, 0); object.rotation.set(0, 0, 0); object.scale.set(1, 1, 1);
    object.castShadow = true; object.receiveShadow = true;
    // The supplied transmission maps are solid black: explicitly disabling
    // transmission avoids an unnecessary full-scene transmission render pass.
    object.material.transmission = 0;
    object.material.transmissionMap = null;
    object.material.envMapIntensity = 0.65;
    object.material.needsUpdate = true;
    const prefix = object.name.match(/^model_(\d+)_/)?.[1];
    if (prefix === '1') body = object;
    else {
      if (!wheelGroups.has(prefix)) wheelGroups.set(prefix, []);
      wheelGroups.get(prefix).push(object);
    }
  });
  if (!body || wheelGroups.size !== 4) throw new Error('Unexpected model structure.');
  car.add(body);
  const wheels = [];
  for (const [id, meshes] of wheelGroups) {
    const box = new T.Box3();
    for (const mesh of meshes) { mesh.geometry.computeBoundingBox(); box.union(mesh.geometry.boundingBox); }
    const pivot = box.getCenter(new T.Vector3());
    const wheel = new T.Group(); wheel.name = `Uploaded wheel ${id}`; wheel.position.copy(pivot);
    for (const mesh of meshes) { mesh.geometry.translate(-pivot.x, -pivot.y, -pivot.z); wheel.add(mesh); }
    car.add(wheel); wheels.push(wheel);
  }

  // Cinematic air plumes are effects, not replacement vehicle geometry.
  const plumes = [];
  const gradient = document.createElement('canvas'); gradient.width=32; gradient.height=128;
  const ctx=gradient.getContext('2d');const fade=ctx.createLinearGradient(0,0,0,128);
  fade.addColorStop(0,'#000');fade.addColorStop(.35,'#777');fade.addColorStop(.85,'#ddd');fade.addColorStop(1,'#000');
  ctx.fillStyle=fade;ctx.fillRect(0,0,32,128);
  const alpha = new T.CanvasTexture(gradient);
  for (const x of [-.56,-.19,.19,.56]) {
    const material=new T.MeshBasicMaterial({color:0xc9edf4,alphaMap:alpha,transparent:true,opacity:.18,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
    const plume=new T.Mesh(new T.ConeGeometry(.20,1.75,24,1,true),material);
    plume.position.set(x,.39,-3.18);plume.rotation.x=Math.PI/2;plume.visible=false;car.add(plume);plumes.push(plume);
  }
  car.updateMatrixWorld(true);
  return {car,body,wheels,plumes,source:'tesla-roadster-20.zip',size:new T.Box3().setFromObject(car).getSize(new T.Vector3())};
}

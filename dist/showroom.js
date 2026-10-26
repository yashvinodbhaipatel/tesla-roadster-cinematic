const $=selector=>document.querySelector(selector);
let app;
const ready=import('./app.js').then(module=>{app=module;return module;}).catch(error=>{
 console.error('Roadster model initialization failed.',error);
 $('#loading').hidden=true;$('#webgl-fallback').hidden=false;
 $('#webgl-fallback h2').textContent='The model could not load.';
 $('#webgl-fallback p').textContent='Please check your connection and reload to try again.';
});
async function navigate(mode){const module=await ready;if(module)module.activatePrototype(mode);}
$('#brand').addEventListener('click',event=>{event.preventDefault();navigate('hero');});
document.querySelectorAll('.nav-button').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.nav==='experience'?'hero':button.dataset.nav)));
let opener;
$('#credits-open').addEventListener('click',()=>{opener=document.activeElement;document.dispatchEvent(new Event('roadster:dialog'));$('#credits-dialog').showModal();});
const dialog=$('#credits-dialog');dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});

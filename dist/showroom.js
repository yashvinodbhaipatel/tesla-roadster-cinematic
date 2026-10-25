// The exact reference is displayed using the creator's published embed.
// No third-party model files are extracted, copied, or redistributed.
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const viewer = $('#reference-viewer');
const embedURL = viewer.src;
let prototypeModule = null;
let modulePromise = null;
let navigation = 0;

function showReference() {
  navigation++;
  prototypeModule?.suspendPrototype();
  document.body.classList.remove('film-mode', 'explore-mode', 'detail-open');
  document.body.classList.add('reference-mode');
  $('#reference-showroom').hidden = false;
  $('#prototype-notice').hidden = true;
  $('#webgl-fallback').hidden = true;
  $('#loading').hidden = true;
  if (viewer.src !== embedURL) viewer.src = embedURL;
  updateNavigation(true);
  $('.skip-link').href = '#reference-viewer';
}

function updateNavigation(reference) {
  for (const button of $$('.nav-button')) {
    const selected = button.dataset.nav === (reference ? 'reference' : 'prototype');
    button.classList.toggle('active', selected);
    if (button.dataset.nav !== 'specs') button.setAttribute('aria-pressed', String(selected));
  }
}

async function showPrototype(mode) {
  const ticket = ++navigation;
  // Unload the external renderer before starting Three.js on smaller devices.
  viewer.src = 'about:blank';
  $('#reference-showroom').hidden = true;
  document.body.classList.remove('reference-mode');
  $('#prototype-notice').hidden = false;
  updateNavigation(false);
  $('.skip-link').href = '#explorer-toolbar';
  if (!prototypeModule) {
    $('#loading').style.opacity = '1';
    $('#loading').hidden = false;
  }
  try {
    modulePromise ||= import('./app.js');
    prototypeModule = await modulePromise;
    if (ticket !== navigation) {
      // A return to the showroom can overtake the initial module download.
      if (document.body.classList.contains('reference-mode')) prototypeModule.suspendPrototype();
      return;
    }
    prototypeModule.activatePrototype(mode);
  } catch (error) {
    if (ticket !== navigation) return;
    $('#loading').hidden = true;
    $('#webgl-fallback').hidden = false;
    console.error('The motion prototype could not start.', error);
  }
}

$('#brand').addEventListener('click', event => { event.preventDefault(); showReference(); });
$('[data-nav="reference"]').addEventListener('click', showReference);
$$('[data-reference]').forEach(button => button.addEventListener('click', showReference));
$$('[data-prototype]').forEach(button => button.addEventListener('click', () => showPrototype(button.dataset.prototype)));

let dialogOpener;
function openDialog(selector) {
  dialogOpener = document.activeElement;
  document.dispatchEvent(new Event('roadster:dialog'));
  $(selector).showModal();
}
$('[data-nav="specs"]').addEventListener('click', () => openDialog('#engineering-dialog'));
$('#credits-open').addEventListener('click', () => openDialog('#credits-dialog'));
$$('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialogOpener?.focus());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});

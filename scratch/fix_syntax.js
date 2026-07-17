const fs = require('fs');
let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');

const replacement = `
  // Cross-tab input mirroring logic
  const syncedInputIds = [
    'patientEnvW', 'patientEnvD', 'patientEnvH',
    'maxFootprintW', 'maxFootprintD', 'maxHeight',
    'sw', 'sh', 'pixelSize', 'pxw', 'pxh',
    'wdSlider', 'wdBox', 'flSlider', 'flBox', 'apSlider', 'apBox',
    'reqResSlider', 'reqResBox', 'cocPreset', 'cocSlider', 'cocBox',
    'overlapX', 'g3dColCamsSlider'
  ];

  syncedInputIds.forEach(id => {
    const el1 = document.getElementById(id);
    const el2 = document.getElementById('m2-' + id);
    if (el1 && el2) {
      ['input', 'change'].forEach(evt => {
        el1.addEventListener(evt, () => {
          if (el2.value !== el1.value) {
            el2.value = el1.value;
            if (id === 'wdSlider') { const b = document.getElementById('m2-wdBox'); if (b) b.value = el1.value; }
            if (id === 'wdBox') { const b = document.getElementById('m2-wdSlider'); if (b) b.value = el1.value; }
            if (id === 'flSlider') { const b = document.getElementById('m2-flBox'); if (b) b.value = el1.value; }
            if (id === 'flBox') { const b = document.getElementById('m2-flSlider'); if (b) b.value = el1.value; }
            if (id === 'apSlider') { const b = document.getElementById('m2-apBox'); if (b) b.value = el1.value; }
            if (id === 'apBox') { const b = document.getElementById('m2-apSlider'); if (b) b.value = el1.value; }
            if (id === 'reqResSlider') { const b = document.getElementById('m2-reqResBox'); if (b) b.value = el1.value; }
            if (id === 'reqResBox') { const b = document.getElementById('m2-reqResSlider'); if (b) b.value = el1.value; }
            if (id === 'cocSlider') { const b = document.getElementById('m2-cocBox'); if (b) b.value = el1.value; }
            if (id === 'cocBox') { const b = document.getElementById('m2-cocSlider'); if (b) b.value = el1.value; }
            if (id === 'sensorPreset' || id === 'cocPreset') el2.dispatchEvent(new Event('change'));
            calculate();
          }
        });
        el2.addEventListener(evt, () => {
          if (el1.value !== el2.value) {
            el1.value = el2.value;
            if (id === 'wdSlider') { const b = document.getElementById('wdBox'); if (b) b.value = el2.value; }
            if (id === 'wdBox') { const b = document.getElementById('wdSlider'); if (b) b.value = el2.value; }
            if (id === 'flSlider') { const b = document.getElementById('flBox'); if (b) b.value = el2.value; }
            if (id === 'flBox') { const b = document.getElementById('flSlider'); if (b) b.value = el2.value; }
            if (id === 'apSlider') { const b = document.getElementById('apBox'); if (b) b.value = el2.value; }
            if (id === 'apBox') { const b = document.getElementById('apSlider'); if (b) b.value = el2.value; }
            if (id === 'reqResSlider') { const b = document.getElementById('reqResBox'); if (b) b.value = el2.value; }
            if (id === 'reqResBox') { const b = document.getElementById('reqResSlider'); if (b) b.value = el2.value; }
            if (id === 'cocSlider') { const b = document.getElementById('cocBox'); if (b) b.value = el2.value; }
            if (id === 'cocBox') { const b = document.getElementById('cocSlider'); if (b) b.value = el2.value; }
            if (id === 'sensorPreset' || id === 'cocPreset') el1.dispatchEvent(new Event('change'));
            calculate();
          }
        });
      });
    }
  });
`;

appJs = appJs.replace(/\/\/ Cross-tab input mirroring logic[\s\S]*?(?=const m2_patientEnvH = document)/m, replacement);
fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);
console.log('Fixed syntax error!');

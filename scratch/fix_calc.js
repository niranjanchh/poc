const fs = require('fs');
let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');

const calcFix = `
  function calculate() {
    const isModel2 = document.getElementById('model2-tab') && document.getElementById('model2-tab').classList.contains('active');
    const prefix = isModel2 ? 'm2-' : '';
    
    const wdBox = document.getElementById(prefix + 'wdBox');
    const flBox = document.getElementById(prefix + 'flBox');
    const cocBox = document.getElementById(prefix + 'cocBox');
    const apBox = document.getElementById(prefix + 'apBox');
    const pixelSizeEl = document.getElementById(prefix + 'pixelSize');
    const swEl = document.getElementById(prefix + 'sw');
    const shEl = document.getElementById(prefix + 'sh');
    const pxwEl = document.getElementById(prefix + 'pxw');
    const pxhEl = document.getElementById(prefix + 'pxh');
    const reqResBox = document.getElementById(prefix + 'reqResBox');
    const patientEnvH = document.getElementById(prefix + 'patientEnvH');

    const fovVal = document.getElementById(prefix + 'fov-val');
    const fovHVal = document.getElementById(prefix + 'fov-h-val');
    const diffBlur = document.getElementById(prefix + 'diff-blur');
    const diffStatus = document.getElementById(prefix + 'diff-status');
    const geoRes = document.getElementById(prefix + 'geo-res');
    const geoResStatus = document.getElementById(prefix + 'geo-res-status');

    if (!wdBox) return;

    const wd = parseFloat(wdBox.value) || 500;
    const fl = parseFloat(flBox.value) || 35;
    const ap = parseFloat(apBox.value) || 8.0;
    const sensorW = parseFloat(swEl.value) || 46.15;
    const sensorH = parseFloat(shEl.value) || 32.87;
    const pxWidth = parseFloat(pxwEl.value) || 13392;
    const pxHeight = parseFloat(pxhEl.value) || 9528;
    const pixelSizeUm = parseFloat(pixelSizeEl.value) || 3.45;
    const reqRes = parseFloat(reqResBox.value) || 30.0;
`;

appJs = appJs.replace(/\/\/ Y-axis label[\s\S]*?(?= \/\/ Geometry)/m, calcFix);

fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);
console.log('Fixed calculate block');

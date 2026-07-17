if (tabId === 'model2-tab') {
      const placeholder3 = document.getElementById('g3d-visualizer-placeholder-tab3');
      const wrapper = document.getElementById('g3d-visualizer-wrapper');
      if (placeholder3 && wrapper) placeholder3.appendChild(wrapper);
      if (!window.g3dInitialized) setupGantry3D();
      setTimeout(resizeGantry3D, 100);
    } else if (tabId === 'calculator-tab') {
      const placeholder2 = document.getElementById('g3d-visualizer-placeholder-tab2');
      const wrapper = document.getElementById('g3d-visualizer-wrapper');
      if (placeholder2 && wrapper) placeholder2.appendChild(wrapper);
      if (!window.g3dInitialized) setupGantry3D();
      setTimeout(resizeGantry3D, 100);
    }// Global State
window.g3dColumns = [];
window.g3dIsSweeping = false;
window.g3dSweepAngle = 0;
window.g3dSweepStart = null;
window.g3dInitialized = false;

var g3dScene, g3dCamera, g3dRenderer, g3dControls;
var gantryGroup, mannequinGroup, stationaryGroup;

// 1. Core Logic & Tabs

function switchSubTab(evt, subTabId) {
    document.querySelectorAll('.sub-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.sub-tab-btn').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(subTabId);
    if (target) target.style.display = 'block';
    if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');
}
window.switchSubTab = switchSubTab;

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.style.display = 'block';
    
    let btnId = 'btn-rfq';
    if (tabId === 'calculator-tab') btnId = 'btn-calc';
    else if (tabId === 'model2-tab') btnId = 'btn-model2';
    
    const targetBtn = document.getElementById(btnId);
    if (targetBtn) targetBtn.classList.add('active');

    if (tabId === 'model2-tab' || tabId === 'calculator-tab') {
      if (!window.g3dInitialized) setupGantry3D();
      setTimeout(resizeGantry3D, 100);
    }
}

// 2. Calculations


function calculate() {
    const isModel2 = document.getElementById('model2-tab') && document.getElementById('model2-tab').style.display === 'block';
    const prefix = isModel2 ? 'm2-' : '';

    const wdBox = document.getElementById(prefix + 'wdBox') || document.getElementById('wdBox');
    const flBox = document.getElementById(prefix + 'flBox') || document.getElementById('flBox');
    const apBox = document.getElementById(prefix + 'apBox') || document.getElementById('apBox');
    const cocBox = document.getElementById(prefix + 'cocBox') || document.getElementById('cocBox');
    const swEl = document.getElementById(prefix + 'sw') || document.getElementById('sw');
    const shEl = document.getElementById(prefix + 'sh') || document.getElementById('sh');
    const pxwEl = document.getElementById(prefix + 'pxw') || document.getElementById('pxw');
    const pxhEl = document.getElementById(prefix + 'pxh') || document.getElementById('pxh');
    const pixelSizeEl = document.getElementById(prefix + 'pixelSize') || document.getElementById('pixelSize');
    const reqResBox = document.getElementById(prefix + 'reqResBox') || document.getElementById('reqResBox');
    const patientEnvHEl = document.getElementById(prefix + 'patientEnvH') || document.getElementById('patientEnvH');
    const patientEnvWEl = document.getElementById(prefix + 'patientEnvW') || document.getElementById('patientEnvW');
    const camsSlider = document.getElementById(prefix + 'g3dColCamsSlider') || document.getElementById('g3dColCamsSlider');
    const overlapEl = document.getElementById(prefix + 'overlapX') || document.getElementById('overlapX') || {value: 15};
    const numColumnsEl = document.getElementById(prefix + 'numColumns') || document.getElementById('numColumns') || {value: isModel2 ? 2 : 1};

    if (!wdBox || !flBox) return;

    const wd = parseFloat(wdBox.value) || 500;
    const fl = parseFloat(flBox.value) || 35;
    const ap = parseFloat(apBox?.value) || 8;
    const coc = parseFloat(cocBox?.value) || 0.025;
    const sensorW = parseFloat(swEl.value) || 46.15;
    const sensorH = parseFloat(shEl.value) || 32.87;
    const pxw = parseFloat(pxwEl?.value) || 13392;
    const pxh = parseFloat(pxhEl?.value) || 9528;
    const pixelSizeUm = parseFloat(pixelSizeEl?.value) || 3.45;
    const reqRes = parseFloat(reqResBox?.value) || 30;
    const patientEnvH = parseFloat(patientEnvHEl?.value) || 2.0;
    const patientEnvW = parseFloat(patientEnvWEl?.value) || 1.0;
    const overlapPercent = parseFloat(overlapEl?.value) || 15;
    const overlapFrac = overlapPercent / 100;
    let numCams = parseInt(camsSlider?.value) || 5;
    const numColumns = isModel2 ? (parseInt(numColumnsEl?.value) || 2) : 1;

    // Magnification & FOV
    const magnification = fl / Math.max(0.1, (wd - fl));
    const fovW = sensorW / magnification;
    const fovH = sensorH / magnification;

    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.innerHTML = text; };

    setText(prefix + 'fovVal', fovW.toFixed(1));
    setText(prefix + 'fovHVal', fovH.toFixed(1));
    setText(prefix + 'fovVal2', fovW.toFixed(1));
    setText(prefix + 'fovHVal2', fovH.toFixed(1));

    // Density (H) & (V)
    const geoResH = pxw / fovW;
    const geoResV = pxh / fovH;
    const minRes = Math.min(geoResH, geoResV);

    setText(prefix + 'geoResH', geoResH.toFixed(1));
    setText(prefix + 'geoResV', geoResV.toFixed(1));
    setText(prefix + 'geoRes', minRes.toFixed(1));

    const geoResStatus = document.getElementById(prefix + 'geoResStatus');
    if (geoResStatus) {
        if (minRes >= reqRes) {
            geoResStatus.textContent = 'PASS';
            geoResStatus.className = 'badge status-pass';
        } else {
            geoResStatus.textContent = 'FAIL';
            geoResStatus.className = 'badge status-fail';
        }
    }

    // Total Array FOV
    const totalFovW = fovW * numColumns * (1 - overlapFrac) + (fovW * overlapFrac);
    const totalFovH = fovH * numCams * (1 - overlapFrac) + (fovH * overlapFrac);
    setText(prefix + 'totalArrayFov', totalFovW.toFixed(0) + ' x ' + totalFovH.toFixed(0) + ' mm');
    setText(prefix + 'totalFovText', totalFovW.toFixed(0) + ' mm &times; ' + totalFovH.toFixed(0) + ' mm');

    // Avg Envelope Density
    // The density at the envelope limits is reduced by distance
    const trackRadius = wd + (patientEnvW * 1000) / 2;
    const maxDist = trackRadius;
    const minM = fl / Math.max(0.1, (maxDist - fl));
    const minGeoRes = pxw / (sensorW / minM);
    const avgEnvDensity = (geoResH + minGeoRes) / 2;
    setText(prefix + 'avgEnvDensity', avgEnvDensity.toFixed(1));

    // Depth of Field
    const hyperfocal = (fl * fl) / (ap * coc) + fl;
    const dn = (wd * (hyperfocal - fl)) / (hyperfocal + wd - 2*fl);
    const df = (wd * (hyperfocal - fl)) / (hyperfocal - wd);
    let dof = df - dn;
    
    setText(prefix + 'nearLimit', dn.toFixed(1) + ' mm');
    if (df < 0 || isNaN(dof)) {
        dof = 9999;
        setText(prefix + 'farLimit', '&infin;');
    } else {
        setText(prefix + 'farLimit', df.toFixed(1) + ' mm');
    }
    
    const dofEl = document.getElementById(prefix + 'singleDOF');
    if (dofEl) dofEl.innerHTML = dof > 1000 ? '&gt; 1000 mm' : dof.toFixed(1) + ' mm';

    // Diffraction Blur
    const diffBlur = 1.342 * ap;
    setText(prefix + 'diffBlur', diffBlur.toFixed(2));
    const diffStatus = document.getElementById(prefix + 'diffStatus');
    if (diffStatus) {
        if (diffBlur <= pixelSizeUm * 2) {
            diffStatus.textContent = 'PASS';
            diffStatus.className = 'badge status-pass';
        } else {
            diffStatus.textContent = 'WARNING';
            diffStatus.className = 'badge status-warn';
        }
    }

    // Vertical Cams & Motor Steps
    const effFovH = fovH * (1 - overlapFrac);
    const totalTravel = patientEnvH * 1000;
    const minCamsNeeded = Math.ceil(totalTravel / effFovH);
    setText(prefix + 'verticalCamsNeededVal', minCamsNeeded);
    
    // Auto-update slider if we are in auto mode or just bind it
    if (numCams < minCamsNeeded) {
        // Just for display, we don't force the slider unless it's strictly required by UI design
    }

    setText(prefix + 'stackSize', '3 images');
    setText(prefix + 'motorStepsVal', numCams);
    setText(prefix + 'motorStepSizeVal', (totalTravel / numCams).toFixed(1));
    setText(prefix + 'motorTotalTravelVal', totalTravel.toFixed(1));

    // Rebuild the 3D model
    if (window.g3dInitialized && typeof rebuildGantryMechanicals === 'function') {
        rebuildGantryMechanicals();
    }
}



function handleSensorPresetChange(prefix) {
    const presetEl = document.getElementById(prefix + 'sensorPreset');
    if (!presetEl) return;
    const preset = presetEl.value;
    const swEl = document.getElementById(prefix + 'sw');
    const shEl = document.getElementById(prefix + 'sh');
    const pixelSizeEl = document.getElementById(prefix + 'pixelSize');
    const pxwEl = document.getElementById(prefix + 'pxw');
    const pxhEl = document.getElementById(prefix + 'pxh');
    
    if (preset === 'IMX342') {
        if (swEl) swEl.value = 31.8;
        if (shEl) shEl.value = 23.8;
        if (pixelSizeEl) pixelSizeEl.value = 3.45;
        if (pxwEl) pxwEl.value = 9576;
        if (pxhEl) pxhEl.value = 6388;
    } else if (preset === 'IMX455') {
        if (swEl) swEl.value = 36.0;
        if (shEl) shEl.value = 24.0;
        if (pixelSizeEl) pixelSizeEl.value = 3.76;
        if (pxwEl) pxwEl.value = 9568;
        if (pxhEl) pxhEl.value = 6380;
    } else if (preset === 'IMX411') {
        if (swEl) swEl.value = 53.4;
        if (shEl) shEl.value = 40.0;
        if (pixelSizeEl) pixelSizeEl.value = 3.76;
        if (pxwEl) pxwEl.value = 14192;
        if (pxhEl) pxhEl.value = 10640;
    } else if (preset === '64mp_mobile') {
        if (swEl) swEl.value = 6.47;
        if (shEl) shEl.value = 4.85;
        if (pixelSizeEl) pixelSizeEl.value = 0.7;
        if (pxwEl) pxwEl.value = 9248;
        if (pxhEl) pxhEl.value = 6936;
    } else if (preset === '100mp_ind') {
        if (swEl) swEl.value = 25.5;
        if (shEl) shEl.value = 19.1;
        if (pixelSizeEl) pixelSizeEl.value = 2.2;
        if (pxwEl) pxwEl.value = 11608;
        if (pxhEl) pxhEl.value = 8708;
    } else if (preset === 'IMX571') {
        if (swEl) swEl.value = 23.5;
        if (shEl) shEl.value = 15.7;
        if (pixelSizeEl) pixelSizeEl.value = 3.76;
        if (pxwEl) pxwEl.value = 6244;
        if (pxhEl) pxhEl.value = 4168;
    }
}

function handleCoCPresetChange(prefix) {
    const presetEl = document.getElementById(prefix + 'cocPreset');
    if (!presetEl) return;
    const preset = presetEl.value;
    const pixelSizeVal = parseFloat(document.getElementById(prefix + 'pixelSize')?.value) || 3.45;
    const swVal = parseFloat(document.getElementById(prefix + 'sw')?.value) || 46.15;
    const shVal = parseFloat(document.getElementById(prefix + 'sh')?.value) || 32.87;
    const cocBox = document.getElementById(prefix + 'cocBox');
    const cocSlider = document.getElementById(prefix + 'cocSlider');
    if (!cocBox || !cocSlider) return;

    if (preset === 'pixel') {
        cocBox.value = pixelSizeVal.toFixed(2);
        cocSlider.value = pixelSizeVal;
    } else if (preset === 'sensor-fraction') {
        const diagonal = Math.sqrt(swVal*swVal + shVal*shVal);
        const fraction = (diagonal / 1500) * 1000; 
        cocBox.value = fraction.toFixed(2);
        cocSlider.value = fraction;
    } else if (preset === 'traditional') {
        cocBox.value = 25.0;
        cocSlider.value = 25.0;
    }
}

function syncSensorDimensions(from, to) {
    ['sw', 'sh', 'pixelSize', 'pxw', 'pxh'].forEach(id => {
        const elFrom = document.getElementById(from + id);
        const elTo = document.getElementById(to + id);
        if (elFrom && elTo) {
            elTo.value = elFrom.value;
        }
    });
}

function syncCoC(from, to) {
    ['cocBox', 'cocSlider'].forEach(id => {
        const elFrom = document.getElementById(from + id);
        const elTo = document.getElementById(to + id);
        if (elFrom && elTo) {
            elTo.value = elFrom.value;
        }
    });
}

window.handleSensorPresetChange = handleSensorPresetChange;
window.handleCoCPresetChange = handleCoCPresetChange;
window.syncSensorDimensions = syncSensorDimensions;
window.syncCoC = syncCoC;

function renderTopDownDensityMap(prefix, actualPxMm) {
    const canvas = document.getElementById(prefix + 'density-map');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    
    const envW_m = parseFloat(document.getElementById(prefix + 'patientEnvW')?.value || 1.0);
    const envD_m = parseFloat(document.getElementById(prefix + 'patientEnvD')?.value || 0.6);
    const targetPxMm = parseFloat(document.getElementById(prefix + 'targetPxMm')?.value || 30);
    const wd_mm = parseFloat(document.getElementById(prefix + 'wdBox')?.value || 480);
    
    const w_mm = envW_m * 1000;
    const d_mm = envD_m * 1000;
    
    const gantryRadiusX = wd_mm + (w_mm / 2);
    const gantryRadiusY = wd_mm + (d_mm / 2);
    
    const paramsDiv = document.getElementById(prefix + 'map-params');
    if (paramsDiv) {
      paramsDiv.textContent = 'Track: ' + Math.round(gantryRadiusX) + 'x' + Math.round(gantryRadiusY) + 'mm';
    }
    
    const scale = Math.min((W - 30) / (gantryRadiusX * 2), (H - 30) / (gantryRadiusY * 2));
    
    ctx.save();
    ctx.translate(W/2, H/2);
    
    // Draw center crosshair and axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -H/2); ctx.lineTo(0, H/2);
    ctx.moveTo(-W/2, 0); ctx.lineTo(W/2, 0);
    ctx.stroke();
    
    // Add scale labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('0', 5, 5);
    ctx.fillText(Math.round(w_mm/2) + 'mm', (w_mm/2 * scale) - 35, 5);
    ctx.fillText('-' + Math.round(w_mm/2) + 'mm', -(w_mm/2 * scale) + 5, 5);
    ctx.fillText(Math.round(d_mm/2) + 'mm', 5, (d_mm/2 * scale) - 15);
    ctx.fillText('-' + Math.round(d_mm/2) + 'mm', 5, -(d_mm/2 * scale) + 5);
    ctx.textBaseline = 'alphabetic'; // reset
    
    // Draw Gantry Orbit ellipse
    ctx.beginPath();
    ctx.ellipse(0, 0, gantryRadiusX * scale, gantryRadiusY * scale, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Camera positions
    const isModel2 = (prefix === 'm2-');
    const camAngles = isModel2 
        ? [0, Math.PI/2, Math.PI, Math.PI*1.5] 
        : [0, Math.PI/4, Math.PI/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*1.5, Math.PI*7/4];
        
    ctx.fillStyle = '#64748b';
    camAngles.forEach(a => {
      const cx = gantryRadiusX * Math.sin(a) * scale;
      const cy = -gantryRadiusY * Math.cos(a) * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw Rectangular Envelope colored by cumulative density
    const rectHalfW = w_mm / 2;
    const rectHalfD = d_mm / 2;
    const edges = [
      { x1: -rectHalfW, y1: -rectHalfD, x2: rectHalfW, y2: -rectHalfD, nx: 0, ny: -1 }, // Top
      { x1: rectHalfW, y1: -rectHalfD, x2: rectHalfW, y2: rectHalfD, nx: 1, ny: 0 },    // Right
      { x1: rectHalfW, y1: rectHalfD, x2: -rectHalfW, y2: rectHalfD, nx: 0, ny: 1 },    // Bottom
      { x1: -rectHalfW, y1: rectHalfD, x2: -rectHalfW, y2: -rectHalfD, nx: -1, ny: 0 }  // Left
    ];
    
    edges.forEach(edge => {
      const steps = 100;
      for (let i = 0; i < steps; i++) {
        const t1 = i / steps;
        const t2 = (i + 1) / steps;
        
        const px1 = edge.x1 + (edge.x2 - edge.x1) * t1;
        const py1 = edge.y1 + (edge.y2 - edge.y1) * t1;
        
        const px2 = edge.x1 + (edge.x2 - edge.x1) * t2;
        const py2 = edge.y1 + (edge.y2 - edge.y1) * t2;
        
        let maxDensity = 0;
        for (let a of camAngles) {
          const cx = gantryRadiusX * Math.sin(a);
          const cy = -gantryRadiusY * Math.cos(a);
          
          const dx = cx - px1;
          const dy = cy - py1;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          
          const dot = (dx / dist) * edge.nx + (dy / dist) * edge.ny;
          if (dot > 0.01) {
            const incidentAngle = Math.acos(Math.min(1, dot));
            const density = (actualPxMm || targetPxMm) * (wd_mm / dist) * Math.cos(incidentAngle);
            if (density > maxDensity) maxDensity = density;
          }
        }
        
        let color = '#ef4444';
        if (maxDensity >= targetPxMm + 10) color = '#3b82f6';
        else if (maxDensity >= targetPxMm) color = '#22c55e';
        else if (maxDensity >= targetPxMm - 5) color = '#f59e0b';
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(px1 * scale, py1 * scale);
        ctx.lineTo(px2 * scale, py2 * scale);
        ctx.stroke();
      }
    });
    
    ctx.restore();
}

function render1DDensityGraph(prefix, actualPxMm) {
    const canvas = document.getElementById(prefix + 'density-graph-container');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const envW_m = parseFloat(document.getElementById(prefix + 'patientEnvW')?.value || 1.0);
    const envD_m = parseFloat(document.getElementById(prefix + 'patientEnvD')?.value || 0.6);
    const targetPxMm = parseFloat(document.getElementById(prefix + 'targetPxMm')?.value || 30);
    const wd_mm = parseFloat(document.getElementById(prefix + 'wdBox')?.value || 480);

    const w_mm = envW_m * 1000;
    const d_mm = envD_m * 1000;

    const angleSelect = document.getElementById(prefix + 'graph-angle') || document.getElementById('graph-angle');
    const angleDeg = parseInt(angleSelect ? angleSelect.value : '0');
    const isFrontBack = (angleDeg === 0 || angleDeg === 180);

    const depthSpanMm = isFrontBack ? d_mm : w_mm;

    // Draw background grid
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    const PADDING_LEFT = 40;
    const PADDING_BOTTOM = 30;
    const PADDING_TOP = 20;
    const PADDING_RIGHT = 20;
    const graphW = W - PADDING_LEFT - PADDING_RIGHT;
    const graphH = H - PADDING_BOTTOM - PADDING_TOP;

    // Draw grid lines
    const gridLines = 5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const maxDensity = Math.max((actualPxMm || targetPxMm) * 1.5, targetPxMm * 1.5, 45);

    // Y axis labels & grid lines
    for (let g = 0; g <= gridLines; g++) {
        const val = (g / gridLines) * maxDensity;
        const yPos = PADDING_TOP + graphH - (g / gridLines) * graphH;
        ctx.beginPath();
        ctx.moveTo(PADDING_LEFT, yPos);
        ctx.lineTo(PADDING_LEFT + graphW, yPos);
        ctx.stroke();
        ctx.fillText(Math.round(val) + '', PADDING_LEFT - 5, yPos);
    }

    // X axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('0 mm', PADDING_LEFT, PADDING_TOP + graphH + 5);
    ctx.fillText(Math.round(depthSpanMm / 2) + ' mm', PADDING_LEFT + graphW / 2, PADDING_TOP + graphH + 5);
    ctx.fillText(Math.round(depthSpanMm) + ' mm', PADDING_LEFT + graphW, PADDING_TOP + graphH + 5);

    // Draw target line
    const targetY = PADDING_TOP + graphH - (targetPxMm / maxDensity) * graphH;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PADDING_LEFT, targetY);
    ctx.lineTo(PADDING_LEFT + graphW, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#22c55e';
    ctx.textAlign = 'left';
    ctx.fillText('Target (' + targetPxMm + ' px/mm)', PADDING_LEFT + 5, targetY - 12);

    // Plot falloff curve
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const samples = 100;
    for (let i = 0; i < samples; i++) {
        const depthIntoEnvelope = (i / (samples - 1)) * depthSpanMm;
        const actualDistance = wd_mm + depthIntoEnvelope;
        const density = (actualPxMm || targetPxMm) * (wd_mm / actualDistance);
        
        const xPos = PADDING_LEFT + (i / (samples - 1)) * graphW;
        const yPos = PADDING_TOP + graphH - (density / maxDensity) * graphH;
        if (i === 0) {
            ctx.moveTo(xPos, yPos);
        } else {
            ctx.lineTo(xPos, yPos);
        }
    }
    ctx.stroke();
}
window.renderTopDownDensityMap = renderTopDownDensityMap;
window.render1DDensityGraph = render1DDensityGraph;

// 3. Three.js 3D Visualizer
function setupGantry3D() {
    let g3dContainer = document.getElementById('canvas3d-three');
    if (!g3dContainer || window.g3dInitialized) return;
    window.g3dInitialized = true;

    g3dScene = new THREE.Scene();
    g3dScene.background = new THREE.Color(0xf4f7f9);

    g3dCamera = new THREE.PerspectiveCamera(45, g3dContainer.clientWidth / g3dContainer.clientHeight, 0.1, 100);
    g3dCamera.position.set(3, 2, 4);

    g3dRenderer = new THREE.WebGLRenderer({ antialias: true });
    g3dRenderer.setSize(g3dContainer.clientWidth, g3dContainer.clientHeight);
    g3dContainer.appendChild(g3dRenderer.domElement);

    g3dControls = new THREE.OrbitControls(g3dCamera, g3dRenderer.domElement);
    g3dControls.target.set(0, 1, 0);
    g3dControls.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    g3dScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    g3dScene.add(dirLight);

    const gridHelper = new THREE.GridHelper(10, 20);
    g3dScene.add(gridHelper);

    stationaryGroup = new THREE.Group();
    g3dScene.add(stationaryGroup);

    mannequinGroup = new THREE.Group();
    stationaryGroup.add(mannequinGroup);
    
    // Basic mannequin representation
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffccaa });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    mannequinGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 1.95;
    mannequinGroup.add(head);

    gantryGroup = new THREE.Group();
    g3dScene.add(gantryGroup);

    requestAnimationFrame(animate);
    rebuildGantryMechanicals();
}

function resizeGantry3D() {
    let g3dContainer = document.getElementById('g3d-visualizer-wrapper') || document.getElementById('canvas3d-three');
    if (!g3dCamera || !g3dRenderer || !g3dContainer) return;
    g3dCamera.aspect = g3dContainer.clientWidth / g3dContainer.clientHeight;
    g3dCamera.updateProjectionMatrix();
    g3dRenderer.setSize(g3dContainer.clientWidth, g3dContainer.clientHeight);
}

function rebuildGantryMechanicals() {
    if (!gantryGroup) return;
    
    while (gantryGroup.children.length > 0) {
        gantryGroup.remove(gantryGroup.children[0]);
    }
    window.g3dColumns = [];

    
  const isModel2 = document.getElementById('model2-tab') && document.getElementById('model2-tab').style.display === 'block';
  const prefix = isModel2 ? 'm2-' : '';

  const patHeight = parseFloat(document.getElementById(prefix + 'patientEnvH')?.value || 2.0);
  const wd = parseFloat(document.getElementById(prefix + 'wdBox')?.value || 500) / 1000;
  const numColumns = isModel2 ? parseInt(document.getElementById('m2-numColumns')?.value || 2) : 1;
  const vertCams = parseInt(document.getElementById(prefix + 'g3dColCamsSlider')?.value || 5);
  const envW = parseFloat(document.getElementById(prefix + 'patientEnvW')?.value || 1.0);
  const envD = parseFloat(document.getElementById(prefix + 'patientEnvD')?.value || 0.6);

  // Envelope Box
    const boxGeo = new THREE.BoxGeometry(envW, patHeight, envD);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.3 });
    const boxMesh = new THREE.LineSegments(boxEdges, boxMat);
    boxMesh.position.y = patHeight / 2;
    gantryGroup.add(boxMesh);

    // Track Ring
    const radius = Math.max(envW, envD) / 2 + wd;
    const ringGeo = new THREE.TorusGeometry(radius, 0.02, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    gantryGroup.add(ring);

    const angleStep = Math.PI / 8; // Spacing between columns
    const startAngle = -(numColumns - 1) * angleStep / 2;

    for (let i = 0; i < numColumns; i++) {
        const colGroup = new THREE.Group();
        const colAngle = startAngle + i * angleStep;
        
        // Position column on the circular track
        colGroup.position.x = Math.sin(colAngle) * radius;
        colGroup.position.z = Math.cos(colAngle) * radius;
        
        // Face the center
        colGroup.rotation.y = colAngle;
        
        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, patHeight + 0.2);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = (patHeight + 0.2) / 2;
        colGroup.add(pole);
        
        // Base
        const baseGeo = new THREE.BoxGeometry(0.3, 0.1, 0.3);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.05;
        colGroup.add(base);

        // Cameras
        const stepH = patHeight / (vertCams + 1);
        for(let j = 0; j < vertCams; j++) {
            const camY = stepH * (j + 1);
            
            const camGeo = new THREE.BoxGeometry(0.08, 0.08, 0.15);
            const camMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
            const cam = new THREE.Mesh(camGeo, camMat);
            
            // Critical requirement: Face completely parallel to the person
            // By applying -colAngle, we perfectly cancel out the column's rotation.
            cam.rotation.y = -colAngle;
            
            // Mount the camera slightly behind the pole
            cam.position.set(0, camY, 0.05);
            
            // FOV Cone
            
            const isModel2 = document.getElementById('model2-tab') && document.getElementById('model2-tab').style.display === 'block';
            const prefix = isModel2 ? 'm2-' : '';
            const fovW = parseFloat(document.getElementById(prefix + 'fovVal')?.textContent) || (wd * 400);
            const fovH = parseFloat(document.getElementById(prefix + 'fovHVal')?.textContent) || (wd * 300);
            
            const fw = (fovW / 1000) / 2;
            const fh = (fovH / 1000) / 2;
            
            const pts = new Float32Array([
                0, 0, 0,          // tip at camera
                -fw, fh, -wd,     // top left
                 fw, fh, -wd,     // top right
                 fw, -fh, -wd,    // bottom right
                -fw, -fh, -wd     // bottom left
            ]);
            const idx = [
                0,1,2, 0,2,3, 0,3,4, 0,4,1, 1,2,3, 1,3,4
            ];
            const fovGeo = new THREE.BufferGeometry();
            fovGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
            fovGeo.setIndex(idx);
            
            const fovEdges = new THREE.EdgesGeometry(fovGeo);
            const fovMat = new THREE.LineBasicMaterial({ color: 0x3b82f6 });
            const fov = new THREE.LineSegments(fovEdges, fovMat);
cam.add(fov);
            colGroup.add(cam);
        }
        
        gantryGroup.add(colGroup);
        window.g3dColumns.push(colGroup);
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (g3dControls) g3dControls.update();
    
    if (window.g3dIsSweeping && gantryGroup) {
        if (!window.g3dSweepStart) window.g3dSweepStart = Date.now();
        const el = Date.now() - window.g3dSweepStart;
        if (el < 5000) {
            window.g3dSweepAngle = (el / 5000) * Math.PI * 2;
        } else {
            window.g3dSweepAngle = 0; 
            window.g3dIsSweeping = false; 
            window.g3dSweepStart = null;
        }
        gantryGroup.rotation.y = window.g3dSweepAngle;
    }
    
    if (g3dRenderer && g3dScene && g3dCamera) {
        g3dRenderer.render(g3dScene, g3dCamera);
    }
}

// 4. Initialization

function updateOverlapValue(val, prefix = '') {
    const el = document.getElementById(prefix + 'overlapValText');
    if (el) el.textContent = val + '%';
    
    // Sync the other tab's overlap slider and text
    const otherPrefix = prefix === '' ? 'm2-' : '';
    const otherSlider = document.getElementById(otherPrefix + 'overlapX');
    const otherText = document.getElementById(otherPrefix + 'overlapValText');
    
    if (otherSlider && otherSlider.value !== val) {
        otherSlider.value = val;
    }
    if (otherText) {
        otherText.textContent = val + '%';
    }
    
    calculate();
}
window.updateOverlapValue = updateOverlapValue;

document.addEventListener('DOMContentLoaded', () => {
  const syncPairs = [
    ['patientEnvW', 'm2-patientEnvW'],
    ['patientEnvD', 'm2-patientEnvD'],
    ['patientEnvH', 'm2-patientEnvH'],
    ['maxFootprintW', 'm2-maxFootprintW'],
    ['maxFootprintD', 'm2-maxFootprintD'],
    ['maxHeight', 'm2-maxHeight'],
    ['sw', 'm2-sw'],
    ['sh', 'm2-sh'],
    ['pixelSize', 'm2-pixelSize'],
    ['pxw', 'm2-pxw'],
    ['pxh', 'm2-pxh'],
    ['wdSlider', 'm2-wdSlider', 'wdBox', 'm2-wdBox'],
    ['flSlider', 'm2-flSlider', 'flBox', 'm2-flBox'],
    ['apSlider', 'm2-apSlider', 'apBox', 'm2-apBox'],
    ['reqResSlider', 'm2-reqResSlider', 'reqResBox', 'm2-reqResBox'],
    ['cocSlider', 'm2-cocSlider', 'cocBox', 'm2-cocBox'],
    ['overlapX', 'm2-overlapX']
  ];

  // Sync inputs across tabs
  syncPairs.forEach(ids => {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        ['input', 'change'].forEach(evt => {
          el.addEventListener(evt, (e) => {
            const val = e.target.value;
            ids.forEach(targetId => {
              const targetEl = document.getElementById(targetId);
              if (targetEl && targetEl !== e.target && targetEl.value !== val) {
                targetEl.value = val;
              }
            });
            if (id === 'overlapX' || id === 'm2-overlapX') {
                const prefix = id.startsWith('m2-') ? 'm2-' : '';
                updateOverlapValue(val, prefix);
            } else {
                calculate();
            }
          });
        });
      }
    });
  });

  // General listeners for ALL inputs/selects to trigger calculations & handle preset updates dynamically
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
      ['input', 'change'].forEach(evt => {
          input.addEventListener(evt, () => {
              const prefix = input.id.startsWith('m2-') ? 'm2-' : '';
              const baseId = input.id.replace('m2-', '');
              if (baseId === 'sensorPreset') {
                  handleSensorPresetChange(prefix);
                  syncSensorDimensions(prefix, prefix === '' ? 'm2-' : '');
              }
              if (baseId === 'cocPreset') {
                  handleCoCPresetChange(prefix);
                  syncCoC(prefix, prefix === '' ? 'm2-' : '');
              }
              calculate();
          });
      });
  });

  switchTab('model2-tab');
  const sweepBtn = document.getElementById('trigger360Sweep');
  if (sweepBtn) {
      sweepBtn.addEventListener('click', () => {
          window.g3dIsSweeping = true;
          window.g3dSweepStart = Date.now();
      });
  }
  window.addEventListener('resize', resizeGantry3D);
});






































































































































































































































































































































  const m2_sensorPreset = document.getElementById('m2-sensorPreset');
  if (m2_sensorPreset) {
    m2_sensorPreset.addEventListener('change', (e) => {
      const preset = m2_sensorPreset.value;
      const swEl = document.getElementById('m2-sw');
      const shEl = document.getElementById('m2-sh');
      const pixelSizeEl = document.getElementById('m2-pixelSize');
      const pxwEl = document.getElementById('m2-pxw');
      const pxhEl = document.getElementById('m2-pxh');
      
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
      
      calculate();
    });
  }

  const cocPreset = document.getElementById('cocPreset');
  if (cocPreset) {
    cocPreset.addEventListener('change', (e) => {
      const preset = e.target.value;
      const pixelSizeVal = parseFloat(document.getElementById('pixelSize').value) || 3.45;
      const swVal = parseFloat(document.getElementById('sw').value) || 46.15;
      const shVal = parseFloat(document.getElementById('sh').value) || 32.87;
      const m2_cocBox = document.getElementById('m2-cocBox') || document.getElementById('cocBox');
      const m2_cocSlider = document.getElementById('m2-cocSlider') || document.getElementById('cocSlider');
      if (!m2_cocBox || !m2_cocSlider) return;

      if (preset === 'pixel') {
        m2_cocBox.value = pixelSizeVal.toFixed(2);
        m2_cocSlider.value = pixelSizeVal;
      } else if (preset === 'sensor-fraction') {
        const diagonal = Math.sqrt(swVal*swVal + shVal*shVal);
        const fraction = (diagonal / 1500) * 1000; 
        m2_cocBox.value = fraction.toFixed(2);
        m2_cocSlider.value = fraction;
      } else if (preset === 'traditional') {
        m2_cocBox.value = 25.0;
        m2_cocSlider.value = 25.0;
      }
      calculate();
    });
  }

  
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
const m2_patientEnvH = document.getElementById('m2-patientEnvH');



















































































































































  
  
  function renderTopDownDensityMap(prefix, actualPxMm) {
    const canvas = document.getElementById('m2-density-map');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    ctx.clearRect(0, 0, W, H);
    
    const envW_m = parseFloat((document.getElementById(prefix + 'patientEnvW') || {}).value) || 1.0;
    const envD_m = parseFloat((document.getElementById(prefix + 'patientEnvD') || {}).value) || 0.6;
    const targetPxMmEl = document.getElementById(prefix + 'targetPxMm') || document.getElementById('targetPxMm') || {value: 30};
    const targetPxMm = parseFloat(targetPxMmEl.value) || 30;
    const wdEl = document.getElementById(prefix === 'm2-' ? 'm2-wdBox' : 'wdBox');
    const wd_mm = wdEl ? parseFloat(wdEl.value) : 480;
    
    const w_mm = envW_m * 1000;
    const d_mm = envD_m * 1000;
    
    const gantryRadiusX = wd_mm + (w_mm / 2);
    const gantryRadiusY = wd_mm + (d_mm / 2);
    
    const paramsDiv = document.getElementById('m2-map-params');
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
      // X labels
      ctx.fillText(Math.round(w_mm/2) + 'mm', (w_mm/2 * scale) - 35, 5);
      ctx.fillText('-' + Math.round(w_mm/2) + 'mm', -(w_mm/2 * scale) + 5, 5);
      // Y labels
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
    
    // Camera positions (4 stops for now on ellipse)
    const camAngles = [0, 90, 180, 270].map(deg => deg * Math.PI / 180);
    ctx.fillStyle = '#64748b';
    camAngles.forEach(a => {
      const cx = gantryRadiusX * Math.sin(a) * scale;
      const cy = -gantryRadiusY * Math.cos(a) * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw Rectangular Envelope colored by cumulative density
    // 4 edges: Top, Right, Bottom, Left
    const rectHalfW = w_mm / 2;
    const rectHalfD = d_mm / 2;
    const edges = [
      { // Top (Back face)
        x1: -rectHalfW, y1: -rectHalfD, x2: rectHalfW, y2: -rectHalfD, nx: 0, ny: -1
      },
      { // Right (Right face)
        x1: rectHalfW, y1: -rectHalfD, x2: rectHalfW, y2: rectHalfD, nx: 1, ny: 0
      },
      { // Bottom (Front face)
        x1: rectHalfW, y1: rectHalfD, x2: -rectHalfW, y2: rectHalfD, nx: 0, ny: 1
      },
      { // Left (Left face)
        x1: -rectHalfW, y1: rectHalfD, x2: -rectHalfW, y2: -rectHalfD, nx: -1, ny: 0
      }
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
            // Nominal distance to this face from the perpendicular camera is exactly wd_mm
            const incidentAngle = Math.acos(Math.min(1, dot));
            // Density proportional to (wd/dist) and cos(angle)
            const density = (actualPxMm || targetPxMm) * (wd_mm / dist) * Math.cos(incidentAngle);
            if (density > maxDensity) maxDensity = density;
          }
        }
        
        let color = '#ef4444';
        if (maxDensity >= targetPxMm + 10) color = '#3b82f6';
        else if (maxDensity >= targetPxMm) color = '#22c55e';
        else if (maxDensity >= targetPxMm - 5) color = '#f59e0b';
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        // Translate to canvas coords (sin/cos orientation matches 3D visualizer)
        // Wait, 3D visualizer has Z as depth. Front face is positive Z.
        // If cy is depth, let's map X->X and Y->Z
        ctx.moveTo(px1 * scale, py1 * scale);
        ctx.lineTo(px2 * scale, py2 * scale);
        ctx.stroke();
      }
    });
    
    ctx.restore();
  }

  function render1DDensityGraph(prefix, actualPxMm) {
    const canvas = document.getElementById('m2-density-graph-container');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const envW_m = parseFloat((document.getElementById(prefix + 'patientEnvW') || {}).value) || 1.0;
    const envD_m = parseFloat((document.getElementById(prefix + 'patientEnvD') || {}).value) || 0.6;
    const targetPxMmEl = document.getElementById(prefix + 'targetPxMm') || document.getElementById('targetPxMm');
    const targetPxMm = targetPxMmEl ? parseFloat(targetPxMmEl.value) : 30;
    const wdEl = document.getElementById(prefix === 'm2-' ? 'm2-wdBox' : 'wdBox');
    const wd_mm = wdEl ? parseFloat(wdEl.value) : 800;

    const w_mm = envW_m * 1000;
    const d_mm = envD_m * 1000;

    const angleSelect = document.getElementById('m2-graph-angle');
    const angleDeg = parseInt(angleSelect ? angleSelect.value : '0');
    const isFrontBack = (angleDeg === 0 || angleDeg === 180);

    // If camera is at Front (0), it looks through the Depth (D)
    // If camera is at Side (90), it looks through the Width (W)
    const depthSpanMm = isFrontBack ? d_mm : w_mm;
    const faceLabel = isFrontBack ? 'Depth' : 'Width';
    
    // Update HTML Labels
    const el_title = canvas.parentElement.querySelector('div');
    if (el_title) el_title.textContent = '1D Depth Falloff Profile (Pixel Density vs Depth)';
    
    const el_xLabel = document.getElementById('m2-graph-x-label');
    const el_xLeft = document.getElementById('m2-graph-x-left');
    const el_xRight = document.getElementById('m2-graph-x-right');
    if (el_xLabel) el_xLabel.textContent = 'â†  Distance into Envelope (mm) â†’';
    if (el_xLeft) el_xLeft.textContent = '0 mm (Start)';
    if (el_xRight) el_xRight.textContent = depthSpanMm.toFixed(0) + ' mm (End)';

    const paramsDiv = document.getElementById('m2-graph-params');
    if (paramsDiv) {
      paramsDiv.innerHTML = 'Target: ' + targetPxMm + ' px/mm | Actual at WD: ' + (actualPxMm ? actualPxMm.toFixed(1) : targetPxMm) + ' px/mm | WD: ' + wd_mm + ' mm';
    }

    const samples = 120;
    const PADDING_LEFT = 40;
    const PADDING_BOTTOM = 25;
    const PADDING_TOP = 20;
    const PADDING_RIGHT = 10;
    const graphW = W - PADDING_LEFT - PADDING_RIGHT;
    const graphH = H - PADDING_BOTTOM - PADDING_TOP;

    const densities = [];
    for (let i = 0; i < samples; i++) {
      const depthIntoEnvelope = (i / (samples - 1)) * depthSpanMm;
      // Pixel Density = Nominal * (Nominal WD / Actual Distance)
      const actualDistance = wd_mm + depthIntoEnvelope;
      const density = (actualPxMm || targetPxMm) * (wd_mm / actualDistance);
      densities.push(density);
    }

    const maxDensity = Math.max(...densities, targetPxMm * 1.2);

    // Draw background grid
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Draw horizontal grid lines
    const gridLines = 5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let g = 0; g <= gridLines; g++) {
      const yPos = PADDING_TOP + graphH - (g / gridLines) * graphH;
      ctx.beginPath();
      ctx.moveTo(PADDING_LEFT, yPos);
      ctx.lineTo(PADDING_LEFT + graphW, yPos);
      ctx.stroke();
      
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
 // Geometry
    const magnification = fl / (wd - fl);
    const fovW = sensorW / (magnification || 0.001);
    const fovH = sensorH / (magnification || 0.001);
    
    fovVal.textContent = fovW.toFixed(0);
    fovHVal.textContent = fovH.toFixed(0);
    
    const densityW = pxWidth / (fovW || 0.001);
    const densityH = pxHeight / (fovH || 0.001);
    const currentDensity = Math.min(densityW, densityH);
    
    // CoC & Diffraction
    const cocUm = parseFloat(cocBox.value) || 0.1;
    const cocMm = cocUm / 1000;
    
    const airyDiskUm = 2.44 * 0.55 * ap;
    diffBlur.textContent = airyDiskUm.toFixed(2);
    
    let isDiffractionOk = airyDiskUm <= pixelSizeUm;
    diffStatus.textContent = isDiffractionOk ? "OK" : "Diff Limit";
    diffStatus.className = `badge ${isDiffractionOk ? 'badge-pass' : 'badge-warn'}`;
    
    const isResolutionOk = currentDensity >= reqRes;
    geoRes.textContent = currentDensity.toFixed(2);
    geoResStatus.textContent = isResolutionOk ? "PASS" : "FAIL";
    geoResStatus.className = `badge ${isResolutionOk ? 'badge-pass' : 'badge-fail'}`;
    
    // Populate Horizontal and Vertical density separately
    const geoResHEl = document.getElementById(prefix + 'geoResH');
    const geoResVEl = document.getElementById(prefix + 'geoResV');
    if (geoResHEl) geoResHEl.textContent = densityW.toFixed(2);
    if (geoResVEl) geoResVEl.textContent = densityH.toFixed(2);
    
    // Total Array FOV and Avg Envelope Density
    {
      const isM2 = (prefix === 'm2-');
      const nColsInput = document.getElementById('m2-numColumns');
      const nCols = (isM2 && nColsInput) ? parseInt(nColsInput.value) : 1;
      const ovPct = (parseFloat((document.getElementById(prefix + 'overlapX') || {}).value) || 0) / 100;
      const patHM2 = (patientEnvH ? parseFloat(patientEnvH.value) : 2.0) || 2.0;
      const patDM2 = (patientEnvD ? parseFloat(patientEnvD.value) : 0.6) || 0.6;
      
      const stepHmm = fovH * (1 - ovPct);
      let vCamsCalc = 1;
      if (patHM2 * 1000 > fovH) {
        vCamsCalc = Math.ceil((patHM2 * 1000 - fovH) / (stepHmm || 0.001)) + 1;
      }
      vCamsCalc = Math.max(1, vCamsCalc);
      
      const tFovW = fovW + (nCols - 1) * fovW * (1 - ovPct);
      const tFovH = fovH + (vCamsCalc - 1) * fovH * (1 - ovPct);
      
      const totalArrayFovEl = document.getElementById(prefix + 'totalArrayFov');
      if (totalArrayFovEl) {
        totalArrayFovEl.innerHTML = (tFovW/1000).toFixed(2) + 'm W \u00d7 ' + (tFovH/1000).toFixed(2) + 'm H';
      }
      
      const avgEnvDensityEl = document.getElementById(prefix + 'avgEnvDensity');
      if (avgEnvDensityEl) {
        const depthMm = patDM2 * 1000;
        const backDens = currentDensity * (wd / (wd + depthMm));
        const avgDens = (currentDensity + backDens) / 2;
        avgEnvDensityEl.textContent = avgDens.toFixed(2);
      }
    }
    
    if (resolutionExplanation) resolutionExplanation.style.display = 'none';
    if (resolutionImpactText) resolutionImpactText.style.display = 'none';
    
    // Depth of Field Calculation
    let dof = 0;
    let near = 0;
    let far = Infinity;

    if (magnification > 0) {
      const N = ap;
      const c = cocMm;
      const f = fl;
      const s = wd;
      
      const denomNear = (f * f) + N * c * (s - f);
      const denomFar = (f * f) - N * c * (s - f);
      
      if (denomNear > 0) {
        near = (s * f * f) / denomNear;
      } else {
        near = 0;
      }
      
      if (denomFar > 0) {
        far = (s * f * f) / denomFar;
        dof = far - near;
      } else {
        far = Infinity;
        dof = 9999;
      }
      
      singleDOF.textContent = dof >= 9999 ? "Infinite" : `${dof.toFixed(1)} mm`;
      nearLimit.textContent = `${near.toFixed(1)} mm`;
      farLimit.textContent = far >= 9999 ? "Infinite" : `${far.toFixed(1)} mm`;
    } else {
      singleDOF.textContent = "Infinite";
      nearLimit.textContent = "0.0 mm";
      farLimit.textContent = "Infinite";
      dof = 9999;
    }
    
    const totalTarget = 100; 
    const stacks = dof > 0 ? Math.ceil(totalTarget / dof) : 1;
    stackSize.textContent = dof >= 100 ? "1" : (isFinite(stacks) && stacks > 0 ? stacks : "Infinite");




    
    if (!patientEnvH) {
      console.error("patientEnvH is missing for prefix: ", prefix);
    }
    const patHeightM = (patientEnvH ? parseFloat(patientEnvH.value) : 2.0) || 2.0;


















    const totalCams = vertCamsNeeded; // Auto-driven count

      const numColsEl = document.getElementById('m2-numColumns');
      const numColumns = (isModel2 && numColsEl) ? parseInt(numColsEl.value) : 1;
      
      if (isModel2 && document.getElementById('m2-numColumnsText')) {
          document.getElementById('m2-numColumnsText').textContent = numColumns + ' columns';
      }
      
      const totalFovW = fovW + (numColumns - 1) * (fovW * (1 - ov));
      const totalFovH = fovH + (vertCamsNeeded - 1) * (fovH * (1 - ov));
      
      const totalFovText = document.getElementById(prefix + 'totalFovText');
      if (totalFovText) {
          totalFovText.innerHTML = (totalFovW/1000).toFixed(2) + 'm W &times; ' + (totalFovH/1000).toFixed(2) + 'm H';
      }
      
      const totalFovResultsText = document.getElementById(prefix === '' ? 'totalFovResultsText' : prefix + 'totalFovResultsText');
      if (totalFovResultsText) {
          totalFovResultsText.innerHTML = (totalFovW/1000).toFixed(2) + 'm W &times; ' + (totalFovH/1000).toFixed(2) + 'm H';
      }
      
      const avgDensityText = document.getElementById(prefix === '' ? 'avgDensityText' : prefix + 'avgDensityText');
      if (avgDensityText && typeof currentDensity !== 'undefined') {
          const depthSpanMm = (patientEnvD ? parseFloat(patientEnvD.value) : 0.6) * 1000;
          const backDensity = currentDensity * (wd / (wd + depthSpanMm));
          const avgDensity = (currentDensity + backDensity) / 2;
          avgDensityText.textContent = avgDensity.toFixed(2);









































      const m2ColCount = (isModel2 && document.getElementById('m2-numColumns')) ? parseInt(document.getElementById('m2-numColumns').value) : 2;
































    populateOptimizationMatrix(prefix);
    if (isModel2) {
      const actualPxMm = Math.min(pxWidth / (fovW || 1), pxHeight / (fovH || 1));
      renderTopDownDensityMap(prefix, actualPxMm);
      render1DDensityGraph(prefix, actualPxMm);
    }
  }





























































  window.updateOverlapValue = function(val, prefix = '') {

















































































































































































































































































    
    const stepBtnThree = document.getElementById('step-btn-three');
    if (stepBtnThree) {
      stepBtnThree.addEventListener('click', function() {
        if (!window.g3dSweepActive && !window.g3dStepActive && window.g3dArchitecture === 'model2') {
          window.g3dStepActive = true;
          window.g3dTargetAngle = g3dSweepAngle + Math.PI / 2; window.lastStepTs = Date.now();
          this.innerHTML = '<span>⏳ Rotating...</span>';
        }
      });
    }



















      
      if (window.g3dStepActive) {
        g3dSweepAngle += (Date.now() - (window.lastStepTs || Date.now())) * 0.001 * 1.5;
        window.lastStepTs = Date.now();
        if (g3dSweepAngle >= window.g3dTargetAngle) {
          g3dSweepAngle = window.g3dTargetAngle;
          window.g3dStepActive = false;
          window.lastStepTs = null;
          const stepBtn = document.getElementById('step-btn-three');
          if (stepBtn) stepBtn.innerHTML = '<span>🔄 Rotate One Step</span>';
        }
        const _d1 = document.getElementById('angle-text-three');
        const _d2 = document.getElementById('time-text-three');
        if (_d1) _d1.textContent = ((g3dSweepAngle / (Math.PI * 2)) * 360).toFixed(1) + '°';
        if (_d2) _d2.textContent = '-- step';















































            b2.innerHTML = window.g3dArchitecture === 'model2' ? '<span>⚡ Trigger 4-Stop Sweep</span>' : '<span>⚡ Trigger 360° Sweep</span>';
























        window.g3dColumns.forEach((col, idx) => {
            let angleOffset = 0;
            if (window.g3dArchitecture === 'model2') {
                const numCols = window.g3dColumns.length;
                angleOffset = (idx - (numCols - 1) / 2) * (2 * dynamicTheta);
            }
            const angle = g3dSweepAngle + angleOffset;
            col.position.set(Math.sin(angle) * xRadius, 0, Math.cos(angle) * zRadius);
            col.rotation.y = window.g3dArchitecture === 'model2' ? g3dSweepAngle : angle;




























































































  
  function rebuildGantryMechanicals() {
    if (!window.g3dCamHeights || window.g3dCamHeights.length === 0) {
      console.warn("g3dCamHeights was empty! Recovering with defaults...");
      window.g3dCamHeights = [0.28, 0.68, 1.10, 1.50, 1.90]; // 5 cams fallback
    }



























    const m2Input = document.getElementById('m2-numColumns');










































































































































































































































































































































































































































































































































































































  }

// ============================================================
// REWRITTEN 3D VISUALIZER LOGIC
// ============================================================
var g3dScene, g3dCamera, g3dRenderer, g3dControls;
var gantryGroup, mannequinGroup, headMesh, stationaryGroup;
var g3dMixer = null;
var g3dClock = new THREE.Clock();
var nathanModel = null;
var dirLight, fillLight;
var g3dSkinMaterials = [];
window.g3dIlluminationMode = 'cross';
var g3dContainer;
var g3dInitialized = false;
var g3dIsSweeping = false, g3dSweepAngle = 0, g3dSweepStart = null;
window.g3dColumns = [];

function setupGantry3D() {
  g3dContainer = document.getElementById('g3d-visualizer-wrapper');
  if (!g3dContainer) g3dContainer = document.getElementById('canvas3d-three');
  if (!g3dContainer || g3dInitialized) return;
  g3dInitialized = true;

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

  dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
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
}

function resizeGantry3D() {
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

  const patHeight = parseFloat(document.getElementById('m2-patientEnvH')?.value || 2.0);
  const wd = parseFloat(document.getElementById('m2-wdBox')?.value || 500) / 1000;
  const numColumns = parseInt(document.getElementById('m2-numColumns')?.value || 2);
  const vertCams = parseInt(document.getElementById('m2-g3dColCamsSlider')?.value || 5);

  // Envelope Box
  const envW = parseFloat(document.getElementById('m2-patientEnvW')?.value || 1.0);
  const envD = parseFloat(document.getElementById('m2-patientEnvD')?.value || 0.6);
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

  const angleStep = Math.PI / 8; // spacing between columns
  const startAngle = -(numColumns - 1) * angleStep / 2;

  for (let i = 0; i < numColumns; i++) {
    const colGroup = new THREE.Group();
    const colAngle = startAngle + i * angleStep;
    
    colGroup.position.x = Math.sin(colAngle) * radius;
    colGroup.position.z = Math.cos(colAngle) * radius;
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
      cam.position.set(0, camY, -0.05);
      
      // FOV Cone
      const fovGeo = new THREE.ConeGeometry(wd * 0.4, wd, 4, 1, true);
      const fovEdges = new THREE.EdgesGeometry(fovGeo);
      const fovMat = new THREE.LineBasicMaterial({ color: 0x3b82f6 });
      const fov = new THREE.LineSegments(fovEdges, fovMat);
      fov.rotation.x = -Math.PI / 2;
      fov.rotation.y = Math.PI / 4;
      fov.position.z = -wd / 2;
      
      cam.add(fov);
      colGroup.add(cam);
    }
    
    gantryGroup.add(colGroup);
    window.g3dColumns.push(colGroup);
  }
}

function updateGantry3D(wdMm, patWMm, fovWMm, fovHMm) {
  rebuildGantryMechanicals();
}

function animate() {
  requestAnimationFrame(animate);
  if (g3dControls) g3dControls.update();
  
  if (g3dIsSweeping && gantryGroup) {
    if (!g3dSweepStart) g3dSweepStart = Date.now();
    const el = Date.now() - g3dSweepStart;
    if (el < 5000) {
      g3dSweepAngle = (el / 5000) * Math.PI * 2;
    } else {
      g3dSweepAngle = 0; 
      g3dIsSweeping = false; 
      g3dSweepStart = null;
    }
    gantryGroup.rotation.y = g3dSweepAngle;
  }
  
  if (g3dRenderer && g3dScene && g3dCamera) {
    g3dRenderer.render(g3dScene, g3dCamera);
  }
}

window.handleGlbData = function(arrayBuffer) { }
window.handleModelUpload = function(files) { }
function setupRequirementHighlighting() { }
function createTextSprite(text, color, bgColor) { return new THREE.Sprite(); }

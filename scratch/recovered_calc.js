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
          this.innerHTML = '<span>ΓÅ│ Rotating...</span>';
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
          if (stepBtn) stepBtn.innerHTML = '<span>≡ƒöä Rotate One Step</span>';
        }
        const _d1 = document.getElementById('angle-text-three');
        const _d2 = document.getElementById('time-text-three');
        if (_d1) _d1.textContent = ((g3dSweepAngle / (Math.PI * 2)) * 360).toFixed(1) + '┬░';
        if (_d2) _d2.textContent = '-- step';















































            b2.innerHTML = window.g3dArchitecture === 'model2' ? '<span>ΓÜí Trigger 4-Stop Sweep</span>' : '<span>ΓÜí Trigger 360┬░ Sweep</span>';
























        window.g3dColumns.forEach((col, idx) => {
            let angleOffset = 0;
            if (window.g3dArchitecture === 'model2') {
                const numCols = window.g3dColumns.length;
                angleOffset = (idx - (numCols - 1) / 2) * (2 * dynamicTheta);
            }
            const angle = g3dSweepAngle + angleOffset;
            col.position.set(Math.sin(angle) * xRadius, 0, Math.cos(angle) * zRadius);
            col.rotation.y = window.g3dArchitecture === 'model2' ? g3dSweepAngle : angle;




























































































  
  
const fs = require('fs');
let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');

// =====================================================================
// 1. Replace the cross-tab input mirroring logic with 3-way sync
// =====================================================================
const oldMirroringLogic = `  // Cross-tab input mirroring logic
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
            if (id === 'wdSlider') document.getElementById('m2-wdBox').value = el1.value;
            if (id === 'wdBox') document.getElementById('m2-wdSlider').value = el1.value;
            if (id === 'flSlider') document.getElementById('m2-flBox').value = el1.value;
            if (id === 'flBox') document.getElementById('m2-flSlider').value = el1.value;
            if (id === 'apSlider') document.getElementById('m2-apBox').value = el1.value;
            if (id === 'apBox') document.getElementById('m2-apSlider').value = el1.value;
            if (id === 'reqResSlider') document.getElementById('m2-reqResBox').value = el1.value;
            if (id === 'reqResBox') document.getElementById('m2-reqResSlider').value = el1.value;
            if (id === 'cocSlider') document.getElementById('m2-cocBox').value = el1.value;
            if (id === 'cocBox') document.getElementById('m2-cocSlider').value = el1.value;

            if (id === 'sensorPreset' || id === 'cocPreset') {
              el2.dispatchEvent(new Event('change'));
            }
            calculate();
          }
        });
        el2.addEventListener(evt, () => {
          if (el1.value !== el2.value) {
            el1.value = el2.value;
            if (id === 'wdSlider') document.getElementById('wdBox').value = el2.value;
            if (id === 'wdBox') document.getElementById('wdSlider').value = el2.value;
            if (id === 'flSlider') document.getElementById('flBox').value = el2.value;
            if (id === 'flBox') document.getElementById('flSlider').value = el2.value;
            if (id === 'apSlider') document.getElementById('apBox').value = el2.value;
            if (id === 'apBox') document.getElementById('apSlider').value = el2.value;
            if (id === 'reqResSlider') document.getElementById('reqResBox').value = el2.value;
            if (id === 'reqResBox') document.getElementById('reqResSlider').value = el2.value;
            if (id === 'cocSlider') document.getElementById('cocBox').value = el2.value;
            if (id === 'cocBox') document.getElementById('cocSlider').value = el2.value;

            if (id === 'sensorPreset' || id === 'cocPreset') {
              el1.dispatchEvent(new Event('change'));
            }
            calculate();
          }
        });
      });
    }
  });`;

const newMirroringLogic = `  // Cross-tab input mirroring logic (3-way sync across Option A, Model 2, and Model 3)
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
    const el3 = document.getElementById('m3-' + id);
    
    const elements = [
      { el: el1, prefix: '' },
      { el: el2, prefix: 'm2-' },
      { el: el3, prefix: 'm3-' }
    ];
    
    elements.forEach((src) => {
      if (!src.el) return;
      ['input', 'change'].forEach(evt => {
        src.el.addEventListener(evt, () => {
          elements.forEach((dst) => {
            if (dst.el && dst.el !== src.el && dst.el.value !== src.el.value) {
              dst.el.value = src.el.value;
              
              const pref = dst.prefix;
              if (id === 'wdSlider') {
                const box = document.getElementById(pref + 'wdBox');
                if (box) box.value = src.el.value;
              }
              if (id === 'wdBox') {
                const slider = document.getElementById(pref + 'wdSlider');
                if (slider) slider.value = src.el.value;
              }
              if (id === 'flSlider') {
                const box = document.getElementById(pref + 'flBox');
                if (box) box.value = src.el.value;
              }
              if (id === 'flBox') {
                const slider = document.getElementById(pref + 'flSlider');
                if (slider) slider.value = src.el.value;
              }
              if (id === 'apSlider') {
                const box = document.getElementById(pref + 'apBox');
                if (box) box.value = src.el.value;
              }
              if (id === 'apBox') {
                const slider = document.getElementById(pref + 'apSlider');
                if (slider) slider.value = src.el.value;
              }
              if (id === 'reqResSlider') {
                const box = document.getElementById(pref + 'reqResBox');
                if (box) box.value = src.el.value;
              }
              if (id === 'reqResBox') {
                const slider = document.getElementById(pref + 'reqResSlider');
                if (slider) slider.value = src.el.value;
              }
              if (id === 'cocSlider') {
                const box = document.getElementById(pref + 'cocBox');
                if (box) box.value = src.el.value;
              }
              if (id === 'cocBox') {
                const slider = document.getElementById(pref + 'cocSlider');
                if (slider) slider.value = src.el.value;
              }

              if (id === 'sensorPreset' || id === 'cocPreset') {
                dst.el.dispatchEvent(new Event('change'));
              }
            }
          });
          
          const srcPref = src.prefix;
          if (id === 'wdSlider') {
            const box = document.getElementById(srcPref + 'wdBox');
            if (box) box.value = src.el.value;
          }
          if (id === 'wdBox') {
            const slider = document.getElementById(srcPref + 'wdSlider');
            if (slider) slider.value = src.el.value;
          }
          if (id === 'flSlider') {
            const box = document.getElementById(srcPref + 'flBox');
            if (box) box.value = src.el.value;
          }
          if (id === 'flBox') {
            const slider = document.getElementById(srcPref + 'flSlider');
            if (slider) slider.value = src.el.value;
          }
          if (id === 'apSlider') {
            const box = document.getElementById(srcPref + 'apBox');
            if (box) box.value = src.el.value;
          }
          if (id === 'apBox') {
            const slider = document.getElementById(srcPref + 'apSlider');
            if (slider) slider.value = src.el.value;
          }
          if (id === 'reqResSlider') {
            const box = document.getElementById(srcPref + 'reqResBox');
            if (box) box.value = src.el.value;
          }
          if (id === 'reqResBox') {
            const slider = document.getElementById(srcPref + 'reqResSlider');
            if (slider) slider.value = src.el.value;
          }
          if (id === 'cocSlider') {
            const box = document.getElementById(srcPref + 'cocBox');
            if (box) box.value = src.el.value;
          }
          if (id === 'cocBox') {
            const slider = document.getElementById(srcPref + 'cocSlider');
            if (slider) slider.value = src.el.value;
          }

          calculate();
        });
      });
    });
  });`;

appJs = appJs.replace(oldMirroringLogic.replace(/\r?\n/g, '\r\n'), newMirroringLogic.replace(/\r?\n/g, '\r\n'));
appJs = appJs.replace(oldMirroringLogic.replace(/\r?\n/g, '\n'), newMirroringLogic.replace(/\r?\n/g, '\n'));
console.log("Patched mirroring logic.");

// =====================================================================
// 2. Fix the HUD overlay text to calculate and display track diameter (W & D) instead of radius
// and add full Model 3 HUD support.
// =====================================================================
const oldHUDLogic = `      // Update HUD overlay text
      const hudEl = document.getElementById('g3d-hud-overlay');
      if (hudEl) {
        const patW = g3dPatW, patD = g3dPatD, patH = g3dPatH, wd = g3dWD;
        const xRadius = patW / 2 + wd;
        const zRadius = patD / 2 + wd;
        var isModel2 = window.g3dArchitecture === 'model2';
        
        let archTitle = '⚙ Option A — Rotating Column Gantry';
        let camCountText = \`\${g3dCamHeights.length} cameras\`;
        let positionText = \`Column at \${((g3dSweepAngle/(Math.PI*2))*360).toFixed(1)}°\`;
        
        if (isModel2) {
          archTitle = '⚙ Model 2 — Dual-Column Gantry (Stereoscopic Pair)';
          camCountText = \`\${g3dCamHeights.length} cams/col | \${2 * g3dCamHeights.length} total\`;
          const baseDeg = (g3dSweepAngle/(Math.PI*2))*360;
          const thetaDeg = (window.g3dDynamicTheta || 0.26) * (180 / Math.PI);
          const col1Angle = (baseDeg - thetaDeg + 360) % 360;
          const col2Angle = (baseDeg + thetaDeg + 360) % 360;
          positionText = \`Cameras parallel maintaining overlap (\${col1Angle.toFixed(1)}° & \${col2Angle.toFixed(1)}°)\`;
        }
        
        hudEl.innerHTML = \`
          <div style="font-weight:bold; font-size:12.5px; color:#0f172a; margin-bottom:4px;">\${archTitle}</div>
          <div>Patient Envelope: \${g3dPatW.toFixed(1)}m W × \${g3dPatD.toFixed(1)}m D × \${g3dPatH.toFixed(1)}m H</div>
          <div>Gantry Track: \${xRadius.toFixed(2)}m W × \${zRadius.toFixed(2)}m D (Elliptical)</div>
          <div>Working Distance: \${(wd*1000).toFixed(0)}mm from Envelope | \${camCountText}</div>
          <div style="color:var(--warn); font-weight:700; margin-top:2px;">Drag to orbit · \${positionText}</div>
        \`;
      }`;

const newHUDLogic = `      // Update HUD overlay text
      const hudEl = document.getElementById('g3d-hud-overlay');
      if (hudEl) {
        const patW = g3dPatW, patD = g3dPatD, patH = g3dPatH, wd = g3dWD;
        const xRadius = patW / 2 + wd;
        const zRadius = patD / 2 + wd;
        
        // Track dimensions should be diameter (Width and Depth of the loop), not radius
        const trackW = 2 * xRadius;
        const trackD = 2 * zRadius;

        var isModel2 = window.g3dArchitecture === 'model2';
        var isModel3 = window.g3dArchitecture === 'model3';
        
        let archTitle = '⚙ Option A — Rotating Column Gantry';
        let camCountText = \`${g3dCamHeights.length} cameras\`;
        let positionText = \`Column at ${((g3dSweepAngle/(Math.PI*2))*360).toFixed(1)}°\`;
        
        if (isModel2) {
          archTitle = '⚙ Model 2 — Dual-Column Gantry (Stereoscopic Pair)';
          camCountText = \`${g3dCamHeights.length} cams/col | ${2 * g3dCamHeights.length} total\`;
          const baseDeg = (g3dSweepAngle/(Math.PI*2))*360;
          const thetaDeg = (window.g3dDynamicTheta || 0.26) * (180 / Math.PI);
          const col1Angle = (baseDeg - thetaDeg + 360) % 360;
          const col2Angle = (baseDeg + thetaDeg + 360) % 360;
          positionText = \`Cameras parallel maintaining overlap (${col1Angle.toFixed(1)}° & ${col2Angle.toFixed(1)}°)\`;
        } else if (isModel3) {
          archTitle = '⚙ Model 3 — Vertical Scanning Array';
          const m3Input = document.getElementById('m3-numColumns');
          const horizColumns = m3Input ? parseInt(m3Input.value) : 2;
          const camsPerCol = g3dCamHeights.length;
          camCountText = \`${horizColumns} columns | ${camsPerCol} cams/col | ${horizColumns * camsPerCol} total\`;
          positionText = \`Vertical translation scanner (Fixed Ring)\`;
        }
        
        hudEl.innerHTML = \`
          <div style="font-weight:bold; font-size:12.5px; color:#0f172a; margin-bottom:4px;">\${archTitle}</div>
          <div>Patient Envelope: \${g3dPatW.toFixed(1)}m W × \${g3dPatD.toFixed(1)}m D × \${g3dPatH.toFixed(1)}m H</div>
          <div>Gantry Track: \${trackW.toFixed(2)}m W × \${trackD.toFixed(2)}m D (Elliptical)</div>
          <div>Working Distance: \${(wd*1000).toFixed(0)}mm from Envelope | \${camCountText}</div>
          <div style="color:var(--warn); font-weight:700; margin-top:2px;">Drag to orbit · \${positionText}</div>
        \`;
      }`;

appJs = appJs.replace(oldHUDLogic.replace(/\r?\n/g, '\r\n'), newHUDLogic.replace(/\r?\n/g, '\r\n'));
appJs = appJs.replace(oldHUDLogic.replace(/\r?\n/g, '\n'), newHUDLogic.replace(/\r?\n/g, '\n'));
console.log("Patched HUD overlay logic.");

fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);
console.log("All patches saved successfully.");

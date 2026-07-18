// 3D Visualizer Globals (Defined at top to avoid Temporal Dead Zone errors)

// ============================================================
// Export RFQ Tab to PDF
// ============================================================
async function exportRFQtoPDF() {
  const btn = document.getElementById('export-rfq-pdf-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Generating PDF...';
  btn.disabled = true;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;

  const subTabIds = [
    'sub-intro', 'sub-geo', 'sub-img', 'sub-rob',
    'sub-ill', 'sub-cal', 'sub-time', 'sub-soft',
    'sub-service', 'sub-reg', 'sub-commercial'
  ];
  const subTabNames = [
    '1. Project Overview & Scope', '2. Spatial & Geometry', '3. Imaging & Optics',
    '4. Positioning Subsystem', '5. Illumination Subsystem', '6. Calibration Suite',
    '7. Sync & Throughput', '8. Software, API & Cyber', '9. Lifecycle & Service',
    '10. Regulatory & Standards', '11. Deliverables & Commercial'
  ];

  // Add title page
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageW, pageH, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Aurora DermaPod RFQ Analysis', pageW / 2, pageH / 2 - 12, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(148, 163, 184);
  pdf.text('Subsystem Constraints & Compliance Review', pageW / 2, pageH / 2 + 2, { align: 'center' });
  pdf.text('Generated: ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), pageW / 2, pageH / 2 + 12, { align: 'center' });

  for (let i = 0; i < subTabIds.length; i++) {
    const id = subTabIds[i];
    const el = document.getElementById(id);
    if (!el) continue;

    // Temporarily show the section
    const prevDisplay = el.style.display;
    const prevClass = el.className;
    el.style.display = 'block';
    el.classList.add('active');

    await new Promise(r => setTimeout(r, 80));

    const canvas = await html2canvas(el, {
      scale: 1.8,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    el.style.display = prevDisplay;
    el.className = prevClass;

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const imgW = pageW - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;

    pdf.addPage();

    // Header bar
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageW, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DermaPod RFQ  |  ' + subTabNames[i], margin, 6.5);
    pdf.text('Page ' + (i + 2), pageW - margin, 6.5, { align: 'right' });

    // Content
    const availH = pageH - 10 - margin;
    const finalH = Math.min(imgH, availH);
    pdf.addImage(imgData, 'JPEG', margin, 11, imgW, finalH);
  }

  pdf.save('DermaPod_RFQ_Analysis.pdf');

  btn.innerHTML = originalText;
  btn.disabled = false;
}

  let userYaw = -0.6; // mouse orbit yaw
  let userPitch = 0.5; // mouse orbit pitch
  let isDrag = false;
  let prevX = 0;
  let prevY = 0;

  // Tab Switching Logic
  function switchTab(tabId) {
    try {
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        const targetTab = document.getElementById(tabId);
        if (targetTab) targetTab.classList.add('active');
        
        if (tabId === 'rfq-tab') {
          document.getElementById('btn-rfq').classList.add('active');
          document.body.classList.remove('calculator-active');
          document.body.classList.remove('model2-active');
        } else if (tabId === 'calculator-tab') {
          document.getElementById('btn-calc').classList.add('active');
          document.body.classList.add('calculator-active');
          document.body.classList.remove('model2-active');
          window.g3dArchitecture = 'optionA';
          // Move the shared 3D wrapper back into Tab 2's placeholder
          const wrapper2 = document.getElementById('g3d-visualizer-wrapper');
          const ph2 = document.getElementById('g3d-visualizer-placeholder-tab2');
          if (wrapper2 && ph2 && wrapper2.parentElement !== ph2) {
            ph2.appendChild(wrapper2);
          }
          calculate();
          // Resize after browser has painted and laid out the active tab
          requestAnimationFrame(() => {
            if (typeof resizeGantry3D === 'function') resizeGantry3D();
            setTimeout(() => { if (typeof resizeGantry3D === 'function') resizeGantry3D(); }, 150);
          });
        } else if (tabId === 'model2-tab') {
          document.getElementById('btn-model2').classList.add('active');
          document.body.classList.add('calculator-active');
          document.body.classList.add('model2-active');
          window.g3dArchitecture = 'model2';
          // Move the shared 3D wrapper into Tab 3's placeholder
          const wrapper3 = document.getElementById('g3d-visualizer-wrapper');
          const ph3 = document.getElementById('g3d-visualizer-placeholder-tab3');
          if (wrapper3 && ph3 && wrapper3.parentElement !== ph3) {
            ph3.appendChild(wrapper3);
          }
          calculate();
          // Resize after browser has painted and laid out the active tab
          requestAnimationFrame(() => {
            if (typeof resizeGantry3D === 'function') resizeGantry3D();
            setTimeout(() => { if (typeof resizeGantry3D === 'function') resizeGantry3D(); }, 150);
          });
        } else if (tabId === 'model3-tab') {
          document.getElementById('btn-model3').classList.add('active');
          document.body.classList.add('calculator-active');
          document.body.classList.add('model2-active');
          window.g3dArchitecture = 'model3';
          // Move the shared 3D wrapper into Tab 4's placeholder
          const wrapper4 = document.getElementById('g3d-visualizer-wrapper');
          const ph4 = document.getElementById('g3d-visualizer-placeholder-tab4');
          if (wrapper4 && ph4 && wrapper4.parentElement !== ph4) {
            ph4.appendChild(wrapper4);
          }
          calculate();
          // Resize after browser has painted and laid out the active tab
          requestAnimationFrame(() => {
            if (typeof resizeGantry3D === 'function') resizeGantry3D();
            setTimeout(() => { if (typeof resizeGantry3D === 'function') resizeGantry3D(); }, 150);
          });
        }
    } catch (err) {
        alert("switchTab error: " + err.message + "\\n" + err.stack);
    }
  }

  // Sub-tabs switching inside RFQ Constraints Tab
  function switchSubTab(event, subTabId) {
    document.querySelectorAll('.sub-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.getElementById(subTabId).classList.add('active');
    event.currentTarget.classList.add('active');
  }

  let saveTimeout = null;
  function triggerAutoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      const fields = document.querySelectorAll('.rfq-textarea');
      const commentsObj = {};
      fields.forEach(field => {
        const key = field.getAttribute('data-key');
        commentsObj[key] = field.innerHTML || '';
      });
      
      fetch('http://localhost:3000/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentsObj)
      }).then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('Auto-saved to local file successfully!');
          }
        }).catch(err => {
          console.warn('Auto-save server offline. Saving locally to browser only.');
        });
    }, 800);
  }

  // LocalStorage Persistence & Contenteditable conversion for compliance fields
  function setupTextareaPersistence() {
    const textareas = document.querySelectorAll('.rfq-textarea');
    
    textareas.forEach(textarea => {
      const key = textarea.getAttribute('data-key');
      const placeholder = textarea.getAttribute('placeholder') || 'Comments...';
      
      // Create contenteditable div in place of textarea to allow selective text highlighting
      const div = document.createElement('div');
      div.className = 'rfq-textarea';
      div.setAttribute('data-key', key);
      div.setAttribute('data-placeholder', placeholder);
      div.contentEditable = 'true';
      
      // Load saved value: Priority 1: localStorage, Priority 2: rfqSavedComments (file database)
      let savedVal = localStorage.getItem('derma_rfq_' + key);
      if (savedVal === null && typeof rfqSavedComments !== 'undefined' && rfqSavedComments && rfqSavedComments[key] !== undefined) {
        savedVal = rfqSavedComments[key];
      }
      
      if (savedVal) {
        div.innerHTML = savedVal;
      }
      
      // Auto-save innerHTML on change
      div.addEventListener('input', () => {
        localStorage.setItem('derma_rfq_' + key, div.innerHTML);
        triggerAutoSave();
      });
      
      textarea.parentNode.replaceChild(div, textarea);
    });
  }

  // Export comments to rfq_comments.js helper function
  function exportComments() {
    const fields = document.querySelectorAll('.rfq-textarea');
    const commentsObj = {};
    fields.forEach(field => {
      const key = field.getAttribute('data-key');
      commentsObj[key] = field.innerHTML || '';
    });
    
    const fileContent = `// Aurora DermaPod RFQ Comments Database\n// Edit this file directly in the codebase, or use the "Export Comments" button in the UI to download a new version.\nconst rfqSavedComments = ${JSON.stringify(commentsObj, null, 2)};\n`;
    
    const blob = new Blob([fileContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rfq_comments.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Reload comments from the disk file by clearing localStorage and refreshing
  function reloadFromDiskFile() {
    if (confirm("Are you sure you want to discard browser changes and reload comments from the disk file (rfq_comments.js)?")) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('derma_rfq_')) {
          localStorage.removeItem(key);
        }
      }
      location.reload();
    }
  }

  // Control Bindings
  const maxFootprintW = document.getElementById('maxFootprintW');
  const maxFootprintD = document.getElementById('maxFootprintD');
  const maxHeight = document.getElementById('maxHeight');
  const patientEnvW = document.getElementById('patientEnvW');
  const patientEnvD = document.getElementById('patientEnvD');
  const patientEnvH = document.getElementById('patientEnvH');

  const sensorPreset = document.getElementById('sensorPreset');
  const sw = document.getElementById('sw');
  const sh = document.getElementById('sh');
  const pixelSize = document.getElementById('pixelSize');
  const pxw = document.getElementById('pxw');
  const pxh = document.getElementById('pxh');
  
  const wdSlider = document.getElementById('wdSlider');
  const wdBox = document.getElementById('wdBox');
  const flSlider = document.getElementById('flSlider');
  const flBox = document.getElementById('flBox');
  const apSlider = document.getElementById('apSlider');
  const apBox = document.getElementById('apBox');
  
  const reqResSlider = document.getElementById('reqResSlider');
  const reqResBox = document.getElementById('reqResBox');
  const cocPreset = document.getElementById('cocPreset');
  const cocSlider = document.getElementById('cocSlider');
  const cocBox = document.getElementById('cocBox');
  
  // Output nodes

  
  const geoRes = document.getElementById('geoRes');
  const geoResStatus = document.getElementById('geoResStatus');
  const fovVal = document.getElementById('fovVal');
  const fovHVal = document.getElementById('fovHVal');
  const diffBlur = document.getElementById('diffBlur');
  const diffStatus = document.getElementById('diffStatus');
  const resolutionExplanation = document.getElementById('resolutionExplanation');
  const resolutionImpactText = document.getElementById('resolutionImpactText');
  
  const singleDOF = document.getElementById('singleDOF');
  const nearLimit = document.getElementById('nearLimit');
  const farLimit = document.getElementById('farLimit');
  const stackSize = document.getElementById('stackSize');
  const dofExplanation = document.getElementById('dofExplanation');
  const dofImpactText = document.getElementById('dofImpactText');
  


  const presets = {
    gmax3265: { w: 29.9, h: 22.4, p: 3.2, pw: 9344, ph: 7000 },
    imx661: { w: 46.15, h: 32.87, p: 3.45, pw: 13376, ph: 9528 },
    "5dmk4": { w: 36, h: 24, p: 5.36, pw: 6720, ph: 4480 },
    imx530: { w: 14.6, h: 12.62, p: 2.74, pw: 5328, ph: 4608 },
    imx541: { w: 14.13, h: 10.38, p: 2.74, pw: 5136, ph: 3752 },
    imx542: { w: 14.13, h: 10.35, p: 3.45, pw: 4096, ph: 3000 },
    mf50: { w: 43.8, h: 32.9, p: 3.76, pw: 8256, ph: 6192 },
    imx927: { w: 25.54, h: 20.01, p: 2.2, pw: 11608, ph: 9096 }
  };

  function applyPreset() {
    const val = sensorPreset.value;
    if (val !== 'custom') {
      const p = presets[val];
      sw.value = p.w;
      sh.value = p.h;
      pixelSize.value = p.p;
      pxw.value = p.pw;
      pxh.value = p.ph;
    }
  }

  function updateCoCFromPreset() {
    const preset = cocPreset.value;
    const pxSize = parseFloat(pixelSize.value);
    const sensorW = parseFloat(sw.value);
    const sensorH = parseFloat(sh.value);
    
    if (preset === 'pixel') {
      cocBox.value = pxSize;
      cocSlider.value = pxSize;
    } else if (preset === 'sensor-fraction') {
      const diagonal = Math.sqrt(sensorW*sensorW + sensorH*sensorH);
      const fraction = (diagonal / 1500) * 1000; 
      cocBox.value = fraction.toFixed(2);
      cocSlider.value = fraction;
    } else if (preset === 'traditional') {
      cocBox.value = 25.0;
      cocSlider.value = 25.0;
    }
  }

  function sync(slider, box) {
    if (!slider || !box) return;
    slider.addEventListener('input', () => { box.value = slider.value; calculate(); });
    box.addEventListener('input', () => { slider.value = box.value; calculate(); });
  }

  // Local slider/box syncing for Tab 2
  sync(wdSlider, wdBox);
  sync(flSlider, flBox);
  sync(apSlider, apBox);
  sync(reqResSlider, reqResBox);
  
  cocSlider.addEventListener('input', () => {
    cocBox.value = cocSlider.value;
    cocPreset.value = 'custom';
    calculate();
  });
  cocBox.addEventListener('input', () => {
    cocSlider.value = cocBox.value;
    cocPreset.value = 'custom';
    calculate();
  });

  sensorPreset.addEventListener('change', applyPreset);
  cocPreset.addEventListener('change', () => {
    updateCoCFromPreset();
    calculate();
  });

  // Local slider/box syncing for Tab 3 (prefixed with m2-)
  const m2_wdSlider = document.getElementById('m2-wdSlider');
  const m2_wdBox = document.getElementById('m2-wdBox');
  const m2_flSlider = document.getElementById('m2-flSlider');
  const m2_flBox = document.getElementById('m2-flBox');
  const m2_apSlider = document.getElementById('m2-apSlider');
  const m2_apBox = document.getElementById('m2-apBox');
  const m2_reqResSlider = document.getElementById('m2-reqResSlider');
  const m2_reqResBox = document.getElementById('m2-reqResBox');
  const m2_cocSlider = document.getElementById('m2-cocSlider');
  const m2_cocBox = document.getElementById('m2-cocBox');
  const m2_cocPreset = document.getElementById('m2-cocPreset');
  const m2_sensorPreset = document.getElementById('m2-sensorPreset');

  sync(m2_wdSlider, m2_wdBox);
  sync(m2_flSlider, m2_flBox);
  sync(m2_apSlider, m2_apBox);
  sync(m2_reqResSlider, m2_reqResBox);

  if (m2_cocSlider && m2_cocBox) {
    m2_cocSlider.addEventListener('input', () => {
      m2_cocBox.value = m2_cocSlider.value;
      if (m2_cocPreset) m2_cocPreset.value = 'custom';
      calculate();
    });
    m2_cocBox.addEventListener('input', () => {
      m2_cocSlider.value = m2_cocBox.value;
      if (m2_cocPreset) m2_cocPreset.value = 'custom';
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
    'overlapX', 'g3dColCamsSlider', 'cameraUnitPrice', 'maxCameraBudget',
    'price50', 'price64', 'price100', 'price127', 'price150', 'priceCustom'
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
    
    elements.forEach((source, srcIdx) => {
      if (!source.el) return;
      ['input', 'change'].forEach(evt => {
        source.el.addEventListener(evt, () => {
          elements.forEach((target, tgtIdx) => {
            if (srcIdx === tgtIdx || !target.el) return;
            if (target.el.value !== source.el.value) {
              target.el.value = source.el.value;
              
              if (id === 'wdSlider') document.getElementById(target.prefix + 'wdBox').value = source.el.value;
              if (id === 'wdBox') document.getElementById(target.prefix + 'wdSlider').value = source.el.value;
              if (id === 'flSlider') document.getElementById(target.prefix + 'flBox').value = source.el.value;
              if (id === 'flBox') document.getElementById(target.prefix + 'flSlider').value = source.el.value;
              if (id === 'apSlider') document.getElementById(target.prefix + 'apBox').value = source.el.value;
              if (id === 'apBox') document.getElementById(target.prefix + 'apSlider').value = source.el.value;
              if (id === 'reqResSlider') document.getElementById(target.prefix + 'reqResBox').value = source.el.value;
              if (id === 'reqResBox') document.getElementById(target.prefix + 'reqResSlider').value = source.el.value;
              if (id === 'cocSlider') document.getElementById(target.prefix + 'cocBox').value = source.el.value;
              if (id === 'cocBox') document.getElementById(target.prefix + 'cocSlider').value = source.el.value;
              
              if (id === 'sensorPreset' || id === 'cocPreset') {
                target.el.dispatchEvent(new Event('change'));
              }
            }
          });
          
          if (id === 'wdSlider' && document.getElementById(source.prefix + 'wdBox')) document.getElementById(source.prefix + 'wdBox').value = source.el.value;
          if (id === 'wdBox' && document.getElementById(source.prefix + 'wdSlider')) document.getElementById(source.prefix + 'wdSlider').value = source.el.value;
          if (id === 'flSlider' && document.getElementById(source.prefix + 'flBox')) document.getElementById(source.prefix + 'flBox').value = source.el.value;
          if (id === 'flBox' && document.getElementById(source.prefix + 'flSlider')) document.getElementById(source.prefix + 'flSlider').value = source.el.value;
          if (id === 'apSlider' && document.getElementById(source.prefix + 'apBox')) document.getElementById(source.prefix + 'apBox').value = source.el.value;
          if (id === 'apBox' && document.getElementById(source.prefix + 'apSlider')) document.getElementById(source.prefix + 'apSlider').value = source.el.value;
          if (id === 'reqResSlider' && document.getElementById(source.prefix + 'reqResBox')) document.getElementById(source.prefix + 'reqResBox').value = source.el.value;
          if (id === 'reqResBox' && document.getElementById(source.prefix + 'reqResSlider')) document.getElementById(source.prefix + 'reqResSlider').value = source.el.value;
          if (id === 'cocSlider' && document.getElementById(source.prefix + 'cocBox')) document.getElementById(source.prefix + 'cocBox').value = source.el.value;
          if (id === 'cocBox' && document.getElementById(source.prefix + 'cocSlider')) document.getElementById(source.prefix + 'cocSlider').value = source.el.value;
          
          calculate();
        });
      });
    });
  });

  // Custom sensor change listener for Tab 2
  [maxFootprintW, maxFootprintD, maxHeight, patientEnvW, patientEnvD, patientEnvH, sw, sh, pixelSize, pxw, pxh].forEach(el => {
    if (el) {
      ['input', 'change'].forEach(evt => {
        el.addEventListener(evt, () => {
          if (el !== maxFootprintW && el !== maxFootprintD && el !== maxHeight && el !== patientEnvW && el !== patientEnvD && el !== patientEnvH) {
            sensorPreset.value = 'custom';
          }
          if (cocPreset.value !== 'custom') {
            updateCoCFromPreset();
          }
          calculate();
        });
      });
    }
  });

  // Custom sensor change listener for Tab 3
  const m2_sw = document.getElementById('m2-sw');
  const m2_sh = document.getElementById('m2-sh');
  const m2_pixelSize = document.getElementById('m2-pixelSize');
  const m2_pxw = document.getElementById('m2-pxw');
  const m2_pxh = document.getElementById('m2-pxh');
  const m2_maxFootprintW = document.getElementById('m2-maxFootprintW');
  const m2_maxFootprintD = document.getElementById('m2-maxFootprintD');
  const m2_maxHeight = document.getElementById('m2-maxHeight');
  const m2_patientEnvW = document.getElementById('m2-patientEnvW');
  const m2_patientEnvD = document.getElementById('m2-patientEnvD');
  const m2_patientEnvH = document.getElementById('m2-patientEnvH');
    const m2_numColumns = document.getElementById('m2-numColumns');

  [m2_maxFootprintW, m2_maxFootprintD, m2_maxHeight, m2_patientEnvW, m2_patientEnvD, m2_patientEnvH, m2_sw, m2_sh, m2_pixelSize, m2_pxw, m2_pxh, m2_numColumns].forEach(el => {
    if (el) {
      ['input', 'change'].forEach(evt => {
        el.addEventListener(evt, () => {
          if (el !== m2_maxFootprintW && el !== m2_maxFootprintD && el !== m2_maxHeight && el !== m2_patientEnvW && el !== m2_patientEnvD && el !== m2_patientEnvH) {
            if (document.getElementById('m2-sensorPreset')) document.getElementById('m2-sensorPreset').value = 'custom';
          }
          calculate();
        });
      });
    }
  });

  
  const m3_maxFootprintW = document.getElementById('m3-maxFootprintW');
  const m3_maxFootprintD = document.getElementById('m3-maxFootprintD');
  const m3_maxHeight = document.getElementById('m3-maxHeight');
  const m3_patientEnvW = document.getElementById('m3-patientEnvW');
  const m3_patientEnvD = document.getElementById('m3-patientEnvD');
  const m3_patientEnvH = document.getElementById('m3-patientEnvH');
  const m3_sw = document.getElementById('m3-sw');
  const m3_sh = document.getElementById('m3-sh');
  const m3_pixelSize = document.getElementById('m3-pixelSize');
  const m3_pxw = document.getElementById('m3-pxw');
  const m3_pxh = document.getElementById('m3-pxh');
  const m3_numColumns = document.getElementById('m3-numColumns');
  const m3_numRows = document.getElementById('m3-numRows');
  const m3_g3dColCamsSlider = document.getElementById('m3-g3dColCamsSlider');
  const m3_settleTime = document.getElementById('m3-settleTime');
  const m3_sliceTime = document.getElementById('m3-sliceTime');
  const m3_rotationTime = document.getElementById('m3-rotationTime');

  [m3_maxFootprintW, m3_maxFootprintD, m3_maxHeight, m3_patientEnvW, m3_patientEnvD, m3_patientEnvH, m3_sw, m3_sh, m3_pixelSize, m3_pxw, m3_pxh, m3_numColumns, m3_numRows, m3_g3dColCamsSlider, m3_settleTime, m3_sliceTime, m3_rotationTime].forEach(el => {
    if (el) {
      ['input', 'change'].forEach(evt => {
        el.addEventListener(evt, () => {
          if (el !== m3_maxFootprintW && el !== m3_maxFootprintD && el !== m3_maxHeight && el !== m3_patientEnvW && el !== m3_patientEnvD && el !== m3_patientEnvH && el !== m3_settleTime && el !== m3_sliceTime && el !== m3_rotationTime) {
            if (document.getElementById('m3-sensorPreset')) document.getElementById('m3-sensorPreset').value = 'custom';
          }
          calculate();
        });
      });
    }
  });

  [m2_maxFootprintW, m2_maxFootprintD, m2_maxHeight, m2_patientEnvW, m2_patientEnvD, m2_patientEnvH, m2_sw, m2_sh, m2_pixelSize, m2_pxw, m2_pxh, m2_numColumns].forEach(el => {
    if (el) {
      ['input', 'change'].forEach(evt => {
        el.addEventListener(evt, () => {
          if (el !== m2_maxFootprintW && el !== m2_maxFootprintD && el !== m2_maxHeight && el !== m2_patientEnvW && el !== m2_patientEnvD && el !== m2_patientEnvH) {
            if (m2_sensorPreset) m2_sensorPreset.value = 'custom';
          }
          if (m2_cocPreset && m2_cocPreset.value !== 'custom') {
            const preset = m2_cocPreset.value;
            const swVal = parseFloat(m2_sw?.value || 46.15);
            const shVal = parseFloat(m2_sh?.value || 32.87);
            const pixelSizeVal = parseFloat(m2_pixelSize?.value || 3.45);
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
          }
          calculate();
        });
      });
    }
  });

  function populateOptimizationMatrix(prefix) {
    if (prefix !== 'm2-' && prefix !== 'm3-' && prefix !== '') return;
    
    const tableBody = document.getElementById(prefix + 'matrix-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    const patWidthM = (document.getElementById(prefix + 'patientEnvW') ? parseFloat(document.getElementById(prefix + 'patientEnvW').value) : 1.0) || 1.0;
    const patHeightM = (document.getElementById(prefix + 'patientEnvH') ? parseFloat(document.getElementById(prefix + 'patientEnvH').value) : 2.0) || 2.0;
    const ov = (parseFloat(document.getElementById(prefix + 'overlapX') ? document.getElementById(prefix + 'overlapX').value : 0) || 0) / 100;
    const targetPxMm = parseFloat(document.getElementById(prefix + 'targetPxMm') ? document.getElementById(prefix + 'targetPxMm').value : 30.0) || 30.0;
    
    const ap = parseFloat(document.getElementById(prefix + 'apBox') ? document.getElementById(prefix + 'apBox').value : 8.0) || 8.0;
    const cocMm = (parseFloat(document.getElementById(prefix + 'cocBox') ? document.getElementById(prefix + 'cocBox').value : 3.0) || 3.0) / 1000;
    
    // Fetch number of columns
    const numColsEl = document.getElementById(prefix + 'numColumns');
    const numColumns = numColsEl ? parseInt(numColsEl.value) : 1;
    
    const targetW = patWidthM * 1000;
    
    const resolutions = [
      { mp: 50, px: 50000000 },
      { mp: 64, px: 64000000 },
      { mp: 100, px: 100000000 },
      { mp: 127, px: 127000000 },
      { mp: 150, px: 150000000 }
    ];
    
    const formats = [
      { name: "APS-C", w: 23.6, h: 15.6, ratio: 1.5 },
      { name: "Full Frame", w: 36.0, h: 24.0, ratio: 1.5 },
      { name: "Medium Format", w: 44.0, h: 33.0, ratio: 1.333 },
      { name: "Large Format", w: 46.15, h: 32.87, ratio: 1.404 },
      { name: "Large Medium", w: 53.4, h: 40.0, ratio: 1.335 }
    ];

    let rows = [];
    
    resolutions.forEach(res => {
      formats.forEach(fmt => {
        const pxH = Math.round(Math.sqrt(res.px / fmt.ratio));
        const pxW = Math.round(pxH * fmt.ratio);
        const pixelSizeUm = (fmt.w / pxW) * 1000;
        
        if (pixelSizeUm >= 2.0 && pixelSizeUm <= 4.0) {
            
            let all_configs = [];
            let constrained_configs = [];
            
            for (let fl = 10; fl <= 150; fl++) {
                for (let wd = 300; wd <= 2000; wd += 10) {
                    if (wd <= fl) continue;
                    
                    const mag = fl / (wd - fl);
                    const fovW = fmt.w / mag;
                    const fovH = fmt.h / mag;
                    
                    const density = Math.min(pxW / fovW, pxH / fovH);
                    const near = (wd * fl * fl) / (fl * fl + (ap * cocMm * (wd - fl)));
                    const far = (wd * fl * fl) / (fl * fl - (ap * cocMm * (wd - fl)));
                    const dof = (far < 0 || far > 99999) ? 9999 : (far - near);
                    
                    const totalFovW = fovW + (numColumns - 1) * (fovW * (1 - ov));
                    const excessFOV = totalFovW - targetW;
                    
                    const fovHM = fovH / 1000;
                    const stepH = fovHM * (1 - ov);
                    let cams = 1;
                    if (patHeightM > fovHM) cams = Math.ceil((patHeightM - fovHM) / (stepH || 0.001)) + 1;
                    
                    if (cams <= 15) {
                        const config = {
                            fl: fl, wd: wd, fovW: fovW, totalFovW: totalFovW, fovH: fovH, 
                            density: density, dof: dof, excessFOV: excessFOV, cams: cams
                        };
                        
                        all_configs.push(config);
                        
                        // IF TOTAL FOV >= Required Envelope AND within 25% tolerance (prevent 8m massive FOVs)
                        if (totalFovW >= targetW && totalFovW <= targetW * 1.25) {
                            constrained_configs.push(config);
                        }
                    }
                }
            }
            
            const fallback = { fl: 35, wd: 1000, fovW: targetW, totalFovW: targetW, fovH: targetW / fmt.ratio, density: 0, dof: 0, excessFOV: 0, cams: 1 };
            
            let best_case1 = fallback;
            let best_case2 = fallback;
            let best_case3 = fallback;
            
            // CASE 1: Clinical (30 px/mm) - Uses ALL configs
            if (all_configs.length > 0) {
                let case1_candidates = all_configs.filter(c => c.density >= targetPxMm);
                if (case1_candidates.length === 0) {
                    case1_candidates = [...all_configs];
                }
                case1_candidates.sort((a, b) => {
                    const diffA = Math.abs(a.density - targetPxMm);
                    const diffB = Math.abs(b.density - targetPxMm);
                    if (Math.abs(diffA - diffB) > 0.1) return diffA - diffB;
                    if (Math.abs(b.dof - a.dof) > 1.0) return b.dof - a.dof;
                    return Math.abs(a.excessFOV) - Math.abs(b.excessFOV);
                });
                best_case1 = case1_candidates[0];
            }
            
            // CASE 2 & 3: Uses Constrained configs
            if (constrained_configs.length > 0) {
                // CASE 2: Maximum Resolution
                let case2_candidates = [...constrained_configs];
                case2_candidates.sort((a, b) => {
                    if (Math.abs(a.excessFOV - b.excessFOV) > 10.0) return a.excessFOV - b.excessFOV;
                    if (Math.abs(b.density - a.density) > 0.1) return b.density - a.density;
                    return b.dof - a.dof;
                });
                best_case2 = case2_candidates[0];
                
                // CASE 3: Maximum DoF
                let case3_candidates = [...constrained_configs];
                case3_candidates.sort((a, b) => {
                    if (Math.abs(b.dof - a.dof) > 10.0) return b.dof - a.dof;
                    if (Math.abs(a.excessFOV - b.excessFOV) > 10.0) return a.excessFOV - b.excessFOV;
                    return b.density - a.density;
                });
                best_case3 = case3_candidates[0];
            }
            
            const p50 = parseFloat(document.getElementById(prefix + 'price50')?.value || 6500);
            const p64 = parseFloat(document.getElementById(prefix + 'price64')?.value || 6500);
            const p100 = parseFloat(document.getElementById(prefix + 'price100')?.value || 8000);
            const p127 = parseFloat(document.getElementById(prefix + 'price127')?.value || 12000);
            const p150 = parseFloat(document.getElementById(prefix + 'price150')?.value || 15000);
            const pCustom = parseFloat(document.getElementById(prefix + 'priceCustom')?.value || 6500);

            const resPrices = {
              50: p50,
              64: p64,
              100: p100,
              127: p127,
              150: p150
            };
            const unitPrice = resPrices[res.mp] || pCustom;
            const maxBudgetInput = document.getElementById(prefix + 'maxCameraBudget');
            const maxBudget = maxBudgetInput ? (parseFloat(maxBudgetInput.value) || 50000) : 50000;
            
            let totalCams1 = 0, totalCams2 = 0, totalCams3 = 0;
            if (prefix === 'm3-') {
              const m3CamsSlider = document.getElementById('m3-g3dColCamsSlider');
              const m3CamsPerCol = m3CamsSlider ? (parseInt(m3CamsSlider.value) || 2) : 2;
              
              const fovW1_m = best_case1.fovW / 1000;
              const stepW1 = fovW1_m * (1 - ov);
              const cols1 = Math.max(1, (patWidthM > fovW1_m) ? Math.ceil((patWidthM - fovW1_m) / (stepW1 || 0.001)) + 1 : 1);
              totalCams1 = cols1 * m3CamsPerCol;
              
              const fovW2_m = best_case2.fovW / 1000;
              const stepW2 = fovW2_m * (1 - ov);
              const cols2 = Math.max(1, (patWidthM > fovW2_m) ? Math.ceil((patWidthM - fovW2_m) / (stepW2 || 0.001)) + 1 : 1);
              totalCams2 = cols2 * m3CamsPerCol;
              
              const fovW3_m = best_case3.fovW / 1000;
              const stepW3 = fovW3_m * (1 - ov);
              const cols3 = Math.max(1, (patWidthM > fovW3_m) ? Math.ceil((patWidthM - fovW3_m) / (stepW3 || 0.001)) + 1 : 1);
              totalCams3 = cols3 * m3CamsPerCol;
            } else if (prefix === 'm2-') {
              totalCams1 = numColumns * best_case1.cams;
              totalCams2 = numColumns * best_case2.cams;
              totalCams3 = numColumns * best_case3.cams;
            } else {
              totalCams1 = best_case1.cams;
              totalCams2 = best_case2.cams;
              totalCams3 = best_case3.cams;
            }
            
            const cost1 = totalCams1 * unitPrice;
            const cost2 = totalCams2 * unitPrice;
            const cost3 = totalCams3 * unitPrice;
            
            const fit1 = cost1 <= maxBudget ? `<span style="color: #10b981; font-weight: bold;">✔ Yes</span>` : `<span style="color: #ef4444; font-weight: bold;">✘ No</span>`;
            const fit2 = cost2 <= maxBudget ? `<span style="color: #10b981; font-weight: bold;">✔ Yes</span>` : `<span style="color: #ef4444; font-weight: bold;">✘ No</span>`;
            const fit3 = cost3 <= maxBudget ? `<span style="color: #10b981; font-weight: bold;">✔ Yes</span>` : `<span style="color: #ef4444; font-weight: bold;">✘ No</span>`;

            rows.push({
              resMP: res.mp,
              fmtName: fmt.name,
              pSize: pixelSizeUm,
              sw: fmt.w, sh: fmt.h, pxw: pxW, pxh: pxH,
              wd1: best_case1.wd, fl1: best_case1.fl, den1: best_case1.density, fovW1: best_case1.totalFovW, fovH1: best_case1.fovH, cams1: best_case1.cams,
              wd2: best_case2.wd, fl2: best_case2.fl, den2: best_case2.density, fovW2: best_case2.totalFovW, fovH2: best_case2.fovH, cams2: best_case2.cams,
              wd3: best_case3.wd, fl3: best_case3.fl, den3: best_case3.density, fovW3: best_case3.totalFovW, fovH3: best_case3.fovH, cams3: best_case3.cams,
              cost1, cost2, cost3, fit1, fit2, fit3
            });
        }
      });
    });

    let html = '';
    rows.forEach(r => {
      html += `
        <tr style="cursor: pointer; border-bottom: 1px solid #e2e8f0;" onclick="loadMatrixConfig('${prefix}', ${r.sw}, ${r.sh}, ${r.pSize.toFixed(2)}, ${r.pxw}, ${r.pxh}, ${r.wd1}, ${r.fl1})" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
          <td rowspan="3" style="border-bottom: 2px solid var(--border);">${r.fmtName}</td>
          <td rowspan="3" style="border-bottom: 2px solid var(--border);">${r.resMP}MP</td>
          <td rowspan="3" style="border-bottom: 2px solid var(--border);">${r.pSize.toFixed(2)}</td>
          <td style="font-weight: bold; color: #f59e0b;">Case 1 (Clinical)</td>
          <td>${r.fl1}mm @ ${(r.wd1/10).toFixed(1)}cm</td>
          <td style="color: #f59e0b; font-weight: bold;">${r.den1.toFixed(1)}</td>
          <td>${(r.fovW1/1000).toFixed(2)}m &times; ${(r.fovH1/1000).toFixed(2)}m</td>
          <td style="font-weight: bold;">${r.cams1}</td>
          <td style="font-weight: bold;">$${r.cost1.toLocaleString()}</td>
          <td>${r.fit1}</td>
          <td><button style="padding: 2px 6px; font-size: 10px; cursor: pointer;">View in 3D</button></td>
        </tr>
      `;
      html += `
        <tr style="cursor: pointer; border-bottom: 1px solid #e2e8f0;" onclick="loadMatrixConfig('${prefix}', ${r.sw}, ${r.sh}, ${r.pSize.toFixed(2)}, ${r.pxw}, ${r.pxh}, ${r.wd2}, ${r.fl2})" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
          <td style="font-weight: bold; color: #8b5cf6;">Case 2 (Max Res)</td>
          <td>${r.fl2}mm @ ${(r.wd2/10).toFixed(1)}cm</td>
          <td style="color: #8b5cf6; font-weight: bold;">${r.den2.toFixed(1)}</td>
          <td>${(r.fovW2/1000).toFixed(2)}m &times; ${(r.fovH2/1000).toFixed(2)}m</td>
          <td style="font-weight: bold;">${r.cams2}</td>
          <td style="font-weight: bold;">$${r.cost2.toLocaleString()}</td>
          <td>${r.fit2}</td>
          <td><button style="padding: 2px 6px; font-size: 10px; cursor: pointer;">View in 3D</button></td>
        </tr>
      `;
      html += `
        <tr style="cursor: pointer; border-bottom: 2px solid var(--border);" onclick="loadMatrixConfig('${prefix}', ${r.sw}, ${r.sh}, ${r.pSize.toFixed(2)}, ${r.pxw}, ${r.pxh}, ${r.wd3}, ${r.fl3})" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
          <td style="font-weight: bold; color: #10b981;">Case 3 (Max DoF)</td>
          <td>${r.fl3}mm @ ${(r.wd3/10).toFixed(1)}cm</td>
          <td style="color: #10b981; font-weight: bold;">${r.den3.toFixed(1)}</td>
          <td>${(r.fovW3/1000).toFixed(2)}m &times; ${(r.fovH3/1000).toFixed(2)}m</td>
          <td style="font-weight: bold;">${r.cams3}</td>
          <td style="font-weight: bold;">$${r.cost3.toLocaleString()}</td>
          <td>${r.fit3}</td>
          <td><button style="padding: 2px 6px; font-size: 10px; cursor: pointer;">View in 3D</button></td>
        </tr>
      `;
    });
    
    tableBody.innerHTML = html;
}

  window.loadMatrixConfig = function(prefix, sw, sh, pSize, pxw, pxh, wd, fl) {
    if (prefix === undefined || prefix === null) prefix = 'm2-'; // fallback
    const setVal = (id, val) => { const el = document.getElementById(prefix + id); if (el) el.value = val; };
    
    setVal('sensorPreset', 'custom');
    setVal('sw', sw.toFixed(2));
    setVal('sh', sh.toFixed(2));
    setVal('pixelSize', pSize);
    setVal('pxw', pxw);
    setVal('pxh', pxh);
    
    setVal('wdSlider', wd.toFixed(0));
    setVal('wdBox', wd.toFixed(0));
    setVal('flSlider', fl.toFixed(0));
    setVal('flBox', fl.toFixed(0));
    
    // For Model 2 specifically, we might want to reset numColumns to 2? 
    // Actually, no, let's leave numColumns alone for both models as it auto-calculates for M3 anyway.
    
    calculate();
  };
function renderTopDownDensityMap(prefix, actualPxMm, fl = 50) {
    const canvas = document.getElementById(prefix + 'density-map');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    ctx.clearRect(0, 0, W, H);
    
    const envW_m = parseFloat((document.getElementById(prefix + 'patientEnvW') || {}).value) || 1.0;
    const envD_m = parseFloat((document.getElementById(prefix + 'patientEnvD') || {}).value) || 0.6;
    const targetPxMmEl = document.getElementById(prefix + 'targetPxMm') || document.getElementById('targetPxMm') || {value: 30};
    const targetPxMm = parseFloat(targetPxMmEl.value) || 30;
    const wdEl = document.getElementById(prefix ? prefix + 'wdBox' : 'wdBox');
    const wd_mm = wdEl ? parseFloat(wdEl.value) : 480;
    
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
            const density = (actualPxMm || targetPxMm) * ((wd_mm - fl) / (dist - fl)) * Math.cos(incidentAngle);
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

  function render1DDensityGraph(prefix, actualPxMm, fl) {
    const canvas = document.getElementById(prefix + 'density-graph-container');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const envW_m = parseFloat((document.getElementById(prefix + 'patientEnvW') || {}).value) || 1.0;
    const envD_m = parseFloat((document.getElementById(prefix + 'patientEnvD') || {}).value) || 0.6;
    const targetPxMmEl = document.getElementById(prefix + 'targetPxMm') || document.getElementById('targetPxMm');
    const targetPxMm = targetPxMmEl ? parseFloat(targetPxMmEl.value) : 30;
    const wdEl = document.getElementById(prefix ? prefix + 'wdBox' : 'wdBox');
    const wd_mm = wdEl ? parseFloat(wdEl.value) : 800;

    // Resolve focal length fl dynamically if not provided
    let flVal = fl;
    if (flVal === undefined) {
      const flEl = document.getElementById(prefix ? prefix + 'flBox' : 'flBox');
      flVal = flEl ? parseFloat(flEl.value) : 50;
    }

    // Resolve actualPxMm dynamically if not provided
    let pxMmVal = actualPxMm;
    if (pxMmVal === undefined) {
      const swEl = document.getElementById(prefix + 'sw');
      const shEl = document.getElementById(prefix + 'sh');
      const pxwEl = document.getElementById(prefix + 'pxw');
      const pxhEl = document.getElementById(prefix + 'pxh');
      const sensorW = swEl ? parseFloat(swEl.value) : 36.0;
      const sensorH = shEl ? parseFloat(shEl.value) : 24.0;
      const pxWidth = pxwEl ? parseInt(pxwEl.value) : 8000;
      const pxHeight = pxhEl ? parseInt(pxhEl.value) : 6000;

      const mag = flVal / Math.max(1, (wd_mm - flVal));
      const fovW = sensorW / (mag || 0.001);
      const fovH = sensorH / (mag || 0.001);
      pxMmVal = Math.min(pxWidth / (fovW || 1), pxHeight / (fovH || 1));
    }

    const w_mm = envW_m * 1000;
    const d_mm = envD_m * 1000;

    const angleSelect = document.getElementById(prefix + 'graph-angle');
    const angleDeg = parseInt(angleSelect ? angleSelect.value : '0');
    const isFrontBack = (angleDeg === 0 || angleDeg === 180);

    // If camera is at Front (0), it looks through the Depth (D)
    // If camera is at Side (90), it looks through the Width (W)
    const depthSpanMm = isFrontBack ? d_mm : w_mm;
    const faceLabel = isFrontBack ? 'Depth' : 'Width';
    
    // Update HTML Labels
    const el_title = canvas.parentElement.querySelector('div');
    if (el_title) el_title.textContent = '1D Depth Falloff Profile (Pixel Density vs Depth)';
    
    const el_xLabel = document.getElementById(prefix + 'graph-x-label');
    const el_xLeft = document.getElementById(prefix + 'graph-x-left');
    const el_xRight = document.getElementById(prefix + 'graph-x-right');
    if (el_xLabel) el_xLabel.textContent = '← Distance into Envelope (mm) →';
    if (el_xLeft) el_xLeft.textContent = '0 mm (Start)';
    if (el_xRight) el_xRight.textContent = depthSpanMm.toFixed(0) + ' mm (End)';

    const paramsDiv = document.getElementById(prefix + 'graph-params');
    if (paramsDiv) {
      paramsDiv.innerHTML = 'Target: ' + targetPxMm + ' px/mm | Actual at WD: ' + (pxMmVal ? pxMmVal.toFixed(1) : targetPxMm) + ' px/mm | WD: ' + wd_mm + ' mm';
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
      const density = pxMmVal * ((wd_mm - flVal) / (actualDistance - flVal));
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
      // Y-axis label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(((g / gridLines) * maxDensity).toFixed(0), PADDING_LEFT - 4, yPos + 3);
      }

      // Draw vertical grid lines (X-axis) and labels
      const xGridLines = 5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let g = 0; g <= xGridLines; g++) {
        const xPos = PADDING_LEFT + (g / xGridLines) * graphW;
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(xPos, PADDING_TOP);
        ctx.lineTo(xPos, PADDING_TOP + graphH);
        ctx.stroke();
        const val = (g / xGridLines) * depthSpanMm;
        ctx.fillStyle = '#64748b';
        ctx.fillText(Math.round(val) + 'mm', xPos, PADDING_TOP + graphH + 5);
      }
      ctx.textBaseline = 'alphabetic'; // reset

    // Y-axis label
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('px/mm', 0, 0);
    ctx.restore();

    // Draw bars
    const barW = graphW / samples;
    for (let i = 0; i < samples; i++) {
      const density = densities[i];
      const barH = (density / maxDensity) * graphH;
      const x = PADDING_LEFT + i * barW;
      const y = PADDING_TOP + graphH - barH;

      // Color
      let color;
      if (density >= targetPxMm + 10) color = '#3b82f6';       // blue - excellent
      else if (density >= targetPxMm) color = '#22c55e';        // green - good
      else if (density >= targetPxMm - 5) color = '#f59e0b';   // orange - marginal
      else color = '#ef4444';                                     // red - poor

      ctx.fillStyle = color;
      ctx.fillRect(x + 1, y, barW - 2, barH);
    }

    // Draw target line
    const targetY = PADDING_TOP + graphH - (targetPxMm / maxDensity) * graphH;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(PADDING_LEFT, targetY);
    ctx.lineTo(PADDING_LEFT + graphW, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Target: ' + targetPxMm + ' px/mm', PADDING_LEFT + 4, targetY - 4);

    // Draw axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING_LEFT, PADDING_TOP);
    ctx.lineTo(PADDING_LEFT, PADDING_TOP + graphH);
    ctx.lineTo(PADDING_LEFT + graphW, PADDING_TOP + graphH);
    ctx.stroke();
  }


  // Unified sensorPreset and cocPreset change listeners for Model 1, Model 2, and Model 3
  ['', 'm2-', 'm3-'].forEach(pref => {
    const sp = document.getElementById(pref + 'sensorPreset');
    if (sp) {
      sp.addEventListener('change', () => {
        const preset = sp.value;
        const swEl = document.getElementById(pref + 'sw');
        const shEl = document.getElementById(pref + 'sh');
        const pixelSizeEl = document.getElementById(pref + 'pixelSize');
        const pxwEl = document.getElementById(pref + 'pxw');
        const pxhEl = document.getElementById(pref + 'pxh');
        if (preset === 'IMX661' || preset === 'imx661') {
          if (swEl) swEl.value = 46.15;
          if (shEl) shEl.value = 32.87;
          if (pixelSizeEl) pixelSizeEl.value = 3.45;
          if (pxwEl) pxwEl.value = 13376;
          if (pxhEl) pxhEl.value = 9528;
        } else if (preset === 'IMX342') {
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
        } else if (preset === 'IMX927' || preset === 'imx927') {
          if (swEl) swEl.value = 25.54;
          if (shEl) shEl.value = 20.01;
          if (pixelSizeEl) pixelSizeEl.value = 2.2;
          if (pxwEl) pxwEl.value = 11608;
          if (pxhEl) pxhEl.value = 9096;
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

    const cp = document.getElementById(pref + 'cocPreset');
    if (cp) {
      cp.addEventListener('change', () => {
        const preset = cp.value;
        const swVal = parseFloat(document.getElementById(pref + 'sw')?.value || 46.15);
        const shVal = parseFloat(document.getElementById(pref + 'sh')?.value || 32.87);
        const pixelSizeVal = parseFloat(document.getElementById(pref + 'pixelSize')?.value || 3.45);
        const cb = document.getElementById(pref + 'cocBox');
        const cs = document.getElementById(pref + 'cocSlider');
        if (cb && cs) {
          if (preset === 'pixel') {
            cb.value = pixelSizeVal.toFixed(2);
            cs.value = pixelSizeVal;
          } else if (preset === 'sensor-fraction') {
            const diagonal = Math.sqrt(swVal*swVal + shVal*shVal);
            const fraction = (diagonal / 1500) * 1000; 
            cb.value = fraction.toFixed(2);
            cs.value = fraction;
          } else if (preset === 'traditional') {
            cb.value = 25.0;
            cs.value = 25.0;
          }
        }
        calculate();
      });
    }
  });

    function calculate() {
    const activeTab = document.querySelector('.tab-content.active');
    const prefix = (activeTab && activeTab.id === 'model2-tab') ? 'm2-' : (activeTab && activeTab.id === 'model3-tab') ? 'm3-' : '';
    var isModel2 = (prefix === 'm2-');
    var isModel3 = (prefix === 'm3-');

    const maxFootprintW = document.getElementById(prefix + 'maxFootprintW');
    const maxFootprintD = document.getElementById(prefix + 'maxFootprintD');
    const maxHeight = document.getElementById(prefix + 'maxHeight');
    const patientEnvW = document.getElementById(prefix + 'patientEnvW');
    const patientEnvD = document.getElementById(prefix + 'patientEnvD');
    const patientEnvH = document.getElementById(prefix + 'patientEnvH');
    const sensorPreset = document.getElementById(prefix + 'sensorPreset');
    const sw = document.getElementById(prefix + 'sw');
    const sh = document.getElementById(prefix + 'sh');
    const pixelSize = document.getElementById(prefix + 'pixelSize');
    const pxw = document.getElementById(prefix + 'pxw');
    const pxh = document.getElementById(prefix + 'pxh');
    const wdSlider = document.getElementById(prefix + 'wdSlider');
    const wdBox = document.getElementById(prefix + 'wdBox');
    const flSlider = document.getElementById(prefix + 'flSlider');
    const flBox = document.getElementById(prefix + 'flBox');
    const apSlider = document.getElementById(prefix + 'apSlider');
    const apBox = document.getElementById(prefix + 'apBox');
    const reqResSlider = document.getElementById(prefix + 'reqResSlider');
    const reqResBox = document.getElementById(prefix + 'reqResBox');
    const cocPreset = document.getElementById(prefix + 'cocPreset');
    const cocSlider = document.getElementById(prefix + 'cocSlider');
    const cocBox = document.getElementById(prefix + 'cocBox');
    const overlapX = document.getElementById(prefix + 'overlapX');

    // Shadow outputs as local variables
    const geoRes = document.getElementById(prefix + 'geoRes');
    const geoResStatus = document.getElementById(prefix + 'geoResStatus');
    const fovVal = document.getElementById(prefix + 'fovVal');
    const fovHVal = document.getElementById(prefix + 'fovHVal');
    const diffBlur = document.getElementById(prefix + 'diffBlur');
    const diffStatus = document.getElementById(prefix + 'diffStatus');
    const resolutionExplanation = document.getElementById(prefix + 'resolutionExplanation');
    const resolutionImpactText = document.getElementById(prefix + 'resolutionImpactText');
    const singleDOF = document.getElementById(prefix + 'singleDOF');
    const nearLimit = document.getElementById(prefix + 'nearLimit');
    const farLimit = document.getElementById(prefix + 'farLimit');
    const stackSize = document.getElementById(prefix + 'stackSize');
    const dofExplanation = document.getElementById(prefix + 'dofExplanation');
    const dofImpactText = document.getElementById(prefix + 'dofImpactText');
    const actualCamFovVal = document.getElementById(prefix + 'actualCamFovVal');
    const maxFovHAtReqResVal = document.getElementById(prefix + 'maxFovHAtReqResVal');
    const verticalCamsNeededVal = document.getElementById(prefix + 'verticalCamsNeededVal');
    const motorStepsVal = document.getElementById(prefix + 'motorStepsVal');
    const motorStepSizeVal = document.getElementById(prefix + 'motorStepSizeVal');
    const motorTotalTravelVal = document.getElementById(prefix + 'motorTotalTravelVal');
    const motorExplanation = document.getElementById(prefix + 'motorExplanation');
    const ringSuggestVal = document.getElementById(prefix + 'ring-suggest-val');
    const sweepSuggestVal = document.getElementById(prefix + 'sweep-suggest-val');

    // Restore calculations inputs
    const limitW = parseFloat(maxFootprintW.value);
    const limitD = parseFloat(maxFootprintD.value);
    const patW = parseFloat(patientEnvW.value) * 1000;
    const patD = parseFloat(patientEnvD.value) * 1000;
    const patH = parseFloat(patientEnvH.value) * 1000;
    const sensorW = parseFloat(sw.value);
    const sensorH = parseFloat(sh.value);
    const pixelSizeUm = parseFloat(pixelSize.value);
    const pxWidth = parseInt(pxw.value);
    const pxHeight = parseInt(pxh.value);
    const wd = parseFloat(wdBox.value);  
    const ap = parseFloat(apBox.value); 
    const reqRes = parseFloat(reqResBox.value); 
    const fl = parseFloat(flBox.value); 
    
    // Safety guard for invalid optics (WD <= FL)
    if (wd <= fl + 5) {
      if(geoRes) geoRes.textContent = "N/A";
      if(geoResStatus) geoResStatus.textContent = "INVALID";
      geoResStatus.className = "badge badge-fail";
      resolutionExplanation.innerHTML = `<span style="color:#ef4444; font-weight:bold;">⚠️ Invalid Configuration:</span> Working Distance (<b>${wd} mm</b>) must be greater than Focal Length (<b>${fl} mm</b>). Increase Working Distance or reduce Focal Length.`;
      resolutionImpactText.innerHTML = `👉 Adjust inputs on the left to restore normal operation.`;
      
      singleDOF.textContent = "N/A";
      nearLimit.textContent = "N/A";
      farLimit.textContent = "N/A";
      stackSize.textContent = "N/A";
      dofExplanation.innerHTML = `N/A (Invalid Optics)`;
      dofImpactText.innerHTML = `👉 DoF calculations require a valid Working Distance greater than the Focal Length.`;
      
      if (actualCamFovVal) actualCamFovVal.textContent = "--";
      if (maxFovHAtReqResVal) maxFovHAtReqResVal.textContent = "--";
      if (verticalCamsNeededVal) verticalCamsNeededVal.textContent = "--";
      if (motorStepsVal) motorStepsVal.textContent = "--";
      if (motorStepSizeVal) motorStepSizeVal.textContent = "--";
      if (motorTotalTravelVal) motorTotalTravelVal.textContent = "--";
      if (motorExplanation) motorExplanation.innerHTML = `N/A (Invalid Optics)`;
      return;
    }
    
    // Geometry
    const magnification = fl / (wd - fl);
    const fovW = sensorW / (magnification || 0.001);
    const fovH = sensorH / (magnification || 0.001);
    
    if (fovVal) fovVal.textContent = fovW.toFixed(0);
    if (fovHVal) fovHVal.textContent = fovH.toFixed(0);
    
    const densityW = pxWidth / (fovW || 0.001);
    const densityH = pxHeight / (fovH || 0.001);
    const currentDensity = Math.min(densityW, densityH);
    
    // CoC & Diffraction
    const cocUm = parseFloat(cocBox.value) || 0.1;
    const cocMm = cocUm / 1000;
    
    const airyDiskUm = 2.44 * 0.55 * ap;
    if(diffBlur) diffBlur.textContent = airyDiskUm.toFixed(2);
    
    let isDiffractionOk = airyDiskUm <= pixelSizeUm;
    if(diffStatus) diffStatus.textContent = isDiffractionOk ? "OK" : "Diff Limit";
    diffStatus.className = `badge ${isDiffractionOk ? 'badge-pass' : 'badge-warn'}`;
    
    const isResolutionOk = currentDensity >= reqRes;
    if(geoRes) geoRes.textContent = currentDensity.toFixed(2);
    if(geoResStatus) geoResStatus.textContent = isResolutionOk ? "PASS" : "FAIL";
    geoResStatus.className = `badge ${isResolutionOk ? 'badge-pass' : 'badge-fail'}`;
    
    // Populate Horizontal and Vertical density separately
    const geoResHEl = document.getElementById(prefix + 'geoResH');
    const geoResVEl = document.getElementById(prefix + 'geoResV');
    if (geoResHEl) geoResHEl.textContent = densityW.toFixed(2);
    if (geoResVEl) geoResVEl.textContent = densityH.toFixed(2);
    
    // Total Array FOV and Avg Envelope Density
    {
      const isM2 = (prefix === 'm2-');
      const isM3 = (prefix === 'm3-');
      const nColsInput = isM2 ? document.getElementById('m2-numColumns') : (isM3 ? document.getElementById('m3-numColumns') : null);
      const nCols = nColsInput ? parseInt(nColsInput.value) : 1;
      const ovPct = (parseFloat((document.getElementById(prefix + 'overlapX') || {}).value) || 0) / 100;
      const patHM2 = (patientEnvH ? parseFloat(patientEnvH.value) : 2.0) || 2.0;
      const patDM2 = (patientEnvD ? parseFloat(patientEnvD.value) : 0.6) || 0.6;
      
      const stepHmm = fovH * (1 - ovPct);
      let vCamsCalc = 1;
      if (patHM2 * 1000 > fovH) {
        vCamsCalc = Math.ceil((patHM2 * 1000 - fovH) / (stepHmm || 0.001)) + 1;
      }
      vCamsCalc = Math.max(1, vCamsCalc);

      
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
    const finalStackSize = (isFinite(stacks) && stacks > 0) ? stacks : 1;
    stackSize.textContent = finalStackSize;
    
    // -------------------------------------------------------------
    // Vertical Motor Steps Calculation (Option A: Rotating Column Gantry)
    // -------------------------------------------------------------
    
    if (!patientEnvH) {
      console.error("patientEnvH is missing for prefix: ", prefix);
    }
    const patHeightM = (patientEnvH ? parseFloat(patientEnvH.value) : 2.0) || 2.0;

    const ov = (parseFloat((document.getElementById(prefix + 'overlapX') || {}).value) || 0) / 100;
    const fovHM = fovH / 1000;
    
    // Calculate vertical cameras needed based on actual camera settings at WD
    const actualStepH_mm = fovH * (1 - ov);
    let vertCamsNeeded = 1;
    if (isModel3) {
      const carriageCamsEl = document.getElementById('m3-g3dColCamsSlider');
      vertCamsNeeded = carriageCamsEl ? parseInt(carriageCamsEl.value) : 2;
      if (document.getElementById('m3-col-cams-val-three')) {
        document.getElementById('m3-col-cams-val-three').textContent = vertCamsNeeded;
      }
    } else if (patHeightM * 1000 > fovH) {
      vertCamsNeeded = Math.ceil((patHeightM * 1000 - fovH) / (actualStepH_mm || 0.001)) + 1;
    }
    vertCamsNeeded = Math.max(1, vertCamsNeeded);

    // Sync count back to slider and UI labels (prefix-safe)
    const label = document.getElementById(prefix + 'col-cams-val-three') || document.getElementById('col-cams-val-three');
    if (label) {
        label.textContent = vertCamsNeeded;
    }
    const slider = document.getElementById(prefix + 'g3dColCamsSlider') || document.getElementById('g3dColCamsSlider');
    if (slider) slider.value = vertCamsNeeded;

    let horizCamsNeeded = 1;
      if (isModel3 && patientEnvW) {
          const envW_m = parseFloat(patientEnvW.value) || 1.0;
          const fovWM = fovW / 1000;
          const stepW = fovWM * (1 - ov);
          if (envW_m > fovWM) {
              horizCamsNeeded = Math.ceil((envW_m - fovWM) / (stepW || 0.001)) + 1;
          }
      }

      const totalCams = vertCamsNeeded; // Auto-driven count

      const numColsEl = document.getElementById('m2-numColumns');
      let numColumns = (isModel2 && numColsEl) ? parseInt(numColsEl.value) : 1;
      
      if (isModel3) {
          numColumns = horizCamsNeeded;
          if (document.getElementById('m3-numColumns')) {
              document.getElementById('m3-numColumns').value = horizCamsNeeded;
          }
          if (document.getElementById('m3-numColumnsText')) {
              document.getElementById('m3-numColumnsText').textContent = numColumns + ' cameras';
          }
      }
      
      if (isModel2 && document.getElementById('m2-numColumnsText')) {
          document.getElementById('m2-numColumnsText').textContent = numColumns + ' columns';
      }
      
      let totalFovW = fovW + (numColumns - 1) * (fovW * (1 - ov));
      let totalFovH = fovH + (vertCamsNeeded - 1) * (fovH * (1 - ov));
      
      const fovSuffix = isModel3 ? ' <span style="font-size:10px; color:#64748b; font-weight:normal;">(Static Array)</span>' : '';
      
      const totalFovText = document.getElementById(prefix + 'totalFovText');
      if (totalFovText) {
          totalFovText.innerHTML = (totalFovW/1000).toFixed(2) + 'm W &times; ' + (totalFovH/1000).toFixed(2) + 'm H' + fovSuffix;
      }
      
      const totalArrayFovEl = document.getElementById(prefix + 'totalArrayFov');
      if (totalArrayFovEl) {
          totalArrayFovEl.innerHTML = (totalFovW/1000).toFixed(2) + 'm W &times; ' + (totalFovH/1000).toFixed(2) + 'm H' + fovSuffix;
      }
      
      const avgDensityText = document.getElementById(prefix === '' ? 'avgDensityText' : prefix + 'avgDensityText');
      if (avgDensityText && typeof currentDensity !== 'undefined') {
          const depthSpanMm = (patientEnvD ? parseFloat(patientEnvD.value) : 0.6) * 1000;
          const backDensity = currentDensity * ((wd - fl) / ((wd + depthSpanMm) - fl));
          const avgDensity = (currentDensity + backDensity) / 2;
          avgDensityText.textContent = avgDensity.toFixed(2);
      }

    // Calculate vertical camera heights starting from bottom to cover patient envelope height
    const newHeights = [];
    if (isModel3) {
      // Local heights on the carriage, spaced upwards starting from 0
      const stepH = fovHM * (1 - ov);
      for (let i = 0; i < vertCamsNeeded; i++) {
        newHeights.push(i * stepH);
      }
    } else {
      let currentH = Math.max(0.15, fovHM / 2); // First camera positioned so its FOV bottom touches floor (min 0.15m)
      for (let i = 0; i < totalCams; i++) {
        newHeights.push(currentH);
        currentH += fovHM * (1 - ov); // Spaced upwards by vertical FOV step
      }
    }
    g3dCamHeights = newHeights;
    
    // Vertical coverage height spanned by column cameras
    let coverageHM = fovHM;
    if (g3dCamHeights.length > 0) {
      const minH = g3dCamHeights[0];
      const maxH = g3dCamHeights[g3dCamHeights.length - 1];
      coverageHM = (maxH - minH) + fovHM;
    }
    
    let verticalTravelStep = fovHM * (1 - ov); // step pitch (meters)
    let motorSteps = 1;
    let totalTravel = 0;
    if (coverageHM < patHeightM) {
      let remainingH = patHeightM - coverageHM;
      let movements = Math.ceil(remainingH / (verticalTravelStep || 0.001));
      motorSteps = movements + 1;
      totalTravel = movements * verticalTravelStep;
    }

    // Update Right Panel UI
    const maxFovH_mm = pxHeight / (reqRes || 1);
    var isModel2 = (prefix === 'm2-');

    if (actualCamFovVal) actualCamFovVal.textContent = `${fovW.toFixed(0)} × ${fovH.toFixed(0)}`;
    if (maxFovHAtReqResVal) maxFovHAtReqResVal.textContent = maxFovH_mm.toFixed(1);
    
    if (verticalCamsNeededVal) {
      const camsLabel = verticalCamsNeededVal.parentNode.previousElementSibling;
      if (camsLabel) {
        camsLabel.textContent = isModel3 ? 'Cameras on Carriage (per Column / Total)' : isModel2 ? 'Cameras Required (per Column / Total)' : 'Vertical Cameras Required (Static Column)';
      }
      var m2ColCount = (isModel2 && document.getElementById('m2-numColumns')) ? parseInt(document.getElementById('m2-numColumns').value) : 2;
      verticalCamsNeededVal.textContent = isModel3 ? `${vertCamsNeeded} / ${vertCamsNeeded * numColumns}` : isModel2 ? `${vertCamsNeeded} / ${m2ColCount * vertCamsNeeded}` : vertCamsNeeded;
    }
    if (isModel3) {
      window.m3MinHeight = Math.max(0.15, fovHM / 2);
      window.m3MaxHeight = window.m3MinHeight + totalTravel;
    }
    
    if (motorStepsVal) {
      const stepsLabel = motorStepsVal.parentNode.previousElementSibling;
      if (stepsLabel) {
        stepsLabel.textContent = isModel3 ? `Required Motor Steps (with ${numColumns} columns)` : isModel2 ? 'Required Motor Steps (with 2 columns)' : 'Required Motor Steps (with 1 column)';
      }
      motorStepsVal.textContent = motorSteps;
    }
    
    if (motorStepSizeVal) motorStepSizeVal.textContent = (verticalTravelStep * 1000).toFixed(0);
    if (motorTotalTravelVal) motorTotalTravelVal.textContent = (totalTravel * 1000).toFixed(0);
    
    let explanationText = "";
    if (isModel3) {
      if (motorSteps === 1) {
        explanationText = `The system has <b>${numColumns} columns</b>, each carrying a vertical array of <b>${vertCamsNeeded} cameras</b> (total <b>${numColumns * vertCamsNeeded} cameras</b>) spanning <b>${coverageHM.toFixed(2)}m</b>. This fully covers the patient envelope height of <b>${patHeightM.toFixed(1)}m</b> in a single shot. <b>No vertical scanning motion is required.</b>`;
      } else {
        explanationText = `The system has <b>${numColumns} columns</b>, each carrying a vertical carriage array of <b>${vertCamsNeeded} cameras</b> (total <b>${numColumns * vertCamsNeeded} cameras</b>) spanning <b>${coverageHM.toFixed(2)}m</b>. To cover the remaining height of the <b>${patHeightM.toFixed(1)}m</b> patient envelope, the carriages must scan vertically in <b>${motorSteps - 1} steps</b> (total <b>${motorSteps} stops</b>) with a step pitch of <b>${(verticalTravelStep * 1000).toFixed(0)} mm</b>. Total vertical travel is <b>${(totalTravel * 1000).toFixed(0)} mm</b>.`;
      }
    } else if (isModel2) {
      if (motorSteps === 1) {
        explanationText = `The ${m2ColCount} columns have <b>${m2ColCount * vertCamsNeeded} cameras</b> (<b>${vertCamsNeeded} cameras per column</b>) spanning <b>${coverageHM.toFixed(2)}m</b> vertically. This fully covers the patient envelope height of <b>${patHeightM.toFixed(1)}m</b> in a single shot. <b>No vertical motor movement is required.</b>`;
      } else {
        explanationText = `The ${m2ColCount} columns have <b>${m2ColCount * vertCamsNeeded} cameras</b> (<b>${vertCamsNeeded} cameras per column</b>) spanning <b>${coverageHM.toFixed(2)}m</b> vertically. To cover the remaining height of the <b>${patHeightM.toFixed(1)}m</b> patient envelope, the dual columns must scan vertically in <b>${motorSteps - 1} steps</b> (total <b>${motorSteps} frame groups</b>) with a step pitch of <b>${(verticalTravelStep * 1000).toFixed(0)} mm</b>. Total vertical travel is <b>${(totalTravel * 1000).toFixed(0)} mm</b>.`;
      }
    } else {
      if (motorSteps === 1) {
        explanationText = `The column has <b>${vertCamsNeeded} cameras</b> spanning <b>${coverageHM.toFixed(2)}m</b> vertically. This fully covers the patient envelope height of <b>${patHeightM.toFixed(1)}m</b> in a single shot. <b>No vertical motor movement is required.</b>`;
      } else {
        explanationText = `The column has <b>${vertCamsNeeded} cameras</b> spanning <b>${coverageHM.toFixed(2)}m</b> vertically. To cover the remaining height of the <b>${patHeightM.toFixed(1)}m</b> patient envelope, the column must scan vertically in <b>${motorSteps - 1} steps</b> (total <b>${motorSteps} frame groups</b>) with a step pitch of <b>${(verticalTravelStep * 1000).toFixed(0)} mm</b>. Total vertical travel is <b>${(totalTravel * 1000).toFixed(0)} mm</b>.`;
      }
    }
    if (motorExplanation) motorExplanation.innerHTML = explanationText;

    const settleInput = document.getElementById('m3-settleTime');
    const sliceInput = document.getElementById('m3-sliceTime');
    const rotInput = document.getElementById('m3-rotationTime');
    
    const settleT = settleInput ? (parseFloat(settleInput.value) || 1.0) : 1.0;
    const sliceT = sliceInput ? (parseFloat(sliceInput.value) || 0.25) : 0.25;
    const rotationT = rotInput ? (parseFloat(rotInput.value) || 3.0) : 3.0;

    if (isModel3) {
      // Focus stacking factor: finalStackSize. Captures BOTH Cross-Polarized and Non-Polarized (2x multiplier)
      const totalImages = numColumns * vertCamsNeeded * motorSteps * (2 * finalStackSize) * 4;
      const stopTime = settleT + (2 * finalStackSize * sliceT); // Single settle time, dual stack exposure time
      const scanTimePerPose = motorSteps * stopTime;
      const totalTime = (4 * scanTimePerPose) + (3 * rotationT);
      
      const imagesEl = document.getElementById('m3-totalCapturedImages');
      const timeEl = document.getElementById('m3-totalSessionTime');
      if (imagesEl) imagesEl.textContent = totalImages;
      if (timeEl) timeEl.textContent = totalTime.toFixed(1);

      // Save animation parameters
      window.g3dTotalTime = totalTime;
      window.g3dMotorSteps = motorSteps;
      window.g3dVerticalTravelStep = verticalTravelStep;
      window.g3dFinalStackSize = finalStackSize;
    } else if (isModel2) {
      // Captures BOTH Cross-Polarized and Non-Polarized (2x multiplier)
      const totalImages = m2ColCount * vertCamsNeeded * motorSteps * (2 * finalStackSize) * 4;
      const stopTime = settleT + (2 * finalStackSize * sliceT); // Single settle time, dual stack exposure time
      const scanTimePerStop = motorSteps * stopTime;
      const totalTime = (4 * scanTimePerStop) + (3 * rotationT);
      
      const imagesEl = document.getElementById('m2-totalCapturedImages');
      const timeEl = document.getElementById('m2-totalSessionTime');
      if (imagesEl) imagesEl.textContent = totalImages;
      if (timeEl) timeEl.textContent = totalTime.toFixed(1);

      // Save animation parameters
      window.g3dTotalTime = totalTime;
      window.g3dMotorSteps = motorSteps;
      window.g3dVerticalTravelStep = verticalTravelStep;
      window.g3dFinalStackSize = finalStackSize;
    } else {
      window.g3dTotalTime = 5.0; // Model 1 defaults to 5.0s sweep
      window.g3dMotorSteps = 1;
      window.g3dVerticalTravelStep = 0;
      window.g3dFinalStackSize = 1;
    }

    // Update the read-only Active Unit Price field based on chosen sensor preset
    const sensorPresetVal = (sensorPreset ? sensorPreset.value : "custom").toLowerCase();
    const p50 = parseFloat(document.getElementById(prefix + 'price50')?.value || 6500);
    const p64 = parseFloat(document.getElementById(prefix + 'price64')?.value || 6500);
    const p100 = parseFloat(document.getElementById(prefix + 'price100')?.value || 8000);
    const p127 = parseFloat(document.getElementById(prefix + 'price127')?.value || 12000);
    const p150 = parseFloat(document.getElementById(prefix + 'price150')?.value || 15000);
    const pCustom = parseFloat(document.getElementById(prefix + 'priceCustom')?.value || 6500);

    let activeUnitPrice = pCustom;
    if (sensorPresetVal.includes("50mp") || sensorPresetVal.includes("mf50")) {
      activeUnitPrice = p50;
    } else if (sensorPresetVal.includes("64mp") || sensorPresetVal.includes("64 mp") || sensorPresetVal.includes("embedded")) {
      activeUnitPrice = p64;
    } else if (sensorPresetVal.includes("100mp") || sensorPresetVal.includes("100 mp")) {
      activeUnitPrice = p100;
    } else if (sensorPresetVal.includes("127mp") || sensorPresetVal.includes("imx661")) {
      activeUnitPrice = p127;
    } else if (sensorPresetVal.includes("150mp") || sensorPresetVal.includes("imx411")) {
      activeUnitPrice = p150;
    }
    
    const priceInput = document.getElementById(prefix + 'cameraUnitPrice');
    if (priceInput) priceInput.value = activeUnitPrice;

    // Calculate total camera cost and budget status
    const budgetInput = document.getElementById(prefix + 'maxCameraBudget');
    const unitPrice = activeUnitPrice;
    const maxBudget = budgetInput ? (parseFloat(budgetInput.value) || 0) : 0;
    
    let totalCamsNum = vertCamsNeeded;
    if (isModel3) {
      totalCamsNum = numColumns * vertCamsNeeded;
    } else if (isModel2) {
      totalCamsNum = m2ColCount * vertCamsNeeded;
    }
    
    const totalCost = totalCamsNum * unitPrice;
    
    const costEl = document.getElementById(prefix ? prefix + 'totalCameraCost' : 'totalCameraCost');
    const budgetStatusEl = document.getElementById(prefix ? prefix + 'budgetStatus' : 'budgetStatus');
    if (costEl) costEl.textContent = totalCost.toLocaleString();
    if (budgetStatusEl) {
      if (totalCost <= maxBudget) {
        budgetStatusEl.textContent = "WITHIN BUDGET";
        budgetStatusEl.className = "badge badge-pass";
      } else {
        budgetStatusEl.textContent = "OVER BUDGET";
        budgetStatusEl.className = "badge badge-fail";
      }
    }


    // Populate optimization matrix
    populateOptimizationMatrix(prefix);
    const actualPxMm = Math.min(pxWidth / (fovW || 1), pxHeight / (fovH || 1));
    renderTopDownDensityMap(prefix, actualPxMm, fl);
    render1DDensityGraph(prefix, actualPxMm, fl);

    // Update live 3D gantry visualizer preview
    if (typeof updateGantry3D === 'function') {
      updateGantry3D(wd, patW, fovW, fovH);
    }
  }

  // Init 3D Visualizer on Tab click
  function init3D() {
    setTimeout(resizeGantry3D, 100);
  }

  // ============================================================
  // GANTRY 3D VISUALIZER — Pure Canvas 2D Perspective Renderer
  // Zero external dependencies. Works on hidden/visible tabs.
  // ============================================================
  var g3dContainer = null;
  var g3dCanvas    = null;
  var g3dCtx       = null;
  var g3dSweepAngle  = 0;
  var g3dIsSweeping  = false;
  var g3dSweepStart  = null;
  var g3dOrbitYaw    = 0.0;
  var g3dOrbitPitch  = 0.35;
  var g3dDragging    = false;
  var g3dDragX = 0, g3dDragY = 0;
  var g3dAnimId      = null;
  var g3dInitialized = false;

  // Zoom and Camera Heights parameters (mutable)
  var g3dCamDist = 4.8;
  var g3dCamHeights = [0.28, 0.68, 1.10, 1.50, 1.90];

  // Live scene params (updated by calculate())
  var g3dPatW = 1.0;
  var g3dPatD = 1.0;
  var g3dPatH = 2.0;
  var g3dWD   = 0.53;
  var g3dFovW = 0.8;
  var g3dFovH = 0.5;

  const G3D_CLEARANCE = 0.30;  // floor footprint radius shown (30 cm)

  // Zoom control helpers
  window.updateG3DZoom = function(val) {
    g3dCamDist = parseFloat(val);
    const text = document.getElementById('zoom-val-three');
    if (text) {
      const relZoom = (4.8 / g3dCamDist).toFixed(1);
      text.textContent = relZoom + 'x';
    }
  };
  window.changeG3DZoom = function(delta) {
    const slider = document.getElementById('g3dZoomSlider');
    if (slider) {
      const newVal = Math.max(1.5, Math.min(12, parseFloat(slider.value) + delta));
      slider.value = newVal;
      window.updateG3DZoom(newVal);
    }
  };
  window.updateOverlapValue = function(val, prefix = '') {
    const text = document.getElementById(prefix + 'overlapValText');
    if (text) text.textContent = val + '%';
    calculate();
  };
  window.resetG3DZoom = function() {
    g3dCamDist = 4.8;
    const slider = document.getElementById('g3dZoomSlider');
    if (slider) slider.value = 4.8;
    window.updateG3DZoom(4.8);
  };

  window.setG3DLightingMode = function(mode) {
    window.g3dIlluminationMode = mode;
    
    const btnCross = document.getElementById('btn-light-cross');
    const btnNone = document.getElementById('btn-light-none');
    if (btnCross && btnNone) {
      if (mode === 'cross') {
        btnCross.classList.add('active');
        btnNone.classList.remove('active');
      } else {
        btnCross.classList.remove('active');
        btnNone.classList.add('active');
      }
    }
    
    const targetShininess = (mode === 'none') ? 2 : 10;
    g3dSkinMaterials.forEach(mat => {
      mat.needsUpdate = true;
    });
    
    if (dirLight) {
      dirLight.intensity = (mode === 'none') ? 1.1 : 0.65;
    }
    if (fillLight) {
      fillLight.intensity = (mode === 'none') ? 0.45 : 0.25;
    }
    
    rebuildGantryMechanicals();
  };

  // Camera count update helper
  window.updateColumnCamCount = function(count) {
    const label = document.getElementById('col-cams-val-three');
    if (label) label.textContent = count;
    calculate();
  };

  // Optics Override helpers (linked to main panel inputs)
  window.syncCameraToMain = function(presetValue) {
    const mainPreset = document.getElementById('sensorPreset');
    if (mainPreset) {
      mainPreset.value = presetValue;
      mainPreset.dispatchEvent(new Event('change'));
    }
  };
  window.syncLensToMain = function(flValue) {
    const flSlider = document.getElementById('flSlider');
    const flBox = document.getElementById('flBox');
    if (flSlider && flBox) {
      flSlider.value = flValue;
      flBox.value = flValue;
      flSlider.dispatchEvent(new Event('input'));
    }
  };

  // ============================================================
  // THREE.JS GANTRY 3D VISUALIZER WITH REAL HEAD SCAN GLTF
  // ============================================================
  var g3dScene, g3dCamera, g3dRenderer, g3dControls;
  var gantryGroup, mannequinGroup, headMesh, stationaryGroup;
  var g3dBoneLeftArm = null, g3dBoneRightArm = null, g3dBoneLeftLeg = null, g3dBoneRightLeg = null;
  var g3dMixer = null;
  var g3dClock = new THREE.Clock();
  var nathanModel = null;
  var dirLight, fillLight;
  var g3dSkinMaterials = [];
  window.g3dIlluminationMode = 'cross';
  
  function setupGantry3D() {
    g3dContainer = document.getElementById('canvas3d-three');
    if (!g3dContainer || g3dInitialized) return;
    g3dInitialized = true;

    // Create floating HTML HUD overlay on top of WebGL canvas
    const hud = document.createElement('div');
    hud.id = 'g3d-hud-overlay';
    hud.style.cssText = 'display:none; position:absolute; top:12px; left:12px; z-index:15; background:rgba(255,255,255,0.92); border:1px solid #cbd5e1; border-radius:7px; padding:10px 14px; font-family:"Segoe UI",sans-serif; font-size:11px; color:#475569; pointer-events:none; box-shadow:0 2px 8px rgba(0,0,0,0.06); width:320px;';
    g3dContainer.appendChild(hud);

    // Create Scene with a clinical main background
    g3dScene = new THREE.Scene();
    g3dScene.background = new THREE.Color(0xf1f5f9);

    // Create camera — use fallback aspect if container is hidden
    const initAspect = (g3dContainer.clientWidth || 800) / (g3dContainer.clientHeight || 500);
    g3dCamera = new THREE.PerspectiveCamera(38, initAspect, 0.1, 100);
    g3dCamera.position.set(3.2, 2.4, 4.2);

    // Create WebGL Renderer — use fallback size if container is hidden (clientWidth=0)
    g3dRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    const initW = g3dContainer.clientWidth  || 800;
    const initH = g3dContainer.clientHeight || 500;
    g3dRenderer.setSize(initW, initH);
    g3dRenderer.setPixelRatio(window.devicePixelRatio);
    g3dRenderer.shadowMap.enabled = false;
    g3dRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Make canvas fill its container via CSS (Three.js sets explicit pixel w/h, this overrides display)
    g3dRenderer.domElement.style.width  = '100%';
    g3dRenderer.domElement.style.height = '100%';
    g3dRenderer.domElement.style.display = 'block';
    g3dContainer.appendChild(g3dRenderer.domElement);

    // Setup Orbit Controls
    g3dControls = new THREE.OrbitControls(g3dCamera, g3dRenderer.domElement);
    g3dControls.enableDamping = true;
    g3dControls.dampingFactor = 0.05;
    g3dControls.enableZoom = false; // Prevent scroll trapping so user can scroll down to matrix
    g3dControls.target.set(0, 1.1, 0); // look at head/torso center
    g3dControls.minDistance = 1.2;
    g3dControls.maxDistance = 8.0;
    g3dControls.maxPolarAngle = Math.PI / 2 + 0.1; // allow looking slightly below floor

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    g3dScene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = false;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    g3dScene.add(dirLight);

    fillLight = new THREE.DirectionalLight(0x93c5fd, 0.35); // soft blue fill light
    fillLight.position.set(-4, 3, -4);
    g3dScene.add(fillLight);

    // Add floor grid
    const gridHelper = new THREE.GridHelper(6, 12, 0xcbd5e1, 0xe2e8f0);
    gridHelper.position.y = 0.005;
    g3dScene.add(gridHelper);

    // Add Floor shadow receiver
    const floorGeo = new THREE.PlaneGeometry(6, 6);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.95 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    g3dScene.add(floorMesh);

    // ⌀30cm green floor safety ring
    const ringGeo = new THREE.RingGeometry(0.297, 0.303, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.01;
    g3dScene.add(ringMesh);
    window.g3dFloorSafetyRing = ringMesh;

    // Groups
    mannequinGroup = new THREE.Group();
    g3dScene.add(mannequinGroup);

    gantryGroup = new THREE.Group();
    g3dScene.add(gantryGroup);

    stationaryGroup = new THREE.Group();
    g3dScene.add(stationaryGroup);

    // Decode and parse embedded realistic human body GLB model if available
    if (window.bodyModelGlbData) {
      try {
        const binaryString = atob(window.bodyModelGlbData);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;

        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.parse(
          arrayBuffer,
          '',
          function (gltf) {
            // Remove mannequin group (the cylinders dummy)
            if (mannequinGroup) {
              while (mannequinGroup.children.length > 0) {
                mannequinGroup.remove(mannequinGroup.children[0]);
              }
            } else {
              mannequinGroup = new THREE.Group();
              g3dScene.add(mannequinGroup);
            }

            const model = gltf.scene;
            model.traverse(child => {
              console.log("GLTF node:", child.name, "| isBone:", child.isBone, "| type:", child.type);
              if (child.isBone) {
                console.log("Model bone detected:", child.name);
                const nameL = child.name.toLowerCase();
                if (nameL.includes('leftarm') || nameL.includes('arm_l') || nameL.includes('l_arm')) g3dBoneLeftArm = child;
                if (nameL.includes('rightarm') || nameL.includes('arm_r') || nameL.includes('r_arm')) g3dBoneRightArm = child;
                if (nameL.includes('leftupleg') || nameL.includes('leg_l') || nameL.includes('l_leg')) g3dBoneLeftLeg = child;
                if (nameL.includes('rightupleg') || nameL.includes('leg_r') || nameL.includes('r_leg')) g3dBoneRightLeg = child;
              }
              if (child.isMesh || child.isSkinnedMesh) {
                if (child.geometry) {
                  if (child.geometry.attributes.normal) child.geometry.deleteAttribute('normal');
                  child.geometry.computeVertexNormals();
                }
                child.castShadow = false;
                child.receiveShadow = false;
                if (child.material) {
                  child.material = new THREE.MeshLambertMaterial({
                    color: 0xf4d3c4
                  });
                  if (!g3dSkinMaterials.includes(child.material)) {
                    g3dSkinMaterials.push(child.material);
                  }
                }
              }
            });

            // Scale and position
            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);

            const targetHeight = 1.75;
            const scaleFactor = targetHeight / (size.y || 1);
          model.scale.multiplyScalar(scaleFactor);
            model.position.set(
              -center.x * scaleFactor,
              0 - (box.min.y * scaleFactor),
              -center.z * scaleFactor
            );

            nathanModel = model;
            mannequinGroup.add(nathanModel);
            console.log('Successfully loaded realistic patient body model from embedded Base64 data!');
          },
          function (err) {
            console.error('Error parsing embedded GLB:', err);
          }
        );
      } catch (e) {
        console.error('Error decoding embedded GLB:', e);
      }
    }


    // Build Gantry mechanicals
    rebuildGantryMechanicals();

    // Drag and Drop human model files (.glb or .zip) directly onto the 3D window
    g3dContainer.addEventListener('dragover', function(e) {
      e.preventDefault();
      g3dContainer.style.border = '2px dashed var(--warn)';
    });
    g3dContainer.addEventListener('dragleave', function() {
      g3dContainer.style.border = '1px solid var(--border)';
    });
    g3dContainer.addEventListener('drop', function(e) {
      e.preventDefault();
      g3dContainer.style.border = '1px solid var(--border)';
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleModelUpload(e.dataTransfer.files);
      }
    });

    // Resize sync — use actual container dimensions, fallback to 800×500 only when hidden (0)
    function syncSize() {
      const w = g3dContainer.clientWidth  || 800;
      const h = g3dContainer.clientHeight || 500;
      g3dRenderer.setSize(w, h, false); // false = don't set CSS style (we handle it ourselves)
      g3dCamera.aspect = w / h;
      g3dCamera.updateProjectionMatrix();
    }
    window._g3dSync = syncSize;

    // Sweep Button listener
    
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
    const btn = document.getElementById('scan-btn-three');
    if (btn) {
      btn.addEventListener('click', () => {
        if (g3dIsSweeping) return;
        g3dIsSweeping = true; g3dSweepStart = null;
        btn.disabled = true;
        if (window.g3dArchitecture === 'model2') {
          btn.innerHTML = '<span>⚡ Scanning 4 Stops...</span>';
        } else if (window.g3dArchitecture === 'model3') {
          btn.innerHTML = '<span>⚡ Scanning Up/Down...</span>';
        } else {
          btn.innerHTML = '<span>⚡ Scanning 360°...</span>';
        }
      });
    }

    // Animation Loop
    var loopErrorFired = false;
    (function loop(ts) {
      try {
        g3dAnimId = requestAnimationFrame(loop);
      
      // Update sweep angle if sweeping
      
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
      } else if (g3dIsSweeping) {
        if (!g3dSweepStart) g3dSweepStart = ts;
        const el = ts - g3dSweepStart;
        const representationDuration = 12000; // Sweeping in 12 seconds for slow, detailed visual representation
        const realTotalTime = window.g3dTotalTime || 5.0;
        const virtualEl = el * (realTotalTime * 1000 / representationDuration);
        
        if (el < representationDuration) {
          const settleInput = document.getElementById('m3-settleTime');
          const sliceInput = document.getElementById('m3-sliceTime');
          const rotInput = document.getElementById('m3-rotationTime');
          
          const settleT = settleInput ? (parseFloat(settleInput.value) || 1.0) : 1.0;
          const sliceT = sliceInput ? (parseFloat(sliceInput.value) || 0.25) : 0.25;
          const rotationT = rotInput ? (parseFloat(rotInput.value) || 3.0) : 3.0;
          
          const numSteps = window.g3dMotorSteps || 1;
          const stackSz = window.g3dFinalStackSize || 1;
          const stopTime = settleT + (stackSz * sliceT);
          const scanTimePerPose = numSteps * stopTime;
          const cycleTime = (rotationT + scanTimePerPose) * 1000;
          
          const cycleIdx = Math.floor(virtualEl / cycleTime);
          const elapsedInCycle = virtualEl - (cycleIdx * cycleTime);
          
          if (window.g3dArchitecture === 'model3') {
            const rotateGantry = document.getElementById('m3-rotateGantryInstead')?.checked || false;
            if (rotateGantry) {
              if (elapsedInCycle < rotationT * 1000) {
                const tRot = elapsedInCycle / (rotationT * 1000);
                const ease = tRot * tRot * (3 - 2 * tRot);
                g3dSweepAngle = (cycleIdx - 1 + ease) * (Math.PI / 2);
              } else {
                g3dSweepAngle = cycleIdx * (Math.PI / 2);
              }
              if (mannequinGroup) mannequinGroup.rotation.y = 0;
            } else {
              if (elapsedInCycle < rotationT * 1000) {
                // Rotation phase: Patient turntable rotates
                const tRot = elapsedInCycle / (rotationT * 1000);
                const ease = tRot * tRot * (3 - 2 * tRot);
                const currentAngle = (cycleIdx - 1 + ease) * (Math.PI / 2);
                if (mannequinGroup) mannequinGroup.rotation.y = Math.max(0, currentAngle);
              } else {
                // Scan phase: Turntable is locked
                if (mannequinGroup) mannequinGroup.rotation.y = cycleIdx * (Math.PI / 2);
              }
              g3dSweepAngle = 0;
            }
            
            // Render carriage vertical sweep for both modes
            if (window.m3RailWrappers) {
              const hMin = window.m3MinHeight || 0.28;
              if (elapsedInCycle < rotationT * 1000) {
                // Rotation/Transition phase: Carriages stay at bottom height
                window.m3RailWrappers.forEach(rw => { rw.position.y = hMin; });
              } else {
                // Scan phase: carriages sweep vertically step-by-step
                const stepH = window.g3dVerticalTravelStep || 0;
                const elapsedInScan = elapsedInCycle - (rotationT * 1000);
                const stepIdx = Math.floor(elapsedInScan / (stopTime * 1000));
                const elapsedInStep = elapsedInScan % (stopTime * 1000);
                
                const currentHeight = hMin + stepIdx * stepH;
                const prevHeight = stepIdx > 0 ? (hMin + (stepIdx - 1) * stepH) : hMin;
                
                let y = currentHeight;
                if (elapsedInStep < settleT * 1000) {
                  const tSettle = elapsedInStep / (settleT * 1000);
                  const easeSettle = tSettle * tSettle * (3 - 2 * tSettle);
                  y = prevHeight + easeSettle * (currentHeight - prevHeight);
                }
                window.m3RailWrappers.forEach(rw => {
                  rw.position.y = y;
                });
              }
            }
          } else if (window.g3dArchitecture === 'model2') {
            // Model 2: Dual Column discrete sweep (columns rotate around patient)
            if (elapsedInCycle < rotationT * 1000) {
              // Rotation phase: Columns rotate on ellipse track
              const tRot = elapsedInCycle / (rotationT * 1000);
              const ease = tRot * tRot * (3 - 2 * tRot);
              g3dSweepAngle = (cycleIdx - 1 + ease) * (Math.PI / 2);
            } else {
              // Scan phase: Columns stay still to capture
              g3dSweepAngle = cycleIdx * (Math.PI / 2);
            }
            if (mannequinGroup) mannequinGroup.rotation.y = 0; // Turntable locked
          } else {
            // Model 1 Option A: Continuous sweep for 5 seconds (reversed direction)
            g3dSweepAngle = -(virtualEl / (realTotalTime * 1000)) * Math.PI * 2;
            if (mannequinGroup) mannequinGroup.rotation.y = 0;
          }
          
          const d1 = document.getElementById('angle-text-three');
          const d2 = document.getElementById('time-text-three');
          if (d1) {
            if (window.g3dArchitecture === 'model3') {
              const currentAngleDeg = Math.round(((mannequinGroup ? mannequinGroup.rotation.y : 0) * (180 / Math.PI)) % 360);
              d1.textContent = currentAngleDeg + '° (Turntable)';
            } else {
              const dispAngle = (360 + (g3dSweepAngle / (Math.PI * 2)) * 360) % 360;
              d1.textContent = dispAngle.toFixed(1) + '°';
            }
          }
          if (d2) d2.textContent = Math.max(0, (realTotalTime * 1000 - virtualEl) / 1000).toFixed(1) + 's remaining (Simulated)';
        } else {
          // Finish and reset to home
          g3dSweepAngle = 0; g3dIsSweeping = false; g3dSweepStart = null;
          if (mannequinGroup) mannequinGroup.rotation.y = 0;
          if (window.m3RailWrappers) {
            const hMin = window.m3MinHeight || 0.28;
            window.m3RailWrappers.forEach(rw => { rw.position.y = hMin; });
          }
          const b2 = document.getElementById('scan-btn-three');
          if (b2) {
            b2.disabled = false;
            b2.innerHTML = window.g3dArchitecture === 'model2' ? '<span>⚡ Trigger Full Scan (4-Stop Sweep)</span>' : (window.g3dArchitecture === 'model3' ? '<span>⚡ Trigger Full Scan (4-Pose Up/Down)</span>' : '<span>⚡ Trigger 360° Sweep</span>');
          }
          const d1 = document.getElementById('angle-text-three');
          const d2 = document.getElementById('time-text-three');
          if (d1) d1.textContent = '0.0° (Home)';
          if (d2) d2.textContent = ((window.g3dTotalTime || 5.0)).toFixed(1) + 's';
        }
      }

      // Dynamically reposition columns on an elliptical path
      if (window.g3dColumns) {
        const patW = g3dPatW, patD = g3dPatD, wd = g3dWD;
        const xRadius = patW / 2 + wd;
        const zRadius = patD / 2 + wd;
        // Calculate dynamic separation based on horizontal FOV and user overlap percentage
        const overlapEl = document.getElementById(window.g3dArchitecture === 'model2' ? 'm2-overlapX' : (window.g3dArchitecture === 'model3' ? 'm3-overlapX' : 'overlapX'));
        const ovVal = parseFloat(overlapEl?.value || 15) / 100;
        // Physical separation needed to overlap their fields of view by exact ovVal %
        const requiredSeparation = g3dFovW * (1 - ovVal);
        const avgRadius = (xRadius + zRadius) / 2;
        // Convert the linear chord distance to an angular separation on the gantry
        const dynamicTheta = Math.asin(Math.min(1, requiredSeparation / (2 * avgRadius))) || 0.26;
        window.g3dDynamicTheta = dynamicTheta; // Store for HUD

        if (window.g3dArchitecture === 'model2' || window.g3dArchitecture === 'model3') {
          // Model 2 & 3: Straight horizontal line of columns parallel to the scene (X-axis)
          const colZ = -(patD / 2 + wd);
          const rotateGantry = document.getElementById('m3-rotateGantryInstead')?.checked || false;
          const angle = (window.g3dArchitecture === 'model2' || (window.g3dArchitecture === 'model3' && rotateGantry)) ? g3dSweepAngle : 0;
          
          const dirX = Math.sin(angle);
          const dirZ = Math.cos(angle);
          const tangentX = Math.cos(angle);
          const tangentZ = -Math.sin(angle);
          
          window.g3dColumns.forEach((col, idx) => {
            const numCols = window.g3dColumns.length;
            const colX = (idx - (numCols - 1) / 2) * requiredSeparation;
            col.position.set(dirX * colZ + tangentX * colX, 0, dirZ * colZ + tangentZ * colX);
            col.rotation.y = angle; // Completely parallel to each other, rotating dynamically around center
          });
        } else {
          // Model 1: Curved elliptical placement
          const xRadius = patW / 2 + wd;
          const zRadius = patD / 2 + wd;
          const avgRadius = (xRadius + zRadius) / 2;
          const dynamicTheta = Math.asin(Math.min(1, requiredSeparation / (2 * avgRadius))) || 0.26;
          window.g3dDynamicTheta = dynamicTheta;

          window.g3dColumns.forEach((col, idx) => {
            const angle = g3dSweepAngle;
            col.position.set(Math.sin(angle) * xRadius, 0, Math.cos(angle) * zRadius);
            col.rotation.y = angle;
          });
        }
      }

      // Update HUD overlay text
      const hudEl = document.getElementById('g3d-hud-overlay');
      if (hudEl) {
        hudEl.style.display = 'none';
        const patW = g3dPatW, patD = g3dPatD, patH = g3dPatH, wd = g3dWD;
        const xRadius = patW / 2 + wd;
        const zRadius = patD / 2 + wd;
        var isModel2 = window.g3dArchitecture === 'model2';
        
        let archTitle = '⚙ Option A — Rotating Column Gantry';
        let camCountText = `${g3dCamHeights.length} cameras`;
        let positionText = `Column at ${((360 + (g3dSweepAngle/(Math.PI*2))*360)%360).toFixed(1)}°`;
        
        if (isModel2) {
          archTitle = '⚙ Model 2 — Dual-Column Gantry (Stereoscopic Pair)';
          camCountText = `${g3dCamHeights.length} cams/col | ${2 * g3dCamHeights.length} total`;
          const baseDeg = (g3dSweepAngle/(Math.PI*2))*360;
          const thetaDeg = (window.g3dDynamicTheta || 0.26) * (180 / Math.PI);
          const col1Angle = (baseDeg - thetaDeg + 360) % 360;
          const col2Angle = (baseDeg + thetaDeg + 360) % 360;
          positionText = `Cameras parallel maintaining overlap (${col1Angle.toFixed(1)}° & ${col2Angle.toFixed(1)}°)`;
        }
        
        const maxDur = (window.g3dTotalTime || 5.0) * 1000;
        let timeText = '';
        if (g3dIsSweeping) {
          const el = ts - g3dSweepStart;
          const remainingTime = Math.max(0, (maxDur - el) / 1000);
          timeText = ` | <span style="color: #e11d48; font-weight: 700;">⏱ ${remainingTime.toFixed(2)}s remaining</span>`;
        } else {
          timeText = ` | <span style="color: #64748b; font-weight: 700;">⏱ ${(maxDur / 1000).toFixed(1)}s scan</span>`;
        }

        hudEl.innerHTML = `
          <div style="font-weight:bold; font-size:12.5px; color:#0f172a; margin-bottom:4px;">${archTitle}</div>
          <div>Patient Envelope: ${g3dPatW.toFixed(1)}m W × ${g3dPatD.toFixed(1)}m D × ${g3dPatH.toFixed(1)}m H</div>
          <div>Gantry Track: ${xRadius.toFixed(2)}m W × ${zRadius.toFixed(2)}m D (Elliptical)</div>
          <div>Working Distance: ${(wd*1000).toFixed(0)}mm from Envelope | ${camCountText}</div>
          <div style="color:var(--warn); font-weight:700; margin-top:2px;">Drag to orbit · ${positionText}${timeText}</div>
        `;
      }

      if (g3dMixer) {
        const delta = g3dClock.getDelta();
        g3dMixer.update(delta);
      }



      // Update camera frustum strobe flashes dynamically inside the loop
      if (window.g3dFrustums) {
        if (g3dIsSweeping) {
          if (window.g3dArchitecture === 'model3' || window.g3dArchitecture === 'model2') {
            const isM3 = window.g3dArchitecture === 'model3';
            
            const settleInput = document.getElementById(isM3 ? 'm3-settleTime' : 'm2-settleTime');
            const sliceInput = document.getElementById(isM3 ? 'm3-sliceTime' : 'm2-sliceTime');
            const rotInput = document.getElementById(isM3 ? 'm3-rotationTime' : 'm2-rotationTime');
            const settleT = settleInput ? (parseFloat(settleInput.value) || 1.0) : 1.0;
            const sliceT = sliceInput ? (parseFloat(sliceInput.value) || 0.25) : 0.25;
            const rotationT = rotInput ? (parseFloat(rotInput.value) || 3.0) : 3.0;
            
            const numSteps = window.g3dMotorSteps || 1;
            const stackSz = window.g3dFinalStackSize || 1;
            const stopTime = settleT + (2 * stackSz * sliceT);
            const scanTimePerPose = numSteps * stopTime;
            const cycleTime = (rotationT + scanTimePerPose) * 1000;
            
            const representationDuration = 12000;
            const realTotalTime = window.g3dTotalTime || 5.0;
            const el = ts - g3dSweepStart;
            const virtualEl = el * (realTotalTime * 1000 / representationDuration);
            const cycleIdx = Math.floor(virtualEl / cycleTime);
            const elapsedInCycle = virtualEl - (cycleIdx * cycleTime);
            
            if (elapsedInCycle < rotationT * 1000) {
              // Rotation phase: dim grey frustums
              window.g3dFrustums.forEach(f => {
                f.material.color.setHex(0x64748b);
                f.material.opacity = 0.1;
              });
            } else {
              // Scan phase
              const elapsedInScan = elapsedInCycle - (rotationT * 1000);
              const stepIdx = Math.floor(elapsedInScan / (stopTime * 1000));
              const elapsedInStep = elapsedInScan % (stopTime * 1000);
              
              if (elapsedInStep < settleT * 1000) {
                // Settle/Vertical transit phase: dim grey frustums
                window.g3dFrustums.forEach(f => {
                  f.material.color.setHex(0x64748b);
                  f.material.opacity = 0.1;
                });
              } else {
                // Capture phase: polarized and unpolarized strobe flashes
                const captureTime = elapsedInStep - (settleT * 1000);
                const halfCaptureTime = (stopTime * 1000 - settleT * 1000) / 2;
                
                if (captureTime < halfCaptureTime) {
                  // Flash 1: Cross-Polarized (Vibrant Blue Pulse)
                  const tFlash = captureTime / halfCaptureTime;
                  const pulse = Math.max(0.1, Math.exp(-5 * tFlash));
                  window.g3dFrustums.forEach(f => {
                    f.material.color.setHex(0x3b82f6); // blue flash
                    f.material.opacity = 0.1 + 0.85 * pulse;
                  });
                } else {
                  // Flash 2: Non-Polarized (Vibrant Amber/White Pulse)
                  const tFlash = (captureTime - halfCaptureTime) / halfCaptureTime;
                  const pulse = Math.max(0.1, Math.exp(-5 * tFlash));
                  window.g3dFrustums.forEach(f => {
                    f.material.color.setHex(0xf59e0b); // amber flash
                    f.material.opacity = 0.1 + 0.85 * pulse;
                  });
                }
              }
            }
          } else {
            // Model 1: Continuous rotation - standard blue breathing pulse
            const pulse = 0.35 + 0.15 * Math.sin(ts / 200);
            window.g3dFrustums.forEach(f => {
              f.material.color.setHex(0x2563eb);
              f.material.opacity = pulse;
            });
          }
        } else {
          // Default idle state
          window.g3dFrustums.forEach(f => {
            f.material.color.setHex(0x2563eb);
            f.material.opacity = 0.45;
          });
        }
      }

      g3dControls.update();
      g3dRenderer.render(g3dScene, g3dCamera);
      } catch (err) {
        if (!loopErrorFired) {
          loopErrorFired = true;
          alert("loop error: " + err.message + "\n" + err.stack);
        }
      }
    })(0);
  }

  function createTextSprite(text, color = '#1e3a8a', bgColor = 'rgba(255, 255, 255, 0.98)') {
    const canvas = document.createElement('canvas');
    // Drastically increase texture resolution for razor-sharp rendering
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Rounded corner background box
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(16, 16, canvas.width - 32, canvas.height - 32, 32);
    } else {
      ctx.rect(16, 16, canvas.width - 32, canvas.height - 32);
    }
    ctx.fill();
    
    // Stroke border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 10;
    ctx.stroke();
    
    // Text style
    ctx.font = 'bold 80px "Segoe UI", sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    
    // Apply anisotropic filtering to make text look crisp from oblique viewing angles
    if (g3dRenderer) {
      const maxAnisotropy = g3dRenderer.capabilities.getMaxAnisotropy();
      if (maxAnisotropy > 0) {
        texture.anisotropy = maxAnisotropy;
      }
    }
    
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.75, 0.1875, 1.0); // Maintain 4:1 aspect ratio
    return sprite;
  }

  
  
  function rebuildGantryMechanicals() {
    if (gantryGroup) {
      g3dScene.remove(gantryGroup);
      gantryGroup = null;
    }
    if (stationaryGroup) {
      g3dScene.remove(stationaryGroup);
      stationaryGroup = null;
    }

    gantryGroup = new THREE.Group();
    g3dScene.add(gantryGroup);
    
    stationaryGroup = new THREE.Group();
    g3dScene.add(stationaryGroup);

    const activeTab = document.querySelector('.tab-content.active');
    const prefix = (activeTab && activeTab.id === 'model2-tab') ? 'm2-' : (activeTab && activeTab.id === 'model3-tab') ? 'm3-' : '';
    
    var isModel2 = window.g3dArchitecture === 'model2';
    var isModel3 = window.g3dArchitecture === 'model3';
    
    const m2Input = document.getElementById('m2-numColumns');
    const numColumns = isModel2 ? (m2Input ? parseInt(m2Input.value) : 2) : 1;
    
    const m3Input = document.getElementById('m3-numColumns');
    const horizCameras = isModel3 ? (m3Input ? parseInt(m3Input.value) : 1) : 1;

    // Floor track
    const trackR = g3dWD + (g3dPatD / 2) + 0.12;
    const trackGeo = new THREE.RingGeometry(trackR - 0.05, trackR + 0.05, 64);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x475569, side: THREE.DoubleSide, roughness: 0.7 });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = 0.01;
    gantryGroup.add(trackMesh);

    window.g3dColumns = [];
    window.g3dFrustums = [];
    
    if (isModel3) {
        // Model 3: Same column positions on elliptical path as Model 2, but cameras are on vertical translating carriages
        window.m3RailWrappers = [];
        window.m3Cameras = [];
        
        const fovHW = Math.min(g3dFovW/2, 3.0);
        const fovVH = Math.min(g3dFovH/2, 3.0);
        
        const carriageBaseY = Math.max(0.15, g3dFovH / 2);
        const vertCamsOnCarriage = g3dCamHeights.length;
        const carriageMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.4 }); // Orange carriage
        
        for (let cIndex = 0; cIndex < horizCameras; cIndex++) {
            const colGroup = new THREE.Group();
            gantryGroup.add(colGroup);
            window.g3dColumns.push(colGroup);
            
            // Base floor support box
            const baseGeo = new THREE.BoxGeometry(0.3, 0.05, 0.4);
            const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
            const baseMesh = new THREE.Mesh(baseGeo, baseMat);
            baseMesh.position.set(0, 0.025, 0.12);
            colGroup.add(baseMesh);
            
            // Vertical pole
            const poleH = g3dPatH + 0.14;
            const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, poleH, 16);
            const poleMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.3, metalness: 0.8 });
            const poleMesh = new THREE.Mesh(poleGeo, poleMat);
            poleMesh.position.set(0, poleH/2, 0.12);
            colGroup.add(poleMesh);
            
            // Moving vertical carriage railWrapper
            const railWrapper = new THREE.Group();
            railWrapper.position.y = carriageBaseY;
            colGroup.add(railWrapper);
            window.m3RailWrappers.push(railWrapper);
            
            // Render the vertical cameras on this column's carriage
            for (let r = 0; r < vertCamsOnCarriage; r++) {
                const h_local = g3dCamHeights[r] || 0.0;
                
                // Orange carriage connector slider block
                const carriageGeo = new THREE.BoxGeometry(0.16, 0.06, 0.2);
                const carrMesh = new THREE.Mesh(carriageGeo, carriageMat);
                carrMesh.position.set(0, h_local, 0.12);
                railWrapper.add(carrMesh);
                
                // Camera body
                const camBodyGeo = new THREE.BoxGeometry(0.08, 0.09, 0.08);
                const camBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
                const camMesh = new THREE.Mesh(camBodyGeo, camBodyMat);
                camMesh.position.set(0, h_local, 0);
                railWrapper.add(camMesh);
                
                // Frustum lines (facing inwards to patient along -renderWd local Z)
                const extendFov = document.getElementById('extendFovCheck') ? document.getElementById('extendFovCheck').checked : false;
                const frustumPoints = [];
                let renderWd = g3dWD;
                let renderFovHW = fovHW;
                let renderFovVH = fovVH;
                
                if (extendFov) {
                    renderWd = g3dWD + (g3dPatD / 2);
                    const scale = renderWd / g3dWD;
                    renderFovHW = fovHW * scale;
                    renderFovVH = fovVH * scale;
                }
                
                const h = h_local;
                frustumPoints.push(new THREE.Vector3(0, h, 0));
                frustumPoints.push(new THREE.Vector3(renderFovHW, h + renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(0, h, 0));
                frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(0, h, 0));
                frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(0, h, 0));
                frustumPoints.push(new THREE.Vector3(renderFovHW, h - renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(renderFovHW, h + renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(renderFovHW, h - renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(renderFovHW, h - renderFovVH, renderWd));
                frustumPoints.push(new THREE.Vector3(renderFovHW, h + renderFovVH, renderWd));

                const lineGeo = new THREE.BufferGeometry().setFromPoints(frustumPoints);
                const lineMat = new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.45 });
                const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
                railWrapper.add(lineMesh);
                window.g3dFrustums.push({ mesh: lineMesh, material: lineMat, model: 'model3' });
                
                window.m3Cameras.push(camMesh);
            }
        }
    } else {
        // Model 1 and Model 2 Logic
        const numColsToRender = isModel2 ? numColumns : 1;
        for (let cIndex = 0; cIndex < numColsToRender; cIndex++) {
          const colGroup = new THREE.Group();
          gantryGroup.add(colGroup);
          window.g3dColumns.push(colGroup);

          const baseGeo = new THREE.BoxGeometry(0.3, 0.05, 0.4);
          const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
          const baseMesh = new THREE.Mesh(baseGeo, baseMat);
          baseMesh.position.set(0, 0.025, 0.12);
          colGroup.add(baseMesh);

          const poleH = g3dPatH + 0.14;
          const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, poleH, 16);
          const poleMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.3, metalness: 0.8 });
          const poleMesh = new THREE.Mesh(poleGeo, poleMat);
          poleMesh.position.set(0, poleH/2, 0.12);
          colGroup.add(poleMesh);

          const fovHW = Math.min(g3dFovW/2, 3.0);
          const fovVH = Math.min(g3dFovH/2, 3.0);

          const isCrossActive = (window.g3dIlluminationMode || 'cross') === 'cross';

          const carriageGeo = new THREE.BoxGeometry(0.16, 0.06, 0.2);
          const carriageMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.4 });

          g3dCamHeights.forEach((h, idx) => {
            const carrMesh = new THREE.Mesh(carriageGeo, carriageMat);
            carrMesh.position.set(0, h, 0.12);
            colGroup.add(carrMesh);

            const camBodyGeo = new THREE.BoxGeometry(0.08, 0.09, 0.08);
            const camBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
            const camMesh = new THREE.Mesh(camBodyGeo, camBodyMat);
            camMesh.position.set(0, h, 0);
            colGroup.add(camMesh);

            const extendFov = document.getElementById('extendFovCheck') ? document.getElementById('extendFovCheck').checked : false;

            const frustumPoints = [];
            let renderWd = g3dWD;
            let renderFovHW = fovHW;
            let renderFovVH = fovVH;
            
            if (extendFov) {
                renderWd = g3dWD + (g3dPatD / 2);
                const scale = renderWd / g3dWD;
                renderFovHW = fovHW * scale;
                renderFovVH = fovVH * scale;
            }

            const zSign = isModel2 ? 1 : -1;
            frustumPoints.push(new THREE.Vector3(0, h, 0));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h + renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(0, h, 0));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(0, h, 0));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(0, h, 0));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h - renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h + renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h - renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h - renderFovVH, zSign * renderWd));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h + renderFovVH, zSign * renderWd));

            const lineGeo = new THREE.BufferGeometry().setFromPoints(frustumPoints);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.45 });
            const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
            colGroup.add(lineMesh);
            window.g3dFrustums.push({ mesh: lineMesh, material: lineMat, model: isModel2 ? 'model2' : 'model1' });
          });
        }
    }

    if (window.g3dFloorSafetyRing) {
      window.g3dFloorSafetyRing.visible = true;
    }

    const rw = g3dPatW;
    const rd = g3dPatD;
    const rh = g3dPatH;

    // Add floating 3D text label for active architecture directly in 3D scene
    const archName = isModel3 ? "Model 3: Turntable Scanning" : (isModel2 ? "Model 2: Dual-Column Gantry" : "Model 1: Rotating Column");
    const textSprite = createTextSprite(archName);
    textSprite.position.set(0, rh + 0.25, 0);
    stationaryGroup.add(textSprite);

    // Add physical turntable platform disc for Model 3 (patient turntable)
    if (isModel3) {
      const turntableGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32);
      const turntableMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.3 });
      const turntableMesh = new THREE.Mesh(turntableGeo, turntableMat);
      turntableMesh.position.y = 0.02; // Sit slightly above floor grid
      mannequinGroup.add(turntableMesh);
    }
    
    {
      // Draw the grey rectangular box for Model 1 / Model 3
      const rectPts = [
        new THREE.Vector3(rw/2, 0, rd/2), new THREE.Vector3(-rw/2, 0, rd/2),
        new THREE.Vector3(-rw/2, 0, rd/2), new THREE.Vector3(-rw/2, 0, -rd/2),
        new THREE.Vector3(-rw/2, 0, -rd/2), new THREE.Vector3(rw/2, 0, -rd/2),
        new THREE.Vector3(rw/2, 0, -rd/2), new THREE.Vector3(rw/2, 0, rd/2),
        new THREE.Vector3(rw/2, rh, rd/2), new THREE.Vector3(-rw/2, rh, rd/2),
        new THREE.Vector3(-rw/2, rh, rd/2), new THREE.Vector3(-rw/2, rh, -rd/2),
        new THREE.Vector3(-rw/2, rh, -rd/2), new THREE.Vector3(rw/2, rh, -rd/2),
        new THREE.Vector3(rw/2, rh, -rd/2), new THREE.Vector3(rw/2, rh, rd/2),
        new THREE.Vector3(rw/2, 0, rd/2), new THREE.Vector3(rw/2, rh, rd/2),
        new THREE.Vector3(-rw/2, 0, rd/2), new THREE.Vector3(-rw/2, rh, rd/2),
        new THREE.Vector3(-rw/2, 0, -rd/2), new THREE.Vector3(-rw/2, rh, -rd/2),
        new THREE.Vector3(rw/2, 0, -rd/2), new THREE.Vector3(rw/2, rh, -rd/2)
      ];
      const rectGeo = new THREE.BufferGeometry().setFromPoints(rectPts);
      const rectMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3 });
      const rectLine = new THREE.LineSegments(rectGeo, rectMat);
      stationaryGroup.add(rectLine);
    }
  }


  function updateGantry3D(wdMm, patWMm, fovWMm, fovHMm) {
    const activeTab = document.querySelector('.tab-content.active');
    const prefix = (activeTab && activeTab.id === 'model2-tab') ? 'm2-' : (activeTab && activeTab.id === 'model3-tab') ? 'm3-' : '';

    const m2Input = document.getElementById('m2-numColumns');
    const targetCols = (window.g3dArchitecture === 'model2' && m2Input) ? parseInt(m2Input.value) : 1;
    
    window.g3dLastArch = window.g3dArchitecture;

    g3dWD   = Math.max(0.05, wdMm   / 1000);
    g3dPatW = Math.max(0.3,  patWMm / 1000);
    g3dFovW = Math.max(0.05, fovWMm / 1000);
    g3dFovH = Math.max(0.05, (fovHMm || 300) / 1000);
    
    const envD = document.getElementById(prefix + 'patientEnvD');
    const envH = document.getElementById(prefix + 'patientEnvH');
    g3dPatD = envD ? (parseFloat(envD.value) || 1.0) : 1.0;
    g3dPatH = envH ? (parseFloat(envH.value) || 2.0) : 2.0;

    // Always rebuild gantry mechanical components to keep track radius (trackR) synced with working distance
    rebuildGantryMechanicals();



    // Update razor-sharp native HTML values inside the bottom-right HUD overlay
    const elEnv = document.getElementById('hud-envelope-val');
    if (elEnv) {
      elEnv.textContent = `${(g3dPatW * 100).toFixed(0)} × ${(g3dPatD * 100).toFixed(0)} × ${(g3dPatH * 100).toFixed(0)} cm`;
    }
    const elWd = document.getElementById('hud-wd-val');
    if (elWd) {
      elWd.textContent = `${wdMm.toFixed(0)} mm`;
    }

    // Sync selects
    const g3dCamSel = document.getElementById('g3dCameraSelect');
    const mainPreset = document.getElementById(prefix + 'sensorPreset');
    if (g3dCamSel && mainPreset) {
      g3dCamSel.value = mainPreset.value;
    }
    const g3dLensSel = document.getElementById('g3dLensSelect');
    const flBox = document.getElementById(prefix + 'flBox');
    if (g3dLensSel && flBox) {
      g3dLensSel.value = flBox.value;
    }

    // Rebuild mechanical elements based on new values
    rebuildGantryMechanicals();

    // Recalculate and update the 360° circumference suggestions
    const overlapVal = parseFloat(document.getElementById(prefix + 'overlapX').value) || 15;
    const overlapFactor = 1 - (overlapVal / 100);
    const effectiveFovW = g3dFovW * overlapFactor;
    // Patient waist/chest envelope circumference
    const patCircumference = Math.PI * Math.max(g3dPatW, g3dPatD);
    const suggestedStops = Math.ceil(patCircumference / (effectiveFovW || 0.1));

    const ringVal = document.getElementById(prefix + 'ring-suggest-val');
    const sweepVal = document.getElementById(prefix + 'sweep-suggest-val');
    if (ringVal) ringVal.textContent = suggestedStops;
    if (sweepVal) {
      if (prefix === 'm2-') {
        sweepVal.textContent = "4"; // Model 2 is fixed at 4 stops
      } else {
        sweepVal.textContent = suggestedStops;
      }
    }
  }

  function resizeGantry3D() {
    if (window._g3dSync) window._g3dSync();
  }

  window.handleGlbData = function(arrayBuffer) {
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.parse(
        arrayBuffer,
        '',
        function(gltf) {
          // Remove placeholders
          if (mannequinGroup) {
            while (mannequinGroup.children.length > 0) {
              mannequinGroup.remove(mannequinGroup.children[0]);
            }
          } else {
            mannequinGroup = new THREE.Group();
            g3dScene.add(mannequinGroup);
          }
          
          const model = gltf.scene;
          
          model.traverse(child => {
            if (child.isBone) {
              const nameL = child.name.toLowerCase();
              if (nameL.includes('leftarm') || nameL.includes('arm_l') || nameL.includes('l_arm')) g3dBoneLeftArm = child;
              if (nameL.includes('rightarm') || nameL.includes('arm_r') || nameL.includes('r_arm')) g3dBoneRightArm = child;
              if (nameL.includes('leftupleg') || nameL.includes('leg_l') || nameL.includes('l_leg')) g3dBoneLeftLeg = child;
              if (nameL.includes('rightupleg') || nameL.includes('leg_r') || nameL.includes('r_leg')) g3dBoneRightLeg = child;
            }
            if (child.isMesh || child.isSkinnedMesh) {
                if (child.geometry) {
                  if (child.geometry.attributes.normal) child.geometry.deleteAttribute('normal');
                  child.geometry.computeVertexNormals();
                }
                child.castShadow = false;
                child.receiveShadow = false;
                if (child.material) {
                  child.material = new THREE.MeshLambertMaterial({
                    color: 0xf4d3c4
                  });
                if (!g3dSkinMaterials.includes(child.material)) {
                  g3dSkinMaterials.push(child.material);
                }
              }
            }
          });

          // Scale and position dynamically using bounding box metrics
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          const center = new THREE.Vector3();
          box.getCenter(center);

          const targetHeight = 1.75; // Standard body model height (1.75m)
          console.log("Xbot Bounding Box Size:", size);
          let scaleFactor = 1.0;
            if (size.y > 0.1 && size.y < 500) {
                scaleFactor = targetHeight / size.y;
                model.scale.multiplyScalar(scaleFactor);
                model.position.set(
                  -center.x * scaleFactor,
                  0 - (box.min.y * scaleFactor),
                  -center.z * scaleFactor
                );
            } else {
                // Fallback for SkinnedMesh bounds failure (like Xbot)
                // Mixamo Xbot is typically 1 unit = 1 meter or 100 units = 1 meter depending on export
                // We'll set it to 1.0 (assuming it's already in meters due to GLTF scaling)
                model.scale.set(0.01, 0.01, 0.01);
                model.position.set(0, 0, 0);
            }

          nathanModel = model;
          mannequinGroup.add(nathanModel);
          console.log('Successfully loaded realistic body model from GLB!');
        },
        function(err) {
          console.error('Error parsing GLB:', err);
        }
    );
  };

  window.handleModelUpload = function(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    const overlay = document.createElement('div');
    overlay.id = 'g3d-loading-overlay';
    overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.85); color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100; font-family:"Segoe UI",sans-serif; border-radius:8px;';
    overlay.innerHTML = '<div style="font-size:20px; font-weight:bold; margin-bottom:8px;">Loading Model...</div><div style="font-size:13px; color:#94a3b8;">Processing 3D geometry in-memory</div>';
    g3dContainer.appendChild(overlay);

    const reader = new FileReader();
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      
      if (file.name.endsWith('.zip')) {
        JSZip.loadAsync(arrayBuffer).then(function(zip) {
          overlay.innerHTML = '<div style="font-size:20px; font-weight:bold; margin-bottom:8px;">Unpacking Textures...</div><div style="font-size:13px; color:#94a3b8;">Extracting diffuse and normal maps</div>';
          
          let fbxFile = null;
          let diffuseFile = null;
          let normalFile = null;

          zip.forEach(function (relativePath, fileEntry) {
            if (relativePath.endsWith('.fbx')) {
              fbxFile = fileEntry;
            } else if (relativePath.endsWith('_dif.jpg')) {
              diffuseFile = fileEntry;
            } else if (relativePath.endsWith('_norm.jpg')) {
              normalFile = fileEntry;
            }
          });

          if (!fbxFile) {
            alert('Could not find .fbx file in the ZIP!');
            overlay.remove();
            return;
          }

          const promises = [];
          let diffuseUrl = null;
          let normalUrl = null;

          if (diffuseFile) {
            promises.push(diffuseFile.async('blob').then(function(blob) {
              diffuseUrl = URL.createObjectURL(blob);
            }));
          }
          if (normalFile) {
            promises.push(normalFile.async('blob').then(function(blob) {
              normalUrl = URL.createObjectURL(blob);
            }));
          }

          Promise.all(promises).then(function() {
            overlay.innerHTML = '<div style="font-size:20px; font-weight:bold; margin-bottom:8px;">Parsing FBX...</div><div style="font-size:13px; color:#94a3b8;">Converting FBX bones and animations</div>';
            
            fbxFile.async('arraybuffer').then(function(fbxBuffer) {
              try {
                const fbxLoader = new THREE.FBXLoader();
                const object = fbxLoader.parse(fbxBuffer, '');

                if (mannequinGroup) {
                  while (mannequinGroup.children.length > 0) {
                    mannequinGroup.remove(mannequinGroup.children[0]);
                  }
                } else {
                  mannequinGroup = new THREE.Group();
                  g3dScene.add(mannequinGroup);
                }
                if (nathanModel) g3dScene.remove(nathanModel);

                object.traverse(child => {
                  if (child.isBone) {
                    const nameL = child.name.toLowerCase();
                    if (nameL.includes('leftarm') || nameL.includes('arm_l') || nameL.includes('l_arm')) g3dBoneLeftArm = child;
                    if (nameL.includes('rightarm') || nameL.includes('arm_r') || nameL.includes('r_arm')) g3dBoneRightArm = child;
                    if (nameL.includes('leftupleg') || nameL.includes('leg_l') || nameL.includes('l_leg')) g3dBoneLeftLeg = child;
                    if (nameL.includes('rightupleg') || nameL.includes('leg_r') || nameL.includes('r_leg')) g3dBoneRightLeg = child;
                  }
                  if (child.isMesh || child.isSkinnedMesh) {
                if (child.geometry) {
                  if (child.geometry.attributes.normal) child.geometry.deleteAttribute('normal');
                  child.geometry.computeVertexNormals();
                }
                child.castShadow = false;
                child.receiveShadow = false;
                if (child.material) {
                  child.material = new THREE.MeshLambertMaterial({
                    color: 0xf4d3c4
                  });
                  if (!g3dSkinMaterials.includes(child.material)) {
                    g3dSkinMaterials.push(child.material);
                  }
                }
              }
            });

            const box = new THREE.Box3().setFromObject(object);
                const size = new THREE.Vector3();
                box.getSize(size);
                const center = new THREE.Vector3();
                box.getCenter(center);

                const targetHeight = 1.80;
                let scaleFactor = 1.0;
                  if (size.y > 0.1 && size.y < 500) {
                      scaleFactor = targetHeight / size.y;
                      object.scale.multiplyScalar(scaleFactor);
                      object.position.set(
                        -center.x * scaleFactor,
                        0 - (box.min.y * scaleFactor),
                        -center.z * scaleFactor
                      );
                  } else {
                      object.scale.set(0.01, 0.01, 0.01);
                      object.position.set(0, 0, 0);
                  }

                if (object.animations && object.animations.length > 0) {
                  g3dMixer = new THREE.AnimationMixer(object);
                  g3dMixer.clipAction(object.animations[0]).play();
                }

                nathanModel = object;
                mannequinGroup.add(nathanModel);
                overlay.remove();
              } catch (err) {
                alert('Error parsing FBX: ' + err.message);
                overlay.remove();
              }
            });
          });
        }).catch(err => {
          alert('Error loading ZIP: ' + err.message);
          overlay.remove();
        });
      } else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        try {
          handleGlbData(arrayBuffer);
          overlay.remove();
        } catch (err) {
          alert('Error parsing GLB: ' + err.message);
          overlay.remove();
        }
      } else {
        alert('Unsupported file format! Please upload a .zip or .glb/.gltf file.');
        overlay.remove();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  function setupRequirementHighlighting() {
    // 1. Restore highlighted HTML cells from localStorage
    document.querySelectorAll('.rfq-table tbody tr').forEach(row => {
      const firstCell = row.querySelector('td:nth-child(1)');
      const thirdCell = row.querySelector('td:nth-child(3)');
      if (firstCell && thirdCell) {
        const reqId = firstCell.textContent.trim().split('\n')[0].trim();
        const savedHtml = localStorage.getItem('highlight_html_req_' + reqId);
        if (savedHtml) {
          thirdCell.innerHTML = savedHtml;
        }
      }
    });

    // 2. Create the custom highlighter context menu element
    const menuId = 'custom-highlighter-menu';
    let contextMenu = document.getElementById(menuId);
    if (!contextMenu) {
      contextMenu = document.createElement('div');
      contextMenu.id = menuId;
      contextMenu.innerHTML = `
        <div id="btn-highlight-selection"><span>🖍️</span> Highlight Selection</div>
        <div id="btn-clear-selection-highlight"><span>🧼</span> Clear Highlights</div>
      `;
      document.body.appendChild(contextMenu);
    }

    // Capture selections and show menu on right click
    document.addEventListener('contextmenu', (e) => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      // Only show menu if right-clicked inside the RFQ table cells or comments
      const inRfqTable = e.target.closest('.rfq-table td, .rfq-textarea');
      
      if (selectedText.length > 0 && inRfqTable) {
        e.preventDefault();
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        contextMenu.currentRange = selection.getRangeAt(0).cloneRange();
      } else {
        contextMenu.style.display = 'none';
      }
    });

    // Hide context menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!contextMenu.contains(e.target)) {
        contextMenu.style.display = 'none';
      }
    });

    // Action: Highlight Selection
    document.getElementById('btn-highlight-selection').addEventListener('click', () => {
      const selection = window.getSelection();
      if (contextMenu.currentRange) {
        selection.removeAllRanges();
        selection.addRange(contextMenu.currentRange);
      }
      
      let container = selection.anchorNode;
      if (container.nodeType === 3) { // Text node
        container = container.parentNode;
      }
      
      const targetCell = container.closest('td, .rfq-textarea');
      if (targetCell) {
        const originalEditableState = targetCell.contentEditable;
        
        // Temporarily make editable if not already editable
        if (originalEditableState !== 'true') {
          targetCell.contentEditable = 'true';
        }
        
        // Trigger browser's native text highlighting command
        document.execCommand('backColor', false, '#fef08a');
        
        // Restore editing state
        targetCell.contentEditable = originalEditableState;
        
        // Persist content
        if (targetCell.classList.contains('rfq-textarea')) {
          const key = targetCell.getAttribute('data-key');
          localStorage.setItem('derma_rfq_' + key, targetCell.innerHTML);
          triggerAutoSave();
        } else {
          const row = targetCell.closest('tr');
          if (row) {
            const firstCell = row.querySelector('td:nth-child(1)');
            if (firstCell) {
              const reqId = firstCell.textContent.trim().split('\n')[0].trim();
              localStorage.setItem('highlight_html_req_' + reqId, targetCell.innerHTML);
            }
          }
        }
      }
      
      contextMenu.style.display = 'none';
      selection.removeAllRanges();
    });

    // Action: Clear Highlights
    document.getElementById('btn-clear-selection-highlight').addEventListener('click', () => {
      const selection = window.getSelection();
      if (contextMenu.currentRange) {
        selection.removeAllRanges();
        selection.addRange(contextMenu.currentRange);
      }
      
      let container = selection.anchorNode;
      if (container.nodeType === 3) {
        container = container.parentNode;
      }
      
      const targetCell = container.closest('td, .rfq-textarea');
      if (targetCell) {
        const originalEditableState = targetCell.contentEditable;
        if (originalEditableState !== 'true') {
          targetCell.contentEditable = 'true';
        }
        
        // Remove highlighting format from selection
        document.execCommand('removeFormat', false, null);
        
        targetCell.contentEditable = originalEditableState;
        
        // Persist content
        if (targetCell.classList.contains('rfq-textarea')) {
          const key = targetCell.getAttribute('data-key');
          localStorage.setItem('derma_rfq_' + key, targetCell.innerHTML);
          triggerAutoSave();
        } else {
          const row = targetCell.closest('tr');
          if (row) {
            const firstCell = row.querySelector('td:nth-child(1)');
            if (firstCell) {
              const reqId = firstCell.textContent.trim().split('\n')[0].trim();
              localStorage.setItem('highlight_html_req_' + reqId, targetCell.innerHTML);
            }
          }
        }
      }
      
      contextMenu.style.display = 'none';
      selection.removeAllRanges();
    });
  }

  function _startGantry3D() {
    setupGantry3D();
    if (typeof init3D === 'function') init3D();
    window.addEventListener('resize', resizeGantry3D);
    applyPreset();
    setupTextareaPersistence();
    setupRequirementHighlighting();
  }

  var appStarted = false;
  function tryStartApp() {
    if (appStarted) return;
    // Check if both DOM is ready (or loading finished) and comments are loaded
    if (commentsLoaded && (document.readyState === 'interactive' || document.readyState === 'complete')) {
      appStarted = true;
      _startGantry3D();
    }
  }

  window.appReadyToStart = function() {
    tryStartApp();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryStartApp);
  } else {
    tryStartApp();
  }
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '10px';
    debugDiv.style.left = '10px';
    debugDiv.style.background = 'black';
    debugDiv.style.color = 'lime';
    debugDiv.style.padding = '10px';
    debugDiv.style.zIndex = '9999';
    document.body.appendChild(debugDiv);
    setInterval(() => {
        debugDiv.innerHTML = "Cols: " + (window.g3dColumns ? window.g3dColumns.length : 0) + 
                             " | Arch: " + window.g3dArchitecture + 
                             " | Target: " + (document.getElementById('m2-numColumns') ? document.getElementById('m2-numColumns').value : 'null');
    }, 500);


  window.simulateVerticalSweep = function(prefix) {
    if (window.g3dSweepInterval) clearInterval(window.g3dSweepInterval);
    
    if (window.m3RailWrapper && g3dCamHeights && g3dCamHeights.length > 0) {
        let stepIndex = g3dCamHeights.length - 1; // start from top
        
        window.m3RailWrapper.position.y = g3dCamHeights[stepIndex];
        
        window.g3dSweepInterval = setInterval(() => {
            stepIndex--;
            if (stepIndex < 0) {
                clearInterval(window.g3dSweepInterval);
                window.m3RailWrapper.position.y = g3dCamHeights[g3dCamHeights.length - 1]; // reset
            } else {
                window.m3RailWrapper.position.y = g3dCamHeights[stepIndex];
            }
        }, 800);
    }
  };

  window.moveGantryDownOneStep = function(prefix) {
    if (window.g3dSweepInterval) clearInterval(window.g3dSweepInterval);
    if (window.m3RailWrapper && g3dCamHeights && g3dCamHeights.length > 0) {
        // find current height index roughly
        let currentY = window.m3RailWrapper.position.y;
        let nextIndex = g3dCamHeights.length - 1;
        for (let i = g3dCamHeights.length - 1; i >= 0; i--) {
            if (g3dCamHeights[i] < currentY - 0.05) {
                nextIndex = i;
                break;
            }
        }
        window.m3RailWrapper.position.y = g3dCamHeights[nextIndex];
    }
  };

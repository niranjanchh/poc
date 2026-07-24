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
  const headerH = 12;
  const contentTop = headerH + 1;
  const contentH = pageH - contentTop - margin;

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

  // Title page
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
    const el = document.getElementById(subTabIds[i]);
    if (!el) continue;

    // Show the section temporarily
    const prevDisplay = el.style.display;
    const prevClass = el.className;
    el.style.display = 'block';
    el.classList.add('active');
    await new Promise(r => setTimeout(r, 120));

    // Capture the full section as one tall canvas at high resolution
    const fullCanvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1400
    });

    el.style.display = prevDisplay;
    el.className = prevClass;

    // Calculate page slicing parameters
    const renderScale = 2;
    const imgW = pageW - margin * 2;
    const pxPerMm = (fullCanvas.width / renderScale) / imgW;
    const sliceHeightPx = Math.floor(contentH * pxPerMm * renderScale);
    const overlapPx = Math.floor(40 * renderScale); // 40px overlap prevents mid-line text cuts
    const stepPx = sliceHeightPx - overlapPx;
    const totalSlices = Math.ceil((fullCanvas.height - overlapPx) / stepPx);

    for (let s = 0; s < totalSlices; s++) {
      pdf.addPage();

      // Header bar
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageW, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DermaPod RFQ  |  ' + subTabNames[i], margin, 6.5);
      pdf.text('Page ' + pdf.internal.getNumberOfPages(), pageW - margin, 6.5, { align: 'right' });

      // Slice the canvas for this page
      const srcY = s * stepPx;
      const srcH = Math.min(sliceHeightPx, fullCanvas.height - srcY);

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = fullCanvas.width;
      sliceCanvas.height = srcH;
      const ctx = sliceCanvas.getContext('2d');
      ctx.drawImage(fullCanvas, 0, srcY, fullCanvas.width, srcH, 0, 0, fullCanvas.width, srcH);

      const sliceImg = sliceCanvas.toDataURL('image/jpeg', 0.95);
      const sliceH = (srcH * imgW) / fullCanvas.width;

      pdf.addImage(sliceImg, 'JPEG', margin, contentTop, imgW, sliceH);
    }
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

  // LocalStorage Persistence & Cloudflare KV Database Sync for compliance fields
  async function syncCommentsFromKV() {
    if (!window.location.protocol.startsWith('http')) return;
    try {
      const res = await fetch('/api/comments?cb=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const kvData = await res.json();
        if (kvData && Object.keys(kvData).length > 0 && !kvData._error) {
          const fields = document.querySelectorAll('.rfq-textarea');
          fields.forEach(field => {
            const key = field.getAttribute('data-key');
            if (kvData[key] !== undefined && document.activeElement !== field) {
              if (field.innerHTML !== kvData[key]) {
                field.innerHTML = kvData[key];
                localStorage.setItem('derma_rfq_' + key, kvData[key]);
              }
            }
          });
        }
      }
    } catch (e) {
      console.log('KV Sync Notice: Running local storage / fallback comments mode.');
    }
  }

  // Poll every 3 seconds for near-instant live sync across all devices
  setInterval(syncCommentsFromKV, 3000);

  let saveDebounceTimers = {};
  function saveSingleFieldToKV(key, value) {
    if (!window.location.protocol.startsWith('http')) return;
    if (saveDebounceTimers[key]) clearTimeout(saveDebounceTimers[key]);
    saveDebounceTimers[key] = setTimeout(async () => {
      try {
        await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: value || '' })
        });
      } catch (e) {
        // Fallback silently if offline or not on Cloudflare
      }
    }, 600);
  }

  function setupTextareaPersistence() {
    const textareas = document.querySelectorAll('.rfq-textarea');
    
    textareas.forEach(textarea => {
      const key = textarea.getAttribute('data-key');
      const placeholder = textarea.getAttribute('placeholder') || 'Comments...';
      
      const div = document.createElement('div');
      div.className = 'rfq-textarea';
      div.setAttribute('data-key', key);
      div.setAttribute('data-placeholder', placeholder);
      div.contentEditable = 'true';
      
      let savedVal = localStorage.getItem('derma_rfq_' + key);
      // If savedVal is empty, null, or old 'NA', override with rfqSavedComments
      if ((savedVal === null || savedVal === 'NA' || savedVal === '') && typeof rfqSavedComments !== 'undefined' && rfqSavedComments && rfqSavedComments[key] !== undefined) {
        savedVal = rfqSavedComments[key];
        localStorage.setItem('derma_rfq_' + key, savedVal);
      }
      
      if (savedVal) {
        div.innerHTML = savedVal;
      }
      
      div.addEventListener('input', () => {
        localStorage.setItem('derma_rfq_' + key, div.innerHTML);
        triggerAutoSave();
        saveSingleFieldToKV(key, div.innerHTML);
      });
      
      textarea.parentNode.replaceChild(div, textarea);
    });

    // Attempt immediate live fetch from Cloudflare KV
    syncCommentsFromKV();
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
    imx455: { w: 36.0, h: 24.0, p: 3.76, pw: 9568, ph: 6380 },
    gmax3265: { w: 29.9, h: 22.4, p: 3.2, pw: 9344, ph: 7000 },
    imx927: { w: 28.08, h: 28.08, p: 2.74, pw: 10248, ph: 10248 },
    imx661: { w: 46.15, h: 32.87, p: 3.45, pw: 13376, ph: 9528 },
    imx411: { w: 53.4, h: 40.0, p: 3.76, pw: 14192, ph: 10640 }
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

  // Local slider/box syncing for Tab 4 (Model 3, prefixed with m3-)
  const m3_wdSlider = document.getElementById('m3-wdSlider');
  const m3_wdBox = document.getElementById('m3-wdBox');
  const m3_flSlider = document.getElementById('m3-flSlider');
  const m3_flBox = document.getElementById('m3-flBox');
  const m3_apSlider = document.getElementById('m3-apSlider');
  const m3_apBox = document.getElementById('m3-apBox');
  const m3_reqResSlider = document.getElementById('m3-reqResSlider');
  const m3_reqResBox = document.getElementById('m3-reqResBox');
  const m3_cocSlider = document.getElementById('m3-cocSlider');
  const m3_cocBox = document.getElementById('m3-cocBox');
  const m3_cocPreset = document.getElementById('m3-cocPreset');
  const m3_sensorPreset = document.getElementById('m3-sensorPreset');

  sync(m3_wdSlider, m3_wdBox);
  sync(m3_flSlider, m3_flBox);
  sync(m3_apSlider, m3_apBox);
  sync(m3_reqResSlider, m3_reqResBox);

  if (m3_cocSlider && m3_cocBox) {
    m3_cocSlider.addEventListener('input', () => {
      m3_cocBox.value = m3_cocSlider.value;
      if (m3_cocPreset) m3_cocPreset.value = 'custom';
      calculate();
    });
    m3_cocBox.addEventListener('input', () => {
      m3_cocSlider.value = m3_cocBox.value;
      if (m3_cocPreset) m3_cocPreset.value = 'custom';
      calculate();
    });
  }

  sync(document.getElementById('maxCameraBudgetSlider'), document.getElementById('maxCameraBudget'));
  sync(document.getElementById('m2-maxCameraBudgetSlider'), document.getElementById('m2-maxCameraBudget'));
  sync(document.getElementById('m3-maxCameraBudgetSlider'), document.getElementById('m3-maxCameraBudget'));

  window.setQuickBudget = function(prefix, amount) {
    const p = prefix || '';
    const input = document.getElementById(p + 'maxCameraBudget');
    const slider = document.getElementById(p + 'maxCameraBudgetSlider');
    if (input) input.value = amount;
    if (slider) slider.value = amount;
    calculate(p);
  };

  // Cross-tab input mirroring logic
  const syncedInputIds = [
    'patientEnvW', 'patientEnvD', 'patientEnvH',
    'maxFootprintW', 'maxFootprintD', 'maxHeight',
    'sw', 'sh', 'pixelSize', 'pxw', 'pxh',
    'wdSlider', 'wdBox', 'flSlider', 'flBox', 'apSlider', 'apBox',
    'reqResSlider', 'reqResBox', 'cocPreset', 'cocSlider', 'cocBox',
    'overlapX', 'g3dColCamsSlider', 'cameraUnitPrice', 'maxCameraBudget', 'maxCameraBudgetSlider',
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
              if (id === 'maxCameraBudgetSlider') document.getElementById(target.prefix + 'maxCameraBudget').value = source.el.value;
              
              if (id === 'overlapX' && typeof window.updateOverlapValue === 'function') {
                window.updateOverlapValue(source.el.value, target.prefix);
              }
              
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
    const targetPxMm = parseFloat(document.getElementById(prefix + 'reqResBox') ? document.getElementById(prefix + 'reqResBox').value : (document.getElementById(prefix + 'targetPxMm') ? document.getElementById(prefix + 'targetPxMm').value : 30.0)) || 30.0;
    
    const ap = parseFloat(document.getElementById(prefix + 'apBox') ? document.getElementById(prefix + 'apBox').value : 8.0) || 8.0;
    const cocMm = (parseFloat(document.getElementById(prefix + 'cocBox') ? document.getElementById(prefix + 'cocBox').value : 3.0) || 3.0) / 1000;
    
    // Fetch number of columns
    const numColsEl = document.getElementById(prefix + 'numColumns');
    const numColumns = numColsEl ? parseInt(numColsEl.value) : 1;
    
    const targetW = patWidthM * 1000;
    
    const realSensors = [
      { name: "Sony IMX455", fmtName: "Full Frame", mp: 61, w: 36.0, h: 24.0, pSize: 3.76, pxw: 9568, pxh: 6380, priceKey: '64' },
      { name: "Gpixel GMAX3265", fmtName: "APS-H / Medium Format", mp: 65, w: 29.9, h: 22.4, pSize: 3.20, pxw: 9344, pxh: 7000, priceKey: '64' },
      { name: "Sony IMX927 / IMX937", fmtName: "Type 2.5\" Square", mp: 105, w: 28.08, h: 28.08, pSize: 2.74, pxw: 10248, pxh: 10248, priceKey: '100' },
      { name: "Sony IMX661", fmtName: "3.6\" Large Format", mp: 127, w: 46.15, h: 32.87, pSize: 3.45, pxw: 13376, pxh: 9528, priceKey: '127' },
      { name: "Sony IMX411", fmtName: "Large Medium Format", mp: 151, w: 53.4, h: 40.0, pSize: 3.76, pxw: 14192, pxh: 10640, priceKey: '150' }
    ];

    let rows = [];
    
    realSensors.forEach(sensor => {
      const pxH = sensor.pxh;
      const pxW = sensor.pxw;
      const pixelSizeUm = sensor.pSize;
      const fmtW = sensor.w;
      const fmtH = sensor.h;
      const ratio = fmtW / fmtH;
      
      let all_configs = [];
      let constrained_configs = [];
      
      for (let fl = 10; fl <= 150; fl++) {
          for (let wd = 300; wd <= 2000; wd += 10) {
              if (wd <= fl) continue;
              
              const mag = fl / (wd - fl);
              const fovW = fmtW / mag;
              const fovH = fmtH / mag;
              
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
                  
                  if (totalFovW >= targetW && totalFovW <= targetW * 1.25) {
                      constrained_configs.push(config);
                  }
              }
          }
      }
      
      const fallback = { fl: 35, wd: 1000, fovW: targetW, totalFovW: targetW, fovH: targetW / ratio, density: 0, dof: 0, excessFOV: 0, cams: 1 };
      
      let best_case1 = fallback;
      let best_case2 = fallback;
      let best_case3 = fallback;
      
      if (all_configs.length > 0) {
          let case1_candidates = all_configs.filter(c => c.density >= targetPxMm);
          if (case1_candidates.length === 0) {
              case1_candidates = [...all_configs];
          }
          case1_candidates.sort((a, b) => {
              if (a.cams !== b.cams) return a.cams - b.cams;
              const diffA = Math.abs(a.density - targetPxMm);
              const diffB = Math.abs(b.density - targetPxMm);
              if (Math.abs(diffA - diffB) > 0.1) return diffA - diffB;
              if (Math.abs(b.dof - a.dof) > 1.0) return b.dof - a.dof;
              return Math.abs(a.excessFOV) - Math.abs(b.excessFOV);
          });
          best_case1 = case1_candidates[0];
      }
      
      if (constrained_configs.length > 0) {
          let case2_candidates = [...constrained_configs];
          case2_candidates.sort((a, b) => {
              if (a.cams !== b.cams) return a.cams - b.cams;
              if (Math.abs(b.density - a.density) > 0.1) return b.density - a.density;
              if (Math.abs(a.excessFOV - b.excessFOV) > 10.0) return a.excessFOV - b.excessFOV;
              return b.dof - a.dof;
          });
          best_case2 = case2_candidates[0];
          
          let case3_candidates = [...constrained_configs];
          case3_candidates.sort((a, b) => {
              if (a.cams !== b.cams) return a.cams - b.cams;
              if (Math.abs(b.dof - a.dof) > 10.0) return b.dof - a.dof;
              if (Math.abs(b.density - a.density) > 0.1) return b.density - a.density;
              if (Math.abs(a.excessFOV - b.excessFOV) > 10.0) return a.excessFOV - b.excessFOV;
              return 0;
          });
          best_case3 = case3_candidates[0];
      }
      
      const p50 = parseFloat(document.getElementById(prefix + 'price50')?.value || 6500);
      const p64 = parseFloat(document.getElementById(prefix + 'price64')?.value || 8850);
      const p100 = parseFloat(document.getElementById(prefix + 'price100')?.value || 16995);
      const p127 = parseFloat(document.getElementById(prefix + 'price127')?.value || 9500);
      const p150 = parseFloat(document.getElementById(prefix + 'price150')?.value || 10800);
      const pCustom = parseFloat(document.getElementById(prefix + 'priceCustom')?.value || 6500);

      const resPrices = {
        '64': p64,
        '100': p100,
        '127': p127,
        '150': p150
      };
      const unitPrice = resPrices[sensor.priceKey] || pCustom;
      const maxBudgetInput = document.getElementById(prefix + 'maxCameraBudget');
      const maxBudget = maxBudgetInput ? (parseFloat(maxBudgetInput.value) || 100000) : 100000;
      
      let totalCams1 = 0, totalCams2 = 0, totalCams3 = 0;
      let colDetail1 = '', colDetail2 = '', colDetail3 = '';

      if (prefix === 'm3-') {
        const m3CamsSlider = document.getElementById('m3-g3dColCamsSlider');
        const m3CamsPerCol = m3CamsSlider ? (parseInt(m3CamsSlider.value) || 2) : 2;
        
        const fovW1_m = best_case1.fovW / 1000;
        const stepW1 = fovW1_m * (1 - ov);
        const cols1 = Math.max(1, (patWidthM > fovW1_m) ? Math.ceil((patWidthM - fovW1_m) / (stepW1 || 0.001)) + 1 : 1);
        totalCams1 = cols1 * m3CamsPerCol;
        colDetail1 = `${totalCams1} (${m3CamsPerCol}/col × ${cols1} cols)`;
        
        const fovW2_m = best_case2.fovW / 1000;
        const stepW2 = fovW2_m * (1 - ov);
        const cols2 = Math.max(1, (patWidthM > fovW2_m) ? Math.ceil((patWidthM - fovW2_m) / (stepW2 || 0.001)) + 1 : 1);
        totalCams2 = cols2 * m3CamsPerCol;
        colDetail2 = `${totalCams2} (${m3CamsPerCol}/col × ${cols2} cols)`;
        
        const fovW3_m = best_case3.fovW / 1000;
        const stepW3 = fovW3_m * (1 - ov);
        const cols3 = Math.max(1, (patWidthM > fovW3_m) ? Math.ceil((patWidthM - fovW3_m) / (stepW3 || 0.001)) + 1 : 1);
        totalCams3 = cols3 * m3CamsPerCol;
        colDetail3 = `${totalCams3} (${m3CamsPerCol}/col × ${cols3} cols)`;
      } else if (prefix === 'm2-') {
        totalCams1 = numColumns * best_case1.cams;
        colDetail1 = `${totalCams1} (${best_case1.cams}/col × ${numColumns} cols)`;

        totalCams2 = numColumns * best_case2.cams;
        colDetail2 = `${totalCams2} (${best_case2.cams}/col × ${numColumns} cols)`;

        totalCams3 = numColumns * best_case3.cams;
        colDetail3 = `${totalCams3} (${best_case3.cams}/col × ${numColumns} cols)`;
      } else {
        totalCams1 = best_case1.cams;
        colDetail1 = `${totalCams1} (1 col)`;

        totalCams2 = best_case2.cams;
        colDetail2 = `${totalCams2} (1 col)`;

        totalCams3 = best_case3.cams;
        colDetail3 = `${totalCams3} (1 col)`;
      }
      
      const cost1 = totalCams1 * unitPrice;
      const cost2 = totalCams2 * unitPrice;
      const cost3 = totalCams3 * unitPrice;
      
      const pass1 = cost1 <= maxBudget;
      const pass2 = cost2 <= maxBudget;
      const pass3 = cost3 <= maxBudget;

      const fit1 = pass1 ? `<span style="color: #10b981; font-weight: bold;">✔ Yes</span>` : `<span style="color: #ef4444; font-weight: bold;">✘ No</span>`;
      const fit2 = pass2 ? `<span style="color: #10b981; font-weight: bold;">✔ Yes</span>` : `<span style="color: #ef4444; font-weight: bold;">✘ No</span>`;
      const fit3 = pass3 ? `<span style="color: #10b981; font-weight: bold;">✔ Yes</span>` : `<span style="color: #ef4444; font-weight: bold;">✘ No</span>`;

      rows.push({
        resMP: sensor.mp,
        fmtName: sensor.fmtName,
        pSize: pixelSizeUm,
        sw: fmtW, sh: fmtH, pxw: pxW, pxh: pxH,
        wd1: best_case1.wd, fl1: best_case1.fl, den1: best_case1.density, fovW1: best_case1.totalFovW, fovH1: best_case1.fovH, dof1: best_case1.dof, cams1: colDetail1, pass1,
        wd2: best_case2.wd, fl2: best_case2.fl, den2: best_case2.density, fovW2: best_case2.totalFovW, fovH2: best_case2.fovH, dof2: best_case2.dof, cams2: colDetail2, pass2,
        wd3: best_case3.wd, fl3: best_case3.fl, den3: best_case3.density, fovW3: best_case3.totalFovW, fovH3: best_case3.fovH, dof3: best_case3.dof, cams3: colDetail3, pass3,
        cost1, cost2, cost3, fit1, fit2, fit3
      });
    });

    // Read filter dropdown values
    const budgetFilterEl = document.getElementById(prefix ? prefix + 'matrix-filter-budget' : 'matrix-filter-budget');
    const mpFilterEl = document.getElementById(prefix ? prefix + 'matrix-filter-mp' : 'matrix-filter-mp');
    const budgetFilter = budgetFilterEl ? budgetFilterEl.value : 'all';
    const mpFilter = mpFilterEl ? mpFilterEl.value : 'all';

    // Get active camera config values to highlight active row
    const curSw = parseFloat((document.getElementById(prefix + 'sw') || {}).value) || 0;
    const curWd = parseFloat((document.getElementById(prefix + 'wdBox') || {}).value) || 0;
    const curFl = parseFloat((document.getElementById(prefix + 'flBox') || {}).value) || 0;
    const curPxw = parseFloat((document.getElementById(prefix + 'pxw') || {}).value) || 0;
    const curPxh = parseFloat((document.getElementById(prefix + 'pxh') || {}).value) || 0;
    const curMp = Math.round((curPxw * curPxh) / 1000000);

    let html = '';
    rows.forEach(r => {
      if (mpFilter !== 'all' && parseInt(mpFilter) !== r.resMP) return;

      const cases = [
        { label: 'Case 1 (Clinical)', color: '#d97706', fl: r.fl1, wd: r.wd1, den: r.den1, fovW: r.fovW1, fovH: r.fovH1, dof: r.dof1, cams: r.cams1, cost: r.cost1, fit: r.fit1, pass: r.pass1 },
        { label: 'Case 2 (Max Res)',  color: '#7c3aed', fl: r.fl2, wd: r.wd2, den: r.den2, fovW: r.fovW2, fovH: r.fovH2, dof: r.dof2, cams: r.cams2, cost: r.cost2, fit: r.fit2, pass: r.pass2 },
        { label: 'Case 3 (Max DoF)',  color: '#059669', fl: r.fl3, wd: r.wd3, den: r.den3, fovW: r.fovW3, fovH: r.fovH3, dof: r.dof3, cams: r.cams3, cost: r.cost3, fit: r.fit3, pass: r.pass3 }
      ];

      const visibleCases = cases.filter(c => budgetFilter === 'all' || (budgetFilter === 'pass' && c.pass));
      if (visibleCases.length === 0) return;

      visibleCases.forEach((c, idx) => {
        const isActive = Math.abs(curSw - r.sw) < 0.5 && Math.abs(curWd - c.wd) < 15 && Math.abs(curFl - c.fl) < 5 && Math.abs(curMp - r.resMP) <= 1;
        const bgStyle = isActive ? 'background: #eff6ff; font-weight: bold;' : '';
        const borderStyle = (idx === visibleCases.length - 1) ? 'border-bottom: 2px solid var(--border);' : 'border-bottom: 1px solid #e2e8f0;';
        const dofStr = (c.dof > 9000 || c.dof <= 0) ? '∞' : `${c.dof.toFixed(0)} mm`;
        const btnText = isActive ? '✓ Active in 3D' : 'View in 3D';
        const btnBg = isActive ? 'background: #2563eb; color: #fff; border: 1px solid #1d4ed8;' : 'background: #f8fafc; color: #1e293b; border: 1px solid #cbd5e1;';

        html += `
          <tr style="cursor: pointer; ${borderStyle} ${bgStyle}" onclick="loadMatrixConfig('${prefix}', ${r.sw}, ${r.sh}, ${r.pSize.toFixed(2)}, ${r.pxw}, ${r.pxh}, ${c.wd}, ${c.fl})" onmouseover="if(!${isActive}) this.style.background='#f8fafc'" onmouseout="if(!${isActive}) this.style.background=''">
            ${idx === 0 ? `<td rowspan="${visibleCases.length}" style="vertical-align: middle; border-bottom: 2px solid var(--border); font-weight: 600;">${r.fmtName}</td>` : ''}
            ${idx === 0 ? `<td rowspan="${visibleCases.length}" style="vertical-align: middle; border-bottom: 2px solid var(--border); font-weight: 600;">${r.resMP} MP</td>` : ''}
            ${idx === 0 ? `<td rowspan="${visibleCases.length}" style="vertical-align: middle; border-bottom: 2px solid var(--border);">${r.pSize.toFixed(2)} µm</td>` : ''}
            <td style="font-weight: bold; color: ${c.color};">${c.label}</td>
            <td>${c.fl}mm @ ${(c.wd/10).toFixed(0)}cm</td>
            <td style="color: ${c.color}; font-weight: bold;">${c.den.toFixed(1)} px/mm</td>
            <td>${(c.fovW/1000).toFixed(2)}m &times; ${(c.fovH/1000).toFixed(2)}m</td>
            <td style="font-weight: 500;">${dofStr}</td>
            <td style="font-weight: 600;">${c.cams}</td>
            <td style="font-weight: bold;">$${c.cost.toLocaleString('en-US')}</td>
            <td>${c.fit}</td>
            <td><button onclick="event.stopPropagation(); loadMatrixConfig('${prefix}', ${r.sw}, ${r.sh}, ${r.pSize.toFixed(2)}, ${r.pxw}, ${r.pxh}, ${c.wd}, ${c.fl});" style="padding: 3px 8px; font-size: 10px; cursor: pointer; border-radius: 4px; ${btnBg} font-weight: 600;">${btnText}</button></td>
          </tr>
        `;
      });
    });
    
    tableBody.innerHTML = html || '<tr><td colspan="12" style="padding: 16px; color: #64748b;">No configurations match the selected filter criteria.</td></tr>';
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
    
    // Ensure the scale accommodates both the envelope and the camera orbit track
    const maxRequiredX = Math.max(w_mm * 0.9, gantryRadiusX);
    const maxRequiredY = Math.max(d_mm * 1.1, gantryRadiusY);
    const scale = Math.min((W/2 - 20) / maxRequiredX, (H/2 - 20) / maxRequiredY);

    const renderTrackX = gantryRadiusX * scale;
    const renderTrackY = gantryRadiusY * scale;
    
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
    ctx.ellipse(0, 0, renderTrackX, renderTrackY, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Read selected angle dropdown value (0, 90, 180, 270 deg)
    const angleSelectEl = document.getElementById(prefix ? prefix + 'graph-angle' : 'graph-angle');
    const selectedAngleDeg = parseFloat(angleSelectEl ? angleSelectEl.value : "0") || 0;
    const activeRad = selectedAngleDeg * Math.PI / 180;

    // Calculate optical half-FOV angle in radians
    const swEl = document.getElementById(prefix + 'sw') || document.getElementById('sw');
    const sensorW = swEl ? parseFloat(swEl.value) : 36.0;
    const mag = fl / (wd_mm - fl);
    const fovW = sensorW / (mag || 0.001);
    const halfFovRad = Math.atan((fovW / 2) / wd_mm) || 0.35;

    // Architecture-specific camera positioning & active FOV cone angle
    let activeCamRad = activeRad;
    let trackCamAngles = [0, Math.PI/2, Math.PI, 3*Math.PI/2];

    if (prefix === 'm2-') {
      // Model 2: Dual columns at 0° (Front) and 180° (Back)
      trackCamAngles = [0, Math.PI];
      activeCamRad = (selectedAngleDeg === 180 || selectedAngleDeg === 270) ? Math.PI : 0;
    } else if (prefix === 'm3-') {
      // Model 3: Camera carriage at 0° (Front) facing patient
      trackCamAngles = [0];
      activeCamRad = 0;
    }

    // 1. Draw Rectangular Patient Envelope Box in center
    const rectHalfW = w_mm / 2;
    const rectHalfD = d_mm / 2;

    ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(-rectHalfW * scale, -rectHalfD * scale, rectHalfW * 2 * scale, rectHalfD * 2 * scale);
    ctx.fill();
    ctx.stroke();

    // 2. Draw EXPANDING FOV BEAM CONTOUR FROM CAMERA LENS ACROSS ENVELOPE
    const activeCx = (renderTrackX / scale) * Math.sin(activeCamRad);
    const activeCy = -(renderTrackY / scale) * Math.cos(activeCamRad);

    const aimAngle = Math.atan2(-activeCy, -activeCx);
    const leftAngle = aimAngle - halfFovRad;
    const rightAngle = aimAngle + halfFovRad;

    // Draw FOV cone exactly to the back face depending on camera angle
    let lx, ly, rx, ry;
    const normRad = (activeCamRad % (2*Math.PI) + 2*Math.PI) % (2*Math.PI);
    
    if (normRad < 0.1 || normRad > 2*Math.PI - 0.1) {
        // 0 deg: Front camera (aims +Y). Back face is +d_mm/2
        const distY = (d_mm / 2) - activeCy;
        lx = activeCx + Math.cos(leftAngle) * (distY / Math.sin(leftAngle));
        ly = activeCy + Math.sin(leftAngle) * (distY / Math.sin(leftAngle));
        rx = activeCx + Math.cos(rightAngle) * (distY / Math.sin(rightAngle));
        ry = activeCy + Math.sin(rightAngle) * (distY / Math.sin(rightAngle));
    } else if (Math.abs(normRad - Math.PI) < 0.1) {
        // 180 deg: Back camera (aims -Y). Back face is -d_mm/2
        const distY = (-d_mm / 2) - activeCy;
        lx = activeCx + Math.cos(leftAngle) * (distY / Math.sin(leftAngle));
        ly = activeCy + Math.sin(leftAngle) * (distY / Math.sin(leftAngle));
        rx = activeCx + Math.cos(rightAngle) * (distY / Math.sin(rightAngle));
        ry = activeCy + Math.sin(rightAngle) * (distY / Math.sin(rightAngle));
    } else if (Math.abs(normRad - Math.PI/2) < 0.1) {
        // 90 deg: Right camera (aims -X). Back face is -w_mm/2
        const distX = (-w_mm / 2) - activeCx;
        lx = activeCx + Math.cos(leftAngle) * (distX / Math.cos(leftAngle));
        ly = activeCy + Math.sin(leftAngle) * (distX / Math.cos(leftAngle));
        rx = activeCx + Math.cos(rightAngle) * (distX / Math.cos(rightAngle));
        ry = activeCy + Math.sin(rightAngle) * (distX / Math.cos(rightAngle));
    } else {
        // 270 deg: Left camera (aims +X). Back face is +w_mm/2
        const distX = (w_mm / 2) - activeCx;
        lx = activeCx + Math.cos(leftAngle) * (distX / Math.cos(leftAngle));
        ly = activeCy + Math.sin(leftAngle) * (distX / Math.cos(leftAngle));
        rx = activeCx + Math.cos(rightAngle) * (distX / Math.cos(rightAngle));
        ry = activeCy + Math.sin(rightAngle) * (distX / Math.cos(rightAngle));
    }

    // Draw Full Expanding FOV Beam Cone from Camera Lens
    ctx.beginPath();
    ctx.moveTo(activeCx * scale, activeCy * scale);
    ctx.lineTo(lx * scale, ly * scale);
    ctx.lineTo(rx * scale, ry * scale);
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.18)'; // Transparent blue FOV beam
    ctx.fill();

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Calculate resolution changes over distance (Front WD vs Back WD)
    const nomPxMm = actualPxMm || targetPxMm;
    const frontWd = wd_mm;
    const backWd = wd_mm + d_mm;
    const frontPxMm = nomPxMm * ((wd_mm - fl) / (frontWd - fl));
    const backPxMm = nomPxMm * ((wd_mm - fl) / (backWd - fl));
    const frontFovM = fovW / 1000;
    const backFovM = (sensorW / (fl / (backWd - fl))) / 1000;

    // Update map parameter HUD text above canvas
    if (paramsDiv) {
      paramsDiv.innerHTML = `FOV Front: <b>${frontFovM.toFixed(2)}m</b> (${frontPxMm.toFixed(1)} px/mm) ➔ Back: <b>${backFovM.toFixed(2)}m</b> (${backPxMm.toFixed(1)} px/mm)`;
    }

    // Center dimension label inside the envelope box with clean spacing
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Patient Envelope (${(envW_m*100).toFixed(0)} × ${(envD_m*100).toFixed(0)} cm)`, 0, 0);

    // 4. Draw subtle dimmed dots for all system camera positions on orbit
    trackCamAngles.forEach(a => {
      const cx = renderTrackX * Math.sin(a);
      const cy = -renderTrackY * Math.cos(a);
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
    });

    // 5. Highlight ACTIVE Camera Dot pointing to envelope overlap region
    ctx.beginPath();
    ctx.arc(activeCx * scale, activeCy * scale, 6.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#2563eb';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4 edges: Top, Right, Bottom, Left
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
        for (let a of trackCamAngles) {
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

function render1DDensityGraph(prefix, actualPxMm, fl = 50) {
    const canvas = document.getElementById(prefix + 'density-graph-container') || document.getElementById(prefix + 'density-graph');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const envW_m = parseFloat((document.getElementById(prefix + 'patientEnvW') || {}).value) || 1.0;
    const envD_m = parseFloat((document.getElementById(prefix + 'patientEnvD') || {}).value) || 0.6;
    const targetPxMmEl = document.getElementById(prefix + 'reqResBox') || document.getElementById(prefix + 'targetPxMm') || document.getElementById('reqResBox');
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
        } else if (preset === 'IMX342' || preset === 'imx342') {
          if (swEl) swEl.value = 22.3;
          if (shEl) shEl.value = 16.7;
          if (pixelSizeEl) pixelSizeEl.value = 3.45;
          if (pxwEl) pxwEl.value = 6464;
          if (pxhEl) pxhEl.value = 4852;
        } else if (preset === 'IMX455' || preset === 'imx455') {
          if (swEl) swEl.value = 36.0;
          if (shEl) shEl.value = 24.0;
          if (pixelSizeEl) pixelSizeEl.value = 3.76;
          if (pxwEl) pxwEl.value = 9568;
          if (pxhEl) pxhEl.value = 6380;
        } else if (preset === 'IMX411' || preset === 'imx411') {
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
        } else if (preset === 'IMX927' || preset === 'imx927') {
          if (swEl) swEl.value = 28.08;
          if (shEl) shEl.value = 28.08;
          if (pixelSizeEl) pixelSizeEl.value = 2.74;
          if (pxwEl) pxwEl.value = 10248;
          if (pxhEl) pxhEl.value = 10248;
        } else if (preset === 'IMX571' || preset === 'imx571') {
          if (swEl) swEl.value = 23.5;
          if (shEl) shEl.value = 15.7;
          if (pixelSizeEl) pixelSizeEl.value = 3.76;
          if (pxwEl) pxwEl.value = 6244;
          if (pxhEl) pxhEl.value = 4168;
        } else if (preset === 'gmax3265') {
          if (swEl) swEl.value = 29.9;
          if (shEl) shEl.value = 22.4;
          if (pixelSizeEl) pixelSizeEl.value = 3.2;
          if (pxwEl) pxwEl.value = 9344;
          if (pxhEl) pxhEl.value = 7000;
        } else if (preset === 'imx530') {
          if (swEl) swEl.value = 14.6;
          if (shEl) shEl.value = 12.62;
          if (pixelSizeEl) pixelSizeEl.value = 2.74;
          if (pxwEl) pxwEl.value = 5328;
          if (pxhEl) pxhEl.value = 4608;
        } else if (preset === 'imx541') {
          if (swEl) swEl.value = 12.36;
          if (shEl) shEl.value = 12.36;
          if (pixelSizeEl) pixelSizeEl.value = 2.74;
          if (pxwEl) pxwEl.value = 4512;
          if (pxhEl) pxhEl.value = 4512;
        } else if (preset === 'imx542') {
          if (swEl) swEl.value = 14.60;
          if (shEl) shEl.value = 8.33;
          if (pixelSizeEl) pixelSizeEl.value = 2.74;
          if (pxwEl) pxwEl.value = 5328;
          if (pxhEl) pxhEl.value = 3040;
        } else if (preset === 'mf50') {
          if (swEl) swEl.value = 43.8;
          if (shEl) shEl.value = 32.9;
          if (pixelSizeEl) pixelSizeEl.value = 3.76;
          if (pxwEl) pxwEl.value = 8256;
          if (pxhEl) pxhEl.value = 6192;
        } else if (preset === '5dmk4') {
          if (swEl) swEl.value = 36.0;
          if (shEl) shEl.value = 24.0;
          if (pixelSizeEl) pixelSizeEl.value = 5.36;
          if (pxwEl) pxwEl.value = 6720;
          if (pxhEl) pxhEl.value = 4480;
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
      const lowestEnvDensityEl = document.getElementById(prefix + 'lowestEnvDensity');
      if (avgEnvDensityEl || lowestEnvDensityEl) {
        const depthMm = patDM2 * 1000;
        const backWd = wd + (depthMm / 2.0);
        const frontWd = Math.max(fl + 10, wd - (depthMm / 2.0));
        const backDens = currentDensity * ((wd - fl) / Math.max(1, backWd - fl));
        const frontDens = currentDensity * ((wd - fl) / Math.max(1, frontWd - fl));
        const avgDens = (backDens + frontDens) / 2.0;

        if (avgEnvDensityEl) avgEnvDensityEl.textContent = avgDens.toFixed(2);
        if (lowestEnvDensityEl) lowestEnvDensityEl.textContent = backDens.toFixed(2);
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
    const stackOverlap = 0.20; // 20% Z-axis overlap for focus stacking
    const stacks = dof > 0 ? (totalTarget <= dof ? 1 : Math.ceil((totalTarget - dof) / (dof * (1 - stackOverlap))) + 1) : 1;
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
    const p64 = parseFloat(document.getElementById(prefix + 'price64')?.value || 8850);
    const p100 = parseFloat(document.getElementById(prefix + 'price100')?.value || 16995);
    const p127 = parseFloat(document.getElementById(prefix + 'price127')?.value || 9500);
    const p150 = parseFloat(document.getElementById(prefix + 'price150')?.value || 10800);
    const pCustom = parseFloat(document.getElementById(prefix + 'priceCustom')?.value || 6500);

    let activeUnitPrice = pCustom;
    if (sensorPresetVal.includes("50mp") || sensorPresetVal.includes("mf50") || sensorPresetVal.includes("imx342") || sensorPresetVal.includes("imx530") || sensorPresetVal.includes("5dmk4")) {
      activeUnitPrice = p50;
    } else if (sensorPresetVal.includes("64mp") || sensorPresetVal.includes("64 mp") || sensorPresetVal.includes("embedded") || sensorPresetVal.includes("gmax3265") || sensorPresetVal.includes("imx541") || sensorPresetVal.includes("imx542") || sensorPresetVal.includes("imx927")) {
      activeUnitPrice = p64;
    } else if (sensorPresetVal.includes("100mp") || sensorPresetVal.includes("100 mp") || sensorPresetVal.includes("imx455") || sensorPresetVal.includes("imx571")) {
      activeUnitPrice = p100;
    } else if (sensorPresetVal.includes("127mp") || sensorPresetVal.includes("imx661")) {
      activeUnitPrice = p127;
    } else if (sensorPresetVal.includes("150mp") || sensorPresetVal.includes("imx411")) {
      activeUnitPrice = p150;
    }
    
    const priceInput = document.getElementById(prefix + 'cameraUnitPrice');
    if (priceInput) priceInput.value = activeUnitPrice;

    // Calculate total camera cost, budget utilization, and status
    const budgetInput = document.getElementById(prefix + 'maxCameraBudget');
    const unitPrice = activeUnitPrice;
    const maxBudget = budgetInput ? (parseFloat(budgetInput.value) || 0) : 100000;
    
    let totalCamsNum = vertCamsNeeded;
    if (isModel3) {
      totalCamsNum = numColumns * vertCamsNeeded;
    } else if (isModel2) {
      totalCamsNum = m2ColCount * vertCamsNeeded;
    }
    
    const totalCost = totalCamsNum * unitPrice;
    const remainingBudget = maxBudget - totalCost;
    const utilPct = maxBudget > 0 ? Math.min(999, (totalCost / maxBudget) * 100).toFixed(1) : 0;
    
    const costEl = document.getElementById(prefix ? prefix + 'totalCameraCost' : 'totalCameraCost');
    const budgetStatusEl = document.getElementById(prefix ? prefix + 'budgetStatus' : 'budgetStatus');
    const budgetTargetEl = document.getElementById(prefix ? prefix + 'budgetTargetDisplay' : 'budgetTargetDisplay');
    const budgetRemEl = document.getElementById(prefix ? prefix + 'budgetRemainingDisplay' : 'budgetRemainingDisplay');
    const budgetUtilEl = document.getElementById(prefix ? prefix + 'budgetUtilDisplay' : 'budgetUtilDisplay');
    const budgetBarEl = document.getElementById(prefix ? prefix + 'budgetProgressBar' : 'budgetProgressBar');

    if (costEl) costEl.textContent = totalCost.toLocaleString();
    if (budgetTargetEl) budgetTargetEl.textContent = maxBudget.toLocaleString();
    if (budgetRemEl) {
      budgetRemEl.textContent = (remainingBudget >= 0 ? '$' : '-$') + Math.abs(remainingBudget).toLocaleString();
      budgetRemEl.style.color = remainingBudget >= 0 ? '#10b981' : '#ef4444';
    }
    if (budgetUtilEl) budgetUtilEl.textContent = utilPct + '%';
    
    if (budgetBarEl) {
      const barPct = Math.min(100, Math.max(0, parseFloat(utilPct)));
      budgetBarEl.style.width = barPct + '%';
      budgetBarEl.style.background = totalCost <= maxBudget ? '#10b981' : '#ef4444';
    }

    if (budgetStatusEl) {
      if (totalCost <= maxBudget) {
        budgetStatusEl.textContent = "PASS (Within Budget)";
        budgetStatusEl.className = "badge badge-pass";
      } else {
        budgetStatusEl.textContent = "FAIL (Over Budget)";
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
  var g3dJointLeftArm = null, g3dJointRightArm = null, g3dJointLeftLeg = null, g3dJointRightLeg = null;
  var g3dMixer = null;
  var g3dClock = new THREE.Clock();
  var nathanModel = null;
  var dirLight, fillLight;
  var g3dSkinMaterials = [];
  window.g3dIlluminationMode = 'cross';

  function buildProceduralArticulatedMannequin() {
    if (!mannequinGroup) return;
    while (mannequinGroup.children.length > 0) {
      mannequinGroup.remove(mannequinGroup.children[0]);
    }

    // Realistic human skin, hair, and apparel materials
    const skinMat   = new THREE.MeshStandardMaterial({ color: 0xf3c5ab, roughness: 0.52, metalness: 0.0 });
    const hairMat   = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.85, metalness: 0.0 });
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
    const shoeMat   = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });

    const rootGroup = new THREE.Group();
    rootGroup.position.set(0, 0, 0);

    // --- REALISTIC TORSO & CHEST ---
    const torsoGeo = new THREE.CylinderGeometry(0.185, 0.13, 0.54, 32);
    const torsoMesh = new THREE.Mesh(torsoGeo, skinMat);
    torsoMesh.position.set(0, 1.24, 0);
    rootGroup.add(torsoMesh);

    // Anatomical Pectoral Muscle Contours
    const pecsL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), skinMat);
    pecsL.scale.set(1.1, 0.7, 0.5);
    pecsL.position.set(-0.07, 1.41, 0.08);
    rootGroup.add(pecsL);

    const pecsR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), skinMat);
    pecsR.scale.set(1.1, 0.7, 0.5);
    pecsR.position.set(0.07, 1.41, 0.08);
    rootGroup.add(pecsR);

    // --- HIPS & MEDICAL APPAREL ---
    const pelvisGeo = new THREE.CylinderGeometry(0.145, 0.132, 0.18, 32);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, shortsMat);
    pelvisMesh.position.set(0, 0.88, 0);
    rootGroup.add(pelvisMesh);

    // --- NECK & REALISTIC HUMAN HEAD ---
    const neckGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.11, 24);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, 1.57, 0);
    rootGroup.add(neckMesh);

    // Cranium & Face
    const headGeo = new THREE.SphereGeometry(0.108, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.scale.set(0.95, 1.18, 0.95);
    headMesh.position.set(0, 1.70, 0);
    rootGroup.add(headMesh);

    // Anatomical Hair Cap
    const hairGeo = new THREE.SphereGeometry(0.111, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.7);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 1.71, -0.005);
    rootGroup.add(hairMesh);

    // Nose Feature
    const noseGeo = new THREE.ConeGeometry(0.016, 0.045, 16);
    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.rotation.x = Math.PI / 2;
    noseMesh.position.set(0, 1.69, 0.108);
    rootGroup.add(noseMesh);

    // Ears
    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), skinMat);
    earL.scale.set(0.4, 1.1, 0.7);
    earL.position.set(-0.10, 1.70, 0.01);
    rootGroup.add(earL);

    const earR = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), skinMat);
    earR.scale.set(0.4, 1.1, 0.7);
    earR.position.set(0.10, 1.70, 0.01);
    rootGroup.add(earR);

    // --- LEFT ARM (Shoulder Joint at x = -0.21, y = 1.48) ---
    g3dJointLeftArm = new THREE.Group();
    g3dJointLeftArm.position.set(-0.21, 1.48, 0);
    rootGroup.add(g3dJointLeftArm);

    // Deltoid Shoulder Muscle
    const shoulderLMesh = new THREE.Mesh(new THREE.SphereGeometry(0.058, 24, 24), skinMat);
    shoulderLMesh.scale.set(1.15, 1.2, 1.1);
    g3dJointLeftArm.add(shoulderLMesh);

    // Upper Arm (Biceps/Triceps)
    const upperArmLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.038, 0.30, 24), skinMat);
    upperArmLMesh.position.set(0, -0.15, 0);
    g3dJointLeftArm.add(upperArmLMesh);

    // Elbow Joint
    const elbowLMesh = new THREE.Mesh(new THREE.SphereGeometry(0.038, 20, 20), skinMat);
    elbowLMesh.position.set(0, -0.30, 0);
    g3dJointLeftArm.add(elbowLMesh);

    // Forearm
    const forearmLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.030, 0.28, 24), skinMat);
    forearmLMesh.position.set(0, -0.44, 0);
    g3dJointLeftArm.add(forearmLMesh);

    // Realistic Hand & Palm
    const handLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.08, 0.06), skinMat);
    handLMesh.position.set(0, -0.62, 0);
    g3dJointLeftArm.add(handLMesh);

    // Thumb
    const thumbL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.035, 12), skinMat);
    thumbL.rotation.z = Math.PI / 4;
    thumbL.position.set(0.015, -0.60, 0.02);
    g3dJointLeftArm.add(thumbL);

    // --- RIGHT ARM (Shoulder Joint at x = +0.21, y = 1.48) ---
    g3dJointRightArm = new THREE.Group();
    g3dJointRightArm.position.set(0.21, 1.48, 0);
    rootGroup.add(g3dJointRightArm);

    // Deltoid Shoulder Muscle
    const shoulderRMesh = new THREE.Mesh(new THREE.SphereGeometry(0.058, 24, 24), skinMat);
    shoulderRMesh.scale.set(1.15, 1.2, 1.1);
    g3dJointRightArm.add(shoulderRMesh);

    // Upper Arm (Biceps/Triceps)
    const upperArmRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.038, 0.30, 24), skinMat);
    upperArmRMesh.position.set(0, -0.15, 0);
    g3dJointRightArm.add(upperArmRMesh);

    // Elbow Joint
    const elbowRMesh = new THREE.Mesh(new THREE.SphereGeometry(0.038, 20, 20), skinMat);
    elbowRMesh.position.set(0, -0.30, 0);
    g3dJointRightArm.add(elbowRMesh);

    // Forearm
    const forearmRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.030, 0.28, 24), skinMat);
    forearmRMesh.position.set(0, -0.44, 0);
    g3dJointRightArm.add(forearmRMesh);

    // Realistic Hand & Palm
    const handRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.08, 0.06), skinMat);
    handRMesh.position.set(0, -0.62, 0);
    g3dJointRightArm.add(handRMesh);

    // Thumb
    const thumbR = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.035, 12), skinMat);
    thumbR.rotation.z = -Math.PI / 4;
    thumbR.position.set(-0.015, -0.60, 0.02);
    g3dJointRightArm.add(thumbR);

    // --- LEFT LEG (Hip Joint at x = -0.09, y = 0.80) ---
    g3dJointLeftLeg = new THREE.Group();
    g3dJointLeftLeg.position.set(-0.09, 0.80, 0);
    rootGroup.add(g3dJointLeftLeg);

    const hipLMesh = new THREE.Mesh(new THREE.SphereGeometry(0.058, 20, 20), skinMat);
    g3dJointLeftLeg.add(hipLMesh);

    // Quadriceps Thigh
    const thighLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.048, 0.40, 24), skinMat);
    thighLMesh.position.set(0, -0.20, 0);
    g3dJointLeftLeg.add(thighLMesh);

    // Knee Cap Joint
    const kneeLMesh = new THREE.Mesh(new THREE.SphereGeometry(0.048, 20, 20), skinMat);
    kneeLMesh.position.set(0, -0.40, 0);
    g3dJointLeftLeg.add(kneeLMesh);

    // Calf Muscle
    const calfLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.038, 0.38, 24), skinMat);
    calfLMesh.position.set(0, -0.59, 0);
    g3dJointLeftLeg.add(calfLMesh);

    // Foot / Shoe
    const footLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.045, 0.19), shoeMat);
    footLMesh.position.set(0, -0.79, 0.04);
    g3dJointLeftLeg.add(footLMesh);

    // --- RIGHT LEG (Hip Joint at x = +0.09, y = 0.80) ---
    g3dJointRightLeg = new THREE.Group();
    g3dJointRightLeg.position.set(0.09, 0.80, 0);
    rootGroup.add(g3dJointRightLeg);

    const hipRMesh = new THREE.Mesh(new THREE.SphereGeometry(0.058, 20, 20), skinMat);
    g3dJointRightLeg.add(hipRMesh);

    // Quadriceps Thigh
    const thighRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.048, 0.40, 24), skinMat);
    thighRMesh.position.set(0, -0.20, 0);
    g3dJointRightLeg.add(thighRMesh);

    // Knee Cap Joint
    const kneeRMesh = new THREE.Mesh(new THREE.SphereGeometry(0.048, 20, 20), skinMat);
    kneeRMesh.position.set(0, -0.40, 0);
    g3dJointRightLeg.add(kneeRMesh);

    // Calf Muscle
    const calfRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.038, 0.38, 24), skinMat);
    calfRMesh.position.set(0, -0.59, 0);
    g3dJointRightLeg.add(calfRMesh);

    // Foot / Shoe
    const footRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.045, 0.19), shoeMat);
    footRMesh.position.set(0, -0.79, 0.04);
    g3dJointRightLeg.add(footRMesh);

    mannequinGroup.add(rootGroup);

    // Apply active pose immediately after building
    if (typeof window.setPatient3DPose === 'function') {
      window.setPatient3DPose(window.g3dActivePose || 'default');
    }
  }
  window.buildProceduralArticulatedMannequin = buildProceduralArticulatedMannequin;

  function setPatient3DPose(poseKey) {
    const pKey = 'standard-a'; // Force relaxed pose as requested
    window.g3dActivePose = pKey;

    const armsLeft  = [g3dBoneLeftArm,  g3dJointLeftArm].filter(Boolean);
    const armsRight = [g3dBoneRightArm, g3dJointRightArm].filter(Boolean);
    const legsLeft  = [g3dBoneLeftLeg,  g3dJointLeftLeg].filter(Boolean);
    const legsRight = [g3dBoneRightLeg, g3dJointRightLeg].filter(Boolean);

    if (armsLeft.length === 0 || armsRight.length === 0) return;

    // Relaxed Pose (Arms straight down, matching reference photo)
    if (g3dBoneLeftArm) {
        g3dBoneLeftArm.rotation.set(0, 0, -1.25); // Mixamo GLTF: rotate -1.25 rad to drop DOWN
    }
    if (g3dBoneRightArm) {
        g3dBoneRightArm.rotation.set(0, 0, 1.25); // Mixamo GLTF: rotate +1.25 rad to drop DOWN
    }
    
    if (g3dJointLeftArm) {
        g3dJointLeftArm.rotation.set(0, 0, 0); // Procedural: bind pose is already straight down
    }
    if (g3dJointRightArm) {
        g3dJointRightArm.rotation.set(0, 0, 0); // Procedural: bind pose is already straight down
    }
    legsLeft.forEach(leg => { leg.rotation.x = 0; leg.rotation.z = 0; });
    legsRight.forEach(leg => { leg.rotation.x = 0; leg.rotation.z = 0; });
    if (nathanModel) {
      nathanModel.updateMatrixWorld(true);
    }
  }
  window.setPatient3DPose = setPatient3DPose;

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

    // Build default procedural jointed mannequin
    buildProceduralArticulatedMannequin();

    // Decode and parse embedded realistic 3D rigged human body GLB model
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
              if (child.isBone || child.type === 'Bone') {
                const nameL = child.name.toLowerCase();
                if (nameL.includes('leftarm') || nameL.includes('arm_l') || nameL.includes('l_arm')) g3dBoneLeftArm = child;
                if (nameL.includes('rightarm') || nameL.includes('arm_r') || nameL.includes('r_arm')) g3dBoneRightArm = child;
                if (nameL.includes('leftupleg') || nameL.includes('leg_l') || nameL.includes('l_leg')) g3dBoneLeftLeg = child;
                if (nameL.includes('rightupleg') || nameL.includes('leg_r') || nameL.includes('r_leg')) g3dBoneRightLeg = child;
              }
              if (child.isMesh || child.isSkinnedMesh) {
                if (child.geometry) {
                  child.geometry.computeVertexNormals();
                }
                child.castShadow = false;
                child.receiveShadow = false;
                if (child.material) {
                  const isJoint = child.name && child.name.toLowerCase().includes('joint');
                  child.material = new THREE.MeshStandardMaterial({
                    color: isJoint ? 0x334155 : 0xe0a98b, // Realistic warm skin tone with dark joints/apparel
                    roughness: 0.52,
                    metalness: 0.0,
                    skinning: true
                  });
                  if (!g3dSkinMaterials.includes(child.material)) {
                    g3dSkinMaterials.push(child.material);
                  }
                }
              }
            });

            // Force matrix update on initial model hierarchy before computing bounds
            model.scale.set(1, 1, 1);
            model.position.set(0, 0, 0);
            model.updateMatrixWorld(true);

            let box = new THREE.Box3().setFromObject(model);
            let size = new THREE.Vector3();
            box.getSize(size);

            // Mixamo Xbot GLB has native Armature scale (0.01) with bone height ~1.78m.
            // If raw size.y is < 0.1, un-skinned geometry accessor returned unscaled units (multiply by 100)
            let rawH = size.y || 1.78;
            if (rawH < 0.1) rawH *= 100;
            if (rawH > 50)  rawH /= 100;

            // Target height: 95% of patient envelope height (1.90m for 2.0m envelope) so patient looks big & fills box perfectly
            const envH = (typeof g3dPatH !== 'undefined' && g3dPatH > 0) ? g3dPatH : 2.0;
            const targetH = envH * 0.95; // 1.90m
            const scaleFactor = targetH / rawH; // ~1.067

            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
            model.position.set(0, 0, 0);
            model.updateMatrixWorld(true);

            nathanModel = model;
            mannequinGroup.add(nathanModel);
            console.log('Successfully loaded real 3D rigged Mixamo human mannequin model!');
            if (typeof window.setPatient3DPose === 'function') {
              const poseSel = document.getElementById('g3d-pose-select');
              window.setPatient3DPose(poseSel ? poseSel.value : 'default');
            }
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
            const rotateGantry = document.getElementById('m3-rotateGantryInstead') ? document.getElementById('m3-rotateGantryInstead').checked : true;
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
          const rotateGantry = document.getElementById('m3-rotateGantryInstead') ? document.getElementById('m3-rotateGantryInstead').checked : true;
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
                const extendEl = document.getElementById('g3d-extend-fov') || document.getElementById('extendFovCheck');
                const extendFov = extendEl ? extendEl.checked : false;
                const frustumPoints = [];
                let renderWd = g3dWD;
                let renderFovHW = fovHW;
                let renderFovVH = fovVH;
                
                if (extendFov) {
                    renderWd = g3dWD + g3dPatD; // Extend fully across the envelope depth to the back face
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

            const extendEl = document.getElementById('g3d-extend-fov') || document.getElementById('extendFovCheck');
            const extendFov = extendEl ? extendEl.checked : false;

            const frustumPoints = [];
            let renderWd = g3dWD;
            let renderFovHW = fovHW;
            let renderFovVH = fovVH;
            
            if (extendFov) {
                renderWd = g3dWD + g3dPatD; // Extend fully across the envelope depth to the back face
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

    // Ensure procedural articulated mannequin is built and active
    if ((!g3dJointLeftArm || mannequinGroup.children.length === 0) && typeof window.buildProceduralArticulatedMannequin === 'function') {
      window.buildProceduralArticulatedMannequin();
    }

    // Add physical turntable platform disc for Model 3 (patient turntable)
    if (isModel3) {
      const turntableGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32);
      turntableGeo.name = 'turntableDisc';
      const turntableMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.3 });
      const turntableMesh = new THREE.Mesh(turntableGeo, turntableMat);
      turntableMesh.position.y = 0.02; // Sit slightly above floor grid
      mannequinGroup.add(turntableMesh);
    }
    
    // Re-apply active joint pose (Supports Model 1, Model 2, and Model 3)
    if (typeof window.setPatient3DPose === 'function') {
      const poseSel = document.getElementById('g3d-pose-select');
      const activePose = poseSel ? poseSel.value : (window.g3dActivePose || 'default');
      window.setPatient3DPose(activePose);
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
    
    // Only show "Rotate Gantry instead of Patient" for Model 3
    const rotateGantryEl = document.getElementById('m3-rotateGantryInstead');
    if (rotateGantryEl && rotateGantryEl.closest('label')) {
        rotateGantryEl.closest('label').style.display = (window.g3dArchitecture === 'model3') ? 'flex' : 'none';
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

          // Reset scale & position and update matrix world
          model.scale.set(1, 1, 1);
          model.position.set(0, 0, 0);
          model.updateMatrixWorld(true);

          let box = new THREE.Box3().setFromObject(model);
          let size = new THREE.Vector3();
          box.getSize(size);

          const envW = (typeof g3dPatW !== 'undefined' && g3dPatW > 0) ? g3dPatW : 1.0;
          const envD = (typeof g3dPatD !== 'undefined' && g3dPatD > 0) ? g3dPatD : 0.6;
          const envH = (typeof g3dPatH !== 'undefined' && g3dPatH > 0) ? g3dPatH : 2.0;

          const maxAllowedW = envW * 0.85;
          const maxAllowedD = envD * 0.85;
          const maxAllowedH = envH * 0.85;

          const scaleX = maxAllowedW / (size.x || 1.0);
          const scaleY = maxAllowedH / (size.y || 1.8);
          const scaleZ = maxAllowedD / (size.z || 0.4);

          const scaleFactor = Math.min(scaleX, scaleY, scaleZ);

          model.scale.set(scaleFactor, scaleFactor, scaleFactor);
          model.updateMatrixWorld(true);

          box = new THREE.Box3().setFromObject(model);
          const center = new THREE.Vector3();
          box.getCenter(center);

          model.position.set(
            -center.x,
            -box.min.y,
            -center.z
          );
          model.updateMatrixWorld(true);

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


  window.renderGantry3D = function() {
    if (typeof rebuildGantryMechanicals === 'function') rebuildGantryMechanicals();
  };

  window.simulateVerticalSweep = function(prefix) {
    if (window.g3dSweepInterval) clearInterval(window.g3dSweepInterval);
    const wrappers = (window.m3RailWrappers && window.m3RailWrappers.length > 0) ? window.m3RailWrappers : (window.m3RailWrapper ? [window.m3RailWrapper] : []);
    
    if (wrappers.length > 0 && g3dCamHeights && g3dCamHeights.length > 0) {
        let stepIndex = g3dCamHeights.length - 1; // start from top
        wrappers.forEach(w => w.position.y = g3dCamHeights[stepIndex]);
        
        window.g3dSweepInterval = setInterval(() => {
            stepIndex--;
            if (stepIndex < 0) {
                clearInterval(window.g3dSweepInterval);
                wrappers.forEach(w => w.position.y = g3dCamHeights[g3dCamHeights.length - 1]); // reset
            } else {
                wrappers.forEach(w => w.position.y = g3dCamHeights[stepIndex]);
            }
        }, 800);
    }
  };

  window.moveGantryDownOneStep = function(prefix) {
    if (window.g3dSweepInterval) clearInterval(window.g3dSweepInterval);
    const wrappers = (window.m3RailWrappers && window.m3RailWrappers.length > 0) ? window.m3RailWrappers : (window.m3RailWrapper ? [window.m3RailWrapper] : []);
    if (wrappers.length > 0 && g3dCamHeights && g3dCamHeights.length > 0) {
        let currentY = wrappers[0].position.y;
        let nextIndex = g3dCamHeights.length - 1;
        for (let i = g3dCamHeights.length - 1; i >= 0; i--) {
            if (g3dCamHeights[i] < currentY - 0.05) {
                nextIndex = i;
                break;
            }
        }
        wrappers.forEach(w => w.position.y = g3dCamHeights[nextIndex]);
    }
  };

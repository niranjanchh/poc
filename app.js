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
document.addEventListener('DOMContentLoaded', () => {
    switchTab('model2-tab'); // Start on Model 2 to verify
    
    const sweepBtn = document.getElementById('trigger360Sweep');
    if (sweepBtn) {
        sweepBtn.addEventListener('click', () => {
            window.g3dIsSweeping = true;
            window.g3dSweepStart = Date.now();
        });
    }

    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
        input.addEventListener('change', calculate);
    });

    window.addEventListener('resize', resizeGantry3D);
});

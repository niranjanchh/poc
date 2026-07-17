// Global State
window.g3dColumns = [];
window.g3dIsSweeping = false;
window.g3dSweepAngle = 0;
window.g3dSweepStart = null;
window.g3dInitialized = false;

var g3dScene, g3dCamera, g3dRenderer, g3dControls;
var gantryGroup, mannequinGroup, stationaryGroup;

// 1. Core Logic & Tabs
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

    if (tabId === 'model2-tab') {
      if (!window.g3dInitialized) setupGantry3D();
      setTimeout(resizeGantry3D, 100);
    }
}

// 2. Calculations
function calculate() {
    const isModel2 = document.getElementById('model2-tab') && document.getElementById('model2-tab').style.display !== 'none';
    const prefix = isModel2 ? 'm2-' : '';

    const wdBox = document.getElementById(prefix + 'wdBox');
    const flBox = document.getElementById(prefix + 'flBox');
    const swEl = document.getElementById(prefix + 'sw');
    const shEl = document.getElementById(prefix + 'sh');

    if (!wdBox || !flBox) return;

    const wd = parseFloat(wdBox.value) || 500;
    const fl = parseFloat(flBox.value) || 35;
    const sensorW = parseFloat(swEl.value) || 46.15;
    const sensorH = parseFloat(shEl.value) || 32.87;

    const magnification = fl / (wd - fl);
    const fovW = sensorW / (magnification || 0.001);
    const fovH = sensorH / (magnification || 0.001);

    const fovVal = document.getElementById(prefix + 'fov-val');
    const fovHVal = document.getElementById(prefix + 'fov-h-val');
    if (fovVal) fovVal.textContent = fovW.toFixed(0);
    if (fovHVal) fovHVal.textContent = fovH.toFixed(0);

    // Rebuild the 3D model
    if (isModel2 && window.g3dInitialized) {
        rebuildGantryMechanicals();
    }
}

// 3. Three.js 3D Visualizer
function setupGantry3D() {
    let g3dContainer = document.getElementById('g3d-visualizer-wrapper') || document.getElementById('canvas3d-three');
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

    const patHeight = parseFloat(document.getElementById('m2-patientEnvH')?.value || 2.0);
    const wd = parseFloat(document.getElementById('m2-wdBox')?.value || 500) / 1000;
    const numColumns = parseInt(document.getElementById('m2-numColumns')?.value || 2);
    const vertCams = parseInt(document.getElementById('m2-g3dColCamsSlider')?.value || 5);
    const envW = parseFloat(document.getElementById('m2-patientEnvW')?.value || 1.0);
    const envD = parseFloat(document.getElementById('m2-patientEnvD')?.value || 0.6);

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
            const fovGeo = new THREE.ConeGeometry(wd * 0.4, wd, 4, 1, true);
            const fovEdges = new THREE.EdgesGeometry(fovGeo);
            const fovMat = new THREE.LineBasicMaterial({ color: 0x3b82f6 });
            const fov = new THREE.LineSegments(fovEdges, fovMat);
            fov.rotation.x = -Math.PI / 2;
            
            // Align FOV with camera (which is rotated parallel to person)
            fov.position.z = -wd / 2;
            
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

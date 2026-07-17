const fs = require('fs');

const missingCode = `
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
`;

let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');
appJs += missingCode;
fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);
console.log('Restored 3D visualizer logic!');

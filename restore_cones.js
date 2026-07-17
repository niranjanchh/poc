const fs = require('fs');
let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');

// Restore the ORIGINAL frustum geometry that was working perfectly before
// Original: apex at (0, h, 0) [patient center], rectangle at (±fovHW, h±fovVH, -renderWd) [near camera]
const broken = `            // Camera body at z = camZ, FOV rectangle projects to patient center (z=0)
            const camZ = -trackR + 0.18;
            // 4 lines from apex (camera) to each corner of the FOV rectangle at patient
            frustumPoints.push(new THREE.Vector3(0, h, camZ));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, 0));
            frustumPoints.push(new THREE.Vector3(0, h, camZ));
            frustumPoints.push(new THREE.Vector3( renderFovHW, h + renderFovVH, 0));
            frustumPoints.push(new THREE.Vector3(0, h, camZ));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, 0));
            frustumPoints.push(new THREE.Vector3(0, h, camZ));
            frustumPoints.push(new THREE.Vector3( renderFovHW, h - renderFovVH, 0));
            // 4 edges of the rectangle at patient plane
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, 0));
            frustumPoints.push(new THREE.Vector3( renderFovHW, h + renderFovVH, 0));
            frustumPoints.push(new THREE.Vector3( renderFovHW, h + renderFovVH, 0));
            frustumPoints.push(new THREE.Vector3( renderFovHW, h - renderFovVH, 0));
            frustumPoints.push(new THREE.Vector3( renderFovHW, h - renderFovVH, 0));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, 0));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, 0));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, 0));`;

const original = `            // Original cone: apex at patient center, rectangle at working distance toward camera
            frustumPoints.push(new THREE.Vector3(0, h, 0));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h + renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(0, h, 0));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(0, h, 0));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(0, h, 0));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h - renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h + renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h + renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(-renderFovHW, h - renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h - renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h - renderFovVH, -renderWd));
            frustumPoints.push(new THREE.Vector3(renderFovHW, h + renderFovVH, -renderWd));`;

if (appJs.includes(broken)) {
    appJs = appJs.replace(broken, original);
    console.log('RESTORED: Original frustum geometry (apex at patient, rectangle at camera distance).');
} else {
    console.log('ERROR: Could not find the broken cone block.');
}

fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);

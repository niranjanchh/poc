const fs = require('fs');
let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');

const targetRegex = /\/\/ FOV frustum wireframe\s*const frustumPoints = \[\];\s*frustumPoints\.push\(new THREE\.Vector3\(0, h, 0\)\);\s*frustumPoints\.push\(new THREE\.Vector3\(fovHW, h \+ fovVH, -wd\)\);[\s\S]*?const lineGeo = new THREE\.BufferGeometry\(\)\.setFromPoints\(frustumPoints\);/m;

const replacement = `// FOV frustum wireframe
        const extendFovCheckbox = document.getElementById('g3d-extend-fov');
        const extendFov = extendFovCheckbox ? extendFovCheckbox.checked : false;

        const frustumPoints = [];
        let renderWd = wd;
        let renderFovHW = fovHW;
        let renderFovVH = fovVH;
        
        if (extendFov) {
            renderWd = wd + (g3dPatD / 2);
            const scale = renderWd / wd;
            renderFovHW = fovHW * scale;
            renderFovVH = fovVH * scale;
        }

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
        frustumPoints.push(new THREE.Vector3(renderFovHW, h + renderFovVH, -renderWd));

        const lineGeo = new THREE.BufferGeometry().setFromPoints(frustumPoints);`;

appJs = appJs.replace(targetRegex, replacement);

fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);
console.log("Successfully patched app.js for extended FOV.");

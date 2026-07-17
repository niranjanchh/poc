const fs = require('fs');

let content = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');

// 1. Remove the model3-tab block in switchTab
content = content.replace(/\} else if \(tabId === 'model3-tab'\) \{[\s\S]*?(?=\} else \{|\}$)/m, '');

// 2. Remove prefix ternary logic for model 3
content = content.replace(/\(activeTab && activeTab\.id === 'model3-tab'\) \? 'm3-' : /g, '');

// 3. Remove isModel3 declarations and conditions
content = content.replace(/var isModel3 = .*?;\n/g, '');
content = content.replace(/const isModel3 = .*?;\n/g, '');
content = content.replace(/let isModel3 = .*?;\n/g, '');

// Remove if (isModel3) blocks
// Using a simple loop to find balanced brackets if needed, or regex for simple ones.
// Actually, simple regex might fail on nested blocks. 
// Let's use string manipulation for the large rebuildGantryMechanicals block.
// Find "if (window.g3dArchitecture === 'model3' && window.m3RailWrapper) {"
let idx = content.indexOf("if (window.g3dArchitecture === 'model3' && window.m3RailWrapper) {");
if (idx !== -1) {
    let endIdx = content.indexOf("if (window.g3dColumns && window.g3dArchitecture !== 'model3') {", idx);
    if (endIdx !== -1) {
        content = content.substring(0, idx) + content.substring(endIdx);
    }
}

// Remove "&& window.g3dArchitecture !== 'model3'"
content = content.replace(/&& window\.g3dArchitecture !== 'model3'/g, '');

// Remove m3- elements
content = content.replace(/const m3_[a-zA-Z0-9_]+ = document\.getElementById\('m3-[a-zA-Z0-9_]+'\);\n/g, '');

// Fix ternary in camsLabel
content = content.replace(/isModel3 \? '[^']*' : /g, '');

// Fix ternary in verticalCamsNeededVal
content = content.replace(/isModel3 \? [^:]* : /g, '');

// Remove block if (isModel3 && patientEnvW)
content = content.replace(/if \(isModel3 && patientEnvW\) \{[\s\S]*?\} else if/g, 'if');

// Remove if (isModel3) { document.getElementById('m3-numColumns').value... }
content = content.replace(/if \(isModel3\) \{\s*if \(document\.getElementById\('m3-numColumns'\)\) \{\s*document\.getElementById\('m3-numColumns'\)\.value = horizCamsNeeded;\s*\}\s*\}/g, '');

// Fix overlapEl
content = content.replace(/\(window\.g3dArchitecture === 'model3' \? 'm3-overlapX' : 'overlapX'\)/g, "'overlapX'");

// animate function logic:
// } else if (isModel3) { ... }
content = content.replace(/\} else if \(isModel3\) \{[\s\S]*?(?=\}\s*\}\s*function resizeGantry3D)/m, '}');

// function initGantry3D() -> m3Input logic
content = content.replace(/const horizCameras = isModel3 \? \(m3Input \? parseInt\(m3Input\.value\) : 1\) : 1;/g, 'const horizCameras = 1;');
content = content.replace(/const m3Input = document\.getElementById\('m3-numColumns'\);\n/g, '');

// Remove event listeners for m3_ variables
content = content.replace(/\[.*m3_.*\].forEach\(.*\{\s*if \(el\) el.addEventListener.*\}\);\n/g, '');

fs.writeFileSync('d:/projects/poc_rfq/app.js', content);
console.log('App.js cleaned');

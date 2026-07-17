const fs = require('fs');
let html = fs.readFileSync('d:/projects/poc_rfq/geometry_optics_calculator.html', 'utf8');

const btnM2 = `<button class="tab-btn" id="btn-model2" onclick="switchTab('model2-tab')">Dual Column Gantry (Model 2)</button>`;
const btnM3 = `<button class="tab-btn" id="btn-model3" onclick="switchTab('model3-tab')">Vertical Scanning Array (Model 3)</button>`;
if (!html.includes('btn-model3')) {
    html = html.replace(btnM2, btnM2 + '\n      ' + btnM3);
}

if (!html.includes('id="model3-tab"')) {
    const startM2 = html.indexOf('<div id="model2-tab" class="tab-content">');
    // find the end of the file where scripts start
    const endM2 = html.indexOf('<script src="app.js');
    if(endM2 === -1) {
       console.log("Could not find end hook.");
    } else {
       // We only want up to the end of model2-tab!
       // model2-tab ends before the closing of .main-content
       // let's search backwards from <script for </div>
       const endOfMainContent = html.lastIndexOf('</div>', endM2);
       const endOfContainer = html.lastIndexOf('</div>', endOfMainContent - 1);
       
       let m2ContentRaw = html.substring(startM2, endOfContainer);
       
       let m3Content = m2ContentRaw.replace(/m2-/g, 'm3-');
       m3Content = m3Content.replace(/model2/g, 'model3');
       m3Content = m3Content.replace(/Model 2/g, 'Model 3');
       m3Content = m3Content.replace('Side-by-Side Dual Column', 'Vertical Translating Array');
       m3Content = m3Content.replace('Number of Columns:', 'Cameras per Horizontal Row:');
       m3Content = m3Content.replace('columns', 'cameras');
       m3Content = m3Content.replace('Vertical Cameras Required (Static Column)', 'Vertical Stops Required (Motor Steps)');
       m3Content = m3Content.replace('TRIGGER 360° SWEEP', 'START VERTICAL SWEEP');
       m3Content = m3Content.replace('ROTATE ONE STEP', 'MOVE DOWN ONE STEP');
       m3Content = m3Content.replace("simulate360Sweep('m3-')", "simulateVerticalSweep('m3-')");
       m3Content = m3Content.replace("rotateGantryOneStep('m3-')", "moveGantryDownOneStep('m3-')");
       
       html = html.substring(0, endOfContainer) + '\n' + m3Content + '\n' + html.substring(endOfContainer);
       fs.writeFileSync('d:/projects/poc_rfq/geometry_optics_calculator.html', html);
       console.log("Safely patched HTML with Model 3.");
    }
}

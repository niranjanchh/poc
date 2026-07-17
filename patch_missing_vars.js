const fs = require('fs');
let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');

const declarations = `
  const m3_maxFootprintW = document.getElementById('m3-maxFootprintW');
  const m3_maxFootprintD = document.getElementById('m3-maxFootprintD');
  const m3_maxHeight = document.getElementById('m3-maxHeight');
  const m3_sw = document.getElementById('m3-sw');
  const m3_sh = document.getElementById('m3-sh');
  const m3_pixelSize = document.getElementById('m3-pixelSize');
  const m3_pxw = document.getElementById('m3-pxw');
  const m3_pxh = document.getElementById('m3-pxh');
`;

// Insert the missing declarations right before the m3_patientEnvW declaration
if (appJs.includes('const m3_patientEnvW')) {
    appJs = appJs.replace('const m3_patientEnvW', declarations.trim() + '\n  const m3_patientEnvW');
    fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);
    console.log("Successfully added missing m3_ declarations.");
} else {
    console.log("Could not find m3_patientEnvW to inject before.");
}

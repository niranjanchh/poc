const fs = require('fs');
let html = fs.readFileSync('d:/projects/poc_rfq/geometry_optics_calculator.html', 'utf8');

const overlayTarget = `</button>\n                  <button id="step-btn-three"`;
const checkboxHtml = `</button>\n                  <label style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #475569; margin-top: 4px; cursor: pointer;">\n                    <input type="checkbox" id="g3d-extend-fov" onchange="if(typeof renderGantry3D === 'function') renderGantry3D()" />\n                    Extend FOV to Envelope Back\n                  </label>\n                  <button id="step-btn-three"`;

html = html.replace(overlayTarget, checkboxHtml);

fs.writeFileSync('d:/projects/poc_rfq/geometry_optics_calculator.html', html);
console.log("Added checkbox to HTML.");

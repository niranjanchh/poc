const fs = require('fs');

const prependCode = `
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

    // Trigger visualizer resize if necessary
    if (tabId === 'model2-tab') {
      if (typeof resizeGantry3D === 'function') setTimeout(resizeGantry3D, 100);
      if (typeof setupGantry3D === 'function' && !window.g3dInitialized) setupGantry3D();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    switchTab('rfq-tab'); // Default tab
    
    if (typeof setupGantry3D === 'function') {
        setupGantry3D();
    }
    if (typeof calculate === 'function') {
        calculate();
    }
    
    const sweepBtn = document.getElementById('trigger360Sweep');
    if (sweepBtn) {
        sweepBtn.addEventListener('click', () => {
            window.g3dIsSweeping = true;
            window.g3dSweepStart = Date.now();
        });
    }

    // Attach listener to inputs for live update
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (typeof calculate === 'function') calculate();
        });
        input.addEventListener('change', () => {
            if (typeof calculate === 'function') calculate();
        });
    });

    window.addEventListener('resize', () => {
        if (typeof resizeGantry3D === 'function') resizeGantry3D();
    });
});

`;

let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');
appJs = prependCode + appJs;
fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);
console.log('Appended switchTab and initialization logic.');

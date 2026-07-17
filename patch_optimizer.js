const fs = require('fs');
let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');

const targetRegex = /\/\/ Case A: Cover Envelope Width \(Maximize DoF\)[\s\S]*?cams_A = Math\.max\(1, cams_A\);/m;

const replacement = `// Case A: Maximize Pixel Density (Unconstrained Brute-Force Optimizer)
            const ap = parseFloat(document.getElementById(prefix + 'apBox') ? document.getElementById(prefix + 'apBox').value : 8.0) || 8.0;
            const cocMm = (parseFloat(document.getElementById(prefix + 'cocBox') ? document.getElementById(prefix + 'cocBox').value : 3.0) || 3.0) / 1000;
            const standardLenses = [24, 35, 50, 85, 105, 135];
            let bestDensity = 0;
            let best_fl_A = 35;
            let best_wd_A = 1000;
            let best_fovHM_A = 0;
            let best_cams_A = 1;
            
            standardLenses.forEach(fl => {
              for(let wd = 500; wd <= 2000; wd += 50) {
                if (wd <= fl) continue;
                const mag = fl / (wd - fl);
                const fovW = fmt.w / mag;
                const fovH = fmt.h / mag;
                const density = Math.min(pxW / fovW, pxH / fovH);
                const fovHM = fovH / 1000;
                const stepH = fovHM * (1 - ov);
                let cams = 1;
                if (patHeightM > fovHM) cams = Math.ceil((patHeightM - fovHM) / (stepH || 0.001)) + 1;
                
                const near = (wd * fl * fl) / (fl * fl + (ap * cocMm * (wd - fl)));
                const far = (wd * fl * fl) / (fl * fl - (ap * cocMm * (wd - fl)));
                const dof = (far < 0 || far > 99999) ? 9999 : (far - near);
                
                // Constraints: Max 10 vertical cams, Min 20mm DoF
                if (cams <= 10 && dof >= 20) {
                  if (density > bestDensity) {
                    bestDensity = density;
                    best_fl_A = fl;
                    best_wd_A = wd;
                    best_fovHM_A = fovHM;
                    best_cams_A = cams;
                  }
                }
              }
            });
            
            if (bestDensity === 0) {
              best_fl_A = 35;
              best_wd_A = 1000;
              const mag = best_fl_A / (best_wd_A - best_fl_A);
              bestDensity = Math.min(pxW / (fmt.w / mag), pxH / (fmt.h / mag));
              best_fovHM_A = (fmt.h / mag) / 1000;
              const step = best_fovHM_A * (1 - ov);
              best_cams_A = patHeightM > best_fovHM_A ? Math.ceil((patHeightM - best_fovHM_A) / (step || 0.001)) + 1 : 1;
            }
            
            const fl_A = best_fl_A;
            const wd_A = best_wd_A;
            const fovHM_A = best_fovHM_A;
            const density_A = bestDensity;
            const cams_A = best_cams_A;`;

if (appJs.match(targetRegex)) {
    appJs = appJs.replace(targetRegex, replacement);
    
    // Also change the badge label back to "Max Density" instead of "Cover Env."
    const rowRegex = /<td><span class="badge badge-pass" style="background:#0284c7; color:white;">Cover Env.<\/span><\/td>/g;
    appJs = appJs.replace(rowRegex, `<td><span class="badge badge-pass" style="background:#8b5cf6; color:white;">Max Density</span></td>`);
    
    fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);
    console.log("Patched Case A to Brute-Force Optimizer.");
} else {
    console.log("Regex failed to match Case A.");
}

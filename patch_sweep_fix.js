const fs = require('fs');
let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');

const regex = /\/\/ End Double Sweep[\s\S]*?const cams_B = Math\.max\(1, cams_B\);/m;

const replacement = `// End Double Sweep
            const fovW_A = fmt.w / (fl_A / (wd_A - fl_A));
            const fovW_B = fmt.w / (fl_B / (wd_B - fl_B));
            const fovH_A = fmt.h / (fl_A / (wd_A - fl_A));
            const fovH_B = fmt.h / (fl_B / (wd_B - fl_B));`;

if (appJs.match(regex)) {
    appJs = appJs.replace(regex, replacement);
    
    // Also patch the row rendering
    const htmlTarget = /<td style="font-weight: bold; color: #10b981;">Case B \(30 px\/mm\)<\/td>[\s\S]*?<\/tr>/m;
    const htmlReplacement = `<td style="font-weight: bold; color: #8b5cf6;">Max DoF (Env)</td>
            <td>\${r.flB}mm @ \${(r.wdB/10).toFixed(1)}cm</td>
            <td style="color: #8b5cf6; font-weight: bold;">\${r.denB.toFixed(1)}</td>
            <td>\${(r.fovWB/1000).toFixed(2)}m &times; \${(r.fovHB/1000).toFixed(2)}m</td>
            <td style="font-weight: bold;">\${r.camsB}</td>
            <td><button style="padding: 2px 6px; font-size: 10px; cursor: pointer;">View in 3D</button></td>
          </tr>`;
    
    appJs = appJs.replace(htmlTarget, htmlReplacement);
    
    fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);
    console.log("Patched Case B to Max DoF.");
} else {
    console.log("Regex failed.");
}

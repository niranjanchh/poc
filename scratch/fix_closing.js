const fs = require('fs');
let appJs = fs.readFileSync('d:/projects/poc_rfq/app.js', 'utf8');

appJs = appJs.replace(
  /render1DDensityGraph\(prefix, actualPxMm\);/g,
  "render1DDensityGraph(prefix, actualPxMm);\n    }\n  }"
);

fs.writeFileSync('d:/projects/poc_rfq/app.js', appJs);
console.log('Fixed closing braces for calculate()');

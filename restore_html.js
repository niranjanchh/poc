const fs = require('fs');
let html = fs.readFileSync('d:/projects/poc_rfq/geometry_optics_calculator.html', 'utf8');

const firstDoctype = html.indexOf('<!DOCTYPE html>');
const secondDoctype = html.indexOf('<!DOCTYPE html>', firstDoctype + 1);

if (secondDoctype !== -1) {
    // The original file starts at the second DOCTYPE
    const originalHtml = html.substring(secondDoctype);
    fs.writeFileSync('d:/projects/poc_rfq/geometry_optics_calculator.html', originalHtml);
    console.log("Restored original HTML!");
} else {
    console.log("Second DOCTYPE not found.");
}

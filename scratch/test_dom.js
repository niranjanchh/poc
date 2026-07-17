const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('geometry_optics_calculator.html', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => { console.error("JSDOM Error:", err); });
virtualConsole.on("warn", (warn) => { console.warn("JSDOM Warn:", warn); });
virtualConsole.on("info", (info) => { console.info("JSDOM Info:", info); });
virtualConsole.on("dir", (dir) => { console.dir("JSDOM Dir:", dir); });
virtualConsole.on("log", (log) => { console.log("JSDOM Log:", log); });
virtualConsole.on("jsdomError", (err) => { console.error("JSDOM jsdomError:", err); });

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  virtualConsole
});

// We need to mock Three.js a bit if it's not loaded, but the HTML loads it from CDN.
// Let's just execute app.js in this context
try {
  dom.window.eval(js);
  console.log("Parsed JS successfully.");
  // try to switch to model 2
  dom.window.switchTab('model2-tab');
  console.log("Switched tab to model 2.");
} catch (e) {
  console.error("Runtime error:", e);
}

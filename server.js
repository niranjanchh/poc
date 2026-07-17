const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const COMMENTS_FILE = path.join(__dirname, 'rfq_comments.js');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.fbx': 'application/octet-stream',
  '.obj': 'text/plain',
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle favicon to prevent 404 console warnings in browsers
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle auto-save POST endpoint
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const commentsObj = JSON.parse(body);
        const fileContent = `// Aurora DermaPod RFQ Comments Database\n// Edit this file directly in the codebase, or use the "Export Comments" button in the UI to download a new version.\nconst rfqSavedComments = ${JSON.stringify(commentsObj, null, 2)};\n`;
        
        fs.writeFile(COMMENTS_FILE, fileContent, 'utf8', (err) => {
          if (err) {
            console.error('Error writing file:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          } else {
            console.log('Successfully auto-saved comments to rfq_comments.js');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          }
        });
      } catch (err) {
        console.error('Error parsing JSON:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Serve static files for GET requests
  if (req.method === 'GET') {
    // Default to index.html or geometry_optics_calculator.html if root request
    let reqUrl = req.url.split('?')[0]; // Strip query parameters
    let reqPath = reqUrl === '/' ? '/geometry_optics_calculator.html' : reqUrl;
    // Decode URI component (handles spaces in file paths)
    reqPath = decodeURIComponent(reqPath);
    
    // Prevent directory traversal attacks
    const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      const stream = fs.createReadStream(filePath);
      stream.on('error', (streamErr) => {
        console.error('Stream error:', streamErr);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      });
      stream.pipe(res);
    });
    return;
  }

  res.writeHead(405);
  res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  console.log(`DermaPod local server listening on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/geometry_optics_calculator.html to view the app with full CORS compatibility!`);
});

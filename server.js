const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT, 10) || 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function requestHandler(req, res) {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const notFoundPath = path.join(__dirname, '404.html');
      fs.readFile(notFoundPath, (err404, data404) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(err404 ? '<h1>404 Not Found</h1>' : data404);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

function start(port) {
  const server = http.createServer(requestHandler);
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      start(port + 1);
    } else {
      console.error(err);
    }
  });

  server.listen(port, () => {
    console.log(`Expense Tracker running on http://localhost:${port}`);
  });
}

start(PORT);

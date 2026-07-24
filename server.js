const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(rootDir, pathname);
  const ext = path.extname(filePath).toLowerCase();

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.readFile(indexPath, (indexErr, content) => {
        if (indexErr) {
          sendErrorPage(res, 404);
          return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes['.html'] || 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        sendErrorPage(res, 404);
        return;
      }

      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
    });
  });
});

function sendErrorPage(res, statusCode) {
  if (statusCode === 404) {
    fs.readFile(path.join(rootDir, 'error.html'), (error, errorContent) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(errorContent);
      }
    });
    return;
  }

  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Error');
}

server.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});

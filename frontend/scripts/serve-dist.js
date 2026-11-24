/**
 * Minimalny serwer statyczny dla testów E2E (bez dodatkowych zależności).
 * Serwuje `dist/` i obsługuje fallback SPA (każda trasa → index.html).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden');

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // Fallback SPA — tylko dla żądań „nawigacyjnych”, nie dla plików z rozszerzeniem.
    if (path.extname(safePath)) return send(res, 404, 'Not found');
    filePath = path.join(ROOT, 'index.html');
    if (!fs.existsSync(filePath)) return send(res, 500, 'Brak builda: uruchom npm run build');
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`E2E static server: http://127.0.0.1:${PORT}`);
});

#!/usr/bin/env node

/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Serves the production build for the mocked Playwright suite.
 *
 * Mocked specs stub every Fineract call in the browser, so no backend is
 * running. Any `/fineract-provider` request that still reaches this server
 * escaped a spec's mocks: it gets a 502 and is logged to stderr, which
 * Playwright prints, so a spec that leans on a real backend shows up.
 *
 * Usage: node scripts/serve-e2e-static.js
 *   E2E_STATIC_ROOT  build folder (default dist/web-app/browser)
 *   E2E_STATIC_PORT  port (default 4200)
 */

const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(process.env.E2E_STATIC_ROOT || 'dist/web-app/browser');
const port = Number(process.env.E2E_STATIC_PORT || 4200);
const indexFile = path.join(root, 'index.html');

const MIME_TYPES = {
  '.css': 'text/css',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.mjs': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

if (!fs.existsSync(indexFile)) {
  console.error(`[serve-e2e-static] ${indexFile} not found. Build the app first (npm run build).`);
  process.exit(1);
}

function send(res, status, file) {
  res.writeHead(status, { 'Content-Type': MIME_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

    if (pathname.startsWith('/fineract-provider')) {
      console.error(`[serve-e2e-static] unmocked backend request: ${req.method} ${req.url}`);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ developerMessage: 'No backend in the mocked E2E suite' }));
      return;
    }

    const file = path.join(root, pathname);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }

    fs.stat(file, (error, stats) => {
      if (!error && stats.isFile()) {
        send(res, 200, file);
      } else if (path.extname(pathname)) {
        res.writeHead(404).end();
      } else {
        send(res, 200, indexFile);
      }
    });
  })
  .listen(port, () => console.log(`[serve-e2e-static] serving ${root} on http://localhost:${port}`));

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

const FINERACT_API_URL = process.env.FINERACT_API_URL || 'https://demo.mifos.community';
const PORT = process.env.E2E_PORT || 4200;
const DIST_DIR = path.resolve(__dirname, '..', 'dist', 'web-app', 'browser');

if (!fs.existsSync(DIST_DIR)) {
  console.error(`Build directory not found: ${DIST_DIR}`);
  console.error('Run "npm run build" before starting the E2E server.');
  process.exit(1);
}

const app = express();

// Proxy /fineract-provider/* to the Fineract backend
app.use(
  '/fineract-provider',
  createProxyMiddleware({
    target: FINERACT_API_URL,
    changeOrigin: true,
    secure: true,
    logger: console
  })
);

// Serve static files from the Angular build
app.use(express.static(DIST_DIR));

// SPA fallback: serve index.html for all non-file routes (Angular hash routing)
app.get('{*path}', (_req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`E2E server listening on http://localhost:${PORT}`);
  console.log(`Proxying /fineract-provider/* → ${FINERACT_API_URL}`);
});

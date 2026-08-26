/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const fs = require('fs');

const sourcePath = 'src/assets/env.template.js';
const outputPath = 'dist/web-app/browser/assets/env.js';
const blockedBrowserVariables = new Set(['EXTERNAL_NATIONAL_ID_SYSTEM_API_KEY', 'MIFOS_REMITTANCE_API_CLIENT_KEY']);

if (!process.env.FINERACT_API_URL && !process.env.FINERACT_API_URLS) {
  console.error('Amplify deployment requires FINERACT_API_URL or FINERACT_API_URLS.');
  process.exit(1);
}

const resolveValue = (name) => {
  if (blockedBrowserVariables.has(name)) {
    return '';
  }
  return process.env[name] ?? '';
};

const source = fs.readFileSync(sourcePath, 'utf8');
const rendered = source
  .replace(/(['"])\$([A-Z0-9_]+)\1/g, (_match, _quote, name) => JSON.stringify(resolveValue(name)))
  .replace(/\$([A-Z0-9_]+)/g, (_match, name) => resolveValue(name));

fs.writeFileSync(outputPath, rendered);

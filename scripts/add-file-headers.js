#!/usr/bin/env node

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const fs = require('fs');
const path = require('path');

// Headers to add based on file type
const HEADERS = {
  code: `/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

`,
  html: `<!--
  Copyright since 2025 Mifos Initiative

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

`
};

// File extensions
const FILE_EXTENSIONS = {
  code: [
    '.ts',
    '.js',
    '.scss',
    '.css'
  ],
  html: ['.html']
};

const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'coverage',
  '.angular',
  'e2e',
  'cypress',
  'playwright',
  '.husky',
  'setup-jest.ts',
  'jest.config.ts',
  'cypress.config.ts',
  'playwright.config.ts',
  'tailwind.config.js',
  'proxy.conf.js',
  'proxy.localhost.conf.js',
  'version.js',
  'environment.ts',
  'environment.prod.ts',
  'polyfills.ts',
  'typings.d.ts',
  'global.d.ts',
  '.spec.ts',
  '.spec.js',
  'tsconfig'
];

function shouldExclude(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return EXCLUDE_PATTERNS.some((pattern) => {
    if (pattern.startsWith('.') && pattern.lastIndexOf('.') > 0) {
      return normalizedPath.endsWith(pattern);
    }
    return normalizedPath.includes(pattern);
  });
}

function getHeaderType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (FILE_EXTENSIONS.html.includes(ext)) {
    return 'html';
  }

  if (FILE_EXTENSIONS.code.includes(ext)) {
    return 'code';
  }

  return null;
}

/**
 * Check if file already has a header
 */
function hasHeader(content, headerType) {
  if (headerType === 'code') {
    return content.includes('Copyright since 2025 Mifos Initiative') && content.includes('Mozilla Public License');
  }

  if (headerType === 'html') {
    return content.includes('Copyright since 2025 Mifos Initiative') && content.includes('Mozilla Public License');
  }

  return false;
}

/**
 * Add header to a file
 */
function addHeaderToFile(filePath, dryRun = false) {
  // Skip excluded files
  if (shouldExclude(filePath)) {
    console.log(`⏭️  Skipping ${filePath} (excluded)`);
    return false;
  }

  const headerType = getHeaderType(filePath);

  if (!headerType) {
    console.log(`⏭️  Skipping ${filePath} (unsupported file type)`);
    return false;
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading ${filePath}: ${error.message}`);
    return false;
  }

  // Skip if file already has a header
  if (hasHeader(content, headerType)) {
    console.log(`✓  ${filePath} (already has header)`);
    return false;
  }

  // Skip empty files
  if (content.trim().length === 0) {
    console.log(`⏭️  Skipping ${filePath} (empty file)`);
    return false;
  }

  const header = HEADERS[headerType];
  const newContent = header + content;

  if (dryRun) {
    console.log(`🔍 Would add header to: ${filePath}`);
    return true;
  }

  try {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Added header to: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  // Parse flags
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const files = args.filter((arg) => !arg.startsWith('--') && !arg.startsWith('-'));

  if (files.length === 0) {
    console.log('Usage: node add-file-headers.js [options] <file1> <file2> ...');
    console.log('\nOptions:');
    console.log('  --dry-run, -d    Show what would be done without making changes');
    console.log('\nExample:');
    console.log('  node add-file-headers.js --dry-run src/app/app.component.ts');
    console.log('  node add-file-headers.js src/app/**/*.ts');
    process.exit(0);
  }

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  let modifiedCount = 0;
  let skippedCount = 0;

  files.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      skippedCount++;
      return;
    }

    const modified = addHeaderToFile(filePath, dryRun);
    if (modified) {
      modifiedCount++;
    } else {
      skippedCount++;
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`Summary: ${modifiedCount} file(s) ${dryRun ? 'would be' : ''} modified, ${skippedCount} skipped`);

  if (dryRun && modifiedCount > 0) {
    console.log('\n💡 Run without --dry-run to apply changes');
  }
}

main();

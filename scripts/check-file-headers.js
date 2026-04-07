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

// Expected header patterns for different file types
const HEADERS = {
  mpl: [
    '/**',
    ' * Copyright since 2025 Mifos Initiative',
    ' *',
    ' * This Source Code Form is subject to the terms of the Mozilla Public',
    ' * License, v. 2.0. If a copy of the MPL was not distributed with this',
    ' * file, You can obtain one at http://mozilla.org/MPL/2.0/.',
    ' */'
  ],
  html: [
    '<!--',
    '  Copyright since 2025 Mifos Initiative',
    '',
    '  This Source Code Form is subject to the terms of the Mozilla Public',
    '  License, v. 2.0. If a copy of the MPL was not distributed with this',
    '  file, You can obtain one at http://mozilla.org/MPL/2.0/.',
    '-->'
  ]
};

// File extensions that should have headers
const FILE_EXTENSIONS = {
  code: [
    '.ts',
    '.js',
    '.scss',
    '.css'
  ],
  html: ['.html']
};

// Files/patterns to exclude from header checks
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

/**
 * Check if a file should be excluded from header validation
 */
function shouldExclude(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return EXCLUDE_PATTERNS.some((pattern) => {
    if (pattern.startsWith('.') && pattern.lastIndexOf('.') > 0) {
      return normalizedPath.endsWith(pattern);
    }

    return normalizedPath.includes(pattern);
  });
}

/**
 * Get the expected header for a file based on its extension
 */
function getExpectedHeader(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (FILE_EXTENSIONS.html.includes(ext)) {
    return HEADERS.html;
  }

  if (FILE_EXTENSIONS.code.includes(ext)) {
    return HEADERS.mpl;
  }

  return null;
}

/**
 * Normalize whitespace for comparison
 */
function normalizeWhitespace(str) {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Check if file has the correct header
 */
function hasValidHeader(filePath) {
  if (shouldExclude(filePath)) {
    return true; // Skip excluded files
  }

  const expectedHeader = getExpectedHeader(filePath);
  if (!expectedHeader) {
    return true; // Skip files without defined header requirements
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return false;
  }

  // Handle empty files
  if (content.trim().length === 0) {
    return true; // Allow empty files
  }

  const lines = content.split(/\r?\n/);
  const headerLineCount = expectedHeader.length;

  let startLine = 0;
  if (lines[0] && lines[0].startsWith('#!')) {
    startLine = 1;
    if (lines[1] !== undefined && lines[1].trim() === '') {
      startLine = 2;
    }
  }

  // Check if file has enough lines
  if (lines.length < startLine + headerLineCount) {
    return false;
  }

  // Compare header lines
  for (let i = 0; i < headerLineCount; i++) {
    const actualLine = normalizeWhitespace(lines[startLine + i]);
    const expectedLine = normalizeWhitespace(expectedHeader[i]);

    if (actualLine !== expectedLine) {
      return false;
    }
  }

  return true;
}

/**
 * Format the expected header for display
 */
function formatExpectedHeader(header) {
  return '\n' + header.join('\n') + '\n';
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node check-file-headers.js <file1> <file2> ...');
    process.exit(1);
  }

  const filesWithoutHeaders = [];

  args.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }

    if (!hasValidHeader(filePath)) {
      filesWithoutHeaders.push(filePath);
    }
  });

  if (filesWithoutHeaders.length > 0) {
    console.error('\n❌ Header validation failed!\n');
    console.error('The following files are missing the required MPL-2.0 license header:\n');

    filesWithoutHeaders.forEach((file) => {
      console.error(`  - ${file}`);
      const expectedHeader = getExpectedHeader(file);
      if (expectedHeader) {
        console.error(`\n    Expected header:${formatExpectedHeader(expectedHeader)}`);
      }
    });

    console.error('\n💡 Please add the MPL-2.0 license header to these files.');
    console.error('   Refer to existing files for the correct format.\n');

    process.exit(1);
  }

  console.log('✅ All files have valid headers');
  process.exit(0);
}

main();

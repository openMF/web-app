/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// eslint.config.js
const angularEslintPlugin = require('@angular-eslint/eslint-plugin');
const angularEslintTemplatePlugin = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const mifosxPlaywrightPlugin = require('./eslint-rules');

module.exports = [
  {
    ignores: [
      'projects/**/*',
      'dist/**/*',
      '.angular/**/*',
      'node_modules/**/*',
      'playwright-report/**/*',
      'test-results/**/*'
    ]
  },

  // TS files configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [
          'tsconfig.json',
          'tsconfig.playwright.json'
        ],
        createDefaultProgram: true
      }
    },
    plugins: {
      '@angular-eslint': angularEslintPlugin,
      '@angular-eslint/template': angularEslintTemplatePlugin,
      '@typescript-eslint': tseslint
    },
    rules: {
      // Angular recommended rules
      ...angularEslintPlugin.configs.recommended.rules,

      // Angular template inline rules
      ...angularEslintTemplatePlugin.configs['process-inline-templates'].rules,

      // Component selector rules
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'mifosx',
          style: 'kebab-case',
          type: 'element'
        }
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'mifosx',
          style: 'camelCase',
          type: 'attribute'
        }
      ]
    }
  },

  // Playwright E2E suite — custom architectural rules.
  // Scoped narrowly to playwright/**/*.ts so the rules do not run
  // against Angular app code.
  {
    files: ['playwright/**/*.ts'],
    plugins: {
      'mifosx-playwright': mifosxPlaywrightPlugin
    },
    rules: {
      'mifosx-playwright/no-direct-login-goto': 'error',
      'mifosx-playwright/no-bare-wait-for-timeout': 'error'
    }
  },

  // HTML files configuration
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser
    },
    plugins: {
      '@angular-eslint': angularEslintPlugin,
      '@angular-eslint/template': angularEslintTemplatePlugin
    },
    rules: {
      // Angular template recommended rules
      ...angularEslintTemplatePlugin.configs.recommended.rules
    }
  }
];

// eslint.config.js
const angularEslintPlugin = require('@angular-eslint/eslint-plugin');
const angularEslintTemplatePlugin = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    ignores: ['projects/**/*']
  },

  // TS files configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [
          'tsconfig.json',
          'e2e/tsconfig.json'
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

  // HTML files configurationNN

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

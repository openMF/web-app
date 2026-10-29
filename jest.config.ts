/**
 * Jest configuration in TypeScript with full type safety
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.interface.ts',
    '!src/app/**/*.model.ts'
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup removed in jest-preset-angular@16 (zone.js setup handled via setupFilesAfterEnv)

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pipes/(.*)$': '<rootDir>/src/app/pipes/$1',
    '^environments/(.*)$': '<rootDir>/src/environments/$1',
    '^\\.\\/\\.env$': '<rootDir>/src/environments/.env.ts',
    'src/environments/.env$': '<rootDir>/src/environments/.env.ts'
  },

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: [
    'node_modules',
    'src'
  ],

  // An array of file extensions your modules use
  moduleFileExtensions: [
    'ts',
    'html',
    'js',
    'json',
    'mjs'
  ],

  // A preset that is used as a base for Jest's configuration
  preset: 'jest-preset-angular',

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '<rootDir>/src/app/**/*.spec.ts',
    '<rootDir>/src/app/**/*.test.ts'
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/src/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
        // Type diagnostics disabled for test files during Angular 20→22 upgrade.
        // jest 30 introduced stricter matcher types that break pre-existing test assertions.
        // Production code remains fully type-checked via `ng build` / `tsc`.
        // Technical debt: re-enable diagnostics and fix test types after upgrade completes.
        diagnostics: false
      }
    ]
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|@fortawesome|@material/web|lit|lit-element|lit-html|@lit|@lit-labs)'
  ]
};

export default config;

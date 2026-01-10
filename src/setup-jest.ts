/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Global test setup
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => ''
  })
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock CSS.supports
Object.defineProperty(window, 'CSS', {
  value: {
    supports: jest.fn().mockReturnValue(false)
  }
});

// Mock window.env for environment configuration
Object.defineProperty(window, 'env', {
  value: {
    oidcServerEnabled: false,
    oidcBaseUrl: '',
    oidcClientId: '',
    oidcApiUrl: '',
    apiUrl: 'http://localhost:8080',
    tenantIdentifier: 'default'
  },
  writable: true
});

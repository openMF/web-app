import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

// Add Jasmine matchers to Jest
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeTrue(): R;
      toBeFalse(): R;
      toBeNull(): R;
      toBeUndefined(): R;
      toBeDefined(): R;
    }
  }
}

// Extend expect with Jasmine matchers
expect.extend({
  toBeTruthy(received) {
    const pass = !!received;
    return {
      pass,
      message: () => `expected ${received} to be truthy`
    };
  },
  toBeFalsy(received) {
    const pass = !received;
    return {
      pass,
      message: () => `expected ${received} to be falsy`
    };
  },
  toBeTrue(received) {
    const pass = received === true;
    return {
      pass,
      message: () => `expected ${received} to be true`
    };
  },
  toBeFalse(received) {
    const pass = received === false;
    return {
      pass,
      message: () => `expected ${received} to be false`
    };
  },
  toBeNull(received) {
    const pass = received === null;
    return {
      pass,
      message: () => `expected ${received} to be null`
    };
  },
  toBeUndefined(received) {
    const pass = received === undefined;
    return {
      pass,
      message: () => `expected ${received} to be undefined`
    };
  },
  toBeDefined(received) {
    const pass = received !== undefined;
    return {
      pass,
      message: () => `expected ${received} to be defined`
    };
  }
});

// Mock the STANDALONE_SHARED_IMPORTS
jest.mock('app/standalone-shared.module', () => ({
  STANDALONE_SHARED_IMPORTS: []
}));

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});

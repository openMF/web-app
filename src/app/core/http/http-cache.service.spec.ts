/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpCacheService } from './http-cache.service';

describe('HttpCacheService', () => {
  let service: HttpCacheService;
  let localStore: { [key: string]: string } = {};
  let sessionStore: { [key: string]: string } = {};

  beforeEach(() => {
    localStore = {};
    sessionStore = {};

    const localMock = {
      getItem: jest.fn((key: string) => localStore[key] ?? null),
      setItem: jest.fn((key: string, val: string) => {
        localStore[key] = val;
      }),
      removeItem: jest.fn((key: string) => {
        delete localStore[key];
      }),
      clear: jest.fn(() => {
        localStore = {};
      }),
      length: 0,
      key: jest.fn()
    };

    const sessionMock = {
      getItem: jest.fn((key: string) => sessionStore[key] ?? null),
      setItem: jest.fn((key: string, val: string) => {
        sessionStore[key] = val;
      }),
      removeItem: jest.fn((key: string) => {
        delete sessionStore[key];
      }),
      clear: jest.fn(() => {
        sessionStore = {};
      }),
      length: 0,
      key: jest.fn()
    };

    Object.defineProperty(window, 'localStorage', {
      value: localMock,
      configurable: true
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: sessionMock,
      configurable: true
    });

    service = new HttpCacheService();
  });

  afterEach(() => {
    localStore = {};
    sessionStore = {};
  });

  it('sets and gets cache data in memory', () => {
    const url = '/api/v1/clients';
    const response = new HttpResponse({ body: [{ id: 1, name: 'Client 1' }] });

    service.setCacheData(url, response);

    expect(service.getCacheData(url)).toBe(response);
    expect(service.getHttpCacheEntry(url)?.data).toBe(response);
  });

  it('returns null for uncached URL', () => {
    expect(service.getCacheData('/api/v1/unknown')).toBeNull();
    expect(service.getHttpCacheEntry('/api/v1/unknown')).toBeNull();
  });

  it('clears cache for a specific URL', () => {
    const url = '/api/v1/offices';
    service.setCacheData(url, new HttpResponse({ body: [] }));
    expect(service.getCacheData(url)).not.toBeNull();

    service.clearCache(url);
    expect(service.getCacheData(url)).toBeNull();
  });

  it('clears all cache when cleanCache is called without arguments', () => {
    service.setCacheData('/api/v1/a', new HttpResponse({ body: 'a' }));
    service.setCacheData('/api/v1/b', new HttpResponse({ body: 'b' }));

    service.cleanCache();

    expect(service.getCacheData('/api/v1/a')).toBeNull();
    expect(service.getCacheData('/api/v1/b')).toBeNull();
  });

  it('evicts entries older than expirationDate in memory', () => {
    const pastDate = new Date(Date.now() - 60000);
    const futureDate = new Date(Date.now() + 60000);

    service.setCacheData('/api/v1/old', new HttpResponse({ body: 'old' }), pastDate);
    service.setCacheData('/api/v1/new', new HttpResponse({ body: 'new' }), futureDate);

    service.cleanCache(new Date());

    expect(service.getCacheData('/api/v1/old')).toBeNull();
    expect(service.getCacheData('/api/v1/new')).not.toBeNull();
  });

  it('evicts persisted entries older than expirationDate even after serialization', () => {
    service.setPersistence('local');

    const pastDate = new Date(Date.now() - 60000);
    const futureDate = new Date(Date.now() + 60000);

    service.setCacheData('/api/v1/old', new HttpResponse({ body: 'old' }), pastDate);
    service.setCacheData('/api/v1/new', new HttpResponse({ body: 'new' }), futureDate);

    // Re-instantiate service to simulate page reload from localStorage
    const reloadedService = new HttpCacheService();
    reloadedService.setPersistence('local');

    reloadedService.cleanCache(new Date());

    expect(reloadedService.getCacheData('/api/v1/old')).toBeNull();
    expect(reloadedService.getCacheData('/api/v1/new')).not.toBeNull();
  });

  it('preserves HttpHeaders and methods when restored from persistent storage', () => {
    service.setPersistence('local');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Total-Count': '42'
    });
    const originalResponse = new HttpResponse({
      body: { total: 42 },
      headers,
      status: 200,
      statusText: 'OK',
      url: '/api/v1/loans'
    });

    service.setCacheData('/api/v1/loans', originalResponse);

    // Reload from storage
    const reloadedService = new HttpCacheService();
    reloadedService.setPersistence('local');

    const cached = reloadedService.getCacheData('/api/v1/loans');
    expect(cached).toBeInstanceOf(HttpResponse);
    expect(cached?.body).toEqual({ total: 42 });
    expect(cached?.headers).toBeInstanceOf(HttpHeaders);
    expect(cached?.headers.get('Content-Type')).toBe('application/json');
    expect(cached?.headers.get('X-Total-Count')).toBe('42');
  });

  it('clears previous storage when switching persistence', () => {
    service.setPersistence('local');
    service.setCacheData('/api/v1/test', new HttpResponse({ body: 'local-val' }));
    expect(localStore['mifosXHttpCache']).not.toBeNull();

    service.setPersistence('session');
    expect(localStore['mifosXHttpCache']).toBeUndefined();
  });

  it('handles corrupted JSON in storage gracefully', () => {
    localStore['mifosXHttpCache'] = '{ invalid json ...';

    const corruptedService = new HttpCacheService();
    expect(() => corruptedService.setPersistence('local')).not.toThrow();
    expect(corruptedService.getCacheData('/any')).toBeNull();
  });

  it('skips invalid or malformed cache entries in storage', () => {
    localStore['mifosXHttpCache'] = JSON.stringify({
      '/api/v1/invalid-boolean': false,
      '/api/v1/invalid-null': null,
      '/api/v1/missing-data': { lastUpdated: new Date() },
      '/api/v1/invalid-date': { lastUpdated: 'not-a-date', data: { body: 'ok' } },
      '/api/v1/legacy': {
        lastUpdated: new Date(),
        data: {
          body: { legacy: true },
          headers: { normalizedNames: {}, lazyUpdate: null },
          status: 200,
          statusText: 'OK'
        }
      },
      '/api/v1/valid': {
        lastUpdated: new Date(),
        data: { body: 'valid', status: 200 }
      }
    });

    const reloadedService = new HttpCacheService();
    reloadedService.setPersistence('local');

    expect(reloadedService.getCacheData('/api/v1/invalid-boolean')).toBeNull();
    expect(reloadedService.getCacheData('/api/v1/invalid-null')).toBeNull();
    expect(reloadedService.getCacheData('/api/v1/missing-data')).toBeNull();
    expect(reloadedService.getCacheData('/api/v1/invalid-date')).toBeNull();
    expect(reloadedService.getCacheData('/api/v1/legacy')).toBeNull();
    expect(reloadedService.getCacheData('/api/v1/valid')?.body).toBe('valid');
  });

  it('catches and ignores storage write errors gracefully during saveCacheData', () => {
    service.setPersistence('local');
    (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const response = new HttpResponse({ body: 'test' });
    expect(() => service.setCacheData('/api/v1/quota', response)).not.toThrow();
    expect(service.getCacheData('/api/v1/quota')).toBe(response);
  });
});

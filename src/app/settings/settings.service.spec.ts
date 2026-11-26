/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { environment } from '../../environments/environment';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockAlertService: any;
  let mockDates: any;
  let originalBaseApiUrl: string;
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map<string, string>();
    jest.spyOn(localStorage, 'getItem').mockImplementation((key) => store.get(key) ?? null);
    jest.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
      store.set(key, String(value));
    });
    jest.spyOn(localStorage, 'removeItem').mockImplementation((key) => {
      store.delete(key);
    });
    jest.spyOn(localStorage, 'clear').mockImplementation(() => {
      store.clear();
    });

    originalBaseApiUrl = environment.baseApiUrl;

    mockAlertService = {
      alert: jest.fn()
    };
    mockDates = {
      convertToDate: jest.fn(),
      parseDate: jest.fn(),
      formatDate: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        { provide: AlertService, useValue: mockAlertService },
        { provide: Dates, useValue: mockDates }
      ]
    });

    service = TestBed.inject(SettingsService);
  });

  afterEach(() => {
    environment.baseApiUrl = originalBaseApiUrl;
    jest.restoreAllMocks();
  });

  describe('servers and server resolution', () => {
    it('returns empty array when mifosXServers is unset or malformed in localStorage', () => {
      expect(service.servers).toEqual([]);
      store.set('mifosXServers', '{invalid-json');
      expect(service.servers).toEqual([]);
    });

    it('returns parsed list of servers when mifosXServers is set', () => {
      const serverList = [
        'https://server1.example.org',
        'https://server2.example.org'
      ];
      service.setServers(serverList);
      expect(service.servers).toEqual(serverList);
    });

    it('returns server from localStorage when mifosXServerURL is set', () => {
      service.setServer('https://custom-server.example.org');
      expect(service.server).toBe('https://custom-server.example.org');
    });

    it('falls back to environment.baseApiUrl when localStorage server is not set', () => {
      environment.baseApiUrl = 'https://env-server.example.org';
      expect(service.server).toBe('https://env-server.example.org');
    });

    it('falls back to first configured server when localStorage and baseApiUrl are unset', () => {
      environment.baseApiUrl = '';
      service.setServers(['https://fallback.example.org']);
      expect(service.server).toBe('https://fallback.example.org');
    });

    it('returns empty string when no server, no baseApiUrl, and no default servers exist', () => {
      environment.baseApiUrl = '';
      expect(service.server).toBe('');
    });

    it('builds baseServerUrl and serverUrl using resolved server', () => {
      service.setServer('https://api.example.org');
      expect(service.baseServerUrl).toBe(`https://api.example.org${environment.apiProvider}`);
      expect(service.serverUrl).toBe(`https://api.example.org${environment.apiProvider}${environment.apiVersion}`);
      expect(service.serverHost).toBe('https://api.example.org');
    });
  });

  describe('date and datetime formats', () => {
    it('returns user date format from localStorage when set', () => {
      service.setDateFormat('yyyy/MM/dd');
      expect(service.dateFormat).toBe('yyyy/MM/dd');
    });

    it('falls back to environment or default format when unset', () => {
      const expected = environment.defaultFormatDate || 'dd MMMM yyyy';
      expect(service.dateFormat).toBe(expected);
    });

    it('returns user datetime format from localStorage when set', () => {
      service.setDatetimeFormat('yyyy-MM-dd HH:mm');
      expect(service.datetimeFormat).toBe('yyyy-MM-dd HH:mm');
    });

    it('falls back to default datetime format when unset', () => {
      const expected = environment.defaultFormatDatetime || 'dd MMMM yyyy HH:mm:ss';
      expect(service.datetimeFormat).toBe(expected);
    });
  });

  describe('language settings', () => {
    it('initializes and returns default language when unset', () => {
      const lang = service.language;
      expect(lang).toBeDefined();
      expect(lang.code).toBe('en');
    });

    it('returns custom language when set', () => {
      service.setLanguage({ name: 'fr-FR', code: 'fr' });
      expect(service.language).toEqual({ name: 'fr-FR', code: 'fr' });
    });

    it('computes languageCode for es, en, and other languages', () => {
      service.setLanguage({ name: 'es-ES', code: 'es' });
      expect(service.languageCode).toBe('es-MX');

      service.setLanguage({ name: 'en-US', code: 'en' });
      expect(service.languageCode).toBe('en-US');

      service.setLanguage({ name: 'fr-FR', code: 'fr' });
      expect(service.languageCode).toBe('fr-FR');
    });
  });

  describe('decimals setting', () => {
    it('defaults to 2 when unset', () => {
      expect(service.decimals).toBe('2');
    });

    it('returns custom decimals when set', () => {
      service.setDecimalToDisplay('4');
      expect(service.decimals).toBe('4');
    });
  });

  describe('tenant settings', () => {
    it('stores and retrieves single tenant identifier', () => {
      service.setTenantIdentifier('default');
      expect(service.tenantIdentifier).toBe('default');
    });

    it('returns configured tenant identifiers when unset or set', () => {
      expect(service.tenantIdentifiers).toEqual([]);
      service.setTenantIdentifiers([
        'tenant1',
        'tenant2'
      ]);
      expect(service.tenantIdentifiers).toEqual([
        'tenant1',
        'tenant2'
      ]);
    });
  });

  describe('business date status validation', () => {
    it('returns true when business date config is enabled', () => {
      const configs = [{ name: SettingsService.businessDateConfigName, enabled: true }];
      expect(service.validateBusinessDateStatus(configs)).toBe(true);
    });

    it('returns false when business date config is disabled', () => {
      const configs = [{ name: SettingsService.businessDateConfigName, enabled: false }];
      expect(service.validateBusinessDateStatus(configs)).toBe(false);
    });

    it('returns false when business date config is not present', () => {
      const configs = [{ name: 'other-config', enabled: true }];
      expect(service.validateBusinessDateStatus(configs)).toBe(false);
    });

    it('handles null or empty configurations safely', () => {
      expect(service.validateBusinessDateStatus(null as any)).toBe(false);
      expect(service.validateBusinessDateStatus([])).toBe(false);
    });
  });

  describe('theme dark mode', () => {
    it('sets and gets dark theme enabled state', () => {
      service.setThemeDarkEnabled(true);
      expect(service.themeDarkEnabled).toBe(true);
      service.setThemeDarkEnabled(false);
      expect(service.themeDarkEnabled).toBe(false);
    });
  });
});

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { SettingsService } from 'app/settings/settings.service';
import { MassRejectionAttemptsService } from './mass-rejection-attempts.service';

describe('MassRejectionAttemptsService', () => {
  let settings: any;
  beforeEach(() => {
    settings = { serverUrl: 'https://synthetic.invalid', tenantIdentifier: 'test' };
    const storage = new Map<string, string>();
    (localStorage.getItem as jest.Mock).mockImplementation((key) => storage.get(key) ?? null);
    (localStorage.setItem as jest.Mock).mockImplementation((key, value) => storage.set(key, value));
    (localStorage.removeItem as jest.Mock).mockImplementation((key) => storage.delete(key));
    TestBed.configureTestingModule({ providers: [{ provide: SettingsService, useValue: settings }] });
  });
  it('keeps uncertain locks across service recreation and isolates server, tenant and product IDs', () => {
    const first = TestBed.inject(MassRejectionAttemptsService);
    expect(first.lock(42, false)).toBe(true);
    const recreated = TestBed.runInInjectionContext(() => new MassRejectionAttemptsService());
    expect(recreated.locked('42', false)).toBe(true);
    expect(recreated.lock(42, false)).toBe(false);
    expect(recreated.locked(42, true)).toBe(false);
    settings.tenantIdentifier = 'another';
    expect(recreated.locked(42, false)).toBe(false);
    settings.tenantIdentifier = 'test';
    settings.serverUrl = 'https://other.invalid';
    expect(recreated.locked(42, false)).toBe(false);
    settings.serverUrl = 'https://synthetic.invalid';
    recreated.unlock(42, false);
    expect(recreated.locked(42, false)).toBe(false);
  });
  it('fails closed when storage is unavailable or refuses a lock', () => {
    const service = TestBed.inject(MassRejectionAttemptsService);
    (localStorage.getItem as jest.Mock).mockImplementation(() => {
      throw new Error('unavailable');
    });
    expect(service.locked(42, false)).toBe(true);
    expect(service.lock(42, false)).toBe(false);
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    (localStorage.setItem as jest.Mock).mockImplementation(() => {
      throw new Error('quota');
    });
    expect(service.lock(42, false)).toBe(false);
  });
});

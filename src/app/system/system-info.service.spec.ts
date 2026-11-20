/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemInfoService } from './system-info.service';
import { VersionService } from './version.service';

describe('SystemInfoService', () => {
  let service: SystemInfoService;
  let settings: { server: string };
  let getBackendInfo: jest.Mock;

  const version = (): string | undefined => {
    let raw: string | undefined;
    service.getFineractVersion().subscribe((fineract) => (raw = fineract.raw));
    return raw;
  };

  beforeEach(() => {
    settings = { server: 'https://one.example.org' };
    getBackendInfo = jest.fn(() => of({ git: { build: { version: `${settings.server}-version` } } }));
    TestBed.configureTestingModule({
      providers: [
        { provide: VersionService, useValue: { getBackendInfo } },
        { provide: SettingsService, useValue: settings },
        { provide: AuthenticationService, useValue: { getCredentials: (): null => null } }
      ]
    });
    service = TestBed.inject(SystemInfoService);
  });

  it('reads the Fineract version once per server', () => {
    expect(version()).toBe('https://one.example.org-version');
    expect(version()).toBe('https://one.example.org-version');

    expect(getBackendInfo).toHaveBeenCalledTimes(1);
  });

  it('reads the version again after another server is selected', () => {
    version();

    settings.server = 'https://two.example.org';

    expect(version()).toBe('https://two.example.org-version');
    expect(getBackendInfo).toHaveBeenCalledTimes(2);
  });

  it('reads the version again after a failed read', () => {
    getBackendInfo.mockReturnValueOnce(throwError(() => new Error('500')));
    expect(version()).toBe('');

    expect(version()).toBe('https://one.example.org-version');
    expect(getBackendInfo).toHaveBeenCalledTimes(2);
  });

  it('keeps the current server cached when a previous server fails late', () => {
    const late = new Subject<unknown>();
    getBackendInfo.mockReturnValueOnce(late);
    service.getFineractVersion().subscribe();

    settings.server = 'https://two.example.org';
    version();
    late.error(new Error('500'));
    version();

    expect(getBackendInfo).toHaveBeenCalledTimes(2);
  });
});

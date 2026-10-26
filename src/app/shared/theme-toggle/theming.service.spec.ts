/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { SettingsService } from 'app/settings/settings.service';
import { ThemingService } from './theming.service';

describe('ThemingService', () => {
  let savedPreference: boolean | null;
  let systemTheme: EventTarget & { matches: boolean };

  beforeEach(() => {
    savedPreference = null;
    systemTheme = Object.assign(new EventTarget(), {
      matches: true,
      addListener: (listener: EventListener) => systemTheme.addEventListener('change', listener)
    });
    jest.spyOn(window, 'matchMedia').mockReturnValue(systemTheme as unknown as MediaQueryList);
    document.body.classList.remove('dark-theme', 'light-theme');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SettingsService,
          useValue: {
            get themeDarkEnabled() {
              return savedPreference;
            }
          }
        }
      ]
    });
  });

  afterEach(() => {
    document.body.classList.remove('dark-theme', 'light-theme');
    jest.restoreAllMocks();
  });

  it('defaults to light when no app preference is saved, even on a dark system', () => {
    const service = TestBed.inject(ThemingService);

    expect(service.isDarkMode()).toBe(false);
    expect(service.theme.value).toBe('light-theme');
    expect(document.body.classList.contains('light-theme')).toBe(true);
  });

  it.each([
    false,
    true
  ])('restores the saved %s preference independently of the system', (saved) => {
    savedPreference = saved;
    systemTheme.matches = !saved;
    const service = TestBed.inject(ThemingService);

    expect(service.isDarkMode()).toBe(saved);
    expect(service.theme.value).toBe(saved ? 'dark-theme' : 'light-theme');
    expect(document.body.classList.contains(saved ? 'dark-theme' : 'light-theme')).toBe(true);
    expect(document.body.classList.contains(saved ? 'light-theme' : 'dark-theme')).toBe(false);
  });

  it('keeps the applied theme and reported state consistent after a system theme change', () => {
    savedPreference = false;
    const service = TestBed.inject(ThemingService);

    systemTheme.dispatchEvent(Object.assign(new Event('change'), { matches: true }));

    expect(service.isDarkMode()).toBe(false);
    expect(service.theme.value).toBe('light-theme');
    expect(document.body.classList.contains('light-theme')).toBe(true);
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  it('reports the applied theme after an explicit toggle instead of re-reading the system', () => {
    const service = TestBed.inject(ThemingService);

    service.setDarkMode(true);
    systemTheme.matches = false;
    expect(service.isDarkMode()).toBe(true);
    expect(service.theme.value).toBe('dark-theme');
    expect(document.body.classList.contains('dark-theme')).toBe(true);

    service.setDarkMode(false);
    expect(service.isDarkMode()).toBe(false);
    expect(service.theme.value).toBe('light-theme');
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });
});

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'app/settings/settings.service';
import { CurrencyNamePipe } from './currency-name.pipe';

describe('CurrencyNamePipe', () => {
  let pipe: CurrencyNamePipe;
  let translateServiceSpy: any;
  let settingsServiceSpy: any;

  beforeEach(() => {
    translateServiceSpy = {
      currentLang: 'es-MX',
      onLangChange: {
        subscribe: jest.fn(() => ({ unsubscribe: () => {} }))
      }
    };
    settingsServiceSpy = {
      language: { code: 'es-MX' }
    };

    TestBed.configureTestingModule({
      providers: [
        CurrencyNamePipe,
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: SettingsService, useValue: settingsServiceSpy }
      ]
    });

    pipe = TestBed.inject(CurrencyNamePipe);
  });

  it('should transform MXN currency code to localized Spanish name', () => {
    const result = pipe.transform({ code: 'MXN', name: 'Mexican Peso' });
    expect(result.toLowerCase()).toContain('peso');
  });

  it('should transform USD currency code to localized Spanish name when language is Spanish', () => {
    const result = pipe.transform({ code: 'USD', name: 'US Dollar' });
    expect(result.toLowerCase()).toContain('dólar');
  });

  it('should fallback to currency name when code is missing', () => {
    const result = pipe.transform({ name: 'Custom Currency' } as any);
    expect(result).toBe('Custom Currency');
  });

  it('should return empty string for null or undefined input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});

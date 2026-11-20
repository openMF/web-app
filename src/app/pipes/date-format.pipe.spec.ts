/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { SettingsService } from 'app/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { Dates } from 'app/core/utils/dates';
import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;
  let settingsServiceStub: any;

  beforeEach(() => {
    settingsServiceStub = {
      dateFormat: 'dd MMMM yyyy',
      language: { code: 'en' }
    };

    TestBed.configureTestingModule({
      providers: [
        DateFormatPipe,
        Dates,
        DatePipe,
        { provide: SettingsService, useValue: settingsServiceStub },
        { provide: TranslateService, useValue: { onLangChange: of({ lang: 'en' }) } }
      ]
    });

    pipe = TestBed.inject(DateFormatPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for undefined or null value', () => {
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for invalid date value', () => {
    expect(pipe.transform('invalid-date')).toBe('');
  });

  it('should format date with default dateFormat when no format is provided', () => {
    const result = pipe.transform('2026-03-15');
    expect(result).toBe('15 March 2026');
  });

  it('should convert Angular custom format tokens (dd to DD, yyyy to YYYY) and format properly', () => {
    expect(pipe.transform('2026-03-15', 'dd MMMM')).toBe('15 March');
    expect(pipe.transform('2026-03-15', 'yyyy-MM-dd')).toBe('2026-03-15');
    expect(pipe.transform('2026-03-15', 'dd/MM/yyyy')).toBe('15/03/2026');
    expect(pipe.transform('2026-03-15', 'd MMMM yyyy')).toBe('15 March 2026');
  });

  it('should format array date representation [yyyy, MM, dd] with custom format', () => {
    expect(
      pipe.transform(
        [
          2026,
          3,
          15
        ],
        'dd MMMM'
      )
    ).toBe('15 March');
    expect(
      pipe.transform([
        2026,
        3,
        15
      ])
    ).toBe('15 March 2026');
  });

  it('should unsubscribe on destroy', () => {
    expect(() => pipe.ngOnDestroy()).not.toThrow();
  });
});

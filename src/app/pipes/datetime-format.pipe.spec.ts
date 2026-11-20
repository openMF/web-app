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
import { DatetimeFormatPipe } from './datetime-format.pipe';

describe('DatetimeFormatPipe', () => {
  let pipe: DatetimeFormatPipe;
  let settingsServiceStub: any;

  beforeEach(() => {
    settingsServiceStub = {
      datetimeFormat: 'dd MMMM yyyy HH:mm',
      language: { code: 'en' }
    };

    TestBed.configureTestingModule({
      providers: [
        DatetimeFormatPipe,
        Dates,
        DatePipe,
        { provide: SettingsService, useValue: settingsServiceStub },
        { provide: TranslateService, useValue: { onLangChange: of({ lang: 'en' }) } }
      ]
    });

    pipe = TestBed.inject(DatetimeFormatPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null, undefined, or empty string', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(pipe.transform('invalid-datetime')).toBe('');
  });

  it('should return empty string for array with fewer than 3 elements', () => {
    expect(
      pipe.transform([
        2026,
        3
      ])
    ).toBe('');
  });

  it('should format datetime using default format when none provided', () => {
    const result = pipe.transform('2026-03-15T14:30:00');
    expect(result).toBe('15 March 2026 14:30');
  });

  it('should convert Angular custom format tokens (dd to DD, yyyy to YYYY) and format properly', () => {
    const testDate = '2026-03-15T14:30:00';
    expect(pipe.transform(testDate, 'dd MMMM')).toBe('15 March');
    expect(pipe.transform(testDate, 'yyyy-MM-dd HH:mm')).toBe('2026-03-15 14:30');
    expect(pipe.transform(testDate, 'dd/MM/yyyy HH:mm')).toBe('15/03/2026 14:30');
  });

  it('should format array input with and without time', () => {
    expect(
      pipe.transform(
        [
          2026,
          3,
          15,
          14,
          30,
          0
        ],
        'dd MMMM yyyy HH:mm'
      )
    ).toBe('15 March 2026 14:30');
    expect(
      pipe.transform(
        [
          2026,
          3,
          15
        ],
        'dd MMMM yyyy'
      )
    ).toBe('15 March 2026');
  });

  it('should unsubscribe on destroy', () => {
    expect(() => pipe.ngOnDestroy()).not.toThrow();
  });
});

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { YesnoPipe } from './yesno.pipe';

describe('YesnoPipe', () => {
  let pipe: YesnoPipe;
  let mockTranslateService: { instant: jest.Mock };

  beforeEach(() => {
    mockTranslateService = {
      instant: jest.fn((key: string) => {
        if (key === 'labels.buttons.Yes') return 'Yes';
        if (key === 'labels.buttons.No') return 'No';
        return key;
      })
    };

    TestBed.configureTestingModule({
      providers: [
        YesnoPipe,
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    });

    pipe = TestBed.inject(YesnoPipe);
  });

  describe('null and empty handling', () => {
    it('returns empty string when value is null', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('returns empty string when value is undefined', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    it('returns empty string when value is an empty or whitespace string', () => {
      expect(pipe.transform('')).toBe('');
      expect(pipe.transform('   ')).toBe('');
    });
  });

  describe('boolean primitives', () => {
    it('returns translated Yes for boolean true', () => {
      expect(pipe.transform(true)).toBe('Yes');
      expect(mockTranslateService.instant).toHaveBeenCalledWith('labels.buttons.Yes');
    });

    it('returns translated No for boolean false', () => {
      expect(pipe.transform(false)).toBe('No');
      expect(mockTranslateService.instant).toHaveBeenCalledWith('labels.buttons.No');
    });
  });

  describe('string representations of booleans', () => {
    it('returns Yes for "true" regardless of case and trimming', () => {
      expect(pipe.transform('true')).toBe('Yes');
      expect(pipe.transform('TRUE')).toBe('Yes');
      expect(pipe.transform(' True ')).toBe('Yes');
    });

    it('returns No for "false" regardless of case and trimming', () => {
      expect(pipe.transform('false')).toBe('No');
      expect(pipe.transform('FALSE')).toBe('No');
      expect(pipe.transform(' False ')).toBe('No');
    });

    it('returns Yes for "yes" and No for "no"', () => {
      expect(pipe.transform('yes')).toBe('Yes');
      expect(pipe.transform('YES')).toBe('Yes');
      expect(pipe.transform('no')).toBe('No');
      expect(pipe.transform('NO')).toBe('No');
    });

    it('returns Yes for string "1" and No for string "0"', () => {
      expect(pipe.transform('1')).toBe('Yes');
      expect(pipe.transform('0')).toBe('No');
    });
  });

  describe('numeric values', () => {
    it('returns No for numeric 0', () => {
      expect(pipe.transform(0)).toBe('No');
    });

    it('returns Yes for non-zero numbers', () => {
      expect(pipe.transform(1)).toBe('Yes');
      expect(pipe.transform(-1)).toBe('Yes');
      expect(pipe.transform(42)).toBe('Yes');
    });
  });
});

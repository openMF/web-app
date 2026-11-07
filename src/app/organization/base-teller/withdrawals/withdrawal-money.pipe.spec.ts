/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { WithdrawalMoneyPipe } from './withdrawal-money.pipe';

describe('WithdrawalMoneyPipe exact display', () => {
  let language: { currentLang: string };
  let pipe: WithdrawalMoneyPipe;
  beforeEach(() => {
    language = { currentLang: 'en-US' };
    TestBed.configureTestingModule({ providers: [{ provide: TranslateService, useValue: language }] });
    pipe = TestBed.runInInjectionContext(() => new WithdrawalMoneyPipe());
  });
  it('formats denominations to account currency precision', () => {
    expect(pipe.transform('100.000000', 2)).toBe('100.00');
    expect(pipe.transform('0.500000', 2)).toBe('0.50');
  });
  it('groups large exact financial values without rounding', () => {
    expect(pipe.transform('9007199254740.99', 2)).toBe('9,007,199,254,740.99');
  });
  it('uses the current locale and updates after language changes', () => {
    language.currentLang = 'de-DE';
    expect(pipe.transform('10000.50', 2)).toBe('10.000,50');
    language.currentLang = 'en-US';
    expect(pipe.transform('10000.50', 2)).toBe('10,000.50');
  });
  it('retains valid financial amounts when legacy settings repeat the locale tag', () => {
    language.currentLang = 'en-US-EN-US';
    expect(pipe.transform('10000.50', 2)).toBe('10,000.50');
  });
  it('localizes fractional digits for Nepali', () => {
    language.currentLang = 'ne-NE';
    expect(pipe.transform('1000.50', 2)).toBe('१,०००.५०');
  });
  it('preserves zero without an unavailable-balance placeholder', () => {
    expect(pipe.transform('0', 2)).toBe('0.00');
    expect(pipe.transform('10', 0)).toBe('10');
  });
  it('does not round invalid precision or invent missing balances', () => {
    expect(pipe.transform(null, 2)).toBe('—');
    expect(pipe.transform('1.001', 2)).toBe('—');
    expect(pipe.transform('invalid', 2)).toBe('—');
  });
});

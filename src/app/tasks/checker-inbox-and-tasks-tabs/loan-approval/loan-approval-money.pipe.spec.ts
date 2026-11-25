/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { LoanApprovalMoneyPipe } from './loan-approval-money.pipe';
describe('Exact loan money display', () => {
  let pipe: LoanApprovalMoneyPipe;
  let translate: { currentLang: string; instant: (key: string) => string };
  beforeEach(() => {
    translate = { currentLang: 'en-US', instant: (key) => key };
    TestBed.configureTestingModule({ providers: [{ provide: TranslateService, useValue: translate }] });
    pipe = TestBed.runInInjectionContext(() => new LoanApprovalMoneyPipe());
  });
  it('preserves large selected-loan totals above the individual account limit', () =>
    expect(pipe.transform('1234567890123456.78', 'MXN', 2)).toBe('1,234,567,890,123,456.78 MXN'));
  it('formats decimal separators in the current language without floating-point conversion', () => {
    translate.currentLang = 'de-DE';
    expect(pipe.transform('1234.10', 'EUR', 2)).toBe('1.234,10 EUR');
  });
  it('preserves zero-decimal currencies', () => expect(pipe.transform('1234', 'JPY', 0)).toBe('1,234 JPY'));
  it('does not round unsupported precision or display an amount without known currency metadata', () => {
    expect(pipe.transform('1.001', 'MXN', 2)).toBe('loanApproval.amountUnavailable');
    expect(pipe.transform('1', undefined, 2)).toBe('loanApproval.amountUnavailable');
  });
  it('retains harmless trailing zeroes at the actual currency precision', () =>
    expect(pipe.transform('1.10000', 'MXN', 2)).toBe('1.10 MXN'));
  it('reuses formatters across amounts and pipe instances, selecting the right cached locale after language changes', () => {
    (LoanApprovalMoneyPipe as any).formatters.clear();
    const Original = Intl.NumberFormat;
    const create = jest
      .spyOn(Intl, 'NumberFormat')
      .mockImplementation((locale, options) => new Original(locale, options));
    try {
      expect(pipe.transform('1234.10', 'MXN', 2)).toBe('1,234.10 MXN');
      pipe.transform('42.00', 'MXN', 2);
      TestBed.runInInjectionContext(() => new LoanApprovalMoneyPipe()).transform('1.00', 'MXN', 2);
      expect(create).toHaveBeenCalledTimes(2);
      translate.currentLang = 'de-DE';
      expect(pipe.transform('1234.10', 'EUR', 2)).toBe('1.234,10 EUR');
      expect(create).toHaveBeenCalledTimes(4);
      translate.currentLang = 'en-US';
      expect(pipe.transform('1234.10', 'MXN', 2)).toBe('1,234.10 MXN');
      expect(create).toHaveBeenCalledTimes(4);
    } finally {
      create.mockRestore();
    }
  });
});

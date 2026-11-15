/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { WriteOffPageComponent } from '../loan-account-actions/write-off-page/write-off-page.component';
import { LoansService } from '../../loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

describe('ANPA native write-off regression', () => {
  it('preserves the existing command and excludes diagnostic/proposal fields', () => {
    const submit = jest.fn(() => of({}));
    const navigate = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { loanId: '2' } }, pathFromRoot: [] } },
        { provide: Router, useValue: { navigate } },
        { provide: LoanProductService, useValue: { productType: { value: 'loan' } } },
        { provide: LoansService, useValue: { submitLoanActionButton: submit } },
        { provide: SettingsService, useValue: { language: { code: 'en' }, dateFormat: 'yyyy-MM-dd' } },
        { provide: Dates, useValue: {} }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new WriteOffPageComponent());
    component.writeOffForm = new FormBuilder().group({
      transactionDate: '2026-11-15',
      amount: 123,
      writeoffReasonId: '',
      note: 'Synthetic review'
    });
    component.submit();
    expect(submit).toHaveBeenCalledWith(
      '2',
      { transactionDate: '2026-11-15', note: 'Synthetic review', dateFormat: 'yyyy-MM-dd', locale: 'en' },
      'writeoff'
    );
    expect(navigate).toHaveBeenCalled();
  });
});

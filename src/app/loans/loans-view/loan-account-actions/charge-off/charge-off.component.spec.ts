/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { ChargeOffComponent } from './charge-off.component';

describe('ChargeOffComponent', () => {
  let loansServiceStub: { submitLoanActionButton: jest.Mock };

  /**
   * Builds the component against stubbed collaborators and runs ngOnInit, without rendering the template.
   * @returns The initialised component.
   */
  function createComponent(): ChargeOffComponent {
    loansServiceStub = { submitLoanActionButton: jest.fn(() => of({})) };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: ActivatedRoute, useValue: { snapshot: { params: { loanId: '1' } }, pathFromRoot: [] } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: LoansService, useValue: loansServiceStub },
        {
          provide: LoanProductService,
          useValue: { isLoanProduct: true, isWorkingCapital: false, productType: { value: 'loan' } }
        },
        {
          provide: SettingsService,
          useValue: { businessDate: new Date(2026, 9, 17), dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        { provide: Dates, useValue: { formatDate: () => '17 October 2026' } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new ChargeOffComponent());
    component.dataObject = { chargeOffReasonOptions: [{ id: 5, name: 'Fraud' }] };
    component.ngOnInit();
    return component;
  }

  it('does not send a reason when none is selected', () => {
    const component = createComponent();

    component.submit();

    const [
      loanId,
      data,
      command
    ] = loansServiceStub.submitLoanActionButton.mock.calls[0];
    expect(loanId).toBe('1');
    expect(command).toBe('charge-off');
    expect(data).not.toHaveProperty('chargeOffReasonId');
    expect(data).toMatchObject({ transactionDate: '17 October 2026', dateFormat: 'dd MMMM yyyy', locale: 'en' });
  });

  it('sends the selected reason', () => {
    const component = createComponent();
    component.chargeoffLoanForm.patchValue({ chargeOffReasonId: 5 });

    component.submit();

    const data = loansServiceStub.submitLoanActionButton.mock.calls[0][1];
    expect(data.chargeOffReasonId).toBe(5);
  });
});

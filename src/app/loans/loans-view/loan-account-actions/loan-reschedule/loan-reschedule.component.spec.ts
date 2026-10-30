/**
 * Copyright since 2025 Mifos Initiative
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
import { PenaltyManagementService } from 'app/loans/services/penalty-management.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { LoanRescheduleComponent } from './loan-reschedule.component';

describe('LoanRescheduleComponent', () => {
  /** A business date behind the computer clock, as on a tenant whose close of business has not run yet. */
  const businessDate = new Date(2026, 9, 15);

  function createComponent(): LoanRescheduleComponent {
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: ActivatedRoute, useValue: { snapshot: { params: { loanId: '40' } } } },
        { provide: Router, useValue: {} },
        { provide: LoanProductService, useValue: { isLoanProduct: true, isWorkingCapital: false } },
        { provide: LoansService, useValue: { getLoanAccountAssociationDetails: () => of({}) } },
        { provide: PenaltyManagementService, useValue: { loadPenalties: () => of([]) } },
        { provide: SettingsService, useValue: { businessDate } },
        { provide: Dates, useValue: {} }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new LoanRescheduleComponent());
    component.dataObject = { rescheduleReasons: [] };
    component.ngOnInit();
    return component;
  }

  it('submits the request on the business date, so it can be approved or rejected on that date', () => {
    const component = createComponent();
    expect(component.rescheduleLoanForm.value.submittedOnDate).toBe(businessDate);
    expect(component.maxDate).toBe(businessDate);
  });
});

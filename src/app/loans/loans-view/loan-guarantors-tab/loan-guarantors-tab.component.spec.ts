/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { LoanGuarantorsTabComponent } from './loan-guarantors-tab.component';

describe('LoanGuarantorsTabComponent', () => {
  const LOAN_ID = '42';

  /** `GET /loans/{loanId}/guarantors` responds with the guarantor list itself. */
  const resolvedGuarantors = [
    guarantor(1, 'Ada', 'Lovelace'),
    guarantor(2, 'Alan', 'Turing')
  ];

  function guarantor(id: number, firstname: string, lastname: string, status = true) {
    return {
      id,
      firstname,
      lastname,
      status,
      guarantorType: { id: 3, value: 'External' },
      clientRelationshipType: { id: 1, name: 'Spouse' },
      guarantorFundingDetails: [] as any[]
    };
  }

  let loansServiceStub: {
    getLoanDelinquencyDataForTemplate: jest.Mock;
    getGuarantors: jest.Mock;
    deleteGuarantor: jest.Mock;
  };
  let dialogStub: { open: jest.Mock };
  let cdrStub: { markForCheck: jest.Mock };

  function createComponent(
    loanGuarantors: any = resolvedGuarantors,
    loanDetailsData: any = { status: { active: true } }
  ): LoanGuarantorsTabComponent {
    TestBed.configureTestingModule({
      providers: [
        {
          // The tab is a child route: `loanId` lives on the parent, as does the loan details data.
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({}) },
            data: of({ loanGuarantors }),
            parent: { snapshot: { paramMap: convertToParamMap({ loanId: LOAN_ID }) }, data: of({ loanDetailsData }) }
          }
        },
        { provide: LoansService, useValue: loansServiceStub },
        { provide: LoanProductService, useValue: { isLoanProduct: true, productType: { value: 'loans' } } },
        { provide: MatDialog, useValue: dialogStub },
        { provide: ChangeDetectorRef, useValue: cdrStub }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new LoanGuarantorsTabComponent());
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      getLoanDelinquencyDataForTemplate: jest.fn(() => of({})),
      getGuarantors: jest.fn(() => of(resolvedGuarantors)),
      deleteGuarantor: jest.fn(() => of({}))
    };
    dialogStub = { open: jest.fn(() => ({ afterClosed: () => of(undefined) })) };
    cdrStub = { markForCheck: jest.fn() };
  });

  // Same guard as the WEB-1237 fix in ViewGuarantorsComponent: the resolved value is the list itself, reading
  // a `guarantors` property off it yields undefined and empties the table.
  it('binds the guarantor list from the resolved array itself', () => {
    const component = createComponent();

    expect(component.guarantors).toBe(resolvedGuarantors);
    expect(component.guarantors).toHaveLength(2);
  });

  it('reads the loan id from the parent route', () => {
    const component = createComponent();

    expect(component.loanId).toBe(LOAN_ID);
    expect(loansServiceStub.getLoanDelinquencyDataForTemplate).toHaveBeenCalledWith(LOAN_ID);
  });

  it('falls back to an empty list when nothing was resolved', () => {
    const component = createComponent(null);

    expect(component.guarantors).toEqual([]);
  });

  it.each([
    [
      'pending approval',
      { pendingApproval: true },
      true
    ],
    [
      'approved',
      { waitingForDisbursal: true },
      true
    ],
    [
      'active',
      { active: true },
      true
    ],
    [
      'closed',
      { closed: true, closedObligationsMet: true },
      false
    ]
  ])('offers Create Guarantor on a %s loan: %s', (_label, status, expected) => {
    const component = createComponent(resolvedGuarantors, { status });

    expect(component.canCreateGuarantor).toBe(expected);
  });

  it('re-fetches and replaces the list after a confirmed delete', () => {
    const remainingGuarantors = [guarantor(2, 'Alan', 'Turing')];
    dialogStub.open.mockReturnValue({ afterClosed: () => of({ delete: true }) });
    loansServiceStub.getGuarantors.mockReturnValue(of(remainingGuarantors));
    const component = createComponent();

    component.deleteGuarantor(1);

    expect(loansServiceStub.deleteGuarantor).toHaveBeenCalledWith(LOAN_ID, 1);
    expect(loansServiceStub.getGuarantors).toHaveBeenCalledWith(LOAN_ID);
    expect(component.guarantors).toBe(remainingGuarantors);
    // OnPush: state arriving from an async callback must be flagged for change detection.
    expect(cdrStub.markForCheck).toHaveBeenCalled();
  });

  it('does not delete when the confirmation dialog is dismissed', () => {
    const component = createComponent();

    component.deleteGuarantor(1);

    expect(loansServiceStub.deleteGuarantor).not.toHaveBeenCalled();
    expect(loansServiceStub.getGuarantors).not.toHaveBeenCalled();
    expect(component.guarantors).toBe(resolvedGuarantors);
  });
});

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
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { ViewGuarantorsComponent } from './view-guarantors.component';

describe('ViewGuarantorsComponent', () => {
  const LOAN_ID = '42';

  /**
   * `GET /loans/{loanId}/guarantors` responds with the guarantor list itself, and the
   * `View Guarantors` branch of LoanActionButtonResolver hands that straight to `dataObject`.
   */
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
    getLoanAccountAssociationDetails: jest.Mock;
    getLoanDelinquencyDataForTemplate: jest.Mock;
    getGuarantors: jest.Mock;
    deleteGuarantor: jest.Mock;
  };
  let dialogStub: { open: jest.Mock };
  let cdrStub: { markForCheck: jest.Mock };

  function createComponent(dataObject: any = resolvedGuarantors): ViewGuarantorsComponent {
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { loanId: LOAN_ID } } } },
        { provide: Router, useValue: { getCurrentNavigation: jest.fn((): any => null), navigate: jest.fn() } },
        { provide: LoansService, useValue: loansServiceStub },
        {
          provide: LoanProductService,
          useValue: { isWorkingCapital: false, isLoanProduct: true, productType: { value: 'loans' } }
        },
        { provide: SettingsService, useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' } },
        { provide: MatDialog, useValue: dialogStub },
        { provide: ChangeDetectorRef, useValue: cdrStub }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new ViewGuarantorsComponent());
    component.dataObject = dataObject;
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      getLoanAccountAssociationDetails: jest.fn(() => of({ currency: { name: 'USD' } })),
      getLoanDelinquencyDataForTemplate: jest.fn(() => of({})),
      getGuarantors: jest.fn(() => of(resolvedGuarantors)),
      deleteGuarantor: jest.fn(() => of({}))
    };
    dialogStub = { open: jest.fn(() => ({ afterClosed: () => of(undefined) })) };
    cdrStub = { markForCheck: jest.fn() };
  });

  // Regression guard for WEB-1237: reading `dataObject.guarantors` off the resolved array
  // yields undefined, which hides the whole table behind its `@if (guarantorDetails)`.
  it('binds the guarantor list from the resolved array itself, not from a `guarantors` property', () => {
    const component = createComponent();

    expect(component.guarantorDetails).toBe(resolvedGuarantors);
    expect(component.guarantorDetails).toHaveLength(2);
    expect((resolvedGuarantors as any).guarantors).toBeUndefined();
  });

  it('falls back to the loan association details when there is no navigation state', () => {
    const component = createComponent();

    expect(loansServiceStub.getLoanAccountAssociationDetails).toHaveBeenCalledWith(LOAN_ID);
    expect(component.loanData).toEqual({ currency: { name: 'USD' } });
    // OnPush: state arriving from an async callback must be flagged for change detection.
    expect(cdrStub.markForCheck).toHaveBeenCalled();
  });

  it('never leaves loanData undefined, so the template can render before the fetch resolves', () => {
    // Leave the fetch pending: the template renders in that window and dereferences loanData.
    loansServiceStub.getLoanAccountAssociationDetails.mockReturnValue(new Subject<any>());
    const component = createComponent();

    expect(component.loanData).toEqual({});
  });

  it('re-fetches and replaces the list after a confirmed delete', () => {
    const remainingGuarantors = [guarantor(2, 'Alan', 'Turing')];
    dialogStub.open.mockReturnValue({ afterClosed: () => of({ delete: true }) });
    loansServiceStub.getGuarantors.mockReturnValue(of(remainingGuarantors));
    const component = createComponent();
    cdrStub.markForCheck.mockClear();

    component.deleteGuarantor(1);

    expect(loansServiceStub.deleteGuarantor).toHaveBeenCalledWith(LOAN_ID, 1);
    expect(loansServiceStub.getGuarantors).toHaveBeenCalledWith(LOAN_ID);
    expect(component.guarantorDetails).toBe(remainingGuarantors);
    expect(cdrStub.markForCheck).toHaveBeenCalled();
  });

  it('does not delete when the confirmation dialog is dismissed', () => {
    dialogStub.open.mockReturnValue({ afterClosed: () => of(undefined) });
    const component = createComponent();

    component.deleteGuarantor(1);

    expect(loansServiceStub.deleteGuarantor).not.toHaveBeenCalled();
    expect(loansServiceStub.getGuarantors).not.toHaveBeenCalled();
    expect(component.guarantorDetails).toBe(resolvedGuarantors);
  });
});

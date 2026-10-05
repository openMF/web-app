/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { LoanAccountActionsComponent } from './loan-account-actions.component';

// A child screen exports PDFs; jspdf ships ESM only, which Jest does not transform.
jest.mock('jspdf', () => ({ jsPDF: jest.fn() }));
jest.mock('jspdf-autotable', () => jest.fn());

describe('LoanAccountActionsComponent', () => {
  let params$: BehaviorSubject<any>;
  let data$: BehaviorSubject<any>;
  let snapshot: any;
  let cdr: { markForCheck: jest.Mock };

  function createComponent(action: string): LoanAccountActionsComponent {
    snapshot = { params: { loanId: '1', action }, queryParamMap: convertToParamMap({}) };
    params$ = new BehaviorSubject(snapshot.params);
    data$ = new BehaviorSubject({ actionButtonData: { amount: 84.06 } });
    cdr = { markForCheck: jest.fn() };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { params: params$, data: data$, snapshot } },
        { provide: Router, useValue: { currentNavigation: (): null => null } },
        { provide: LoanProductService, useValue: { isWorkingCapital: false } },
        { provide: ChangeDetectorRef, useValue: cdr }
      ]
    });
    return TestBed.runInInjectionContext(() => new LoanAccountActionsComponent());
  }

  /**
   * Mimics the router reusing the component for another action: the snapshot moves first, then params and the newly
   * resolved template are emitted.
   */
  function navigateTo(loanId: string, action: string) {
    snapshot.params = { loanId, action };
    params$.next(snapshot.params);
    data$.next({ actionButtonData: { amount: 84.53 } });
  }

  it('tags the resolved template with the action it was opened for', () => {
    const component = createComponent('Loan Withdrawal');

    expect(component.actions['Loan Withdrawal']).toBe(true);
    expect(component.actionButtonData).toEqual({ amount: 84.06, actionName: 'Loan Withdrawal', productType: 'loan' });
  });

  it('switches the screen and its template when only the action in the route changes', () => {
    const component = createComponent('Loan Withdrawal');
    cdr.markForCheck.mockClear();

    navigateTo('2', 'Contract Termination');

    expect(component.actions['Loan Withdrawal']).toBe(false);
    expect(component.actions['Contract Termination']).toBe(true);
    expect(component.actionButtonData.actionName).toBe('Contract Termination');
    expect(component.actionButtonData.amount).toBe(84.53);
    expect(cdr.markForCheck).toHaveBeenCalled();
  });

  it('keeps mapping Change Loan Officer onto the Assign Loan Officer screen', () => {
    const component = createComponent('Change Loan Officer');

    expect(component.actions['Assign Loan Officer']).toBe(true);
    expect(component.actionButtonData.actionName).toBe('Assign Loan Officer');
  });
});

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, expect, it } from '@jest/globals';

import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { ChargesTabComponent } from './charges-tab.component';

describe('ChargesTabComponent', () => {
  /**
   * Creates the tab for a loan as the loan details resolver returns it.
   * @param loanDetails Loan details from GET /loans/{loanId}
   */
  async function createTab(loanDetails: any): Promise<ChargesTabComponent> {
    await TestBed.configureTestingModule({
      imports: [ChargesTabComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { parent: { data: of({ loanDetailsData: loanDetails }) }, data: of({}) } },
        { provide: LoanProductService, useValue: { isLoanProduct: true, isWorkingCapital: false } },
        { provide: SystemService, useValue: { getConfigurationByName: () => of({ stringValue: 'due-date' }) } },
        { provide: Dates, useValue: { parseDate: (value: any) => value } },
        { provide: LoansService, useValue: {} },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: MatDialog, useValue: {} },
        { provide: SettingsService, useValue: {} },
        { provide: AlertService, useValue: {} }
      ]
    })
      .overrideComponent(ChargesTabComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    return TestBed.createComponent(ChargesTabComponent).componentInstance;
  }

  it('shows an empty charges table for a loan without charges', async () => {
    // Fineract leaves `charges` out of the loan details when the loan has none.
    const component = await createTab({ status: { value: 'Active' } });

    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.chargesData).toEqual([]);
    expect(component.dataSource.data).toEqual([]);
    expect(component.displayedColumns).toContain('name');
  });
});

/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { ViewChargeComponent } from './view-charge.component';

describe('ViewChargeComponent', () => {
  let component: ViewChargeComponent;
  let dialogStub: { open: jest.Mock };
  let loansServiceStub: { executeLoansAccountChargesCommand: jest.Mock };
  let translateServiceStub: { instant: jest.Mock };
  let loanProductServiceStub: { isWorkingCapital: boolean; loanAccountPath: string };

  const chargeData = {
    id: 3109,
    loanId: 115,
    name: 'Application Fee',
    amountOutstanding: 110,
    chargePayable: true,
    paid: false,
    chargeTimeType: { waived: false }
  };

  const loanDetailsData = {
    id: 115,
    status: { value: 'Active' }
  };

  beforeEach(() => {
    dialogStub = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of({ confirm: true })
      })
    };

    loansServiceStub = {
      executeLoansAccountChargesCommand: jest.fn().mockReturnValue(of({}))
    };

    translateServiceStub = {
      instant: jest.fn((key: string) => {
        if (key === 'labels.heading.Waive Charge') {
          return 'Waive Charge';
        }
        if (key === 'labels.dialogContext.Are you sure you want to waive charge with id:') {
          return 'Are you sure you want to waive charge with id:';
        }
        return key;
      })
    };

    loanProductServiceStub = {
      isWorkingCapital: false,
      loanAccountPath: 'loans'
    };

    TestBed.configureTestingModule({
      providers: [
        ViewChargeComponent,
        { provide: MatDialog, useValue: dialogStub },
        { provide: LoansService, useValue: loansServiceStub },
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: LoanProductService, useValue: loanProductServiceStub },
        { provide: SettingsService, useValue: { businessDate: new Date() } },
        { provide: Dates, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              loansAccountCharge: chargeData,
              loanDetailsData: loanDetailsData
            })
          }
        }
      ]
    });

    component = TestBed.inject(ViewChargeComponent);
  });

  it('should initialize component and determine waive permission', () => {
    expect(component).toBeTruthy();
    expect(component.chargeData.id).toBe(3109);
    expect(component.allowWaive).toBe(true);
  });

  it('should not throw TypeError and should open confirmation dialog on waiveCharge', () => {
    const reloadSpy = jest.spyOn(component as any, 'reload').mockImplementation();

    expect(() => component.waiveCharge()).not.toThrow();

    expect(dialogStub.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
      data: {
        heading: 'Waive Charge',
        dialogContext: 'Are you sure you want to waive charge with id: 3109',
        type: 'Basic'
      }
    });

    expect(loansServiceStub.executeLoansAccountChargesCommand).toHaveBeenCalledWith('loans', 115, 'waive', {}, 3109);
    expect(reloadSpy).toHaveBeenCalled();
  });
});

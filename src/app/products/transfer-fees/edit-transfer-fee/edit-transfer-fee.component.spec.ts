/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { OrganizationService } from 'app/organization/organization.service';
import { of } from 'rxjs';

import { TransferFeesService } from '../transfer-fees.service';
import { createTransferFeeForm } from '../transfer-fee-form';
import { EditTransferFeeComponent } from './edit-transfer-fee.component';

describe('EditTransferFeeComponent', () => {
  function createComponent(): EditTransferFeeComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              transferFee: {
                id: 7,
                transferType: 'SINPE_MOVIL',
                currencyCode: 'USD',
                transferMode: null,
                feeType: 'PERCENTAGE',
                feeValue: '1.25',
                feeCurrency: 'USD',
                thresholdAmount: '100.00',
                thresholdFeeValue: null,
                description: 'Existing fee',
                isActive: true,
                exchangeRateRequired: true
              }
            })
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: TransferFeesService, useValue: { updateTransferFee: jest.fn() } },
        { provide: ErrorHandlerService, useValue: { handleError: jest.fn(), showSuccess: jest.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        {
          provide: OrganizationService,
          useValue: { getCurrencies: jest.fn(() => of({ selectedCurrencyOptions: [] })) }
        }
      ]
    });

    return TestBed.runInInjectionContext(() => new EditTransferFeeComponent());
  }

  it('should build a supported edit payload from resolver data and form changes', () => {
    const component = createComponent();
    component.ngOnInit();
    component.transferFeeForm.patchValue({
      transferMode: 'T_PLUS_1',
      thresholdFeeValue: '',
      description: 'Updated fee',
      isActive: false
    });

    expect(component.buildPayload()).toEqual({
      transferType: 'SINPE_MOVIL',
      currencyCode: 'USD',
      transferMode: 'T_PLUS_1',
      feeType: 'PERCENTAGE',
      feeValue: '1.25',
      feeCurrency: 'USD',
      thresholdAmount: '100.00',
      thresholdFeeValue: null,
      description: 'Updated fee',
      isActive: false,
      exchangeRateRequired: true
    });
  });

  it('should default an existing transfer fee with an omitted active flag to active', () => {
    const form = createTransferFeeForm(new UntypedFormBuilder(), {
      id: 7,
      transferType: 'PIN',
      currencyCode: 'CRC',
      feeType: 'FIXED',
      feeValue: '10.00'
    });

    expect(form.get('isActive')?.value).toBe(true);
  });
});

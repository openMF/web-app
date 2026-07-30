/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { OrganizationService } from 'app/organization/organization.service';
import { of } from 'rxjs';

import { TransferFeesService } from '../transfer-fees.service';
import { CreateTransferFeeComponent } from './create-transfer-fee.component';
import { TestBed } from '@angular/core/testing';

describe('CreateTransferFeeComponent', () => {
  function createComponent(): CreateTransferFeeComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: ActivatedRoute, useValue: { data: of({}) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: TransferFeesService, useValue: { createTransferFee: jest.fn() } },
        { provide: ErrorHandlerService, useValue: { handleError: jest.fn(), showSuccess: jest.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        {
          provide: OrganizationService,
          useValue: { getCurrencies: jest.fn(() => of({ selectedCurrencyOptions: [] })) }
        }
      ]
    });

    return TestBed.runInInjectionContext(() => new CreateTransferFeeComponent());
  }

  it('should build a supported create payload and normalize blank optional values', () => {
    const component = createComponent();
    component.ngOnInit();
    component.transferFeeForm.patchValue({
      transferType: 'PIN',
      currencyCode: 'CRC',
      transferMode: '',
      feeType: 'FIXED',
      feeValue: '10.50',
      feeCurrency: '',
      thresholdAmount: '',
      thresholdFeeValue: '700.00',
      description: '',
      isActive: true,
      exchangeRateRequired: false
    });

    expect(component.buildPayload()).toEqual({
      transferType: 'PIN',
      currencyCode: 'CRC',
      transferMode: null,
      feeType: 'FIXED',
      feeValue: '10.50',
      feeCurrency: null,
      thresholdAmount: null,
      thresholdFeeValue: '700.00',
      description: null,
      isActive: true,
      exchangeRateRequired: false
    });
  });
});

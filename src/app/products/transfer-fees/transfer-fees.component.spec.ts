/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { TransferFeesComponent } from './transfer-fees.component';

describe('TransferFeesComponent', () => {
  function createComponent(): { component: TransferFeesComponent; router: { navigate: jest.Mock } } {
    const router = { navigate: jest.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              transferFees: [
                { id: 1, transferType: 'PIN', currencyCode: 'CRC', feeType: 'FIXED', feeValue: '10.00' },
                { id: 2, transferType: 'SINPE_MOVIL', currencyCode: 'USD', feeType: 'PERCENTAGE', feeValue: '1.00' }
              ]
            })
          }
        },
        { provide: Router, useValue: router }
      ]
    });

    return { component: TestBed.runInInjectionContext(() => new TransferFeesComponent()), router };
  }

  it('should map plugin values to translation keys', () => {
    const { component } = createComponent();

    expect(component.transferTypeLabelKey('SINPE_MOVIL')).toBe('labels.inputs.SINPE Movil');
    expect(component.transferModeLabelKey('INMEDIATA')).toBe('labels.inputs.Inmediata');
    expect(component.feeTypeLabelKey('FIXED')).toBe('labels.inputs.Fixed');
  });

  it('should filter transfer fees by supported fields', () => {
    const { component } = createComponent();
    component.ngOnInit();

    component.applyFilter('sinpe');

    expect(component.dataSource.filteredData).toEqual([
      { id: 2, transferType: 'SINPE_MOVIL', currencyCode: 'USD', feeType: 'PERCENTAGE', feeValue: '1.00' }
    ]);
  });

  it('should navigate to a transfer fee from keyboard activation', () => {
    const { component, router } = createComponent();

    component.navigateToTransferFee(7);

    expect(router.navigate).toHaveBeenCalledWith([7], { relativeTo: expect.anything() });
  });
});

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { CreateGuarantorComponent } from './create-guarantor.component';

describe('CreateGuarantorComponent', () => {
  const LOAN_ID = '42';

  let loansServiceStub: { createNewGuarantor: jest.Mock; guarantorAccountResource: jest.Mock };

  function createComponent(): CreateGuarantorComponent {
    loansServiceStub = {
      createNewGuarantor: jest.fn(() => of({})),
      guarantorAccountResource: jest.fn(() => of({ accountLinkingOptions: [] }))
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { loanId: LOAN_ID } } } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: LoansService, useValue: loansServiceStub },
        {
          provide: LoanProductService,
          useValue: { isWorkingCapital: false, isLoanProduct: true, productType: { value: 'loans' } }
        },
        {
          provide: SettingsService,
          useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy', businessDate: new Date(2026, 9, 13) }
        },
        { provide: ClientsService, useValue: { getFilteredClients: jest.fn(() => of({ pageItems: [] })) } },
        { provide: Dates, useValue: { formatDate: jest.fn() } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new CreateGuarantorComponent());
    component.dataObject = { allowedClientRelationshipTypes: [] };
    component.ngOnInit();
    return component;
  }

  it('does not accept a typed name until a client is picked from the list', () => {
    const component = createComponent();
    const name = component.newGuarantorForm.get('name');

    name.setValue('Ada');

    expect(name.hasError('clientNotPicked')).toBe(true);
    expect(component.newGuarantorForm.valid).toBe(false);
  });

  it('sends the picked client as entityId', () => {
    const component = createComponent();
    component.newGuarantorForm.get('name').setValue({ id: 7, displayName: 'Ada Lovelace' });

    expect(component.newGuarantorForm.valid).toBe(true);

    component.submit();

    expect(loansServiceStub.createNewGuarantor).toHaveBeenCalledWith(
      LOAN_ID,
      expect.objectContaining({ entityId: 7, guarantorTypeId: 1 })
    );
  });
});

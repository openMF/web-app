/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe, DecimalPipe } from '@angular/common';
import { CdkStepper } from '@angular/cdk/stepper';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { SettingsService } from 'app/settings/settings.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { LoansAccountPreviewStepComponent } from './loans-account-preview-step.component';

const CURRENCY = { code: 'USD', name: 'US Dollar', decimalPlaces: 2, displaySymbol: '$' };

/** Part of GET /loans/template?templateType=group&groupId=1&productId=6: a group template has a group and no client. */
const GROUP_PRODUCT_TEMPLATE: any = {
  clientName: null,
  client: null,
  group: { id: 1, name: 'Market Women Group' },
  currency: CURRENCY,
  product: { id: 6, name: 'Group Loan' },
  termFrequencyTypeOptions: [],
  loanOfficerOptions: [],
  loanPurposeOptions: [],
  overdueCharges: []
};

/** Part of GET /loans/template?templateType=individual&clientId=4&productId=6. */
const CLIENT_PRODUCT_TEMPLATE: any = {
  ...GROUP_PRODUCT_TEMPLATE,
  group: null,
  clientName: 'Jane Doe'
};

describe('LoansAccountPreviewStepComponent', () => {
  let fixture: ComponentFixture<LoansAccountPreviewStepComponent>;

  function render(productTemplate: any): HTMLElement {
    TestBed.configureTestingModule({
      imports: [
        LoansAccountPreviewStepComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        DecimalPipe,
        // the Previous button (matStepperPrevious) needs the parent stepper
        { provide: CdkStepper, useValue: {} },
        provideRouter([]),
        {
          provide: LoanProductService,
          useValue: { isLoanProduct: true, isWorkingCapital: false, productType: { value: 'loan' } }
        },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } }
      ]
    });
    TestBed.inject(FaIconLibrary).addIcons(faArrowLeft);
    fixture = TestBed.createComponent(LoansAccountPreviewStepComponent);
    fixture.componentRef.setInput('loansAccountTemplate', {});
    fixture.componentRef.setInput('loansAccountProductTemplate', productTemplate);
    fixture.componentRef.setInput('loansAccount', { productId: 'GL', charges: [], originators: [] });
    fixture.componentRef.setInput('loanProductsBasicDetails', []);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('shows the group, instead of failing, for a group loan application', () => {
    const element = render(GROUP_PRODUCT_TEMPLATE);
    const groupRow = element.querySelector('[data-testid="group-row"]');
    expect(groupRow?.textContent).toContain('Market Women Group');
    expect(element.querySelector('[data-testid="client-row"]')).toBeNull();
  });

  it('still shows the client for an individual loan application', () => {
    const element = render(CLIENT_PRODUCT_TEMPLATE);
    const clientRow = element.querySelector('[data-testid="client-row"]');
    expect(clientRow?.textContent).toContain('Jane Doe');
    expect(element.querySelector('[data-testid="group-row"]')).toBeNull();
  });
});

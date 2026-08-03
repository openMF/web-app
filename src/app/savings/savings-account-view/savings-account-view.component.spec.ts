/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, expect, it, jest } from '@jest/globals';

import { environment } from 'environments/environment';
import { SavingsService } from '../savings.service';
import { SavingsAccountViewComponent } from './savings-account-view.component';

describe('SavingsAccountViewComponent fast payment menu', () => {
  let fixture: ComponentFixture<SavingsAccountViewComponent>;
  let component: SavingsAccountViewComponent;
  let router: { url: string; navigate: jest.Mock; navigateByUrl: jest.Mock };
  const originalFastPaymentFlag = environment.mifosInterbankTransfersEnabled;

  const savingsAccountData = (overrides: any = {}) => ({
    id: 87,
    clientId: 90,
    accountNo: '00000087',
    externalId: 'CR92037300110010000087',
    status: { value: 'Active' },
    subStatus: {
      block: false,
      blockCredit: false,
      blockDebit: false
    },
    summary: { availableBalance: 100 },
    currency: { code: 'CRC' },
    ...overrides
  });

  const setup = async (accountOverrides: any = {}) => {
    router = {
      url: '/clients/90/savings-accounts/87/general',
      navigate: jest.fn(),
      navigateByUrl: jest.fn(() => Promise.resolve(true))
    };

    await TestBed.configureTestingModule({
      imports: [
        SavingsAccountViewComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              savingsAccountData: savingsAccountData(accountOverrides),
              savingsDatatables: []
            }),
            snapshot: {
              paramMap: {
                get: jest.fn(() => '87')
              }
            }
          }
        },
        {
          provide: Router,
          useValue: router
        },
        {
          provide: SavingsService,
          useValue: {}
        },
        {
          provide: MatDialog,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsAccountViewComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  };

  afterEach(() => {
    environment.mifosInterbankTransfersEnabled = originalFastPaymentFlag;
  });

  it('shows Link to payment system under More when the account has clientId', async () => {
    environment.mifosInterbankTransfersEnabled = true;
    await setup();

    expect(component.buttonConfig.options).toEqual(
      expect.arrayContaining([
        {
          name: 'Link to payment system',
          taskPermissionName: 'CREATE_ACCOUNTTRANSFER'
        }
      ])
    );
  });

  it('shows Link to payment system even when externalId is missing', async () => {
    environment.mifosInterbankTransfersEnabled = true;
    await setup({ externalId: undefined });

    expect(component.buttonConfig.options.map((option) => option.name)).toContain('Link to payment system');
  });

  it.each([
    'CRC',
    'USD',
    'EUR',
    'INR'
  ])('shows Link to payment system for %s savings accounts', async (currencyCode) => {
    environment.mifosInterbankTransfersEnabled = true;
    await setup({ currency: { code: currencyCode } });

    expect(component.buttonConfig.options.map((option) => option.name)).toContain('Link to payment system');
  });

  it('hides Link to payment system when the feature flag is disabled', async () => {
    environment.mifosInterbankTransfersEnabled = false;
    await setup();

    expect(component.buttonConfig.options.map((option) => option.name)).not.toContain('Link to payment system');
  });

  it('hides Link to payment system when the account is not client owned', async () => {
    environment.mifosInterbankTransfersEnabled = true;
    await setup({ clientId: undefined });

    expect(component.buttonConfig.options.map((option) => option.name)).not.toContain('Link to payment system');
  });

  it('reuses savings action routing for Link to payment system', async () => {
    environment.mifosInterbankTransfersEnabled = true;
    await setup();

    component.doAction('Link to payment system');

    expect(router.navigate).toHaveBeenCalledWith(['actions/Link to payment system'], expect.any(Object));
  });
});

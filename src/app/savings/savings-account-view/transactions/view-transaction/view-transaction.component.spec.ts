/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, expect, it, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { IconsModule } from 'app/shared/icons.module';
import { ViewTransactionComponent } from './view-transaction.component';

describe('Savings ViewTransactionComponent', () => {
  let fixture: ComponentFixture<ViewTransactionComponent>;

  const savingsAccountData = (overrides: Record<string, unknown> = {}) => ({
    id: 87,
    accountNo: '000000001',
    externalId: 'CR92037300110010000087',
    savingsProductName: 'anvay',
    clientName: 'an kh',
    clientAccountNo: '000000001',
    currency: {
      code: 'USD'
    },
    status: {
      code: 'savingsAccountStatusType.active',
      value: 'Active',
      rejected: false,
      submittedAndPendingApproval: false
    },
    subStatus: {
      block: false,
      value: ''
    },
    summary: {
      accountBalance: 180,
      availableBalance: 180
    },
    ...overrides
  });

  const setup = async (accountData = savingsAccountData()) => {
    localStorage.setItem('mifosXLanguage', JSON.stringify({ code: 'en-US' }));

    await TestBed.configureTestingModule({
      imports: [
        ViewTransactionComponent,
        RouterTestingModule,
        IconsModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              savingsAccountData: accountData,
              transactionDatatables: [{ registeredTableName: 'Rastro valida credito' }]
            }),
            snapshot: {
              params: {
                savingAccountId: '87'
              }
            },
            parent: null
          }
        },
        {
          provide: MatDialog,
          useValue: {}
        },
        {
          provide: AuthenticationService,
          useValue: {
            getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] }))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTransactionComponent);
    fixture.detectChanges();
  };

  const text = () => fixture.nativeElement.textContent;

  it('renders the savings account profile header on the transaction detail page', async () => {
    await setup();

    expect(text()).toContain('labels.inputs.Savings Product');
    expect(text()).toContain('anvay');
    expect(text()).toContain('labels.inputs.Account Number');
    expect(text()).toContain('000000001');
    expect(text()).toContain('labels.inputs.External Id');
    expect(text()).toContain('CR92037300110010000087');
    expect(text()).toContain('an kh');
    expect(text()).toContain('labels.heading.Account Overview');
    expect(text()).toContain('labels.inputs.Current Balance');
    expect(text()).toContain('labels.inputs.Available Balance');
  });

  it('does not render the client avatar profile metadata on transaction detail', async () => {
    await setup();

    expect(text()).not.toContain('labels.inputs.Office');
    expect(text()).not.toContain('labels.inputs.Staff');
    expect(fixture.nativeElement.querySelector('img.profile-image')?.getAttribute('src')).toBe(
      'assets/images/savings_account_placeholder.png'
    );
  });

  it('keeps existing transaction tabs rendered', async () => {
    await setup();

    expect(text()).toContain('labels.heading.General');
    expect(text()).toContain('Rastro valida credito');
  });
});

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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import en from '../../../../../assets/translations/en-US.json';
import es from '../../../../../assets/translations/es-MX.json';
import { describe, expect, it, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { IconsModule } from 'app/shared/icons.module';
import { ViewTransactionComponent } from './view-transaction.component';

describe('Savings ViewTransactionComponent', () => {
  let fixture: ComponentFixture<ViewTransactionComponent>;
  let routeData: BehaviorSubject<Record<string, unknown>>;

  const savingsAccountData = (overrides: Record<string, unknown> = {}) => ({
    id: 101,
    accountNo: '0000067',
    externalId: 'CR-DEMO-000067',
    savingsProductName: 'Demo Savings',
    clientName: 'Synthetic Customer',
    clientAccountNo: '000000101',
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

    routeData = new BehaviorSubject<Record<string, unknown>>({
      savingsAccountData: accountData,
      transactionDatatables: [{ registeredTableName: 'Demo transaction table' }]
    });

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
            data: routeData.asObservable(),
            snapshot: {
              params: {
                savingAccountId: '101'
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

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', en);
    translate.setTranslation('es-MX', es);
    translate.use('en-US');

    fixture = TestBed.createComponent(ViewTransactionComponent);
    fixture.detectChanges();
  };

  const text = () => fixture.nativeElement.textContent;

  it('renders the savings account profile header on the transaction detail page', async () => {
    await setup();

    expect(text()).toContain('Savings Product');
    expect(text()).toContain('Demo Savings');
    expect(text()).toContain('Account Number');
    expect(text()).toContain('0000067');
    expect(text()).toContain('External Id');
    expect(text()).toContain('CR-DEMO-000067');
    expect(text()).toContain('Synthetic Customer');
    expect(text()).toContain('Account Overview');
    expect(text()).toContain('Current Balance');
    expect(text()).toContain('Available Balance');
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

    expect(text()).toContain('General');
    expect(text()).toContain('Demo transaction table');
  });

  it('renders exactly one account External Id between the account number and client name', async () => {
    await setup();
    const rows = fixture.nativeElement.querySelectorAll('.external-id-row');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toMatch(/External Id\s*:\s*CR-DEMO-000067/);
    const summary = text();
    expect(summary.indexOf('Account Number')).toBeLessThan(summary.indexOf('External Id'));
    expect(summary.indexOf('External Id')).toBeLessThan(summary.indexOf('Synthetic Customer'));
  });

  it.each([
    null,
    undefined,
    ''
  ])('omits an empty External Id (%s)', async (externalId) => {
    await setup(savingsAccountData({ externalId }));
    expect(fixture.nativeElement.querySelector('.external-id-row')).toBeNull();
    expect(text()).not.toMatch(/null|undefined/);
    expect(text()).toContain('Synthetic Customer');
  });

  it('omits the row when the API omits externalId', async () => {
    const account = savingsAccountData();
    delete account.externalId;
    await setup(account);
    expect(fixture.nativeElement.querySelector('.external-id-row')).toBeNull();
  });

  it('preserves the string zero', async () => {
    await setup(savingsAccountData({ externalId: '0' }));
    expect(fixture.nativeElement.querySelector('.external-id-row').textContent).toContain('0');
  });

  it('uses the account identifier even when resolved client and transaction IDs differ', async () => {
    await setup(savingsAccountData({ externalId: 'ACCOUNT-DEMO-001' }));
    fixture.autoDetectChanges();
    routeData.next({
      ...routeData.value,
      clientData: { externalId: 'CLIENT-DEMO-001' },
      savingsAccountTransaction: { externalId: 'TX-DEMO-001' }
    });
    await fixture.whenStable();
    expect(text()).toContain('ACCOUNT-DEMO-001');
    expect(text()).not.toContain('CLIENT-DEMO-001');
    expect(text()).not.toContain('TX-DEMO-001');
  });

  it('refreshes the OnPush summary on reused-route account changes, including an absent ID', async () => {
    await setup();
    fixture.autoDetectChanges();
    routeData.next({
      ...routeData.value,
      savingsAccountData: savingsAccountData({ id: 102, accountNo: '0000068', externalId: 'CR-DEMO-000068' })
    });
    await fixture.whenStable();
    expect(text()).toContain('CR-DEMO-000068');
    expect(text()).not.toContain('CR-DEMO-000067');
    expect(text()).toContain('0000068');
    routeData.next({ ...routeData.value, savingsAccountData: savingsAccountData({ externalId: null }) });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.external-id-row')).toBeNull();
  });

  it('renders the full long identifier as selectable text', async () => {
    const externalId = 'ACCOUNT-DEMO-' + 'X'.repeat(88);
    await setup(savingsAccountData({ externalId }));
    expect(fixture.nativeElement.querySelector('.external-id-row').textContent).toContain(externalId);
  });

  it('uses the existing Spanish label without a raw translation key', async () => {
    await setup();
    TestBed.inject(TranslateService).use('es-MX');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.external-id-row').textContent).toContain('Id externo');
    expect(text()).not.toContain('labels.inputs.External Id');
  });
});

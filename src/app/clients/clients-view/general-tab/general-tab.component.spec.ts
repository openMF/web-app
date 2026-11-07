/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ClientsService } from 'app/clients/clients.service';
import { ReportsService } from 'app/reports/reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { GeneralTabComponent } from './general-tab.component';

@Component({ imports: [GeneralTabComponent], template: '<mifosx-general-tab />' })
class HostComponent {}

const saving = (id: number, state = 'submitted.and.pending.approval', depositType = 'Fixed Deposit') => ({
  id,
  accountNo: String(id).padStart(9, '0'),
  productId: 1362,
  productName: 'INVERSION TOTAL',
  depositType: { value: depositType },
  status: {
    code: `savingsAccountStatusType.${state}`,
    value: state,
    submittedAndPendingApproval: state === 'submitted.and.pending.approval',
    active: state === 'active',
    closed: state === 'closed'
  },
  currency: { code: 'USD' },
  timeline: { submittedOnDate: [
      2026,
      10,
      1
    ] }
});

const originalAccounts = () => ({
  savingsAccounts: [
    saving(1, 'active', 'Savings'),
    ...[
      2,
      3,
      4,
      5
    ].map((id) => saving(id))
  ]
});

describe('GeneralTabComponent accounts', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: GeneralTabComponent;
  let routeData: BehaviorSubject<any>;

  beforeEach(async () => {
    routeData = new BehaviorSubject({ clientAccountsData: originalAccounts() });
    await TestBed.configureTestingModule({
      imports: [
        HostComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([]),
        DatePipe,
        DecimalPipe,
        { provide: ClientsService, useValue: {} },
        { provide: ReportsService, useValue: {} },
        { provide: AlertService, useValue: {} },
        { provide: SettingsService, useValue: { decimals: 2, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } },
        {
          provide: ActivatedRoute,
          useFactory: (router: Router) => ({
            snapshot: router.routerState.root.snapshot,
            data: routeData,
            parent: { snapshot: { params: { clientId: '42' } } }
          }),
          deps: [Router]
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.query(By.directive(GeneralTabComponent)).componentInstance;
  });

  const rows = () => Array.from(fixture.nativeElement.querySelectorAll('.account-row')) as HTMLElement[];
  function select(type: string) {
    const index = [
      'all',
      'loan',
      'savings',
      'fixed',
      'recurring',
      'shares'
    ].indexOf(type);
    fixture.nativeElement.querySelectorAll('.at-tab')[index].click();
    fixture.detectChanges();
  }
  function toggleClosed() {
    fixture.nativeElement.querySelector('.toggle-pill').click();
    fixture.detectChanges();
  }
  function load(accounts: any) {
    routeData.next({ clientAccountsData: accounts });
    fixture.detectChanges();
  }
  function count(type: string): number {
    const index = [
      'all',
      'loan',
      'savings',
      'fixed',
      'recurring',
      'shares'
    ].indexOf(type);
    return Number(fixture.nativeElement.querySelectorAll('.at-count')[index].textContent.trim());
  }

  it('renders all five authorized records, including four distinct FD accounts sharing one product', () => {
    expect(count('all')).toBe(5);
    expect(count('savings')).toBe(1);
    expect(count('fixed')).toBe(4);
    select('fixed');
    expect(rows()).toHaveLength(4);
    expect(rows().map((r) => r.querySelector('mifosx-account-number')?.textContent?.trim())).toEqual([
      '000000002',
      '000000003',
      '000000004',
      '000000005'
    ]);
    expect(new Set(component.savingAccounts.map((a) => a.id)).size).toBe(5);
    // Tailwind's global .fixed utility removes rows AND their contents from flow.
    expect(fixture.nativeElement.querySelector('.accounts-card .fixed')).toBeNull();
    expect(rows().every((r) => r.textContent?.includes('INVERSION TOTAL'))).toBe(true);
  });

  it.each([
    0,
    1
  ])('renders exactly %i FD records and the corresponding empty state', (size) => {
    load({ savingsAccounts: [saving(2)].slice(0, size) });
    select('fixed');
    expect(count('fixed')).toBe(size);
    expect(rows()).toHaveLength(size);
    expect(fixture.nativeElement.querySelectorAll('.acc-empty')).toHaveLength(size === 0 ? 1 : 0);
  });

  it('keeps pending, approved, active and matured accounts eligible with their original statuses', () => {
    const accounts = [
      'submitted.and.pending.approval',
      'approved',
      'active',
      'matured'
    ].map((s, i) => saving(i + 2, s));
    load({ savingsAccounts: accounts });
    select('fixed');
    expect(rows()).toHaveLength(4);
    expect(rows().map((r) => r.querySelector('.status-pill')?.textContent?.trim())).toEqual(
      accounts.map((a) => `labels.catalogs.${a.status.value}`)
    );
    expect(component.savingAccounts).toBe(accounts);
  });

  it('switches between non-closed and closed subsets, keeping every counter consistent', () => {
    load({ savingsAccounts: [
        saving(2),
        saving(3, 'approved'),
        saving(4, 'active'),
        saving(5, 'closed')
      ] });
    select('fixed');
    expect(count('fixed')).toBe(3);
    expect(rows()).toHaveLength(3);
    toggleClosed();
    expect(count('all')).toBe(1);
    expect(count('fixed')).toBe(1);
    expect(rows()).toHaveLength(1);
    expect(rows()[0].textContent).toContain('000000005');
    select('savings');
    expect(count('savings')).toBe(0);
    expect(rows()).toHaveLength(0);
    select('fixed');
    expect(rows()).toHaveLength(1);
    toggleClosed();
    expect(count('fixed')).toBe(3);
    expect(rows()).toHaveLength(3);
  });

  it.each([
    'rejected',
    'withdrawn.by.applicant',
    'pre.mature.closure'
  ])('preserves the existing closed-group treatment of %s', (state) => {
    load({ savingsAccounts: [
        saving(2),
        saving(3, state)
      ] });
    select('fixed');
    expect(count('fixed')).toBe(1);
    expect(rows()).toHaveLength(1);
    toggleClosed();
    expect(count('fixed')).toBe(1);
    expect(rows()[0].textContent).toContain('000000003');
  });

  it('preserves all category tabs and repeated selection without duplicates or stale counts', () => {
    load({
      savingsAccounts: [
        ...originalAccounts().savingsAccounts,
        saving(6, 'active', 'Recurring Deposit')
      ],
      loanAccounts: [{ id: 20, status: { code: 'loanStatusType.active' } }],
      shareAccounts: [{ id: 30, status: { code: 'shareAccountStatusType.active' } }]
    });
    for (const [
      type,
      size
    ] of [
      [
        'all',
        8
      ],
      [
        'loan',
        1
      ],
      [
        'savings',
        1
      ],
      [
        'fixed',
        4
      ],
      [
        'recurring',
        1
      ],
      [
        'shares',
        1
      ],
      [
        'all',
        8
      ],
      [
        'fixed',
        4
      ],
      [
        'savings',
        1
      ],
      [
        'fixed',
        4
      ]
    ] as const) {
      select(type);
      expect(count(type)).toBe(size);
      expect(rows()).toHaveLength(size);
    }
  });

  it('updates an already checked OnPush child after asynchronous route data arrives', async () => {
    select('fixed');
    await Promise.resolve();
    load({ savingsAccounts: [
        saving(9),
        saving(10)
      ] });
    expect(count('fixed')).toBe(2);
    expect(rows()).toHaveLength(2);
    expect(rows()[0].textContent).toContain('000000009');
    load({});
    expect(count('all')).toBe(0);
    expect(rows()).toHaveLength(0);
  });

  it('uses each original account ID in its details and approval navigation', () => {
    select('fixed');
    const links = fixture.debugElement.queryAll(By.css('.account-row')).map((r) => r.injector.get(RouterLink));
    for (const [
      index,
      link
    ] of links.entries()) {
      expect(link.urlTree?.toString()).toBe(`/fixed-deposits-accounts/${index + 2}/general`);
    }
    const approval = fixture.debugElement.queryAll(By.css('.row-action')).map((r) => r.injector.get(RouterLink));
    expect(approval[2].urlTree?.toString()).toBe('/fixed-deposits-accounts/4/actions/Approve');
  });

  it('does not invent balances or records absent from the authorized response', () => {
    load({ savingsAccounts: [saving(123)] });
    select('fixed');
    expect(count('all')).toBe(1);
    expect(rows()).toHaveLength(1);
    expect(rows()[0].querySelector('.acc-balance-value')?.textContent?.trim()).toBe('');
    expect(component.savingAccounts[0].id).toBe(123);
  });
});

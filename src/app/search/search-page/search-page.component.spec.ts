/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Clipboard } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCopy, faEye } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';
import { describe, expect, it, jest } from '@jest/globals';

import { AlertService } from 'app/core/alert/alert.service';
import { SearchData } from '../search.model';
import { SearchPageComponent } from './search-page.component';

describe('SearchPageComponent', () => {
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;
  let router: { navigate: jest.Mock };

  const setup = async (searchResults: SearchData[]) => {
    router = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        SearchPageComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ searchResults })
          }
        },
        { provide: Router, useValue: router },
        { provide: AlertService, useValue: { alert: jest.fn() } },
        { provide: Clipboard, useValue: { copy: jest.fn() } },
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPageComponent);
    TestBed.inject(FaIconLibrary).addIcons(faCopy, faEye);
    TestBed.inject(TranslateService).setTranslation('en', {
      labels: {
        inputs: {
          Client: 'Client',
          Group: 'Group',
          Office: 'Office'
        }
      }
    });
    TestBed.inject(TranslateService).use('en');
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const searchResult = (overrides: Partial<SearchData>): SearchData => ({
    entityId: 10,
    entityAccountNo: '000000010',
    entityExternalId: 'entity-ext',
    entityName: 'Working Capital',
    entityType: 'LOAN',
    parentId: 20,
    parentName: 'Asha Client',
    entityStatus: {
      id: 300,
      code: 'loanStatusType.active',
      value: 'Active'
    },
    parentType: 'client',
    subEntityType: '',
    ...overrides
  });

  const tableText = () => (fixture.nativeElement as HTMLElement).textContent || '';

  it('renders loan transaction rows with transaction id, account number, owner, and external id', async () => {
    await setup([
      searchResult({
        entityType: 'LOAN_TRANSACTION',
        entityExternalId: 'txn-ext-001',
        transactionId: 501,
        transactionType: 'repayment',
        transactionExternalId: 'txn-ext-001',
        accountId: 10,
        accountNo: 'LN-00010',
        accountType: 'loan'
      })
    ]);

    expect(tableText()).toContain('Repayment #501');
    expect(tableText()).toContain('LN-00010');
    expect(tableText()).toContain('Asha Client');
    expect(tableText()).toContain('txn-ext-001');
  });

  it('renders savings transaction rows with reference number when external id is missing', async () => {
    await setup([
      searchResult({
        entityType: 'SAVINGS_TRANSACTION',
        entityExternalId: '',
        entityName: 'Voluntary Savings',
        parentName: 'Market Group',
        parentType: 'group',
        transactionId: 777,
        transactionType: 'withdrawal',
        transactionExternalId: '',
        transactionRefNo: 'ref-777',
        accountId: 11,
        accountNo: 'SV-00011',
        accountType: 'savings'
      })
    ]);

    expect(tableText()).toContain('Withdrawal #777');
    expect(tableText()).toContain('SV-00011');
    expect(tableText()).toContain('Group');
    expect(tableText()).toContain('Market Group');
    expect(tableText()).toContain('ref-777');
  });

  it('does not render undefined or null when optional transaction fields are missing', async () => {
    await setup([
      searchResult({
        entityType: 'SAVINGS_TRANSACTION',
        entityExternalId: undefined,
        parentName: undefined,
        transactionId: undefined,
        transactionType: undefined,
        transactionExternalId: undefined,
        transactionRefNo: undefined,
        accountId: undefined,
        accountNo: undefined,
        accountType: 'savings'
      })
    ]);

    expect(tableText()).not.toContain('undefined');
    expect(tableText()).not.toContain('null');
  });

  it('navigates client-owned loan transactions with separate account and transaction ids', async () => {
    await setup([]);
    const entity = searchResult({
      entityType: 'LOAN_TRANSACTION',
      parentId: 42,
      parentType: 'client',
      transactionId: 501,
      accountId: 10
    });

    component.navigate(entity);

    expect(router.navigate).toHaveBeenCalledWith([
      'clients',
      42,
      'loans-accounts',
      10,
      'transactions',
      501
    ]);
  });

  it('navigates group-owned loan transactions with separate account and transaction ids', async () => {
    await setup([]);
    const entity = searchResult({
      entityType: 'LOAN_TRANSACTION',
      parentId: 43,
      parentType: 'group',
      transactionId: 502,
      accountId: 12
    });

    component.navigate(entity);

    expect(router.navigate).toHaveBeenCalledWith([
      'groups',
      43,
      'loans-accounts',
      12,
      'transactions',
      502
    ]);
  });

  it('navigates client-owned savings transactions to the general tab', async () => {
    await setup([]);
    const entity = searchResult({
      entityType: 'SAVINGS_TRANSACTION',
      parentId: 42,
      parentType: 'client',
      transactionId: 776,
      accountId: 13
    });

    component.navigate(entity);

    expect(router.navigate).toHaveBeenCalledWith([
      'clients',
      42,
      'savings-accounts',
      13,
      'transactions',
      776,
      'general'
    ]);
  });

  it('navigates group-owned savings transactions to the general tab', async () => {
    await setup([]);
    const entity = searchResult({
      entityType: 'SAVINGS_TRANSACTION',
      parentId: 43,
      parentType: 'group',
      transactionId: 777,
      accountId: 11
    });

    component.navigate(entity);

    expect(router.navigate).toHaveBeenCalledWith([
      'groups',
      43,
      'savings-accounts',
      11,
      'transactions',
      777,
      'general'
    ]);
  });

  it('preserves existing non-transaction loan navigation', async () => {
    await setup([]);

    component.navigate(
      searchResult({
        entityType: 'LOAN',
        entityId: 10,
        parentId: 42
      })
    );

    expect(router.navigate).toHaveBeenCalledWith([
      'clients',
      42,
      'loans-accounts',
      10,
      'general'
    ]);
  });
});

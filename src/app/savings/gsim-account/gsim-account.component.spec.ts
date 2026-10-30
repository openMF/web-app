/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { GsimAccountComponent } from './gsim-account.component';

describe('GsimAccountComponent', () => {
  /** Member accounts of one GSIM account as GET /groups/{groupId}/gsimaccounts returns them. */
  const members = [
    {
      id: 19,
      displayName: '(8) Saver',
      accountNo: '0000000191',
      status: { code: 'savingsAccountStatusType.active', value: 'Active', active: true }
    },
    {
      id: 20,
      displayName: '(9) Pending',
      accountNo: '0000000192',
      status: {
        code: 'savingsAccountStatusType.submitted.and.pending.approval',
        value: 'Submitted',
        submittedAndPendingApproval: true
      }
    },
    {
      id: 21,
      displayName: '(10) Approved',
      accountNo: '0000000193',
      status: { code: 'savingsAccountStatusType.approved', value: 'Approved', approved: true, active: false }
    }
  ];

  function render() {
    TestBed.configureTestingModule({
      imports: [
        GsimAccountComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { parent: { params: of({ groupId: '6' }) } },
            data: of({
              gsimData: [{ childGSIMAccounts: members }],
              savingAccountData: {
                accountNo: '0000000191',
                status: { code: 'savingsAccountStatusType.active', value: 'Active' }
              },
              groupsData: {}
            })
          }
        }
      ]
    });
    const fixture = TestBed.createComponent(GsimAccountComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('opens the member account actions under the group, where the savings routes live', () => {
    const fixture = render();
    const router = TestBed.inject(Router);
    const navigate = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    for (const icon of [
      'fa-arrow-up',
      'fa-check',
      'fa-check-circle',
      'fa-undo'
    ]) {
      fixture.nativeElement.querySelector(`button:has(i.${icon})`).click();
    }

    expect(navigate.mock.calls.map(([url]) => router.serializeUrl(url as any))).toEqual([
      '/groups/6/savings-accounts/19/actions/Deposit',
      '/groups/6/savings-accounts/20/actions/Approve',
      '/groups/6/savings-accounts/21/actions/Activate',
      '/groups/6/savings-accounts/21/actions/Undo%20Approval'
    ]);
  });

  it('opens the transactions of an active member account under the group', () => {
    const fixture = render();
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance.onRowClick(members[0] as any);

    expect(navigate).toHaveBeenCalledWith([
      '/groups',
      '6',
      'savings-accounts',
      19,
      'transactions'
    ]);
  });
});

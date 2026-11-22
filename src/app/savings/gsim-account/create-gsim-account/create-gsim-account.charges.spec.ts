/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe, registerLocaleData } from '@angular/common';
import localeEN from '@angular/common/locales/en';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { GroupsService } from 'app/groups/groups.service';
import { SettingsService } from 'app/settings/settings.service';
import { SavingsService } from '../../savings.service';
import { CreateGsimAccountComponent } from './create-gsim-account.component';

registerLocaleData(localeEN);

describe('CreateGsimAccountComponent charges', () => {
  /** Charges as the charges step holds them after the user picked their dates. */
  const pickedCharges = [
    { id: 9, amount: 15, chargeTimeType: { value: 'Specified due date' }, dueDate: new Date(2026, 9, 25) },
    { id: 4, amount: 10, chargeTimeType: { value: 'Annual Fee' }, feeOnMonthDay: '15 March 2027' },
    { id: 7, amount: 5, chargeTimeType: { value: 'Monthly Fee' }, feeOnMonthDay: '05 November 2027', feeInterval: 2 }
  ];

  /** Builds the request bodies for a GSIM application of two members with the given charges. */
  function bodies(charges: any[] = pickedCharges): any[] {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ savingsAccountTemplate: { groupId: 6 }, groupsData: { activeClientMembers: [] } }) }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: SavingsService, useValue: {} },
        // only submit() looks the new GSIM account up; building the request bodies never calls it
        { provide: GroupsService, useValue: {} },
        { provide: SettingsService, useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' } },
        Dates,
        DatePipe
      ]
    });
    const component = TestBed.runInInjectionContext(() => new CreateGsimAccountComponent());
    const members = [
      { id: 8, selected: true },
      { id: 9, selected: true }
    ];
    component.savingsActiveClientMembers = { selectedClientMembers: { selectedMembers: members } } as any;
    component.savingsAccountDetailsStep = {
      savingsAccountDetails: { productId: 1, submittedOnDate: new Date(2026, 9, 20) }
    } as any;
    component.savingsAccountTermsStep = { savingsAccountTerms: {} } as any;
    component.savingsAccountChargesStep = { savingsAccountCharges: { charges } } as any;
    // the preview step reads savingsAccount, which takes the selection from the members step
    expect(component.savingsAccount.productId).toBe(1);
    return component.buildRequestData();
  }

  it('sends the due date, fee day and fee interval of every charge for every member', () => {
    const expected: any[] = [
      {
        chargeId: 9,
        amount: 15,
        dueDate: '25 October 2026',
        feeOnMonthDay: undefined,
        feeInterval: undefined
      },
      { chargeId: 4, amount: 10, dueDate: undefined, feeOnMonthDay: '15 March', feeInterval: undefined },
      { chargeId: 7, amount: 5, dueDate: undefined, feeOnMonthDay: '05 November', feeInterval: 2 }
    ];

    for (const body of bodies()) {
      expect(body.charges).toEqual(expected);
      expect(body.monthDayFormat).toBe('dd MMMM');
    }
  });

  it('sends the [month, day] of a charge template as a day and month', () => {
    const feeOnMonthDay = [
      7,
      22
    ];
    const charges = [{ id: 4, amount: 10, chargeTimeType: { value: 'Annual Fee' }, feeOnMonthDay, feeInterval: 1 }];

    for (const body of bodies(charges)) {
      expect(body.charges[0].feeOnMonthDay).toBe('22 July');
    }
  });
});

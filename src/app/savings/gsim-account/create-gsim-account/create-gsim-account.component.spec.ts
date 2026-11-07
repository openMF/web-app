/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { GroupsService } from 'app/groups/groups.service';
import { SettingsService } from 'app/settings/settings.service';
import { SavingsService } from '../../savings.service';
import { CreateGsimAccountComponent } from './create-gsim-account.component';

describe('CreateGsimAccountComponent', () => {
  let router: { navigate: jest.Mock };
  let savingsService: { createGsimAcccount: jest.Mock };
  let groupsService: { getGSIMAccountsData: jest.Mock };

  /** Builds the component with the given number of selected group members. */
  function create(memberCount: number): CreateGsimAccountComponent {
    router = { navigate: jest.fn() };
    // POST /savingsaccounts/gsim answers with the savings id of the last member and the id of the GSIM account
    savingsService = { createGsimAcccount: jest.fn().mockReturnValue(of({ resourceId: 21, gsimId: 3 })) };
    groupsService = {
      getGSIMAccountsData: jest.fn().mockReturnValue(
        of([
          { gsimId: 1, accountNumber: '000000014' },
          { gsimId: 3, accountNumber: '000000019' }
        ])
      )
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ savingsAccountTemplate: { groupId: 6 }, groupsData: { activeClientMembers: [] } }) }
        },
        { provide: Router, useValue: router },
        { provide: SavingsService, useValue: savingsService },
        { provide: GroupsService, useValue: groupsService },
        { provide: SettingsService, useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' } },
        { provide: Dates, useValue: { formatDate: (): string => '20 October 2026' } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new CreateGsimAccountComponent());
    const members = Array.from({ length: memberCount }, (_, index) => ({ id: index + 8, selected: true }));
    component.savingsActiveClientMembers = { selectedClientMembers: { selectedMembers: members } } as any;
    component.savingsAccountDetailsStep = {
      savingsAccountDetails: { productId: 1, submittedOnDate: new Date() }
    } as any;
    component.savingsAccountTermsStep = { savingsAccountTerms: {} } as any;
    component.savingsAccountChargesStep = { savingsAccountCharges: { charges: [] } } as any;
    // the preview step reads savingsAccount, which takes the selection from the members step
    expect(component.savingsAccount.productId).toBe(1);
    return component;
  }

  it('links all members to one application: the first is the parent and the last one closes it', () => {
    const bodies = create(3).buildRequestData();

    expect(bodies.map((body) => body.clientId)).toEqual([
      8,
      9,
      10
    ]);
    expect(bodies.map((body) => body.isParentAccount)).toEqual([
      true,
      false,
      false
    ]);
    expect(bodies.map((body) => body.lastApplication)).toEqual([
      undefined,
      undefined,
      true
    ]);
    expect(new Set(bodies.map((body) => body.applicationId)).size).toBe(1);
    expect(bodies[0].applicationId).toBeGreaterThan(0);
  });

  it('marks a single-member application as both parent and last', () => {
    const [body] = create(1).buildRequestData();

    expect(body.isParentAccount).toBe(true);
    expect(body.lastApplication).toBe(true);
  });

  it('uses a new application id for every application', () => {
    const first = create(1).buildRequestData()[0].applicationId;
    TestBed.resetTestingModule();

    expect(create(1).buildRequestData()[0].applicationId).not.toBe(first);
  });

  it('opens the new GSIM account by its account number after submitting', () => {
    const component = create(3);

    component.submit();

    expect(savingsService.createGsimAcccount).toHaveBeenCalledWith({ clientArray: expect.any(Array) });
    expect(groupsService.getGSIMAccountsData).toHaveBeenCalledWith(6);
    expect(router.navigate).toHaveBeenCalledWith(
      [
        '../',
        '000000019'
      ],
      expect.anything()
    );
  });

  it('opens the group page when the new GSIM account is not in the list', () => {
    const component = create(3);
    groupsService.getGSIMAccountsData.mockReturnValue(of([{ gsimId: 1, accountNumber: '000000014' }]));

    component.submit();

    expect(router.navigate).toHaveBeenCalledWith([
      '/groups',
      6,
      'general'
    ]);
  });

  it('opens the group page when loading the GSIM accounts fails after they were created', () => {
    const component = create(3);
    groupsService.getGSIMAccountsData.mockReturnValue(throwError(() => new Error('lookup failed')));

    component.submit();

    expect(router.navigate).toHaveBeenCalledWith([
      '/groups',
      6,
      'general'
    ]);
  });
});

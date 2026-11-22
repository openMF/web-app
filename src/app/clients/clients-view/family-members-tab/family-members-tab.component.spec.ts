/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { FamilyMembersTabComponent } from './family-members-tab.component';
import { ClientsService } from 'app/clients/clients.service';

describe('FamilyMembersTabComponent', () => {
  const familyMemberOptions = {
    relationshipIdOptions: [{ id: 1, name: 'Father' }],
    genderIdOptions: [{ id: 2, name: 'Female' }],
    maritalStatusIdOptions: [{ id: 3, name: 'Married' }],
    professionIdOptions: [{ id: 4, name: 'Farmer' }]
  };
  // The client template carries the family-member options one level down, next to its other options.
  const clientTemplate = { officeOptions: [{ id: 1, name: 'Head Office' }], familyMemberOptions };

  let component: FamilyMembersTabComponent;
  let clientsService: { getClientTemplate: jest.Mock; getClientFamilyMembers: jest.Mock };
  let dialog: { open: jest.Mock };

  beforeEach(() => {
    clientsService = {
      getClientTemplate: jest.fn(() => of(clientTemplate)),
      getClientFamilyMembers: jest.fn(() => of([]))
    };
    // The user cancels, so nothing is saved.
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(undefined) })) };

    TestBed.configureTestingModule({
      imports: [
        FamilyMembersTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ clientFamilyMembers: [] }),
            snapshot: { pathFromRoot: [{ paramMap: convertToParamMap({ clientId: '793' }) }] }
          }
        },
        { provide: ClientsService, useValue: clientsService }
      ]
    });
    TestBed.overrideProvider(MatDialog, { useValue: dialog });
    component = TestBed.createComponent(FamilyMembersTabComponent).componentInstance;
  });

  it('opens Add with the family-member options on the first open', () => {
    component.addFamilyMember();

    const config = dialog.open.mock.calls[0][1] as any;
    expect(config.data.context).toBe('Add');
    expect(config.data.options).toBe(familyMemberOptions);
    expect(config.data.options.relationshipIdOptions).toEqual([{ id: 1, name: 'Father' }]);
  });

  it('opens Edit with the family-member options on the first open', () => {
    const member = { id: 9, clientId: 793 };

    component.editFamilyMember(member);

    const config = dialog.open.mock.calls[0][1] as any;
    expect(config.data.context).toBe('Edit');
    expect(config.data.member).toBe(member);
    expect(config.data.options.genderIdOptions).toEqual([{ id: 2, name: 'Female' }]);
  });

  it('reuses the saved options on the second open without fetching the template again', () => {
    component.addFamilyMember();
    component.addFamilyMember();

    expect(clientsService.getClientTemplate).toHaveBeenCalledTimes(1);
    expect((dialog.open.mock.calls[1][1] as any).data.options).toBe(familyMemberOptions);
  });
});

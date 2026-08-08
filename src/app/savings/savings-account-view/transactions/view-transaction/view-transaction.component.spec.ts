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

import { ClientsService } from 'app/clients/clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ViewTransactionComponent } from './view-transaction.component';

describe('Savings ViewTransactionComponent', () => {
  let fixture: ComponentFixture<ViewTransactionComponent>;
  let clientsService: { getClientProfileImage: jest.Mock };

  const clientViewData = (overrides: any = {}) => ({
    id: 90,
    displayName: 'Grace Hopper',
    officeName: 'Head Office',
    accountNo: '000000090',
    externalId: 'EXT-90',
    staffName: 'Ada Lovelace',
    mobileNo: '5551234567',
    emailAddress: 'grace@example.com',
    status: { code: 'clientStatusType.active', value: 'Active' },
    groups: [],
    ...overrides
  });

  const setup = async (clientData: any = clientViewData()) => {
    localStorage.setItem('mifosXLanguage', JSON.stringify({ code: 'en-US' }));
    clientsService = {
      getClientProfileImage: jest.fn(() => of(null))
    };

    const clientRoute: any = {
      snapshot: {
        data: {
          clientViewData: clientData
        }
      },
      parent: null
    };
    const savingsRoute = {
      snapshot: { data: {} },
      parent: clientRoute
    };

    await TestBed.configureTestingModule({
      imports: [
        ViewTransactionComponent,
        RouterTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ transactionDatatables: [{ registeredTableName: 'Rastro valida credito' }] }),
            snapshot: {
              params: {
                savingAccountId: '87'
              }
            },
            parent: savingsRoute
          }
        },
        {
          provide: ClientsService,
          useValue: clientsService
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

  it('renders the customer header on the transaction detail page', async () => {
    await setup();

    expect(text()).toContain('labels.inputs.Client Name');
    expect(text()).toContain('Grace Hopper');
    expect(text()).toContain('Head Office');
    expect(text()).toContain('000000090');
    expect(text()).toContain('EXT-90');
    expect(text()).toContain('Ada Lovelace');
    expect(text()).toContain('5551234567');
    expect(text()).toContain('grace@example.com');
    expect(clientsService.getClientProfileImage).toHaveBeenCalledWith(90);
  });

  it('does not break when optional customer fields are missing', async () => {
    await setup(
      clientViewData({
        externalId: undefined,
        staffName: undefined,
        mobileNo: undefined,
        emailAddress: undefined,
        groups: undefined
      })
    );

    expect(text()).toContain('Grace Hopper');
    expect(text()).toContain('labels.inputs.Unassigned');
    expect(text()).toContain('labels.heading.General');
  });

  it('keeps existing transaction tabs rendered', async () => {
    await setup();

    expect(text()).toContain('labels.heading.General');
    expect(text()).toContain('Rastro valida credito');
  });
});

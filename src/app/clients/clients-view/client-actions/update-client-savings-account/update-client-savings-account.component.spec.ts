/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UpdateClientSavingsAccountComponent } from './update-client-savings-account.component';
import { ClientsService } from 'app/clients/clients.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ClientActionNotifierService } from '../client-action-notifier.service';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('UpdateClientSavingsAccountComponent', () => {
  let component: UpdateClientSavingsAccountComponent;
  let fixture: ComponentFixture<UpdateClientSavingsAccountComponent>;

  let clientsService: jest.Mocked<ClientsService>;
  let notifier: jest.Mocked<ClientActionNotifierService>;

  const clientId = '456';
  const clientData = {
    id: clientId,
    savingsAccountId: 10,
    savingAccountOptions: [{ id: 10, accountNo: 'SA001' }]
  };

  const setup = async () => {
    clientsService = {
      executeClientCommand: jest.fn(() => of({}))
    } as any;

    notifier = { notifyAndNavigate: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [
        UpdateClientSavingsAccountComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ clientActionData: clientData })
          }
        },
        { provide: ClientsService, useValue: clientsService },
        { provide: ClientActionNotifierService, useValue: notifier },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateClientSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(setup);

  it('should initialize correctly', () => {
    expect(component.clientData).toEqual(clientData);
    expect(component.savingsAccounts).toEqual(clientData.savingAccountOptions);
    expect(component.clientSavingsAccountForm).toBeDefined();
  });

  it('should pre-populate form with existing savings account', () => {
    expect(component.clientSavingsAccountForm.value.savingsAccountId).toBe(clientData.savingsAccountId);
  });

  it('should call API with updateSavingsAccount command on submit', () => {
    component.clientSavingsAccountForm.patchValue({ savingsAccountId: 10 });

    component.submit();

    expect(clientsService.executeClientCommand).toHaveBeenCalledWith(
      clientId,
      'updateSavingsAccount',
      expect.objectContaining({ savingsAccountId: 10 })
    );
  });

  it('should notify and navigate after successful submission', () => {
    component.submit();

    expect(notifier.notifyAndNavigate).toHaveBeenCalledWith(
      'clients.actions.updateSavingsAccount.success',
      TestBed.inject(ActivatedRoute)
    );
  });

  it('should not notify and navigate if API call fails', () => {
    clientsService.executeClientCommand.mockReturnValueOnce(throwError(() => new Error('API error')));

    component.submit();

    expect(notifier.notifyAndNavigate).not.toHaveBeenCalled();
  });
});

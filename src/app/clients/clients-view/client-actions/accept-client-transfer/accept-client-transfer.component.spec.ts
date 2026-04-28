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
import { AcceptClientTransferComponent } from './accept-client-transfer.component';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ClientActionNotifierService } from '../client-action-notifier.service';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('AcceptClientTransferComponent', () => {
  let component: AcceptClientTransferComponent;
  let fixture: ComponentFixture<AcceptClientTransferComponent>;

  let clientsService: Partial<jest.Mocked<ClientsService>>;
  let settingsService: Partial<SettingsService>;
  let dates: Partial<jest.Mocked<Dates>>;
  let notifier: Partial<jest.Mocked<ClientActionNotifierService>>;

  const clientId = '456';
  const transferDate = new Date(2025, 10, 1).toISOString();

  const setup = async () => {
    clientsService = {
      executeClientCommand: jest.fn(() => of({}))
    };

    settingsService = {
      language: { code: 'en' },
      dateFormat: 'dd MMMM yyyy'
    } as SettingsService;

    dates = {
      formatDate: jest.fn(() => '01 November 2025')
    };

    notifier = {
      notifyAndNavigate: jest.fn(),
      notify: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        AcceptClientTransferComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ clientActionData: transferDate }),
            parent: { snapshot: { params: { clientId } } }
          }
        },
        { provide: ClientsService, useValue: clientsService },
        { provide: SettingsService, useValue: settingsService },
        { provide: Dates, useValue: dates },
        { provide: ClientActionNotifierService, useValue: notifier },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AcceptClientTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(setup);

  it('should initialize correctly', () => {
    expect(component.clientId).toBe(clientId);
    expect(component.acceptClientTransferForm).toBeDefined();
  });

  it('should call API with acceptTransfer command on submit', () => {
    component.submit();

    expect(clientsService.executeClientCommand).toHaveBeenCalledWith(clientId, 'acceptTransfer', expect.any(Object));
  });

  it('should notify and navigate after successful submission', () => {
    component.submit();

    expect(notifier.notifyAndNavigate).toHaveBeenCalledWith(
      'clients.actions.acceptTransfer.success',
      TestBed.inject(ActivatedRoute)
    );
  });

  it('should notify failure if API call fails', () => {
    (clientsService.executeClientCommand as jest.Mock).mockReturnValueOnce(throwError(() => new Error('API error')));

    component.submit();

    expect(notifier.notify).toHaveBeenCalledWith('clients.actions.acceptTransfer.failure');
  });
});

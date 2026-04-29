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
import { ClientAssignStaffComponent } from './client-assign-staff.component';
import { ClientsService } from 'app/clients/clients.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ClientActionNotifierService } from '../client-action-notifier.service';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('ClientAssignStaffComponent', () => {
  let component: ClientAssignStaffComponent;
  let fixture: ComponentFixture<ClientAssignStaffComponent>;

  let clientsService: jest.Mocked<ClientsService>;
  let notifier: jest.Mocked<ClientActionNotifierService>;

  const clientId = '456';
  const clientData = { id: clientId, staffOptions: [{ id: 1, displayName: 'Staff A' }] };

  const setup = async () => {
    clientsService = {
      executeClientCommand: jest.fn(() => of({}))
    } as any;

    notifier = { notifyAndNavigate: jest.fn(), notify: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [
        ClientAssignStaffComponent,
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

    fixture = TestBed.createComponent(ClientAssignStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(setup);

  it('should initialize correctly', () => {
    expect(component.clientData).toEqual(clientData);
    expect(component.staffData).toEqual(clientData.staffOptions);
    expect(component.clientAssignStaffForm).toBeDefined();
  });

  it('should call API with assignStaff command on submit', () => {
    component.clientAssignStaffForm.patchValue({ staffId: 1 });

    component.submit();

    expect(clientsService.executeClientCommand).toHaveBeenCalledWith(
      clientId,
      'assignStaff',
      expect.objectContaining({ staffId: 1 })
    );
  });

  it('should notify and navigate after successful submission', () => {
    component.submit();

    expect(notifier.notifyAndNavigate).toHaveBeenCalledWith(
      'clients.actions.assignStaff.success',
      TestBed.inject(ActivatedRoute)
    );
  });

  it('should show failure notification if API call fails', () => {
    clientsService.executeClientCommand.mockReturnValueOnce(throwError(() => new Error('API error')));

    component.submit();

    expect(notifier.notifyAndNavigate).not.toHaveBeenCalled();
    expect(notifier.notify).toHaveBeenCalledWith('clients.actions.assignStaff.failure');
  });
});

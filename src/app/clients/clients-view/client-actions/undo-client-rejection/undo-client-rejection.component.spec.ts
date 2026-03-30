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
import { UndoClientRejectionComponent } from './undo-client-rejection.component';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ClientActionNotifierService } from '../client-action-notifier.service';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('UndoClientRejectionComponent', () => {
  let component: UndoClientRejectionComponent;
  let fixture: ComponentFixture<UndoClientRejectionComponent>;

  let clientsService: jest.Mocked<ClientsService>;
  let settingsService: SettingsService;
  let dates: jest.Mocked<Dates>;
  let notifier: jest.Mocked<ClientActionNotifierService>;

  const clientId = '456';
  const businessDate = new Date(2025, 11, 20);

  const setup = async () => {
    clientsService = {
      executeClientCommand: jest.fn(() => of({}))
    } as any;

    settingsService = {
      language: { code: 'en' },
      dateFormat: 'dd MMMM yyyy',
      businessDate
    } as any;

    dates = {
      formatDate: jest.fn(() => '20 March 2026')
    } as any;

    notifier = { notifyAndNavigate: jest.fn(), notify: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [
        UndoClientRejectionComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
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

    fixture = TestBed.createComponent(UndoClientRejectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillValidForm = (date: Date | string = new Date(2025, 10, 3)) => {
    component.undoClientRejectionForm.patchValue({ reopenedDate: date });
  };

  beforeEach(setup);

  it('should initialize correctly', () => {
    expect(component.clientId).toBe(clientId);
    expect(component.maxDate).toEqual(businessDate);
    expect(component.undoClientRejectionForm.valid).toBe(false);
  });

  it('should be invalid when required fields are missing', () => {
    expect(component.undoClientRejectionForm.valid).toBe(false);
  });

  it('should be valid when all required fields are provided', () => {
    fillValidForm();
    expect(component.undoClientRejectionForm.valid).toBe(true);
  });

  it('should submit and call API with formatted date', () => {
    const date = new Date(2025, 10, 3);
    fillValidForm(date);

    component.submit();

    expect(dates.formatDate).toHaveBeenCalledWith(date, 'dd MMMM yyyy');
    expect(clientsService.executeClientCommand).toHaveBeenCalledWith(
      clientId,
      'undoRejection',
      expect.objectContaining({
        reopenedDate: '20 March 2026',
        locale: 'en',
        dateFormat: 'dd MMMM yyyy'
      })
    );
  });

  it('should not format date if already a string', () => {
    fillValidForm('14 August 2025');

    component.submit();

    expect(dates.formatDate).not.toHaveBeenCalled();
  });

  it('should notify and navigate after successful submission', () => {
    fillValidForm();

    component.submit();

    expect(notifier.notifyAndNavigate).toHaveBeenCalledWith(
      'clients.actions.undoRejection.success',
      TestBed.inject(ActivatedRoute)
    );
  });

  it('should not notify and navigate if API call fails', () => {
    clientsService.executeClientCommand.mockReturnValueOnce(throwError(() => new Error('API error')));

    fillValidForm();

    component.submit();

    expect(notifier.notifyAndNavigate).not.toHaveBeenCalled();
    expect(notifier.notify).toHaveBeenCalledWith('clients.actions.undoRejection.failure');
  });
});

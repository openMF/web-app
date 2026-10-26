import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactivateClientComponent } from './reactivate-client.component';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ClientActionNotifierService } from '../client-action-notifier.service';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('ReactivateClientComponent', () => {
  let component: ReactivateClientComponent;
  let fixture: ComponentFixture<ReactivateClientComponent>;

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
        ReactivateClientComponent,
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

    fixture = TestBed.createComponent(ReactivateClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillValidForm = (date: Date | string = new Date(2025, 10, 3)) => {
    component.reactivateClientForm.patchValue({ reactivationDate: date });
  };

  beforeEach(setup);

  it('should initialize correctly', () => {
    expect(component.clientId).toBe(clientId);
    expect(component.maxDate).toEqual(businessDate);
    expect(component.reactivateClientForm.valid).toBe(false);
  });

  it('should be invalid when required fields are missing', () => {
    expect(component.reactivateClientForm.valid).toBe(false);
  });

  it('should be valid when all required fields are provided', () => {
    fillValidForm();
    expect(component.reactivateClientForm.valid).toBe(true);
  });

  it('should submit and call API with formatted date', () => {
    const date = new Date(2025, 10, 3);
    fillValidForm(date);

    component.submit();

    expect(dates.formatDate).toHaveBeenCalledWith(date, 'dd MMMM yyyy');
    expect(clientsService.executeClientCommand).toHaveBeenCalledWith(
      clientId,
      'reactivate',
      expect.objectContaining({
        reactivationDate: '20 March 2026',
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
      'clients.actions.reactivate.success',
      TestBed.inject(ActivatedRoute)
    );
  });

  it('should show failure notification if API call fails', () => {
    clientsService.executeClientCommand.mockReturnValueOnce(throwError(() => new Error('API error')));

    fillValidForm();

    component.submit();

    expect(notifier.notifyAndNavigate).not.toHaveBeenCalled();
    expect(notifier.notify).toHaveBeenCalledWith('clients.actions.reactivate.failure');
  });
});

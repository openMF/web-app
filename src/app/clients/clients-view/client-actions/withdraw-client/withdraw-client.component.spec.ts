import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WithdrawClientComponent } from './withdraw-client.component';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ClientActionNotifierService } from '../client-action-notifier.service';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('WithdrawClientComponent', () => {
  let component: WithdrawClientComponent;
  let fixture: ComponentFixture<WithdrawClientComponent>;

  let clientsService: Partial<jest.Mocked<ClientsService>>;
  let settingsService: Partial<SettingsService>;
  let dates: Partial<jest.Mocked<Dates>>;
  let notifier: Partial<jest.Mocked<ClientActionNotifierService>>;

  const clientId = '456';
  const businessDate = new Date(2025, 11, 20);

  const setup = async () => {
    clientsService = {
      executeClientCommand: jest.fn(() => of({}))
    };

    settingsService = {
      language: { code: 'en' },
      dateFormat: 'dd MMMM yyyy',
      businessDate
    } as SettingsService;

    dates = {
      formatDate: jest.fn(() => '20 March 2026')
    };

    notifier = {
      notifyAndNavigate: jest.fn(),
      notify: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        WithdrawClientComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ clientActionData: { narrations: [] } }),
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

    fixture = TestBed.createComponent(WithdrawClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillValidForm = (date: Date | string = new Date(2025, 10, 3)) => {
    component.withdrawClientForm.patchValue({
      withdrawalDate: date,
      withdrawalReasonId: 1
    });
  };

  beforeEach(setup);

  it('should initialize correctly', () => {
    expect(component.clientId).toBe(clientId);
    expect(component.maxDate).toEqual(businessDate);
    expect(component.withdrawClientForm.valid).toBe(false);
  });

  it('should be invalid when required fields are missing', () => {
    expect(component.withdrawClientForm.valid).toBe(false);
  });

  it('should be valid when all required fields are provided', () => {
    fillValidForm();
    expect(component.withdrawClientForm.valid).toBe(true);
  });

  it('should submit and call API with formatted date', () => {
    const date = new Date(2025, 10, 3);
    fillValidForm(date);

    component.submit();

    expect(dates.formatDate).toHaveBeenCalledWith(date, 'dd MMMM yyyy');
    expect(clientsService.executeClientCommand).toHaveBeenCalledWith(
      clientId,
      'withdraw',
      expect.objectContaining({
        withdrawalDate: '20 March 2026',
        withdrawalReasonId: 1,
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
      'clients.actions.withdraw.success',
      TestBed.inject(ActivatedRoute)
    );
  });

  it('should notify failure if API call fails', () => {
    (clientsService.executeClientCommand as jest.Mock).mockReturnValueOnce(throwError(() => new Error('API error')));

    fillValidForm();

    component.submit();

    expect(notifier.notify).toHaveBeenCalledWith('clients.actions.withdraw.failure');
  });
});

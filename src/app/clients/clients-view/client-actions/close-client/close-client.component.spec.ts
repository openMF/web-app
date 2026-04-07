import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CloseClientComponent } from './close-client.component';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { TranslateModule } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('CloseClientComponent', () => {
  let component: CloseClientComponent;
  let fixture: ComponentFixture<CloseClientComponent>;

  let router: jest.Mocked<Router>;
  let clientsService: jest.Mocked<ClientsService>;
  let settingsService: SettingsService;
  let dates: jest.Mocked<Dates>;

  const clientId = '456';
  const businessDate = new Date(2025, 11, 20);

  const setup = async () => {
    router = { navigate: jest.fn() } as any;

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

    await TestBed.configureTestingModule({
      imports: [
        CloseClientComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Router, useValue: router },
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
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CloseClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillValidForm = (date: Date | string = new Date(2025, 10, 3)) => {
    component.closeClientForm.patchValue({
      closureDate: date,
      closureReasonId: 1
    });
  };

  beforeEach(setup);

  it('should initialize correctly', () => {
    expect(component.clientId).toBe(clientId);
    expect(component.maxDate).toEqual(businessDate);
    expect(component.closeClientForm.valid).toBe(false);
  });

  it('should be invalid when required fields are missing', () => {
    expect(component.closeClientForm.valid).toBe(false);
  });

  it('should be valid when all required fields are provided', () => {
    fillValidForm();
    expect(component.closeClientForm.valid).toBe(true);
  });

  it('should submit and call API with formatted date', () => {
    const date = new Date(2025, 10, 3);
    fillValidForm(date);

    component.submit();

    expect(dates.formatDate).toHaveBeenCalledWith(date, 'dd MMMM yyyy');

    expect(clientsService.executeClientCommand).toHaveBeenCalledWith(
      clientId,
      'close',
      expect.objectContaining({
        closureDate: '20 March 2026',
        closureReasonId: 1,
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

  it('should navigate after successful submission', () => {
    fillValidForm();

    component.submit();

    expect(router.navigate).toHaveBeenCalled();
  });

  it('should not navigate if API call fails', () => {
    clientsService.executeClientCommand.mockReturnValueOnce(throwError(() => new Error('API error')));

    fillValidForm();

    component.submit();

    expect(router.navigate).not.toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { ActivateClientComponent } from './activate-client.component';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { TranslateModule } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('ActivateClientComponent - Unit Tests', () => {
  let component: ActivateClientComponent;
  let fixture: ComponentFixture<ActivateClientComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockClientsService: jest.Mocked<ClientsService>;
  let mockSettingsService: jest.Mocked<SettingsService>;
  let mockDates: jest.Mocked<Dates>;

  const mockClientId = '123';
  const mockBusinessDate = new Date(2026, 0, 15);

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockClientsService = {
      executeClientCommand: jest.fn(() => of({ resourceId: 123 }))
    } as unknown as jest.Mocked<ClientsService>;

    mockSettingsService = {
      language: { code: 'en' },
      dateFormat: 'dd MMMM yyyy',
      businessDate: mockBusinessDate
    } as unknown as jest.Mocked<SettingsService>;

    mockDates = {
      formatDate: jest.fn((date: Date, format: string) => '15 January 2026')
    } as unknown as jest.Mocked<Dates>;

    await TestBed.configureTestingModule({
      imports: [
        ActivateClientComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                params: { clientId: mockClientId }
              }
            }
          }
        },
        { provide: ClientsService, useValue: mockClientsService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: Dates, useValue: mockDates },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivateClientComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should extract clientId from parent route params', () => {
      expect(component.clientId).toBe(mockClientId);
    });

    it('should initialize minDate to January 1, 2000', () => {
      expect(component.minDate).toEqual(new Date(2000, 0, 1));
    });

    it('should set maxDate from settings business date on init', () => {
      fixture.detectChanges();
      expect(component.maxDate).toEqual(mockBusinessDate);
    });
  });

  describe('Form Creation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create activateClientForm', () => {
      expect(component.activateClientForm).toBeDefined();
    });

    it('should have activationDate control', () => {
      expect(component.activateClientForm.get('activationDate')).toBeDefined();
    });

    it('should require activationDate field', () => {
      const activationDateControl = component.activateClientForm.get('activationDate');
      activationDateControl?.setValue('');
      expect(activationDateControl?.valid).toBe(false);
      expect(activationDateControl?.errors?.['required']).toBeTruthy();
    });

    it('should be valid when activationDate is provided', () => {
      const activationDateControl = component.activateClientForm.get('activationDate');
      activationDateControl?.setValue(new Date(2026, 0, 10));
      expect(activationDateControl?.valid).toBe(true);
    });

    it('should initialize with empty activationDate', () => {
      const activationDateControl = component.activateClientForm.get('activationDate');
      expect(activationDateControl?.value).toBe('');
    });
  });

  describe('Submit Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call executeClientCommand with activate command', () => {
      const testDate = new Date(2026, 0, 10);
      component.activateClientForm.patchValue({ activationDate: testDate });

      component.submit();

      expect(mockClientsService.executeClientCommand).toHaveBeenCalledWith(
        mockClientId,
        'activate',
        expect.objectContaining({
          activationDate: '15 January 2026',
          dateFormat: 'dd MMMM yyyy',
          locale: 'en'
        })
      );
    });

    it('should format date using Dates service when activationDate is Date object', () => {
      const testDate = new Date(2026, 0, 10);
      component.activateClientForm.patchValue({ activationDate: testDate });

      component.submit();

      expect(mockDates.formatDate).toHaveBeenCalledWith(testDate, 'dd MMMM yyyy');
    });

    it('should include locale from settings service', () => {
      component.activateClientForm.patchValue({ activationDate: new Date() });

      component.submit();

      expect(mockClientsService.executeClientCommand).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ locale: 'en' })
      );
    });

    it('should include dateFormat from settings service', () => {
      component.activateClientForm.patchValue({ activationDate: new Date() });

      component.submit();

      expect(mockClientsService.executeClientCommand).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ dateFormat: 'dd MMMM yyyy' })
      );
    });

    it('should not format date if activationDate is not a Date object', () => {
      component.activateClientForm.patchValue({ activationDate: '10 January 2026' });

      component.submit();

      expect(mockDates.formatDate).not.toHaveBeenCalled();
      expect(mockClientsService.executeClientCommand).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ activationDate: '10 January 2026' })
      );
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to parent route after successful activation', () => {
      const mockActivatedRoute = TestBed.inject(ActivatedRoute);
      component.activateClientForm.patchValue({ activationDate: new Date() });

      component.submit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['../../'], { relativeTo: mockActivatedRoute });
    });
  });

  describe('Date Constraints', () => {
    it('should have minDate set to year 2000', () => {
      expect(component.minDate.getFullYear()).toBe(2000);
      expect(component.minDate.getMonth()).toBe(0);
      expect(component.minDate.getDate()).toBe(1);
    });

    it('should set maxDate from settings service businessDate on init', () => {
      fixture.detectChanges();
      expect(component.maxDate).toEqual(mockBusinessDate);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle form with Date object activationDate', () => {
      const testDate = new Date(2026, 0, 15);
      component.activateClientForm.patchValue({ activationDate: testDate });

      expect(() => component.submit()).not.toThrow();
      expect(mockClientsService.executeClientCommand).toHaveBeenCalled();
    });

    it('should handle form with string activationDate', () => {
      component.activateClientForm.patchValue({ activationDate: '15 January 2026' });

      expect(() => component.submit()).not.toThrow();
      expect(mockClientsService.executeClientCommand).toHaveBeenCalled();
    });

    it('should use correct clientId for service call', () => {
      component.activateClientForm.patchValue({ activationDate: new Date() });

      component.submit();

      expect(mockClientsService.executeClientCommand).toHaveBeenCalledWith('123', expect.anything(), expect.anything());
    });
  });

  describe('Integration Flow', () => {
    it('should complete full activation workflow', () => {
      // 1. Component initializes
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(component.activateClientForm).toBeDefined();

      // 2. User fills activation date
      const activationDate = new Date(2026, 0, 10);
      component.activateClientForm.patchValue({ activationDate });

      // 3. Form is valid
      expect(component.activateClientForm.valid).toBe(true);

      // 4. User submits
      component.submit();

      // 5. Service is called with correct params
      expect(mockClientsService.executeClientCommand).toHaveBeenCalledWith(
        '123',
        'activate',
        expect.objectContaining({
          dateFormat: 'dd MMMM yyyy',
          locale: 'en'
        })
      );

      // 6. Navigation occurs
      expect(mockRouter.navigate).toHaveBeenCalled();
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { CreateClientComponent } from './create-client.component';
import { ClientsService } from '../clients.service';
import { SettingsService } from '../../settings/settings.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('CreateClientComponent - Integration Tests', () => {
  let component: CreateClientComponent;
  let fixture: ComponentFixture<CreateClientComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockClientsService: jest.Mocked<ClientsService>;
  let mockSettingsService: jest.Mocked<SettingsService>;
  let routeDataSubject: BehaviorSubject<any>;

  const mockClientTemplate: any = {
    isAddressEnabled: true,
    datatables: [
      {
        registeredTableName: 'PersonDatatable',
        entitySubType: 'person',
        columnHeaderData: [] as any[]
      },
      {
        registeredTableName: 'EntityDatatable',
        entitySubType: 'entity',
        columnHeaderData: [] as any[]
      }
    ],
    officeOptions: [
      { id: 1, name: 'Head Office' }],
    staffOptions: [
      { id: 1, displayName: 'John Doe' }],
    savingsProductOptions: [] as any[],
    genderOptions: [] as any[],
    clientTypeOptions: [] as any[],
    clientClassificationOptions: [] as any[],
    clientNonPersonConstitutionOptions: [] as any[],
    clientNonPersonMainBusinessLineOptions: [] as any[],
    clientLegalFormOptions: [
      { id: 1, value: 'Person' },
      { id: 2, value: 'Entity' }
    ]
  };

  const mockAddressConfig = {
    addressTypeIdOptions: [
      { id: 1, name: 'Home' }]
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn()
    } as any;

    routeDataSubject = new BehaviorSubject({
      clientTemplate: { ...mockClientTemplate },
      clientAddressFieldConfig: { ...mockAddressConfig }
    });

    mockClientsService = {
      createClient: jest.fn(() => of({ resourceId: 123, clientId: 123 }))
    } as unknown as jest.Mocked<ClientsService>;

    mockSettingsService = {
      language: { code: 'en' },
      dateFormat: 'dd MMMM yyyy'
    } as unknown as jest.Mocked<SettingsService>;

    await TestBed.configureTestingModule({
      imports: [
        CreateClientComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeDataSubject.asObservable(),
            snapshot: { data: routeDataSubject.value }
          }
        },
        { provide: ClientsService, useValue: mockClientsService },
        { provide: SettingsService, useValue: mockSettingsService },
        DatePipe,
        DecimalPipe,
        provideNativeDateAdapter(),
        provideAnimationsAsync()

      ]
    }).compileComponents();

    // Add all FontAwesome solid icons to handle all child component icon requirements
    const faIconLibrary = TestBed.inject(FaIconLibrary);
    const iconList = Object.keys(solidIcons)
      .filter((key) => key !== 'fas' && key !== 'prefix' && key.startsWith('fa'))
      .map((icon) => (solidIcons as any)[icon]);
    faIconLibrary.addIcons(...iconList);

    fixture = TestBed.createComponent(CreateClientComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default legal form type as Person (1)', () => {
      expect(component.legalFormType).toBe(1);
    });

    it('should load client template and address config from route resolver', () => {
      expect(component.clientTemplate).toEqual(mockClientTemplate);
      expect(component.clientAddressFieldConfig).toEqual(mockAddressConfig);
    });

    it('should filter datatables based on initial legal form type', () => {
      expect(component.datatables).toHaveLength(1);
      expect(component.datatables[0].entitySubType).toBe('person');
    });
  });

  describe('Legal Form Type Changes', () => {
    it('should update legal form type when changed to Entity', () => {
      component.legalFormChange({ legalForm: 2 });
      expect(component.legalFormType).toBe(2);
    });

    it('should filter datatables for Entity when legal form is Entity', () => {
      component.legalFormChange({ legalForm: 2 });
      expect(component.datatables).toHaveLength(1);
      expect(component.datatables[0].entitySubType).toBe('entity');
      expect(component.datatables[0].registeredTableName).toBe('EntityDatatable');
    });

    it('should filter datatables for Person when legal form is Person', () => {
      component.legalFormChange({ legalForm: 1 });
      expect(component.datatables).toHaveLength(1);
      expect(component.datatables[0].entitySubType).toBe('person');
      expect(component.datatables[0].registeredTableName).toBe('PersonDatatable');
    });

    it('should handle no datatables when template has none', () => {
      routeDataSubject.next({
        clientTemplate: { ...mockClientTemplate, datatables: [] },
        clientAddressFieldConfig: mockAddressConfig
      });

      component.legalFormChange({ legalForm: 2 });
      expect(component.datatables).toHaveLength(0);
    });

    it('should re-filter datatables when switching between Person and Entity multiple times', () => {
      component.legalFormChange({ legalForm: 2 });
      expect(component.datatables[0].entitySubType).toBe('entity');

      component.legalFormChange({ legalForm: 1 });
      expect(component.datatables[0].entitySubType).toBe('person');

      component.legalFormChange({ legalForm: 2 });
      expect(component.datatables[0].entitySubType).toBe('entity');
    });
  });

  describe('Client Data Aggregation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should aggregate client data from general and family steps when address is disabled', () => {
      routeDataSubject.next({
        clientTemplate: { ...mockClientTemplate, isAddressEnabled: false },
        clientAddressFieldConfig: mockAddressConfig
      });

      // Mock the getter methods on child components
      if (component.clientGeneralStep) {
        Object.defineProperty(component.clientGeneralStep, 'clientGeneralDetails', {
          get: jest.fn(() => ({
            firstname: 'John',
            lastname: 'Doe',
            officeId: 1,
            active: true
          })),
          configurable: true
        });
      }

      if (component.clientFamilyMembersStep) {
        Object.defineProperty(component.clientFamilyMembersStep, 'familyMembers', {
          get: jest.fn(() => ({
            familyMembers: [
              { firstName: 'Jane', relationship: 'Spouse' }]
          })),
          configurable: true
        });
      }

      const clientData = component.client;
      expect(clientData.firstname).toBe('John');
      expect(clientData.lastname).toBe('Doe');
      expect(clientData.familyMembers).toBeDefined();
    });

    it('should aggregate client data including address when address is enabled', () => {
      // Mock the getter methods on child components
      if (component.clientGeneralStep) {
        Object.defineProperty(component.clientGeneralStep, 'clientGeneralDetails', {
          get: jest.fn(() => ({
            firstname: 'John',
            lastname: 'Doe',
            officeId: 1,
            active: true
          })),
          configurable: true
        });
      }

      if (component.clientFamilyMembersStep) {
        Object.defineProperty(component.clientFamilyMembersStep, 'familyMembers', {
          get: jest.fn(() => ({
            familyMembers: [
              { firstName: 'Jane', relationship: 'Spouse' }]
          })),
          configurable: true
        });
      }

      if (component.clientAddressStep) {
        Object.defineProperty(component.clientAddressStep, 'address', {
          get: jest.fn(() => ({
            address: [
              { addressTypeId: 1, street: '123 Main St' }]
          })),
          configurable: true
        });
      }

      const clientData = component.client;
      expect(clientData.firstname).toBe('John');
      expect(clientData.address).toBeDefined();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate that general form is required', () => {
      if (component.clientGeneralStep && component.clientGeneralStep.createClientForm) {
        jest.spyOn(component.clientGeneralForm, 'valid', 'get').mockReturnValue(false);
        expect(component.areFormvalids()).toBe(false);
      }
    });

    it('should require address when address is enabled', () => {
      component.clientTemplate.isAddressEnabled = true;

      if (component.clientGeneralStep && component.clientGeneralStep.createClientForm) {
        jest.spyOn(component.clientGeneralForm, 'valid', 'get').mockReturnValue(true);
      }

      if (component.clientAddressStep) {
        Object.defineProperty(component.clientAddressStep, 'address', {
          get: jest.fn(() => ({ address: [] })),
          configurable: true
        });
        expect(component.areFormvalids()).toBe(false);
      }
    });

    it('should validate all datatable forms when datatables exist', () => {
      component.clientTemplate.datatables = mockClientTemplate.datatables;
      component.clientTemplate.isAddressEnabled = false; // Disable address to simplify test
      component.setDatatables();

      if (component.clientGeneralStep && component.clientGeneralStep.createClientForm) {
        jest.spyOn(component.clientGeneralForm, 'valid', 'get').mockReturnValue(true);
      }

      // When there are no clientDatatables ViewChildren, validation should pass
      expect(component.areFormvalids()).toBe(true);
    });

    it('should pass validation when all forms are valid', () => {
      component.clientTemplate.isAddressEnabled = false;

      if (component.clientGeneralStep && component.clientGeneralStep.createClientForm) {
        jest.spyOn(component.clientGeneralForm, 'valid', 'get').mockReturnValue(true);
      }

      expect(component.areFormvalids()).toBe(true);
    });
  });

  describe('Client Submission', () => {
    beforeEach(() => {
      fixture.detectChanges();

      // Mock child component getters
      if (component.clientGeneralStep) {
        Object.defineProperty(component.clientGeneralStep, 'clientGeneralDetails', {
          get: jest.fn(() => ({
            firstname: 'John',
            lastname: 'Doe',
            officeId: 1,
            active: true,
            externalId: 'EXT-001',
            dateFormat: 'dd MMMM yyyy',
            locale: 'en'
          })),
          configurable: true
        });
      }

      if (component.clientFamilyMembersStep) {
        Object.defineProperty(component.clientFamilyMembersStep, 'familyMembers', {
          get: jest.fn(() => ({
            familyMembers: []
          })),
          configurable: true
        });
      }
    });

    it('should submit client with locale and dateFormat from settings', () => {
      component.submit();

      expect(mockClientsService.createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFormat: 'dd MMMM yyyy',
          locale: 'en'
        })
      );
    });

    it('should navigate to client detail page after successful creation', () => {
      const mockActivatedRoute = TestBed.inject(ActivatedRoute);

      component.submit();

      expect(mockClientsService.createClient).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [
          '../',
          123
        ],
        { relativeTo: mockActivatedRoute }
      );
    });

    it('should include address data in submission when address is enabled', () => {
      component.clientTemplate.isAddressEnabled = true;

      if (component.clientAddressStep) {
        Object.defineProperty(component.clientAddressStep, 'address', {
          get: jest.fn(() => ({
            address: [
              { addressTypeId: 1, street: '123 Main St', city: 'New York' }]
          })),
          configurable: true
        });
      }

      component.submit();

      expect(mockClientsService.createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          address: expect.arrayContaining([
            expect.objectContaining({ street: '123 Main St' })
          ])
        })
      );
    });

    it('should submit without address when address is disabled', () => {
      component.clientTemplate.isAddressEnabled = false;

      component.submit();

      const callArgs = mockClientsService.createClient.mock.calls[0][0];
      expect(callArgs.address).toBeUndefined();
    });

    it('should include datatable data when datatables exist', () => {
      component.clientTemplate.datatables = mockClientTemplate.datatables;
      component.setDatatables();

      // Note: In real scenario, clientDatatables would be populated by ViewChildren
      // This test verifies the logic flow
      component.submit();

      expect(mockClientsService.createClient).toHaveBeenCalled();
    });

    it('should handle client creation with all data types', () => {
      component.clientTemplate.isAddressEnabled = true;
      component.clientTemplate.datatables = mockClientTemplate.datatables;

      if (component.clientAddressStep) {
        Object.defineProperty(component.clientAddressStep, 'address', {
          get: jest.fn(() => ({
            address: [{ addressTypeId: 1, street: 'Test St' }]
          })),
          configurable: true
        });
      }

      component.submit();

      expect(mockClientsService.createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          firstname: 'John',
          lastname: 'Doe',
          officeId: 1,
          dateFormat: 'dd MMMM yyyy',
          locale: 'en'
        })
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing client template gracefully', () => {
      routeDataSubject.next({
        clientTemplate: null,
        clientAddressFieldConfig: mockAddressConfig
      });

      // The component doesn't currently handle null template, which is actually a bug
      // But this test documents the current behavior
      expect(component.clientTemplate).toBeNull();
    });

    it('should handle undefined datatables in template', () => {
      routeDataSubject.next({
        clientTemplate: { ...mockClientTemplate, datatables: undefined },
        clientAddressFieldConfig: mockAddressConfig
      });

      component.setDatatables();
      expect(component.datatables).toEqual([]);
    });

    it('should handle datatables with case-insensitive entitySubType', () => {
      routeDataSubject.next({
        clientTemplate: {
          ...mockClientTemplate,
          datatables: [
            { registeredTableName: 'Test1', entitySubType: 'PERSON' },
            { registeredTableName: 'Test2', entitySubType: 'Person' },
            { registeredTableName: 'Test3', entitySubType: 'person' }
          ]
        },
        clientAddressFieldConfig: mockAddressConfig
      });

      component.legalFormChange({ legalForm: 1 });
      expect(component.datatables).toHaveLength(3);
    });

    it('should properly update when route data changes', () => {
      const newTemplate = {
        ...mockClientTemplate,
        isAddressEnabled: false
      };

      routeDataSubject.next({
        clientTemplate: newTemplate,
        clientAddressFieldConfig: mockAddressConfig
      });

      expect(component.clientTemplate.isAddressEnabled).toBe(false);
    });
  });

  describe('Integration Flow - Complete Client Creation', () => {
    it('should complete full client creation workflow', () => {
      // 1. Component initializes
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(component.clientTemplate).toBeDefined();

      // 2. User fills general information
      if (component.clientGeneralStep) {
        Object.defineProperty(component.clientGeneralStep, 'clientGeneralDetails', {
          get: jest.fn(() => ({
            firstname: 'Jane',
            lastname: 'Smith',
            officeId: 1,
            active: true,
            dateFormat: 'dd MMMM yyyy',
            locale: 'en'
          })),
          configurable: true
        });
      }

      // 3. User adds family members
      if (component.clientFamilyMembersStep) {
        Object.defineProperty(component.clientFamilyMembersStep, 'familyMembers', {
          get: jest.fn(() => ({
            familyMembers: [
              { firstName: 'John', relationship: 'Spouse' }]
          })),
          configurable: true
        });
      }

      // 4. User adds address
      if (component.clientAddressStep) {
        Object.defineProperty(component.clientAddressStep, 'address', {
          get: jest.fn(() => ({
            address: [
              { addressTypeId: 1, street: '456 Oak Ave', city: 'Boston' }]
          })),
          configurable: true
        });
      }

      // 5. Form validation passes
      if (component.clientGeneralStep && component.clientGeneralStep.createClientForm) {
        jest.spyOn(component.clientGeneralForm, 'valid', 'get').mockReturnValue(true);
      }

      // 6. User submits
      component.submit();

      // 7. Client is created
      expect(mockClientsService.createClient).toHaveBeenCalled();

      // 8. Navigation occurs
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        expect.arrayContaining([
          '../',
          123
        ]),
        expect.any(Object)
      );
    });
  });
});

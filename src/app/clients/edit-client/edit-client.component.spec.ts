/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

import { EditClientComponent } from './edit-client.component';
import { ClientsService } from '../clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { environment } from 'environments/environment';
import { Dates } from 'app/core/utils/dates';

describe('EditClientComponent WEB-1161 production edit flow', () => {
  let fixture: ComponentFixture<EditClientComponent>;
  let component: EditClientComponent;
  let clientsService: jest.Mocked<ClientsService>;
  let systemService: jest.Mocked<SystemService>;
  let router: jest.Mocked<Router>;
  let originalProductionMode: boolean;

  const clientDataAndTemplate: any = {
    id: 1,
    officeId: 1,
    staffId: 2,
    accountNo: '000000001',
    externalId: 'EXT-1',
    legalForm: { id: 1 },
    firstname: 'Jane',
    middlename: 'Maria',
    lastname: 'Doe',
    displayName: 'Jane Maria Doe',
    mobileNo: '555-0100',
    emailAddress: 'jane@example.org',
    dateOfBirth: [
      1990,
      4,
      18
    ],
    isStaff: false,
    active: true,
    gender: { id: 21, name: 'Female' },
    clientType: { id: 31, name: 'Individual' },
    clientClassification: { id: 41, name: 'Standard' },
    timeline: {
      submittedOnDate: [
        2024,
        1,
        2
      ],
      activatedOnDate: [
        2024,
        1,
        3
      ]
    },
    officeOptions: [{ id: 1, name: 'Head Office' }],
    staffOptions: [{ id: 2, displayName: 'Loan Officer' }],
    clientLegalFormOptions: [
      { id: 1, value: 'Person' },
      { id: 2, value: 'Entity' }
    ],
    clientTypeOptions: [{ id: 31, name: 'Individual' }],
    clientClassificationOptions: [{ id: 41, name: 'Standard' }],
    genderOptions: [{ id: 21, name: 'Female' }],
    clientNonPersonConstitutionOptions: [],
    clientNonPersonMainBusinessLineOptions: [],
    clientNonPersonDetails: {}
  };

  function configureTestingModule(
    productionMode: boolean,
    clientOverrides: any = {},
    datatableRowsByTable: Record<string, any> = {},
    addressData: any[] = [
      {
        addressId: 99,
        addressTypeId: 10,
        addressType: 'Home',
        isActive: true,
        street: 'Main Street',
        postalCode: '12345',
        city: 'Guadalajara',
        stateProvinceId: 20,
        countryId: 30
      }
    ]
  ) {
    environment.productionMode = productionMode;
    const resolvedClientDataAndTemplate = {
      ...clientDataAndTemplate,
      ...clientOverrides,
      timeline: {
        ...clientDataAndTemplate.timeline,
        ...(clientOverrides.timeline || {})
      }
    };

    clientsService = {
      updateClient: jest.fn(() => of({})),
      getClientAddressTemplate: jest.fn(() =>
        of({
          addressTypeIdOptions: [
            { id: 10, name: 'Home Address' },
            { id: 11, name: 'Office Address' }
          ],
          stateProvinceIdOptions: [{ id: 20, name: 'Jalisco' }],
          countryIdOptions: [{ id: 30, name: 'Mexico' }]
        })
      ),
      getClientIdentifierTemplate: jest.fn(() =>
        of({
          allowedDocumentTypes: [
            { id: 50, name: 'National ID' },
            { id: 51, name: 'Tax ID' }
          ]
        })
      ),
      getClientDatatables: jest.fn(() =>
        of([
          { registeredTableName: 'client_socioeconomic_information' },
          {
            registeredTableName: 'client_personal_references',
            columnHeaderData: [
              { columnName: 'id' },
              { columnName: 'reference_name', columnDisplayType: 'STRING', isColumnNullable: false },
              { columnName: 'phone', columnDisplayType: 'STRING', isColumnNullable: true }
            ]
          },
          {
            registeredTableName: 'client_commercial_reference',
            columnHeaderData: [
              { columnName: 'id' },
              { columnName: 'business_name', columnDisplayType: 'STRING', isColumnNullable: false },
              { columnName: 'phone', columnDisplayType: 'STRING', isColumnNullable: true }
            ]
          },
          { registeredTableName: 'client_beneficiaries' },
          { registeredTableName: 'client_pep_pld' },
          { registeredTableName: 'entity_legal_representative' },
          { registeredTableName: 'entity_transactional_profile' }
        ])
      ),
      getClientAddressData: jest.fn(() => of(addressData)),
      getClientFamilyMembers: jest.fn(() => of([])),
      getClientIdentifiers: jest.fn(() =>
        of([
          {
            id: 3,
            documentType: { id: 50, name: 'National ID' },
            documentKey: 'NID-123',
            description: 'National identifier',
            status: 'Active'
          }
        ])
      ),
      getClientIdentificationDocuments: jest.fn(() => of([])),
      getClientDocuments: jest.fn(() => of([])),
      getClientDatatable: jest.fn((_clientId: string, datatableName: string) => {
        const defaultRowsByTable: Record<string, any> = {
          client_socioeconomic_information: {
            columnHeaders: [
              { columnName: 'id' },
              { columnName: 'occupation', columnDisplayType: 'STRING', isColumnNullable: true },
              { columnName: 'average_monthly_income', columnDisplayType: 'DECIMAL', isColumnNullable: true }
            ],
            data: [
              {
                row: [
                  7,
                  'Engineer',
                  '25000'
                ]
              }
            ]
          },
          client_beneficiaries: {
            columnHeaders: [
              { columnName: 'id' },
              { columnName: 'beneficiary_name', columnDisplayType: 'STRING', isColumnNullable: true },
              { columnName: 'percentage', columnDisplayType: 'DECIMAL', isColumnNullable: true }
            ],
            data: [
              {
                row: [
                  8,
                  'Alice Doe',
                  '50'
                ]
              }
            ]
          },
          client_pep_pld: {
            columnHeaders: [
              { columnName: 'id' },
              { columnName: 'pep', columnDisplayType: 'BOOLEAN', isColumnNullable: true }
            ],
            data: [
              {
                row: [
                  9,
                  'No'
                ]
              }
            ]
          },
          entity_legal_representative: {
            columnHeaders: [
              { columnName: 'id' },
              { columnName: 'representative_name', columnDisplayType: 'STRING', isColumnNullable: true }
            ],
            data: [
              {
                row: [
                  10,
                  'Entity Rep'
                ]
              }
            ]
          },
          entity_transactional_profile: {
            columnHeaders: [
              { columnName: 'id' },
              { columnName: 'monthly_transactions', columnDisplayType: 'INTEGER', isColumnNullable: true }
            ],
            data: [
              {
                row: [
                  11,
                  '20'
                ]
              }
            ]
          }
        };
        return of(
          datatableRowsByTable[datatableName] || defaultRowsByTable[datatableName] || { columnHeaders: [], data: [] }
        );
      }),
      editClientAddress: jest.fn(() => of({})),
      createClientAddress: jest.fn(() => of({})),
      editClientDatatableEntry: jest.fn(() => of({})),
      editClientIdentifier: jest.fn(() => of({})),
      lookupExternalNationalId: jest.fn(() => of(null))
    } as unknown as jest.Mocked<ClientsService>;

    systemService = {
      addEntityDatatableEntry: jest.fn(() => of({})),
      editEntityDatatableEntry: jest.fn(() => of({})),
      editEntityDatatableEntryOneToMany: jest.fn(() => of({}))
    } as unknown as jest.Mocked<SystemService>;

    router = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      imports: [
        EditClientComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ClientsService, useValue: clientsService },
        { provide: SystemService, useValue: systemService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ clientDataAndTemplate: resolvedClientDataAndTemplate }),
            snapshot: { data: { clientDataAndTemplate: resolvedClientDataAndTemplate } }
          }
        },
        {
          provide: SettingsService,
          useValue: {
            businessDate: new Date(2024, 0, 15),
            language: { code: 'en' },
            dateFormat: 'dd MMMM yyyy'
          }
        },
        {
          provide: Dates,
          useValue: {
            formatDate: jest.fn(() => '02 January 2024'),
            parseDate: jest.fn((value: any) => new Date(value)),
            parseDatetime: jest.fn((value: any) => new Date(value))
          }
        },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    });

    fixture = TestBed.createComponent(EditClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    originalProductionMode = environment.productionMode;
  });

  afterEach(() => {
    environment.productionMode = originalProductionMode;
    TestBed.resetTestingModule();
  });

  it('shows WEB-1161 PERSON edit sections in the existing Edit Client form when production mode is enabled', () => {
    configureTestingModule(true);

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('labels.heading.General Client Information');
    expect(text).toContain('labels.heading.Home Address');
    expect(text).toContain('labels.heading.Socioeconomic Information');
    expect(text).toContain('labels.heading.Personal References');
    expect(text).toContain('labels.heading.Commercial Reference');
    expect(text).toContain('labels.heading.Beneficiaries');
    expect(text).toContain('labels.heading.Client Type / PEP / PLD information');
    expect(text).not.toContain('labels.heading.Data Tables');
    expect(text).toContain('Occupation');
    expect(component.personalDataAddressForm?.value.street).toBe('Main Street');
    expect(component.identifierForms['3'].value.documentKey).toBe('NID-123');
    expect(component.datatableSections('socioeconomic')[0].records).toHaveLength(1);
  });

  it('does not load or render WEB-1161 edit sections when production mode is disabled', () => {
    configureTestingModule(false);

    expect(clientsService.getClientAddressTemplate).not.toHaveBeenCalled();
    expect(clientsService.getClientDatatables).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).not.toContain('labels.heading.Home Address');
    expect(fixture.nativeElement.textContent).not.toContain('labels.heading.Socioeconomic Information');
  });

  it('saves base client, address, identifiers, and existing datatable rows from the single Edit Client flow', () => {
    configureTestingModule(true);
    component.editClientForm.patchValue({ mobileNo: '555-0199' });
    component.editClientForm.markAsDirty();
    component.personalDataAddressForm?.patchValue({ street: 'Updated Street' });
    component.personalDataAddressForm?.markAsDirty();
    component.identifierForms['3'].patchValue({ documentKey: 'NID-999' });
    component.identifierForms['3'].markAsDirty();
    const section = component.productionDatatableSections[0];
    const record = section.records[0];
    component.personalDataTableForms[component.datatableFormKey(section, record)].patchValue({
      occupation: 'Architect'
    });
    component.personalDataTableForms[component.datatableFormKey(section, record)].markAsDirty();

    component.submit();

    expect(clientsService.updateClient).toHaveBeenCalled();
    expect(clientsService.updateClient.mock.calls[0][1]).not.toHaveProperty('age');
    expect(clientsService.editClientAddress).toHaveBeenCalledWith(
      '1',
      '10',
      expect.objectContaining({ street: 'Updated Street', addressId: 99, addressTypeId: '10' })
    );
    expect(clientsService.editClientIdentifier).toHaveBeenCalledWith(
      '1',
      '3',
      expect.objectContaining({ documentKey: 'NID-999', locale: 'en', dateFormat: 'dd MMMM yyyy' })
    );
    expect(systemService.editEntityDatatableEntryOneToMany).toHaveBeenCalledWith(
      '1',
      '7',
      'client_socioeconomic_information',
      expect.objectContaining({ occupation: 'Architect', locale: 'en' })
    );
    expect(router.navigate).toHaveBeenCalledWith(['../personal-data'], expect.any(Object));
  });

  it('submits from the form submit event instead of relying on a separate button click handler', () => {
    configureTestingModule(true);
    component.editClientForm.patchValue({ mobileNo: '555-0199' });
    component.editClientForm.markAsDirty();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    form.dispatchEvent(new Event('submit'));

    expect(clientsService.updateClient).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['../personal-data'], expect.any(Object));
  });

  it('does not call the address API with a non-numeric address type', () => {
    configureTestingModule(true);
    component.editableAddress = null;
    component.personalDataAddressForm?.patchValue({ addressTypeId: 'asdfg', street: 'Updated Street' });
    component.personalDataAddressForm?.markAsDirty();

    expect(component.isSubmitDisabled).toBe(true);

    component.submit();

    expect(clientsService.updateClient).not.toHaveBeenCalled();
    expect(clientsService.createClientAddress).not.toHaveBeenCalled();
    expect(clientsService.editClientAddress).not.toHaveBeenCalled();
  });

  it('prefills an existing address type from its display label and updates with the resolved template id', () => {
    configureTestingModule(true, {}, {}, [
      {
        addressId: 99,
        addressType: 'Home Address',
        isActive: true,
        street: 'Main Street'
      }
    ]);

    expect(component.personalDataAddressForm?.value.addressTypeId).toBe('10');

    component.personalDataAddressForm?.patchValue({ street: 'Updated Street' });
    component.personalDataAddressForm?.markAsDirty();

    expect(component.personalDataAddressForm?.valid).toBe(true);
    expect(component.isSubmitDisabled).toBe(false);

    component.submit();

    expect(clientsService.editClientAddress).toHaveBeenCalledWith(
      '1',
      '10',
      expect.objectContaining({ addressId: 99, street: 'Updated Street', addressTypeId: '10' })
    );
  });

  it('creates a new address with the selected real address type id', () => {
    configureTestingModule(true, {}, {}, []);
    component.editableAddress = null;
    component.personalDataAddressForm?.patchValue({
      addressTypeId: 11,
      street: 'Office Street',
      postalCode: '45000',
      city: 'Zapopan',
      stateProvinceId: 20,
      countryId: 30
    });
    component.personalDataAddressForm?.markAsDirty();

    expect(component.personalDataAddressForm?.valid).toBe(true);
    expect(component.isSubmitDisabled).toBe(false);

    component.submit();

    expect(clientsService.createClientAddress).toHaveBeenCalledWith(
      '1',
      '11',
      expect.objectContaining({
        street: 'Office Street',
        postalCode: '45000',
        city: 'Zapopan',
        stateProvinceId: 20,
        countryId: 30
      })
    );
  });

  it('requires address type to be selected from the loaded address template options', () => {
    configureTestingModule(true);
    component.personalDataAddressForm?.patchValue({ addressTypeId: 999, street: 'Updated Street' });
    component.personalDataAddressForm?.markAsDirty();

    expect(component.isSubmitDisabled).toBe(true);

    component.submit();

    expect(clientsService.updateClient).not.toHaveBeenCalled();
    expect(clientsService.createClientAddress).not.toHaveBeenCalled();
    expect(clientsService.editClientAddress).not.toHaveBeenCalled();
  });

  it('shows WEB-1161 ENTITY edit sections for ENTITY legal form clients', () => {
    configureTestingModule(true, {
      legalForm: { id: 2 },
      fullname: 'Acme Holdings LLC',
      clientNonPersonDetails: {
        constitution: { id: 1 },
        mainBusinessLine: { id: 2 },
        incorpNumber: 'INC-1'
      },
      clientNonPersonConstitutionOptions: [{ id: 1, name: 'LLC' }],
      clientNonPersonMainBusinessLineOptions: [{ id: 2, name: 'Services' }]
    });

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('labels.heading.Legal Entity Details');
    expect(text).toContain('labels.heading.Tax Address');
    expect(text).toContain('labels.heading.Legal Representative');
    expect(text).toContain('labels.heading.Customer Transactional Profile');
    expect(text).not.toContain('labels.heading.Socioeconomic Information');
    expect(component.datatableSections('legalRepresentative')[0].records).toHaveLength(1);
    expect(component.datatableSections('transactionalProfile')[0].records).toHaveLength(1);
  });

  it('saves dirty WEB-1161 ENTITY DataTable values when untouched base non-person details are incomplete', () => {
    configureTestingModule(true, {
      id: 4,
      legalForm: { id: 2 },
      fullname: 'WEB1161 Entity Test',
      clientNonPersonDetails: null,
      clientNonPersonConstitutionOptions: [],
      clientNonPersonMainBusinessLineOptions: []
    });
    const section = component.datatableSections('legalRepresentative')[0];
    const record = section.records[0];
    const form = component.personalDataTableForms[component.datatableFormKey(section, record)];

    expect(component.editClientForm.valid).toBe(false);
    expect(component.editClientForm.dirty).toBe(false);

    form.patchValue({ representative_name: 'Legal Rep Test' });
    form.markAsDirty();

    expect(component.isSubmitDisabled).toBe(false);

    component.submit();

    expect(clientsService.updateClient).not.toHaveBeenCalled();
    expect(systemService.editEntityDatatableEntryOneToMany).toHaveBeenCalledWith(
      '4',
      '10',
      'entity_legal_representative',
      expect.objectContaining({ representative_name: 'Legal Rep Test' })
    );
  });

  it('renders empty DataTable schema forms and creates rows when no client row exists', () => {
    configureTestingModule(
      true,
      {},
      {
        client_socioeconomic_information: {
          columnHeaders: [
            { columnName: 'id' },
            { columnName: 'occupation', columnDisplayType: 'STRING', isColumnNullable: false },
            { columnName: 'average_monthly_income', columnDisplayType: 'DECIMAL', isColumnNullable: true },
            {
              columnName: 'risk_level_cd_risk_level',
              columnDisplayType: 'CODELOOKUP',
              isColumnNullable: true,
              columnValues: [{ id: 5, value: 'Low' }]
            }
          ],
          data: []
        }
      }
    );

    const section = component.datatableSections('socioeconomic')[0];
    const newRowKey = component.datatableNewFormKey(section, 0);

    expect(component.hasDatatableSchema('socioeconomic')).toBe(true);
    expect(section.records).toHaveLength(0);
    expect(component.personalDataTableForms[newRowKey]).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Occupation');
    expect(fixture.nativeElement.textContent).toContain('Average Monthly Income');

    component.personalDataTableForms[newRowKey].patchValue({
      occupation: 'Teacher',
      average_monthly_income: '30000',
      risk_level: 5
    });
    component.personalDataTableForms[newRowKey].markAsDirty();

    component.submit();

    expect(systemService.addEntityDatatableEntry).toHaveBeenCalledWith(
      '1',
      'client_socioeconomic_information',
      expect.objectContaining({
        occupation: 'Teacher',
        average_monthly_income: 30000,
        risk_level_cd_risk_level: 5,
        locale: 'en'
      })
    );
  });

  it('keeps the save button enabled for an invalid dirty DataTable row and marks it touched on submit', () => {
    configureTestingModule(
      true,
      {},
      {
        client_socioeconomic_information: {
          columnHeaders: [
            { columnName: 'id' },
            { columnName: 'occupation', columnDisplayType: 'STRING', isColumnNullable: false },
            { columnName: 'average_monthly_income', columnDisplayType: 'DECIMAL', isColumnNullable: false }
          ],
          data: []
        }
      }
    );
    const section = component.datatableSections('socioeconomic')[0];
    const newRowKey = component.datatableNewFormKey(section, 0);
    const form = component.personalDataTableForms[newRowKey];
    form.patchValue({ occupation: 'Teacher' });
    form.markAsDirty();

    expect(component.isSubmitDisabled).toBe(false);

    component.submit();

    expect(form.touched).toBe(true);
    expect(clientsService.updateClient).not.toHaveBeenCalled();
    expect(systemService.addEntityDatatableEntry).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not mark WEB-1161 setup metadata columns as required when mandatory is false', () => {
    configureTestingModule(
      true,
      {},
      {
        client_socioeconomic_information: {
          columnHeaders: [
            { columnName: 'id' },
            { columnName: 'occupation', columnDisplayType: 'STRING', mandatory: false },
            { columnName: 'economic_activity', columnDisplayType: 'STRING', mandatory: false },
            { columnName: 'average_monthly_income', columnDisplayType: 'DECIMAL', mandatory: false }
          ],
          data: []
        }
      }
    );
    const section = component.datatableSections('socioeconomic')[0];
    const newRowKey = component.datatableNewFormKey(section, 0);
    const form = component.personalDataTableForms[newRowKey];

    form.patchValue({ economic_activity: 'Retail' });
    form.markAsDirty();

    expect(form.valid).toBe(true);
    expect(component.isSubmitDisabled).toBe(false);

    component.submit();

    expect(systemService.addEntityDatatableEntry).toHaveBeenCalledWith(
      '1',
      'client_socioeconomic_information',
      expect.objectContaining({
        occupation: '',
        economic_activity: 'Retail',
        average_monthly_income: null
      })
    );
  });

  it('serializes setup-backed DataTable values using schema types instead of numeric-looking input values', () => {
    configureTestingModule(
      true,
      {},
      {
        client_socioeconomic_information: {
          columnHeaders: [
            { columnName: 'id' },
            { columnName: 'tax_id', columnDisplayType: 'String', mandatory: false },
            { columnName: 'phone', columnType: 'String', mandatory: false },
            { columnName: 'age_of_business', columnDisplayType: 'Number', mandatory: false },
            { columnName: 'average_monthly_income', columnDisplayType: 'Decimal', mandatory: false }
          ],
          data: []
        }
      }
    );
    const section = component.datatableSections('socioeconomic')[0];
    const newRowKey = component.datatableNewFormKey(section, 0);
    const form = component.personalDataTableForms[newRowKey];

    form.patchValue({
      tax_id: 123456,
      phone: 9876543210,
      age_of_business: '12',
      average_monthly_income: '1234.56'
    });
    form.markAsDirty();

    component.submit();

    expect(systemService.addEntityDatatableEntry).toHaveBeenCalledWith(
      '1',
      'client_socioeconomic_information',
      expect.objectContaining({
        tax_id: '123456',
        phone: '9876543210',
        age_of_business: 12,
        average_monthly_income: 1234.56
      })
    );
  });

  it('prefills DataTable lookups from display values and saves the selected lookup id', () => {
    configureTestingModule(
      true,
      {},
      {
        client_socioeconomic_information: {
          columnHeaders: [
            { columnName: 'id' },
            {
              columnName: 'risk_level_cd_risk_level',
              columnDisplayType: 'CODELOOKUP',
              isColumnNullable: true,
              columnValues: [
                { id: 5, value: 'Low' },
                { id: 6, value: 'High' }
              ]
            }
          ],
          data: [
            {
              row: [
                7,
                'Low'
              ]
            }
          ]
        }
      }
    );
    const section = component.datatableSections('socioeconomic')[0];
    const record = section.records[0];
    const form = component.personalDataTableForms[component.datatableFormKey(section, record)];

    expect(form.value.risk_level).toBe(5);

    form.patchValue({ risk_level: 6 });
    form.markAsDirty();
    component.submit();

    expect(systemService.editEntityDatatableEntryOneToMany).toHaveBeenCalledWith(
      '1',
      '7',
      'client_socioeconomic_information',
      expect.objectContaining({ risk_level_cd_risk_level: 6 })
    );
  });

  it('keeps the user on Edit Client and re-enables save when a persistence request fails', () => {
    configureTestingModule(true);
    component.editClientForm.patchValue({ mobileNo: '555-0199' });
    component.editClientForm.markAsDirty();
    clientsService.updateClient.mockReturnValueOnce(throwError(() => new Error('Save failed')));

    component.submit();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.saving).toBe(false);
  });

  it('renders add forms for empty personal and commercial reference schemas from DataTable metadata', () => {
    configureTestingModule(
      true,
      {},
      {
        client_personal_references: { columnHeaders: [], data: [] },
        client_commercial_reference: { columnHeaders: [], data: [] }
      }
    );

    const personalReferenceSection = component.datatableSections('personalReferences')[0];
    const commercialReferenceSection = component.datatableSections('commercialReferences')[0];
    const personalReferenceNewRowKey = component.datatableNewFormKey(personalReferenceSection, 0);
    const commercialReferenceNewRowKey = component.datatableNewFormKey(commercialReferenceSection, 0);

    expect(personalReferenceSection.columns.map((column) => column.columnName)).toEqual([
      'reference_name',
      'phone'
    ]);
    expect(commercialReferenceSection.columns.map((column) => column.columnName)).toEqual([
      'business_name',
      'phone'
    ]);
    expect(fixture.nativeElement.textContent).toContain('Reference Name');
    expect(fixture.nativeElement.textContent).toContain('Business Name');
    expect(fixture.nativeElement.textContent).not.toContain('client_personal_references');
    expect(fixture.nativeElement.textContent).not.toContain('client_commercial_reference');

    component.personalDataTableForms[personalReferenceNewRowKey].patchValue({
      reference_name: 'Ana Friend',
      phone: '555-0111'
    });
    component.personalDataTableForms[personalReferenceNewRowKey].markAsDirty();
    component.personalDataTableForms[commercialReferenceNewRowKey].patchValue({
      business_name: 'Corner Shop',
      phone: '555-0222'
    });
    component.personalDataTableForms[commercialReferenceNewRowKey].markAsDirty();

    component.submit();

    expect(systemService.addEntityDatatableEntry).toHaveBeenCalledWith(
      '1',
      'client_personal_references',
      expect.objectContaining({ reference_name: 'Ana Friend', phone: '555-0111' })
    );
    expect(systemService.addEntityDatatableEntry).toHaveBeenCalledWith(
      '1',
      'client_commercial_reference',
      expect.objectContaining({ business_name: 'Corner Shop', phone: '555-0222' })
    );
  });

  it('renders WEB-1161 boolean question fields as Yes/No buttons and saves boolean values', () => {
    configureTestingModule(
      true,
      {},
      {
        client_pep_pld: {
          columnHeaders: [
            { columnName: 'client_id' },
            { columnName: 'is_pep', columnDisplayType: 'BOOLEAN', isColumnNullable: true },
            { columnName: 'pep_details', columnDisplayType: 'TEXT', isColumnNullable: true }
          ],
          data: []
        }
      }
    );

    const section = component.datatableSections('pepPld')[0];
    const newRowKey = component.datatableNewFormKey(section, 0);

    expect(component.isDatatableYesNo(section.columns[0])).toBe(true);
    expect(component.datatableYesNoValues(section.columns[0])).toEqual([
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]);
    expect(fixture.nativeElement.textContent).toContain('Is Pep');
    expect(fixture.nativeElement.querySelectorAll('mat-button-toggle').length).toBe(2);

    component.personalDataTableForms[newRowKey].patchValue({
      is_pep: true,
      pep_details: 'Public office'
    });
    component.personalDataTableForms[newRowKey].markAsDirty();

    component.submit();

    expect(systemService.addEntityDatatableEntry).toHaveBeenCalledWith(
      '1',
      'client_pep_pld',
      expect.objectContaining({ is_pep: true, pep_details: 'Public office' })
    );
  });
});

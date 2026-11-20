/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { ValidationStatus } from 'app/clients/models/document-validation.model';
import { PersonProductionPersonalDataComponent } from './person-production-personal-data.component';
import { PersonalDataViewService } from '../personal-data-view.service';

describe('PersonProductionPersonalDataComponent', () => {
  let fixture: ComponentFixture<PersonProductionPersonalDataComponent>;
  let component: PersonProductionPersonalDataComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PersonProductionPersonalDataComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SettingsService,
          useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        },
        {
          provide: Dates,
          useValue: {
            angularToMomentFormat: jest.fn(() => 'DD MMMM YYYY'),
            getMomentLocale: jest.fn(() => 'en')
          }
        }
      ]
    });

    fixture = TestBed.createComponent(PersonProductionPersonalDataComponent);
    component = fixture.componentInstance;
    component.clientViewData = {
      displayName: 'Jane Maria Doe',
      firstname: 'Jane',
      middlename: 'Maria',
      lastname: 'Doe',
      gender: { name: 'Female' },
      mobileNo: '555-0100',
      emailAddress: 'jane@example.org',
      dateOfBirth: [
        1990,
        4,
        18
      ],
      clientType: { name: 'Individual' }
    };
    component.viewModel = {
      addresses: [
        {
          isActive: true,
          addressType: 'Office Address',
          street: 'Office Street'
        },
        {
          isActive: false,
          addressType: 'Home Address',
          street: 'Main Street',
          streetNumber: '42',
          apartmentNumber: '5B',
          neighborhood: 'Centro',
          postalCode: '12345',
          municipality: 'Guadalajara',
          locality: 'Zapopan',
          stateProvinceId: 20,
          countryId: 30
        }
      ],
      addressTemplate: {
        stateProvinceIdOptions: [{ id: 20, name: 'Jalisco' }],
        countryIdOptions: [{ id: 30, name: 'Mexico' }]
      },
      familyMembers: [
        {
          id: 7,
          firstName: 'John',
          lastName: 'Doe',
          relationship: 'Spouse',
          mobileNumber: '555-0123',
          address: 'Family address',
          profession: 'Teacher'
        }
      ],
      identifiers: [{ id: 1, documentKey: 'NID-123', documentType: { name: 'National ID' } }],
      documents: [],
      datatableSections: {
        socioeconomic: [
          {
            key: 'socioeconomic',
            title: 'Socioeconomic Information',
            sourceName: 'client_socioeconomic_information',
            columns: [],
            isMultiRow: true,
            records: [
              {
                fields: [
                  { label: 'Occupation', value: 'Engineer' },
                  { label: 'Average Monthly Income', value: '25000' }
                ]
              }
            ]
          }
        ],
        personalReferences: [
          {
            key: 'personalReferences',
            title: 'Personal References',
            sourceName: 'client_personal_references',
            columns: [],
            isMultiRow: true,
            records: [{ fields: [{ label: 'Reference Name', value: 'Maria Reference' }] }]
          }
        ],
        commercialReferences: [
          {
            key: 'commercialReferences',
            title: 'Commercial Reference',
            sourceName: 'client_commercial_reference',
            columns: [],
            isMultiRow: true,
            records: [{ fields: [{ label: 'Business Name', value: 'Corner Shop' }] }]
          }
        ],
        beneficiaries: [
          {
            key: 'beneficiaries',
            title: 'Beneficiaries',
            sourceName: 'client_beneficiaries',
            columns: [],
            isMultiRow: true,
            records: [
              {
                fields: [
                  { label: 'Beneficiary Name', value: 'Alice Doe' },
                  { label: 'Percentage', value: '50' },
                  { label: 'Relationship', value: 'Daughter' }
                ]
              }
            ]
          }
        ],
        pepPld: [
          {
            key: 'pepPld',
            title: 'Client Type / PEP / PLD Information',
            sourceName: 'client_pep_pld',
            columns: [],
            isMultiRow: true,
            records: [
              {
                fields: [
                  { label: 'Is Pep', value: 'No' },
                  { label: 'Level of Government', value: 'Federal' },
                  { label: 'Institution', value: 'Treasury' },
                  { label: 'Level and Charge', value: 'Director' },
                  { label: 'Reporting Period', value: '2024' },
                  { label: 'Related To Pep', value: 'Yes' },
                  { label: 'Full Name', value: 'Related Person' },
                  { label: 'Relationship', value: 'Sibling' },
                  { label: 'Entity Employee', value: 'No' },
                  { label: 'Position', value: 'Officer' }
                ]
              }
            ]
          }
        ]
      }
    };
  });

  it('renders the PERSON production sections in the Jira order', () => {
    fixture.detectChanges();

    const headings = fixture.debugElement
      .queryAll(By.css('h3'))
      .map((heading) => heading.nativeElement.textContent.trim());

    expect(headings).toEqual([
      'labels.heading.General Client Information',
      'labels.heading.Home Address',
      'labels.heading.Socioeconomic Information',
      'labels.heading.Personal References (2 Family Members, 1 Acquaintance)',
      'labels.heading.Commercial Reference',
      'labels.heading.Beneficiaries',
      'labels.heading.Client Type'
    ]);
  });

  it('renders real client, address, socioeconomic, beneficiary, and family reference values', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Jane Maria Doe');
    expect(text).toContain('NID-123');
    expect(text).toContain('Main Street');
    expect(text).not.toContain('Office Street');
    expect(text).toContain('Guadalajara');
    expect(text).toContain('Jalisco');
    expect(text).toContain('Mexico');
    expect(text).toContain('Engineer');
    expect(text).toContain('25000');
    expect(text).toContain('Maria Reference');
    expect(text).toContain('Corner Shop');
    expect(text).toContain('Alice Doe');
    expect(text).toContain('labels.inputs.Home phone 1');
    expect(text).toContain("labels.inputs.Spouse's Name");
    expect(text).toContain('labels.inputs.Zip code');
    expect(text).toContain('labels.inputs.Municipality/City');
    expect(text).toContain('labels.inputs.Locality/Borough/Town');
    expect(text).toContain('labels.inputs.Age of the business');
    expect(text).toContain('labels.inputs.Average Expenses (Monthly)');
    expect(text).toContain('labels.inputs.Colony / Neighborhood');
    expect(text).toContain('labels.inputs.Reference 1 (Family Member)');
    expect(text).toContain('labels.inputs.Reference 2 (Family Member)');
    expect(text).toContain('labels.inputs.Reference 3 (Acquaintance)');
    expect(text).toContain('labels.inputs.Reference 1');
    expect(text).toContain('labels.inputs.Reference 2');
    expect(text).toContain('labels.inputs.Reference 3');
    expect(text).toContain('labels.text.Person PEP PLD Question 1');
    expect(text).toContain('labels.text.Person PEP PLD Question 2');
    expect(text).toContain('labels.text.Person PEP PLD Question 3');
    expect(text).toContain('Federal');
    expect(fixture.nativeElement.querySelectorAll('.yes-no-indicator').length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('.yes-no-option.selected').length).toBe(3);
    const entityEmployeeItem = Array.from(fixture.nativeElement.querySelectorAll('.data-item')).find((item: Element) =>
      item.textContent?.includes('labels.inputs.Entity Employee')
    ) as HTMLElement;
    expect(entityEmployeeItem.querySelector('.yes-no-indicator')).toBeTruthy();
    expect(entityEmployeeItem.querySelectorAll('.yes-no-option.selected').length).toBe(1);
    expect(entityEmployeeItem.querySelector('.yes-no-option.selected')?.getAttribute('aria-pressed')).toBe('true');
    expect(text).not.toContain('client_personal_references');
    expect(text).not.toContain('client_commercial_reference');
    expect(text).not.toContain('labels.inputs.Pep Details');
    expect(text).not.toContain('labels.inputs.Pld Observations');
    expect(text).not.toContain('labels.inputs.KYC Validation');
    expect(text).not.toContain('labels.inputs.Account No');
    expect(text).not.toContain('labels.inputs.Office');
  });

  it('handles missing optional datasets without crashing', () => {
    component.viewModel = {
      addresses: [],
      familyMembers: [],
      identifiers: [],
      documents: [],
      datatableSections: {
        personalReferences: [
          {
            key: 'personalReferences',
            title: 'Personal References',
            sourceName: 'client_personal_references',
            columns: [],
            isMultiRow: true,
            records: []
          }
        ],
        commercialReferences: [
          {
            key: 'commercialReferences',
            title: 'Commercial Reference',
            sourceName: 'client_commercial_reference',
            columns: [],
            isMultiRow: true,
            records: []
          }
        ],
        pepPld: [
          {
            key: 'pepPld',
            title: 'Client Type / PEP / PLD Information',
            sourceName: 'client_pep_pld',
            columns: [{ columnName: 'pep', label: 'PEP', idx: 1 }],
            isMultiRow: true,
            records: []
          }
        ]
      }
    };

    expect(() => fixture.detectChanges()).not.toThrow();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('labels.inputs.Street');
    expect(text).toContain('labels.inputs.Street Number');
    expect(text).toContain('labels.inputs.Apartment Number');
    expect(text).toContain('labels.inputs.Neighborhood');
    expect(text).toContain('labels.inputs.Zip code');
    expect(text).toContain('labels.inputs.Municipality/City');
    expect(text).toContain('labels.inputs.Locality/Borough/Town');
    expect(text).toContain('labels.inputs.State');
    expect(text).toContain('labels.inputs.Country');
    expect(text).toContain('labels.inputs.Name');
    expect(text).toContain('labels.inputs.Relationship');
    expect(text).toContain('labels.inputs.Reference 3 (Acquaintance)');
    expect(text).toContain('labels.text.Person PEP PLD Question 1');
    expect(text).toContain('labels.inputs.Yes / No');
    expect(fixture.nativeElement.querySelectorAll('.yes-no-indicator').length).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('.yes-no-option.selected').length).toBe(0);
    const entityEmployeeItem = Array.from(fixture.nativeElement.querySelectorAll('.data-item')).find((item: Element) =>
      item.textContent?.includes('labels.inputs.Entity Employee')
    ) as HTMLElement;
    expect(entityEmployeeItem.querySelector('.yes-no-indicator')).toBeFalsy();
    expect(entityEmployeeItem.textContent).toContain('-');
    expect(text).not.toContain('labels.inputs.Address Line 1');
    expect(text).not.toContain('labels.inputs.Pep Details');
    expect(text).not.toContain('client_personal_references');
    expect(text).not.toContain('client_commercial_reference');
  });

  it('does not display raw zero address state or country ids', () => {
    component.viewModel = {
      addresses: [
        {
          addressType: 'Home Address',
          stateProvinceId: 0,
          countryId: 0
        }
      ],
      addressTemplate: {
        stateProvinceIdOptions: [{ id: 20, name: 'Jalisco' }],
        countryIdOptions: [{ id: 30, name: 'Mexico' }]
      },
      familyMembers: [],
      identifiers: [],
      documents: [],
      datatableSections: {}
    };

    fixture.detectChanges();

    expect(component.addressFields.find((field) => field.label === 'State')?.value).toBe('-');
    expect(component.addressFields.find((field) => field.label === 'Country')?.value).toBe('-');
    expect(fixture.nativeElement.textContent).not.toContain('>0<');
  });

  describe('address presentation', () => {
    const legacyAddress = {
      addressType: 'Home Address',
      street: '',
      addressLine1: '407',
      addressLine2: 'SANTA RITA',
      addressLine3: '',
      city: 'LEON DE LOS ALDAMA',
      postalCode: '37450',
      stateProvinceId: 20,
      countryId: 30
    };

    function renderAddresses(addresses: any[]): Record<string, string> {
      fixture.componentRef.setInput('viewModel', { ...component.viewModel, addresses });
      fixture.detectChanges();
      const section = fixture.debugElement
        .queryAll(By.css('.section'))
        .find(
          (element) => element.query(By.css('h3'))?.nativeElement.textContent.trim() === 'labels.heading.Home Address'
        );
      expect(section).toBeDefined();
      return Object.fromEntries(
        section!.queryAll(By.css('.data-item')).map((item) => [
          item.query(By.css('.label')).nativeElement.textContent.trim().replace('labels.inputs.', ''),
          item.query(By.css('.value')).nativeElement.textContent.trim()
        ])
      );
    }

    it('renders the reported legacy values under their correct labels without mutating the source', () => {
      const address = Object.freeze({ ...legacyAddress });
      const original = { ...address };
      component.viewModel!.addressTemplate = {
        stateProvinceIdOptions: [{ id: 20, name: 'Guanajuato' }],
        countryIdOptions: [{ id: 30, name: 'México' }]
      };
      const expected = {
        Street: '-',
        'Street Number': '407',
        'Apartment Number': '-',
        Neighborhood: 'SANTA RITA',
        'Zip code': '37450',
        'Municipality/City': 'LEON DE LOS ALDAMA',
        'Locality/Borough/Town': '-',
        State: 'Guanajuato',
        Country: 'México'
      };

      expect(renderAddresses([address])).toEqual(expected);
      expect(renderAddresses([address])).toEqual(expected);
      expect(address).toEqual(original);
      expect(component.homeAddress).toBe(address);
    });

    it('prefers dedicated fields over conflicting legacy values and aliases', () => {
      expect(
        renderAddresses([
          {
            ...legacyAddress,
            street: 'AVENIDA REFORMA',
            streetNumber: '125',
            houseNumber: '126',
            houseNo: '127',
            apartmentNumber: '4B',
            apartmentNo: '5B',
            unitNumber: '6B',
            addressLine3: 'Unspecified third line',
            neighborhood: 'CENTRO',
            colony: 'OTHER COLONY',
            colonia: 'OTHER COLONIA'
          }
        ])
      ).toMatchObject({
        Street: 'AVENIDA REFORMA',
        'Street Number': '125',
        'Apartment Number': '4B',
        Neighborhood: 'CENTRO'
      });
    });

    it.each([
      { houseNumber: '12A', apartmentNo: '2B', colony: 'COLONY 2' },
      { houseNo: '12A', unitNumber: '2B', colonia: 'COLONY 2' }
    ])('supports established dedicated aliases: %o', (aliases) => {
      expect(renderAddresses([{ ...legacyAddress, ...aliases }])).toMatchObject({
        Street: '-',
        'Street Number': '12A',
        'Apartment Number': '2B',
        Neighborhood: 'COLONY 2'
      });
    });

    it('does not infer the meaning of address lines from their contents', () => {
      expect(
        renderAddresses([
          {
            ...legacyAddress,
            addressLine1: '407-B',
            addressLine2: '15 DE MAYO',
            addressLine3: 'Unspecified third line'
          }
        ])
      ).toMatchObject({
        Street: '-',
        'Street Number': '407-B',
        'Apartment Number': '-',
        Neighborhood: '15 DE MAYO'
      });
    });

    it.each([
      { addresses: [] },
      { addresses: [{}] },
      {
        addresses: [
          {
            street: null,
            streetNumber: null,
            apartmentNumber: null,
            neighborhood: null,
            addressLine1: null,
            addressLine2: null,
            addressLine3: null
          }
        ]
      }
    ])('renders missing fields safely for %o', ({ addresses }) => {
      const fields = renderAddresses(addresses);
      expect(Object.values(fields)).toEqual(Array(9).fill('-'));
    });

    it('keeps the inactive home address ahead of an active work address', () => {
      const work = { ...legacyAddress, addressType: 'Work Address', isActive: true, addressLine1: '999' };
      const home = { ...legacyAddress, isActive: false };

      expect(
        renderAddresses([
          work,
          home
        ])['Street Number']
      ).toBe('407');
      expect(component.homeAddress).toBe(home);
    });

    it('keeps the active address fallback when there is no home address', () => {
      const work = { ...legacyAddress, addressType: 'Work Address', isActive: false, addressLine1: '999' };
      const other = { ...legacyAddress, addressType: 'Other Address', isActive: true };

      expect(
        renderAddresses([
          work,
          other
        ])
      ).toMatchObject({ 'Street Number': '407', Neighborhood: 'SANTA RITA' });
      expect(component.homeAddress).toBe(other);
    });

    it('keeps the first address fallback when no home or active address exists', () => {
      const work = { ...legacyAddress, addressType: 'Work Address', isActive: false };
      const other = { ...work, addressType: 'Other Address', addressLine1: '999' };

      expect(
        renderAddresses([
          work,
          other
        ])
      ).toMatchObject({ 'Street Number': '407', Neighborhood: 'SANTA RITA' });
      expect(component.homeAddress).toBe(work);
    });

    it('loads and renders the profile through GET requests without issuing writes', () => {
      const http = TestBed.inject(HttpTestingController);
      const address = Object.freeze({ ...legacyAddress });
      let loaded = false;
      TestBed.inject(PersonalDataViewService)
        .load('11')
        .subscribe((viewModel) => {
          loaded = true;
          fixture.componentRef.setInput('viewModel', viewModel);
        });
      const responses = new Map<string, unknown>([
        [
          '/client/11/addresses',
          [address]
        ],
        [
          '/client/addresses/template',
          component.viewModel!.addressTemplate
        ],
        [
          '/clients/11/familymembers',
          []
        ],
        [
          '/clients/11/identifiers',
          []
        ],
        [
          '/clients/11/documents',
          []
        ]
      ]);
      responses.forEach((response, url) => {
        const request = http.expectOne(url);
        expect(request.request.method).toBe('GET');
        request.flush(response as any);
      });

      expect(loaded).toBe(true);
      expect(renderAddresses(component.viewModel!.addresses)).toMatchObject({
        Street: '-',
        'Street Number': '407',
        Neighborhood: 'SANTA RITA'
      });
      expect(address).toEqual(legacyAddress);
      http.expectNone((request) => [
          'POST',
          'PUT',
          'PATCH',
          'DELETE'
        ].includes(request.method));
      http.verify();
    });
  });

  it('does not render section-level Edit buttons in the read-only overview', () => {
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('button:not(.yes-no-option)')).length).toBe(0);
    expect(fixture.nativeElement.textContent).not.toContain('labels.buttons.Edit');
  });

  it('keeps the existing KYC actions available when KYC validation is enabled', () => {
    component.isKycEnabled = true;
    component.canExportKyc = true;
    component.validationData = {
      validationStatus: ValidationStatus.COMPLETE
    } as any;
    jest.spyOn(component.exportKyc, 'emit');
    jest.spyOn(component.validateDocumentation, 'emit');

    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('button'));

    buttons[0].nativeElement.click();
    buttons[1].nativeElement.click();

    expect(component.exportKyc.emit).toHaveBeenCalled();
    expect(component.validateDocumentation.emit).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('labels.inputs.COMPLETE');
  });
  it('disables export while loading and keeps validation available', () => {
    component.isKycEnabled = true;
    component.canExportKyc = true;
    component.isExportingKyc = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.export-kyc-button').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.validate-docs-button').disabled).toBe(false);
  });

  it('hides an unauthorized export without hiding validation', () => {
    component.isKycEnabled = true;
    component.canExportKyc = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.export-kyc-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.validate-docs-button')).not.toBeNull();
  });
});

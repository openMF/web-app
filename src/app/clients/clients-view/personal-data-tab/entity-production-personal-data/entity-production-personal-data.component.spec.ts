/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { ValidationStatus } from 'app/clients/models/document-validation.model';
import { EntityProductionPersonalDataComponent } from './entity-production-personal-data.component';

const translationsDirectory = join(process.cwd(), 'src/assets/translations');
const generalDataTranslationKeys = [
  'labels.heading.Legal Entity Details',
  'labels.heading.Tax Address',
  'labels.inputs.Name or Corporate Name',
  'labels.inputs.Tax Id',
  'labels.inputs.Digital Id',
  'labels.inputs.Deed Number',
  'labels.inputs.Date of Deed',
  'labels.inputs.Notary Office',
  'labels.inputs.Name of the Notary',
  'labels.inputs.Electronic Reference Number',
  'labels.inputs.Date of Incorporation',
  'labels.inputs.Registration Date',
  'labels.inputs.Nature of business, business activity, or corporate purpose',
  'labels.inputs.No Ext',
  'labels.inputs.No Int',
  'labels.inputs.Neighborhood',
  'labels.inputs.Zip code'
];

function translationValue(translations: Record<string, any>, key: string): unknown {
  const [
    root,
    section,
    ...leafParts
  ] = key.split('.');
  return translations[root]?.[section]?.[leafParts.join('.')];
}

describe('EntityProductionPersonalDataComponent', () => {
  let fixture: ComponentFixture<EntityProductionPersonalDataComponent>;
  let component: EntityProductionPersonalDataComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        EntityProductionPersonalDataComponent,
        TranslateModule.forRoot()
      ],
      providers: [
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

    fixture = TestBed.createComponent(EntityProductionPersonalDataComponent);
    component = fixture.componentInstance;
    component.clientViewData = {
      displayName: 'Acme Holdings',
      fullname: 'Acme Holdings LLC',
      emailAddress: 'contact@acme.example',
      mobileNo: '555-9000',
      dateOfBirth: [
        2020,
        1,
        15
      ],
      clientNonPersonDetails: {
        incorpNumber: 'INC-99'
      }
    };
    component.viewModel = {
      addresses: [
        {
          isActive: true,
          street: 'Fiscal Avenue',
          streetNumber: '10',
          apartmentNumber: '2',
          neighborhood: 'Centro',
          postalCode: '44100',
          city: 'Guadalajara',
          stateName: 'Jalisco',
          countryName: 'Mexico'
        }
      ],
      familyMembers: [],
      identifiers: [{ id: 1, documentKey: 'RFC-123', documentType: { name: 'Tax ID' } }],
      documents: [],
      datatableSections: {
        legalRepresentative: [
          {
            key: 'legalRepresentative',
            title: 'Legal Representative',
            sourceName: 'entity_legal_representative',
            columns: [],
            isMultiRow: true,
            records: [
              {
                fields: [
                  { label: 'Middle Name', value: 'Alex' },
                  { label: 'Email', value: 'alex@example.org' }
                ]
              }
            ]
          }
        ],
        addressLegalRepresentative: [
          {
            key: 'addressLegalRepresentative',
            title: 'Address of Legal Representative',
            sourceName: 'entity_address_legal_representative',
            columns: [],
            isMultiRow: true,
            records: [{ fields: [{ label: 'Address', value: 'Legal address' }] }]
          }
        ],
        authorizedRepresentative: [],
        addressAuthorizedRepresentative: [],
        pepRelatedIndividuals: [
          {
            key: 'pepRelatedIndividuals',
            title: 'Politically Exposed Persons and Related Individuals',
            sourceName: 'entity_pep_related_individuals',
            columns: [],
            isMultiRow: true,
            records: [{ fields: [{ label: 'Yes / No', value: 'Yes' }] }]
          }
        ],
        resourceProviderBeneficialOwner: [],
        transactionalProfile: [],
        shareholdingIndividuals: [],
        shareholdingLegalEntities: [],
        uboLegalEntities: [],
        uboNaturalPersons: [],
        controllingPersonPepQuestions: []
      }
    };
  });

  it('renders the ENTITY production sections in the Jira order', () => {
    fixture.detectChanges();

    const headings = fixture.debugElement
      .queryAll(By.css('h3'))
      .map((heading) => heading.nativeElement.textContent.trim());

    expect(headings).toEqual([
      'labels.heading.Legal Entity Details',
      'labels.heading.Tax Address',
      'labels.heading.Legal Representative',
      'labels.heading.Address of Legal Representative',
      'labels.heading.Authorized Representative',
      'labels.heading.Address of Authorized Representative',
      'labels.heading.Politically Exposed Persons and Related Individuals',
      'labels.heading.Resource Provider / Beneficial Owner',
      'labels.heading.Customer Transactional Profile',
      'labels.heading.Shareholding Structure - Individuals',
      'labels.heading.Shareholding Structure - Legal Entities',
      'labels.heading.Declaration of Ultimate Beneficial Owners',
      'labels.heading.Controlling Person / PEP Related Questions'
    ]);
    expect(fixture.nativeElement.textContent).toContain('labels.heading.Legal Entity');
    expect(fixture.nativeElement.textContent).toContain('labels.heading.Natural Person');
  });

  it('resolves all General Data labels in es-MX', () => {
    const translateService = TestBed.inject(TranslateService);
    const translations = JSON.parse(readFileSync(join(translationsDirectory, 'es-MX.json'), 'utf8'));
    translateService.setTranslation('es-MX', translations);
    translateService.use('es-MX');

    fixture.detectChanges();

    generalDataTranslationKeys.forEach((key) => {
      expect(translateService.instant(key)).not.toBe(key);
      expect(fixture.nativeElement.textContent).not.toContain(key);
    });
    expect(fixture.nativeElement.textContent).toContain('Detalles de persona moral');
    expect(fixture.nativeElement.textContent).toContain('Domicilio fiscal');
    expect(fixture.nativeElement.textContent).toContain('Nombre del notario');
    expect(fixture.nativeElement.textContent).toContain('Fecha de registro');
  });

  it.each(readdirSync(translationsDirectory).filter((file) => file.endsWith('.json')))(
    'defines every Entity General Data key in %s',
    (localeFile) => {
      const translations = JSON.parse(readFileSync(join(translationsDirectory, localeFile), 'utf8'));

      generalDataTranslationKeys.forEach((key) => {
        const value = translationValue(translations, key);

        expect(typeof value).toBe('string');
        expect((value as string).trim()).toBeTruthy();
        expect(value).not.toBe(key);
        expect(value).not.toMatch(/^labels\./i);
      });
    }
  );

  it('renders real entity, tax address, identifier, and representative datatable values', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Acme Holdings LLC');
    expect(text).toContain('RFC-123');
    expect(text).toContain('Fiscal Avenue');
    expect(text).toContain('44100');
    expect(text).toContain('Alex');
    expect(text).toContain('alex@example.org');
    expect(text).toContain('Legal address');
    expect(text).toContain('labels.inputs.No Ext');
    expect(text).toContain('labels.inputs.No Int');
    expect(text).toContain('labels.inputs.Borough / City / Delegation / Municipality / Locality / Town');
    expect(text).toContain('labels.inputs.Monthly Income Amount');
    expect(text).toContain('labels.inputs.Use: Single family residential building');
    expect(text).toContain('labels.inputs.Level of Control');
    expect(text).toContain('labels.text.Entity PEP Related Intro');
    expect(text).toContain('labels.text.Entity Resource Provider Question 1');
    expect(text).toContain('labels.text.Entity Resource Provider Question 2');
    expect(text).toContain('labels.text.Entity Controlling Person PEP Question 1');
    expect(text).toContain('labels.text.Entity Controlling Person PEP Question 2');
    expect(text).not.toContain('entity_legal_representative');
    expect(text).not.toContain('entity_transactional_profile');
    expect(text).not.toContain('labels.heading.Account Information');
    expect(fixture.nativeElement.querySelectorAll('.yes-no-indicator').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelectorAll('.yes-no-option.selected').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('.yes-no-option.selected')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('prefers exact DataTable labels before substring fallback matches', () => {
    component.viewModel = {
      ...component.viewModel!,
      datatableSections: {
        ...component.viewModel!.datatableSections,
        shareholdingLegalEntities: [
          {
            key: 'shareholdingLegalEntities',
            title: 'Shareholding Structure - Legal Entities',
            sourceName: 'entity_shareholding_legal_entities',
            columns: [],
            isMultiRow: true,
            records: [
              {
                fields: [
                  { label: 'No. of Shares', value: '100' },
                  { label: '% Shares', value: '25' }
                ]
              }
            ]
          }
        ]
      }
    };

    fixture.detectChanges();
    const shareFields = Array.from(fixture.nativeElement.querySelectorAll('.data-item')).filter((item: Element) =>
      item.textContent?.includes('labels.inputs.% Shares')
    );

    expect(shareFields.some((item: Element) => item.textContent?.includes('25'))).toBe(true);
  });

  it('normalizes accented Yes values for the read-only Yes/No indicator', () => {
    component.viewModel = {
      ...component.viewModel!,
      datatableSections: {
        ...component.viewModel!.datatableSections,
        pepRelatedIndividuals: [
          {
            key: 'pepRelatedIndividuals',
            title: 'Politically Exposed Persons and Related Individuals',
            sourceName: 'entity_pep_related_individuals',
            columns: [],
            isMultiRow: true,
            records: [{ fields: [{ label: 'Yes / No', value: 'Sí' }] }]
          }
        ]
      }
    };

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.yes-no-option.selected')?.textContent).toContain('labels.buttons.Yes');
  });

  it('handles missing optional datasets without crashing', () => {
    component.viewModel = {
      addresses: [],
      familyMembers: [],
      identifiers: [],
      documents: [],
      datatableSections: {}
    };

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('labels.inputs.Name or Corporate Name');
    expect(fixture.nativeElement.textContent).toContain('labels.inputs.Monthly Income Amount');
    expect(fixture.nativeElement.textContent).not.toContain('labels.text.No Data');
  });

  it('does not render section-level Edit buttons in the read-only overview', () => {
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('button:not(.yes-no-option)')).length).toBe(0);
    expect(fixture.nativeElement.textContent).not.toContain('labels.buttons.Edit');
  });

  it('keeps the existing KYC actions available when KYC validation is enabled', () => {
    component.isKycEnabled = true;
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
});

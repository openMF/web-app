/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CustomerDataValidation, ValidationStatus } from 'app/clients/models/document-validation.model';
import { ENTITY_PERSONAL_DATA_DATATABLES } from 'app/clients/models/personal-data-datatables.model';
import { PersonalDataField, PersonalDataTableSection, PersonalDataViewModel } from '../personal-data-view.model';

interface EntityFieldConfig {
  label: string;
  patterns: string[];
  date?: boolean;
  className?: string;
}

interface EntityDatatableDisplaySection {
  key: string;
  title: string;
  fields: EntityFieldConfig[];
  questionKeys?: string[];
  explanatoryTextKeys?: string[];
  subtitle?: string;
}

interface EntityDisplayGroup {
  subtitle?: string;
  questionKeys?: string[];
  explanatoryTextKeys?: string[];
  records: PersonalDataField[][];
}

@Component({
  selector: 'mifosx-entity-production-personal-data',
  templateUrl: './entity-production-personal-data.component.html',
  styleUrls: ['./entity-production-personal-data.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    DateFormatPipe,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityProductionPersonalDataComponent {
  @Input() clientViewData: any;
  @Input() viewModel: PersonalDataViewModel | null = null;
  @Input() isKycEnabled = false;
  @Input() validationData: CustomerDataValidation | null = null;

  @Output() exportKyc = new EventEmitter<void>();
  @Output() validateDocumentation = new EventEmitter<void>();

  readonly ValidationStatus = ValidationStatus;
  readonly entityDisplaySections: EntityDatatableDisplaySection[] = [
    {
      key: 'legalRepresentative',
      title: 'labels.heading.Legal Representative',
      fields: [
        { label: 'labels.inputs.Middle Name', patterns: [
            'middle name',
            'middle name s',
            'middlename'
          ] },
        { label: 'labels.inputs.Last Name', patterns: [
            'last name',
            'last name s',
            'lastname'
          ] },
        { label: 'labels.inputs.Name(s)', patterns: [
            'name s',
            'names',
            'first name',
            'firstname',
            'name'
          ] },
        { label: 'labels.inputs.Tax Id', patterns: [
            'tax id',
            'tax number',
            'rfc'
          ] },
        { label: 'labels.inputs.Birthdate', patterns: [
            'birthdate',
            'birth date',
            'date of birth'
          ], date: true },
        { label: 'labels.inputs.Country of Birth', patterns: [
            'country of birth',
            'birth country'
          ] },
        { label: 'labels.inputs.Email', patterns: [
            'email',
            'email address'
          ] }
      ]
    },
    {
      key: 'addressLegalRepresentative',
      title: 'labels.heading.Address of Legal Representative',
      fields: this.representativeAddressFields()
    },
    {
      key: 'authorizedRepresentative',
      title: 'labels.heading.Authorized Representative',
      fields: [
        { label: 'labels.inputs.Middle Name', patterns: [
            'middle name',
            'middle name s',
            'middlename'
          ] },
        { label: 'labels.inputs.Last Name', patterns: [
            'last name',
            'last name s',
            'lastname'
          ] },
        { label: 'labels.inputs.Name(s)', patterns: [
            'name s',
            'names',
            'first name',
            'firstname',
            'name'
          ] },
        { label: 'labels.inputs.Tax Id', patterns: [
            'tax id',
            'tax number',
            'rfc'
          ] },
        { label: 'labels.inputs.Birthdate', patterns: [
            'birthdate',
            'birth date',
            'date of birth'
          ], date: true },
        { label: 'labels.inputs.Country of Birth', patterns: [
            'country of birth',
            'birth country'
          ] },
        { label: 'labels.inputs.Email', patterns: [
            'email',
            'email address'
          ] }
      ]
    },
    {
      key: 'addressAuthorizedRepresentative',
      title: 'labels.heading.Address of Authorized Representative',
      fields: this.representativeAddressFields()
    },
    {
      key: 'pepRelatedIndividuals',
      title: 'labels.heading.Politically Exposed Persons and Related Individuals',
      questionKeys: [
        'labels.text.Entity PEP Related Intro',
        'labels.text.Entity PEP Related Question 1',
        'labels.text.Entity PEP Related Question 2'
      ],
      fields: [
        { label: 'labels.inputs.Yes / No', patterns: [
            'yes no',
            'answer',
            'pep',
            'question 1'
          ] },
        { label: 'labels.inputs.Name', patterns: ['name'] },
        { label: 'labels.inputs.Affiliation', patterns: [
            'affiliation',
            'institution'
          ] },
        { label: 'labels.inputs.Position', patterns: [
            'position',
            'level and charge'
          ] },
        { label: 'labels.inputs.Reporting period', patterns: [
            'reporting period',
            'period reported'
          ] },
        { label: 'labels.inputs.Relationship', patterns: ['relationship'] },
        { label: 'labels.inputs.Main Activities', patterns: [
            'main activities',
            'key functions'
          ] },
        { label: 'labels.inputs.Period reported', patterns: [
            'period reported',
            'reporting period'
          ] }
      ]
    },
    {
      key: 'resourceProviderBeneficialOwner',
      title: 'labels.heading.Resource Provider / Beneficial Owner',
      questionKeys: [
        'labels.text.Entity Resource Provider Question 1',
        'labels.text.Entity Resource Provider Question 2'
      ],
      explanatoryTextKeys: [
        'labels.text.Entity Ultimate Beneficial Owner Interview Text',
        'labels.text.Entity Resource Provider Interview Text'
      ],
      fields: [{ label: 'labels.inputs.Yes / No', patterns: [
            'yes no',
            'answer',
            'declared',
            'third party'
          ] }]
    },
    {
      key: 'transactionalProfile',
      title: 'labels.heading.Customer Transactional Profile',
      fields: [
        { label: 'labels.inputs.Monthly Income Amount', patterns: [
            'monthly income amount',
            'monthly income',
            'income amount'
          ] },
        {
          label: 'labels.inputs.Monthly Expenditure Amount',
          patterns: [
            'monthly expenditure amount',
            'monthly expenditure',
            'expenditure amount'
          ]
        },
        {
          label: 'labels.inputs.Where do the funds to open the account come from?',
          patterns: [
            'funds to open the account',
            'source of funds',
            'funds come from'
          ]
        },
        {
          label: 'labels.inputs.Allocation of resources for operations',
          patterns: [
            'allocation of resources for operations',
            'allocation of resources',
            'resources for operations'
          ]
        }
      ]
    },
    {
      key: 'shareholdingIndividuals',
      title: 'labels.heading.Shareholding Structure - Individuals',
      fields: [
        { label: 'labels.inputs.Middle Name', patterns: [
            'middle name',
            'middlename'
          ] },
        { label: 'labels.inputs.Last Name', patterns: [
            'last name',
            'lastname'
          ] },
        { label: 'labels.inputs.Name(s)', patterns: [
            'name s',
            'names',
            'first name',
            'name'
          ] },
        { label: 'labels.inputs.Tax Id', patterns: [
            'tax id',
            'tax number',
            'rfc'
          ] },
        { label: 'labels.inputs.Number of Shares', patterns: [
            'number of shares',
            'no of shares',
            'shares number'
          ] },
        { label: 'labels.inputs.% of Shares', patterns: [
            'of shares',
            'shares'
          ] },
        { label: 'labels.inputs.National Id', patterns: [
            'national id',
            'national identifier'
          ] },
        {
          label: 'labels.inputs.Use: Single family residential building',
          patterns: [
            'single family residential building',
            'use'
          ]
        },
        { label: 'labels.inputs.Nationality', patterns: ['nationality'] },
        { label: 'labels.inputs.Economic Activity', patterns: [
            'economic activity',
            'activity'
          ] },
        { label: 'labels.inputs.Spouse Full Name', patterns: [
            'spouse full name',
            'spouse name',
            'full name'
          ] }
      ]
    },
    {
      key: 'shareholdingLegalEntities',
      title: 'labels.heading.Shareholding Structure - Legal Entities',
      fields: [
        { label: 'labels.inputs.Name or Corporate Name', patterns: [
            'name or corporate name',
            'corporate name',
            'name'
          ] },
        { label: 'labels.inputs.Tax Id', patterns: [
            'tax id',
            'tax number',
            'rfc'
          ] },
        { label: 'labels.inputs.Date of Incorporation', patterns: [
            'date of incorporation',
            'incorporation date'
          ], date: true },
        { label: 'labels.inputs.Number of Shares', patterns: [
            'no of shares',
            'number of shares'
          ] },
        { label: 'labels.inputs.% Shares', patterns: [
            'shares',
            'of shares'
          ] },
        { label: 'labels.inputs.Nationality', patterns: ['nationality'] },
        { label: 'labels.inputs.Economic Activity', patterns: [
            'economic activity',
            'activity'
          ] }
      ]
    },
    {
      key: 'uboLegalEntities',
      title: 'labels.heading.Declaration of Ultimate Beneficial Owners',
      subtitle: 'labels.heading.Legal Entity',
      fields: [
        { label: 'labels.inputs.Name or Corporate Name', patterns: [
            'name or corporate name',
            'corporate name',
            'name'
          ] },
        { label: 'labels.inputs.% Shares', patterns: [
            'shares',
            'of shares'
          ] },
        { label: 'labels.inputs.Tax Id', patterns: [
            'tax id',
            'tax number',
            'rfc'
          ] },
        { label: 'labels.inputs.Level of Control', patterns: [
            'level of control',
            'control level'
          ] }
      ]
    },
    {
      key: 'uboNaturalPersons',
      title: 'labels.heading.Declaration of Ultimate Beneficial Owners',
      subtitle: 'labels.heading.Natural Person',
      fields: [
        { label: 'labels.inputs.Middle Name', patterns: [
            'middle name',
            'middlename'
          ] },
        { label: 'labels.inputs.Last Name', patterns: [
            'last name',
            'lastname'
          ] },
        { label: 'labels.inputs.Name(s)', patterns: [
            'name s',
            'names',
            'first name',
            'name'
          ] },
        { label: 'labels.inputs.Tax Id', patterns: [
            'tax id',
            'tax number',
            'rfc'
          ] },
        { label: 'labels.inputs.National Id', patterns: [
            'national id',
            'national identifier'
          ] },
        { label: 'labels.inputs.Position within the Entity', patterns: [
            'position within the entity',
            'position'
          ] },
        { label: 'labels.inputs.% of Shares', patterns: [
            'of shares',
            'shares'
          ] },
        { label: 'labels.inputs.Level of Control', patterns: [
            'level of control',
            'control level'
          ] }
      ]
    },
    {
      key: 'controllingPersonPepQuestions',
      title: 'labels.heading.Controlling Person / PEP Related Questions',
      questionKeys: [
        'labels.text.Entity Controlling Person PEP Question 1',
        'labels.text.Entity Controlling Person PEP Question 2'
      ],
      fields: [
        { label: 'labels.inputs.Yes / No', patterns: [
            'yes no',
            'answer',
            'question'
          ] },
        { label: 'labels.inputs.Name', patterns: ['name'] },
        { label: 'labels.inputs.Institution', patterns: [
            'institution',
            'affiliation'
          ] },
        { label: 'labels.inputs.Level and charge', patterns: [
            'level and charge',
            'position'
          ] },
        { label: 'labels.inputs.Key Functions', patterns: [
            'key functions',
            'main activities'
          ] },
        { label: 'labels.inputs.Reporting period', patterns: [
            'reporting period',
            'period reported'
          ] },
        { label: 'labels.inputs.Relationship', patterns: ['relationship'] }
      ]
    }
  ];

  get taxAddress(): any {
    return (
      this.viewModel?.addresses?.find((address: any) => /tax/i.test(address.addressType || '')) || this.activeAddress
    );
  }

  get activeAddress(): any {
    return this.viewModel?.addresses?.find((address: any) => address.isActive) || this.viewModel?.addresses?.[0];
  }

  get entityDetails(): any {
    return this.clientViewData?.clientNonPersonDetails || {};
  }

  get legalEntityFields(): PersonalDataField[] {
    return this.fixedFields([
      {
        label: 'labels.inputs.Name or Corporate Name',
        value: () =>
          this.readClientValue([
            'fullname',
            'displayName'
          ])
      },
      {
        label: 'labels.inputs.Tax Id',
        value: () =>
          this.readClientOrDatatableValue(
            [
              'taxId',
              'taxID',
              'taxNumber',
              'rfc'
            ],
            [
              'tax id',
              'tax number',
              'rfc'
            ]
          ) ||
          this.identifierValue([
            /tax/i,
            /\brfc\b/i
          ])
      },
      {
        label: 'labels.inputs.Digital Id',
        value: () =>
          this.readClientOrDatatableValue(
            [
              'digitalId',
              'digitalID'
            ],
            [
              'digital id',
              'digital identifier'
            ]
          )
      },
      {
        label: 'labels.inputs.Deed Number',
        value: () =>
          this.readClientOrDatatableValue(
            [
              'deedNumber',
              'deedNo'
            ],
            [
              'deed no',
              'deed number'
            ]
          )
      },
      {
        label: 'labels.inputs.Date of Deed',
        value: () =>
          this.readClientOrDatatableValue(
            [
              'dateOfDeed',
              'deedDate'
            ],
            [
              'date of deed',
              'deed date'
            ]
          ),
        date: true
      },
      {
        label: 'labels.inputs.Notary Office',
        value: () => this.readClientOrDatatableValue(['notaryOffice'], ['notary office'])
      },
      {
        label: 'labels.inputs.Name of the Notary',
        value: () =>
          this.readClientOrDatatableValue(
            [
              'notaryName',
              'nameOfNotary'
            ],
            [
              'name of notary',
              'notary name'
            ]
          )
      },
      {
        label: 'labels.inputs.Electronic Reference Number',
        value: () =>
          this.readClientOrDatatableValue(
            ['electronicReferenceNumber'],
            [
              'electronic reference number',
              'electronic reference'
            ]
          )
      },
      {
        label: 'labels.inputs.Date of Incorporation',
        value: () =>
          this.readClientOrDatatableValue(
            [
              'dateOfBirth',
              'dateOfIncorporation'
            ],
            [
              'date of incorporation',
              'incorporation date'
            ],
            ['entityLegalDetails']
          ),
        date: true
      },
      {
        label: 'labels.inputs.Registration Date',
        value: () =>
          this.readClientOrDatatableValue(
            ['registrationDate'],
            [
              'registration date',
              'registration data'
            ],
            ['entityLegalDetails']
          ),
        date: true
      },
      {
        label: 'labels.inputs.Nature of business, business activity, or corporate purpose',
        value: () =>
          this.readClientOrDatatableValue(
            [
              'businessActivity',
              'corporatePurpose',
              'mainBusinessLine'
            ],
            [
              'nature of business',
              'business activity',
              'corporate purpose',
              'main business line'
            ],
            ['entityLegalDetails']
          )
      },
      {
        label: 'labels.inputs.Nationality',
        value: () => this.readClientOrDatatableValue(['nationality'], ['nationality'])
      },
      {
        label: 'labels.inputs.Phone',
        value: () =>
          this.readClientValue([
            'mobileNo',
            'mobileNumber'
          ])
      },
      {
        label: 'labels.inputs.Email',
        value: () =>
          this.readClientValue([
            'emailAddress',
            'email'
          ])
      }
    ]);
  }

  get taxAddressFields(): PersonalDataField[] {
    const address = this.taxAddress;
    return this.fixedFields([
      {
        label: 'labels.inputs.Street',
        value: () =>
          this.readObjectValue(address, [
            'street',
            'addressLine1'
          ])
      },
      {
        label: 'labels.inputs.No Ext',
        value: () =>
          this.readObjectValue(address, [
            'streetNumber',
            'houseNumber',
            'houseNo'
          ])
      },
      {
        label: 'labels.inputs.No Int',
        value: () =>
          this.readObjectValue(address, [
            'apartmentNumber',
            'apartmentNo',
            'unitNumber'
          ])
      },
      {
        label: 'labels.inputs.Neighborhood',
        className: 'wide',
        value: () =>
          this.readObjectValue(address, [
            'neighborhood',
            'colony',
            'colonia'
          ])
      },
      {
        label: 'labels.inputs.Zip code',
        value: () =>
          this.readObjectValue(address, [
            'postalCode',
            'zipCode'
          ])
      },
      {
        label: 'labels.inputs.Borough / City / Delegation / Municipality / Locality / Town',
        className: 'wide',
        value: () =>
          this.readObjectValue(address, [
            'locality',
            'borough',
            'city',
            'town',
            'municipality'
          ])
      }
    ]);
  }

  get kycStatusLabel(): string {
    return this.validationData?.validationStatus || 'Not Available';
  }

  datatableSections(key: string): PersonalDataTableSection[] {
    return this.viewModel?.datatableSections?.[key] || [];
  }

  showSectionHeading(sectionConfig: EntityDatatableDisplaySection, index: number): boolean {
    return !index || this.entityDisplaySections[index - 1].title !== sectionConfig.title;
  }

  displayGroups(sectionConfig: EntityDatatableDisplaySection): EntityDisplayGroup[] {
    if (sectionConfig.key === 'pepRelatedIndividuals') {
      return [
        {
          questionKeys: [
            'labels.text.Entity PEP Related Intro',
            'labels.text.Entity PEP Related Question 1'
          ],
          records: this.recordsForSection(sectionConfig, [
            'Yes / No',
            'Name',
            'Affiliation',
            'Position',
            'Reporting period'
          ])
        },
        {
          questionKeys: ['labels.text.Entity PEP Related Question 2'],
          records: this.recordsForSection(sectionConfig, [
            'Yes / No',
            'Name',
            'Relationship',
            'Affiliation',
            'Position',
            'Main Activities',
            'Period reported'
          ])
        }
      ];
    }
    if (sectionConfig.key === 'resourceProviderBeneficialOwner') {
      return [
        {
          questionKeys: ['labels.text.Entity Resource Provider Question 1'],
          explanatoryTextKeys: ['labels.text.Entity Ultimate Beneficial Owner Interview Text'],
          records: this.recordsForSection(sectionConfig, ['Yes / No'])
        },
        {
          questionKeys: ['labels.text.Entity Resource Provider Question 2'],
          explanatoryTextKeys: ['labels.text.Entity Resource Provider Interview Text'],
          records: this.recordsForSection(sectionConfig, ['Yes / No'])
        }
      ];
    }
    if (sectionConfig.key === 'controllingPersonPepQuestions') {
      return [
        {
          questionKeys: ['labels.text.Entity Controlling Person PEP Question 1'],
          records: this.recordsForSection(sectionConfig, [
            'Yes / No',
            'Name',
            'Institution',
            'Level and charge',
            'Key Functions',
            'Reporting period'
          ])
        },
        {
          questionKeys: ['labels.text.Entity Controlling Person PEP Question 2'],
          records: this.recordsForSection(sectionConfig, [
            'Yes / No',
            'Name',
            'Relationship',
            'Institution',
            'Level and charge',
            'Key Functions',
            'Reporting period'
          ])
        }
      ];
    }
    return [
      {
        subtitle: sectionConfig.subtitle,
        questionKeys: sectionConfig.questionKeys,
        explanatoryTextKeys: sectionConfig.explanatoryTextKeys,
        records: this.recordsForSection(sectionConfig)
      }
    ];
  }

  private recordsForSection(
    sectionConfig: EntityDatatableDisplaySection,
    fieldLabels?: string[]
  ): PersonalDataField[][] {
    const fieldConfigs = fieldLabels?.length
      ? fieldLabels
          .map((label) =>
            sectionConfig.fields.find((field) => this.displayLabel(field.label) === this.displayLabel(label))
          )
          .filter((field): field is EntityFieldConfig => !!field)
      : sectionConfig.fields;
    const records = this.datatableSections(sectionConfig.key).flatMap((section) => section.records);
    if (!records.length) {
      return [this.fixedRecordFields(fieldConfigs, [])];
    }
    return records.map((record) => this.fixedRecordFields(fieldConfigs, record.fields));
  }

  hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  isYesNoField(field: PersonalDataField): boolean {
    return this.normalizeLabel(this.displayLabel(field.label)) === 'yes no';
  }

  isYesNoSelected(field: PersonalDataField, option: 'Yes' | 'No'): boolean {
    const normalizedValue = this.normalizeYesNoValue(field.value);
    return normalizedValue === option.toLowerCase();
  }

  private fixedFields(
    fieldConfigs: Array<{ label: string; value: () => any; date?: boolean; className?: string }>
  ): PersonalDataField[] {
    return fieldConfigs.map((field) => {
      const value = field.value();
      return {
        label: field.label,
        value: this.hasValue(value) ? this.readOptionValue(value) : '-',
        date: field.date && this.hasValue(value),
        className: field.className
      };
    });
  }

  private readClientOrDatatableValue(
    clientFields: string[],
    datatablePatterns: string[],
    datatableKeys?: string[]
  ): any {
    return this.readClientValue(clientFields) || this.readDatatableValue(datatablePatterns, datatableKeys);
  }

  private readClientValue(fields: string[]): any {
    return this.readObjectValue(this.clientViewData, fields) || this.readObjectValue(this.entityDetails, fields);
  }

  private readObjectValue(source: any, fields: string[]): any {
    for (const field of fields) {
      const value = source?.[field];
      if (this.hasValue(value)) {
        return this.readOptionValue(value);
      }
    }
    return '';
  }

  private readDatatableValue(patterns: string[], sectionKeys?: string[]): any {
    const normalizedPatterns = patterns.map((pattern) => this.normalizeLabel(pattern));
    const sections = sectionKeys?.length
      ? sectionKeys.flatMap((sectionKey) => this.datatableSections(sectionKey))
      : Object.values(this.viewModel?.datatableSections || {}).flat();
    for (const section of sections) {
      for (const record of section.records) {
        const exactField = record.fields.find((recordField) => {
          const normalizedLabel = this.normalizeLabel(recordField.label);
          return normalizedPatterns.some((pattern) => normalizedLabel === pattern);
        });
        const field =
          exactField ||
          record.fields.find((recordField) => {
            const normalizedLabel = this.normalizeLabel(recordField.label);
            return normalizedPatterns.some((pattern) => normalizedLabel.includes(pattern));
          });
        if (this.hasValue(field?.value)) {
          return this.readOptionValue(field?.value);
        }
      }
    }
    return '';
  }

  private fixedRecordFields(fieldConfigs: EntityFieldConfig[], fields: Array<{ label: string; value: any }>) {
    return fieldConfigs.map((field) => {
      const value = this.readRecordValue(fields, field.patterns);
      return {
        label: field.label,
        value: this.hasValue(value) ? value : '-',
        date: field.date && this.hasValue(value),
        className: field.className
      };
    });
  }

  private readRecordValue(fields: Array<{ label: string; value: any }>, patterns: string[]): any {
    const normalizedPatterns = patterns.map((pattern) => this.normalizeLabel(pattern));
    const exactField = fields.find((recordField) => {
      const normalizedLabel = this.normalizeLabel(recordField.label);
      return normalizedPatterns.some((pattern) => normalizedLabel === pattern);
    });
    const field =
      exactField ||
      fields.find((recordField) => {
        const normalizedLabel = this.normalizeLabel(recordField.label);
        return normalizedPatterns.some((pattern) => normalizedLabel.includes(pattern));
      });
    return this.hasValue(field?.value) ? this.readOptionValue(field?.value) : '';
  }

  private representativeAddressFields(): EntityFieldConfig[] {
    return [
      { label: 'labels.inputs.Address', patterns: [
          'address',
          'street'
        ] },
      { label: 'labels.inputs.Neighborhood', patterns: [
          'neighborhood',
          'colony',
          'colonia'
        ] },
      { label: 'labels.inputs.Zip code', patterns: [
          'zip code',
          'postal code'
        ] },
      { label: 'labels.inputs.State', patterns: [
          'state',
          'province'
        ] },
      {
        label: 'labels.inputs.Borough / City / Delegation / Municipality / Locality / Town',
        patterns: [
          'borough city delegation municipality locality town',
          'borough',
          'city',
          'municipality',
          'locality'
        ]
      }
    ];
  }

  translationKey(value: string, prefix: string): string {
    return value.startsWith(`${prefix}.`) ? value : `${prefix}.${value}`;
  }

  private displayLabel(value: string): string {
    return value.replace(/^labels\.(inputs|heading|text)\./, '');
  }

  private readOptionValue(value: any): any {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value.name || value.value || value.code || value.displayName || '';
    }
    return value;
  }

  private normalizeYesNoValue(value: any): string {
    if (value === true) {
      return 'yes';
    }
    if (value === false) {
      return 'no';
    }
    const normalizedValue = this.normalizeLabel(`${value || ''}`);
    if ([
        'yes',
        'y',
        'true',
        'si',
        'sí'
      ].includes(normalizedValue)) {
      return 'yes';
    }
    if ([
        'no',
        'n',
        'false'
      ].includes(normalizedValue)) {
      return 'no';
    }
    return '';
  }

  private identifierValue(patterns: RegExp[]): string {
    const identifier = this.viewModel?.identifiers?.find((record: any) => {
      const type = `${record.documentType?.name || ''} ${record.documentType?.code || ''} ${
        record.documentType?.value || ''
      }`;
      return patterns.some((pattern) => pattern.test(type));
    });
    return identifier?.documentKey || '';
  }

  private normalizeLabel(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
}

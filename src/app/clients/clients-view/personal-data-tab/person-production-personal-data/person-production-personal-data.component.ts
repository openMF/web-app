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
import { PersonalDataField, PersonalDataTableSection, PersonalDataViewModel } from '../personal-data-view.model';

@Component({
  selector: 'mifosx-person-production-personal-data',
  templateUrl: './person-production-personal-data.component.html',
  styleUrls: ['./person-production-personal-data.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    DateFormatPipe,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonProductionPersonalDataComponent {
  @Input() clientViewData: any;
  @Input() viewModel: PersonalDataViewModel | null = null;
  @Input() isKycEnabled = false;
  @Input() validationData: CustomerDataValidation | null = null;

  @Output() exportKyc = new EventEmitter<void>();
  @Output() validateDocumentation = new EventEmitter<void>();

  readonly ValidationStatus = ValidationStatus;

  private readonly generalClientFieldConfigs = [
    {
      label: 'Display Name',
      value: () => this.readClientValue(['displayName'])
    },
    {
      label: 'Middle Name',
      value: () =>
        this.readClientValue([
          'middlename',
          'middleName'
        ])
    },
    {
      label: 'Last Name',
      value: () =>
        this.readClientValue([
          'lastname',
          'lastName'
        ])
    },
    {
      label: 'Name(s)',
      value: () =>
        this.readClientValue([
          'firstname',
          'firstName'
        ])
    },
    {
      label: 'Gender',
      value: () => this.readOptionValue(this.clientViewData?.gender)
    },
    {
      label: 'National Id',
      value: () =>
        this.readClientValue([
          'nationalId',
          'nationalID',
          'nationalIdentifier',
          'identityCard'
        ]) ||
        this.identifierValue([
          /national/i,
          /\bnid\b/i,
          /identity/i
        ])
    },
    {
      label: 'Nationality',
      value: () => this.readClientOrDatatableValue(['nationality'], ['nationality'])
    },
    {
      label: 'Tax Id',
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
      label: 'Home phone 1',
      value: () =>
        this.readClientOrDatatableValue(
          [
            'homePhone',
            'homephone'
          ],
          [
            'home phone',
            'homephone'
          ]
        )
    },
    {
      label: 'Mobile phone',
      value: () =>
        this.readClientValue([
          'mobileNo',
          'mobileNumber'
        ])
    },
    {
      label: 'Digital Id',
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
      label: 'Email',
      value: () =>
        this.readClientValue([
          'emailAddress',
          'email'
        ])
    },
    {
      label: 'Birthdate',
      value: () => this.readClientValue(['dateOfBirth']),
      date: true
    },
    {
      label: 'Age',
      value: () => this.readClientValue(['age']) || this.calculateAge(this.clientViewData?.dateOfBirth)
    },
    {
      label: 'State/Region of Birth',
      value: () =>
        this.readClientOrDatatableValue(
          [
            'stateOfBirth',
            'birthState',
            'regionOfBirth'
          ],
          [
            'state of birth',
            'birth state',
            'region of birth'
          ]
        )
    },
    {
      label: 'Country of Birth',
      value: () =>
        this.readClientOrDatatableValue(
          [
            'countryOfBirth',
            'birthCountry'
          ],
          [
            'country of birth',
            'birth country'
          ]
        )
    },
    {
      label: 'Marital Status',
      value: () => this.readClientOrDatatableValue(['maritalStatus'], ['marital status'])
    },
    {
      label: 'Matrimonial Property Regime',
      value: () =>
        this.readClientOrDatatableValue(
          [
            'matrimonialPropertyRegime',
            'propertyRegime'
          ],
          [
            'matrimonial property regime',
            'property regime'
          ]
        )
    },
    {
      label: "Spouse's Name",
      value: () =>
        this.readClientOrDatatableValue(
          ['spouseName'],
          [
            'spouse name',
            "spouse's name"
          ]
        ) || this.displayName(this.spouseMember)
    },
    {
      label: "Spouse's Occupation",
      value: () =>
        this.readClientOrDatatableValue(
          ['spouseOccupation'],
          [
            'spouse occupation',
            "spouse's occupation"
          ]
        ) || this.spouseMember?.profession
    }
  ];

  private readonly socioeconomicFieldConfigs = [
    {
      label: 'Occupation',
      patterns: [
        'occupation',
        'profession'
      ]
    },
    {
      label: 'Economic Activity',
      patterns: [
        'economic activity',
        'activity'
      ]
    },
    {
      label: 'Age of the business',
      patterns: [
        'age of the business',
        'age of business',
        'business age',
        'years in business'
      ]
    },
    {
      label: 'Work phone',
      patterns: [
        'work phone',
        'workphone',
        'business phone',
        'company phone'
      ]
    },
    {
      label: 'Company where you work',
      patterns: [
        'company where you work',
        'company name',
        'employer',
        'workplace'
      ]
    },
    {
      label: 'Company address',
      className: 'full-width',
      patterns: [
        'company address',
        'work address',
        'employer address'
      ]
    },
    {
      label: 'Average Monthly Income',
      patterns: [
        'average monthly income',
        'monthly income',
        'income'
      ]
    },
    {
      label: 'Average Expenses (Monthly)',
      patterns: [
        'average expenses monthly',
        'average monthly expenses',
        'monthly expenses',
        'expenses'
      ]
    },
    {
      label: 'Period',
      patterns: [
        'period',
        'frequency'
      ]
    },
    {
      label: 'Number of economic dependents',
      patterns: [
        'number of economic dependents',
        'economic dependents',
        'dependents'
      ]
    }
  ];

  private readonly beneficiaryFieldConfigs = [
    { label: 'Name', patterns: [
        'name',
        'full name',
        'beneficiary name'
      ] },
    { label: 'Percentage', patterns: [
        'percentage',
        'percent',
        'share'
      ] },
    { label: 'Phone', patterns: [
        'phone',
        'mobile',
        'telephone'
      ] },
    { label: 'Relationship', patterns: ['relationship'] },
    { label: 'Birthdate', patterns: [
        'birthdate',
        'date of birth',
        'dob'
      ], date: true },
    { label: 'Address', patterns: ['address'] },
    { label: 'Colony / Neighborhood', patterns: [
        'colony neighborhood',
        'neighborhood',
        'colony',
        'colonia'
      ] },
    { label: 'Municipality/City', patterns: [
        'municipality city',
        'municipality',
        'city'
      ] },
    { label: 'Locality/Borough/Town', patterns: [
        'locality borough town',
        'locality',
        'borough',
        'town'
      ] },
    { label: 'State', patterns: [
        'state',
        'province'
      ] },
    { label: 'Nationality', patterns: ['nationality'] }
  ];

  private readonly personalReferenceFieldConfigs = [
    { label: 'Name', patterns: [
        'name',
        'reference name',
        'full name'
      ] },
    { label: 'Relationship', patterns: ['relationship'] },
    { label: 'Phone', patterns: [
        'phone',
        'mobile',
        'telephone'
      ] },
    { label: 'Address', patterns: ['address'] }
  ];

  private readonly commercialReferenceFieldConfigs = [
    { label: 'Name', patterns: [
        'name',
        'business name',
        'commercial name'
      ] },
    { label: 'Address', patterns: ['address'] },
    { label: 'Phone', patterns: [
        'phone',
        'mobile',
        'telephone'
      ] }
  ];

  private readonly pepPldQuestionGroups = [
    {
      question: 'Person PEP PLD Question 1',
      fields: [
        { label: 'Yes / No', patterns: [
            'is pep',
            'pep',
            'yes no',
            'yes / no'
          ] },
        { label: 'Level of Government', patterns: [
            'level of government',
            'government level'
          ] },
        { label: 'Institution', patterns: ['institution'] },
        { label: 'Level and Charge', patterns: [
            'level and charge',
            'level charge',
            'position',
            'charge'
          ] },
        { label: 'Reporting period', patterns: [
            'reporting period',
            'period'
          ] }
      ]
    },
    {
      question: 'Person PEP PLD Question 2',
      fields: [
        { label: 'Yes / No', patterns: [
            'related to pep',
            'family relationship',
            'yes no',
            'yes / no'
          ] },
        { label: 'Full Name', patterns: [
            'full name',
            'related pep name',
            'name'
          ] },
        { label: 'Institution', patterns: ['institution'] },
        { label: 'Relationship', patterns: ['relationship'] },
        { label: 'Level and Charge', patterns: [
            'level and charge',
            'level charge',
            'position',
            'charge'
          ] },
        { label: 'Reporting period', patterns: [
            'reporting period',
            'period'
          ] },
        { label: 'Entity Employee', patterns: [
            'entity employee',
            'employee'
          ] }
      ]
    },
    {
      question: 'Person PEP PLD Question 3',
      fields: [
        { label: 'Yes / No', patterns: [
            'entity relationship',
            'related to entity',
            'shareholder employee officer',
            'yes no',
            'yes / no'
          ] },
        { label: 'Full Name', patterns: [
            'full name',
            'name'
          ] },
        { label: 'Relationship', patterns: ['relationship'] },
        { label: 'Position', patterns: [
            'position',
            'charge'
          ] }
      ]
    }
  ];

  get homeAddress(): any {
    return (
      this.viewModel?.addresses?.find((address: any) => /home/i.test(address.addressType || '')) ||
      this.activeAddress ||
      this.viewModel?.addresses?.[0]
    );
  }

  get activeAddress(): any {
    return this.viewModel?.addresses?.find((address: any) => address.isActive);
  }

  get kycStatusLabel(): string {
    return this.validationData?.validationStatus || 'Not Available';
  }

  get spouseMember(): any {
    return this.viewModel?.familyMembers?.find((member: any) =>
      /spouse/i.test(this.readOptionValue(member?.relationship))
    );
  }

  get generalClientFields(): PersonalDataField[] {
    return this.fixedFields(this.generalClientFieldConfigs);
  }

  get addressFields(): PersonalDataField[] {
    const address = this.homeAddress;
    return this.fixedFields([
      {
        label: 'Street',
        value: () =>
          this.readObjectValue(address, [
            'street',
            'addressLine1'
          ])
      },
      {
        label: 'Street Number',
        value: () =>
          this.readObjectValue(address, [
            'streetNumber',
            'addressLine2'
          ])
      },
      {
        label: 'Apartment Number',
        value: () =>
          this.readObjectValue(address, [
            'apartmentNumber',
            'addressLine3'
          ])
      },
      {
        label: 'Neighborhood',
        value: () =>
          this.readObjectValue(address, [
            'neighborhood',
            'colony',
            'addressLine1'
          ])
      },
      {
        label: 'Zip code',
        value: () =>
          this.readObjectValue(address, [
            'postalCode',
            'zipCode'
          ])
      },
      {
        label: 'Municipality/City',
        value: () =>
          this.readObjectValue(address, [
            'municipality',
            'city'
          ])
      },
      {
        label: 'Locality/Borough/Town',
        value: () =>
          this.readObjectValue(address, [
            'locality',
            'borough',
            'townVillage',
            'town',
            'village'
          ])
      },
      {
        label: 'State',
        value: () =>
          this.addressOptionValue(address, 'stateProvinceId', 'stateProvinceIdOptions', [
            'stateName',
            'stateProvinceName'
          ])
      },
      {
        label: 'Country',
        value: () => this.addressOptionValue(address, 'countryId', 'countryIdOptions', ['countryName'])
      }
    ]);
  }

  get socioeconomicFields(): PersonalDataField[] {
    return this.fixedFields(
      this.socioeconomicFieldConfigs.map((field) => ({
        label: field.label,
        className: field.className,
        value: () => this.readClientOrDatatableValue([this.camelCase(field.label)], field.patterns, ['socioeconomic'])
      }))
    );
  }

  get personalReferences(): any[] {
    return this.viewModel?.familyMembers || [];
  }

  get personalReferenceRecords(): PersonalDataField[][] {
    const datatableRecords = this.structuredDatatableRecords(
      'personalReferences',
      this.personalReferenceFieldConfigs,
      true
    );
    if (datatableRecords.length) {
      return this.ensureRecordCount(datatableRecords, this.personalReferenceFieldConfigs, 3);
    }
    const familyRecords = this.personalReferences.map((member) =>
      this.fixedFields([
        { label: 'Name', value: () => this.displayName(member) },
        { label: 'Relationship', value: () => this.readOptionValue(member.relationship) },
        { label: 'Phone', value: () => member.mobileNumber },
        { label: 'Address', value: () => this.referenceAddress(member) }
      ])
    );
    return this.ensureRecordCount(familyRecords, this.personalReferenceFieldConfigs, 3);
  }

  get commercialReferenceRecords(): PersonalDataField[][] {
    return this.ensureRecordCount(
      this.structuredDatatableRecords('commercialReferences', this.commercialReferenceFieldConfigs, true),
      this.commercialReferenceFieldConfigs,
      3
    );
  }

  get pepPldRecords(): PersonalDataField[][] {
    return this.pepPldQuestionGroups.map((group) => this.fixedRecordFields(group.fields, this.pepPldSourceFields));
  }

  get pepPldSourceFields(): PersonalDataField[] {
    return this.datatableSections('pepPld')
      .flatMap((section) => section.records)
      .flatMap((record) => record.fields);
  }

  get beneficiaryRecords(): PersonalDataField[][] {
    return this.structuredDatatableRecords('beneficiaries', this.beneficiaryFieldConfigs);
  }

  datatableSections(key: string): PersonalDataTableSection[] {
    return this.viewModel?.datatableSections?.[key] || [];
  }

  referenceTitle(index: number): string {
    if (index === 0) {
      return 'Reference 1 (Family Member)';
    }
    if (index === 1) {
      return 'Reference 2 (Family Member)';
    }
    return 'Reference 3 (Acquaintance)';
  }

  commercialReferenceTitle(index: number): string {
    return `Reference ${index + 1}`;
  }

  pepPldQuestion(index: number): string {
    return this.pepPldQuestionGroups[index]?.question || '';
  }

  displayName(member: any): string {
    return [
      member?.firstName,
      member?.middleName,
      member?.lastName
    ]
      .filter(Boolean)
      .join(' ');
  }

  referenceAddress(member: any): string {
    return this.readObjectValue(member, [
      'address',
      'addressLine1',
      'street'
    ]);
  }

  structuredDatatableRecords(
    key: string,
    fieldConfigs: Array<{ label: string; patterns: string[]; date?: boolean }>,
    includeEmptyRecord = false
  ) {
    const records = this.datatableSections(key).flatMap((section) => section.records);
    if (!records.length) {
      return includeEmptyRecord ? [this.fixedRecordFields(fieldConfigs, [])] : [];
    }
    return records.map((record) => this.fixedRecordFields(fieldConfigs, record.fields));
  }

  private ensureRecordCount(
    records: PersonalDataField[][],
    fieldConfigs: Array<{ label: string; patterns: string[]; date?: boolean }>,
    count: number
  ): PersonalDataField[][] {
    const fixedRecords = records.slice(0, count);
    while (fixedRecords.length < count) {
      fixedRecords.push(this.fixedRecordFields(fieldConfigs, []));
    }
    return fixedRecords;
  }

  hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  isYesNoField(field: PersonalDataField): boolean {
    const normalizedLabel = this.normalizeLabel(field.label);
    return normalizedLabel === 'yes no' || (normalizedLabel === 'entity employee' && [
          'yes',
          'no'
        ].includes(this.normalizeYesNoValue(field.value)));
  }

  isYesNoSelected(field: PersonalDataField, option: 'Yes' | 'No'): boolean {
    const normalizedValue = this.normalizeYesNoValue(field.value);
    return normalizedValue === option.toLowerCase();
  }

  private availableFields(
    fieldConfigs: Array<{ label: string; value: () => any; date?: boolean }>
  ): PersonalDataField[] {
    return fieldConfigs
      .map((field) => ({
        label: field.label,
        value: field.value(),
        date: field.date
      }))
      .filter((field) => this.hasValue(field.value));
  }

  private fixedFields(
    fieldConfigs: Array<{ label: string; value: () => any; date?: boolean; className?: string }>
  ): PersonalDataField[] {
    return fieldConfigs.map((field) => {
      const value = field.value();
      return {
        label: field.label,
        value: this.hasValue(value) ? value : '-',
        date: field.date && this.hasValue(value),
        className: field.className
      };
    });
  }

  private fixedRecordFields(
    fieldConfigs: Array<{ label: string; patterns: string[]; date?: boolean }>,
    fields: Array<{ label: string; value: any }>
  ): PersonalDataField[] {
    return fieldConfigs.map((field) => {
      const value = this.readRecordValue(fields, field.patterns);
      return {
        label: field.label,
        value: this.hasValue(value) ? value : '-',
        date: field.date && this.hasValue(value)
      };
    });
  }

  private addressOptionValue(address: any, idKey: string, templateOptionsKey: string, displayKeys: string[]): any {
    const displayValue = this.readObjectValue(address, displayKeys);
    if (this.hasValue(displayValue) && !this.isZeroValue(displayValue)) {
      return displayValue;
    }
    const optionId = address?.[idKey];
    if (!this.hasValue(optionId) || this.isZeroValue(optionId)) {
      return '';
    }
    const option = this.viewModel?.addressTemplate?.[templateOptionsKey]?.find(
      (item: any) => item?.id?.toString() === optionId.toString()
    );
    return this.readOptionValue(option);
  }

  private isZeroValue(value: any): boolean {
    return value?.toString?.() === '0';
  }

  private datatableSchemaRecords(key: string): PersonalDataField[][] {
    const sections = this.datatableSections(key);
    const records = sections.flatMap((section) => section.records);
    if (records.length) {
      return records.map((record) =>
        record.fields.map((field) => ({
          label: field.label,
          value: this.hasValue(field.value) ? this.readOptionValue(field.value) : '-',
          rawLabel: true
        }))
      );
    }
    const columns = sections.flatMap((section) => section.columns);
    if (!columns.length) {
      return [];
    }
    return [
      columns.map((column) => ({
        label: column.label,
        value: '-',
        rawLabel: true
      }))
    ];
  }

  private readClientOrDatatableValue(
    clientFields: string[],
    datatablePatterns: string[],
    datatableKeys?: string[]
  ): any {
    return (
      this.readClientValue(clientFields) ||
      this.readDatatableValue(
        datatablePatterns,
        datatableKeys || [
          'additionalProfile',
          'socioeconomic',
          'pepPld'
        ]
      )
    );
  }

  private readClientValue(fields: string[]): any {
    return this.readObjectValue(this.clientViewData, fields);
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

  private readDatatableValue(patterns: string[], sectionKeys: string[]): any {
    for (const sectionKey of sectionKeys) {
      for (const section of this.datatableSections(sectionKey)) {
        for (const record of section.records) {
          const value = this.readRecordValue(record.fields, patterns);
          if (this.hasValue(value)) {
            return value;
          }
        }
      }
    }
    return '';
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

  private calculateAge(dateOfBirth: any): number | '' {
    if (!dateOfBirth) {
      return '';
    }

    const birthDate = Array.isArray(dateOfBirth)
      ? new Date(dateOfBirth[0], dateOfBirth[1] - 1, dateOfBirth[2])
      : new Date(dateOfBirth);
    if (Number.isNaN(birthDate.getTime())) {
      return '';
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private camelCase(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, character: string) => character.toUpperCase())
      .replace(/^[A-Z]/, (character) => character.toLowerCase());
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

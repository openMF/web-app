/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LegalFormId } from 'app/clients/models/legal-form.enum';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { ClientIdentifierPayload, ClientsService } from '../clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { Datatables } from 'app/core/utils/datatables';
import { ExternalNationalIdService } from 'app/clients/services/external-national-id.service';
import { PersonalDataViewService } from '../clients-view/personal-data-tab/personal-data-view.service';
import {
  PersonalDataTableColumn,
  PersonalDataTableRecord,
  PersonalDataTableSection,
  PersonalDataViewModel
} from '../clients-view/personal-data-tab/personal-data-view.model';
import { MatDivider } from '@angular/material/divider';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { SystemService } from 'app/system/system.service';
import { environment } from 'environments/environment';
import {
  ENTITY_PERSONAL_DATA_DATATABLES,
  PERSON_PERSONAL_DATA_DATATABLES
} from 'app/clients/models/personal-data-datatables.model';
import { normalizeAddressCoordinates } from 'app/clients/utils/address-coordinate.util';

/**
 * Edit Client Component
 */
@Component({
  selector: 'mifosx-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.scss'],
  providers: [ExternalNationalIdService],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
    CdkTextareaAutosize,
    MatCheckbox,
    MatButtonToggleModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditClientComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientsService = inject(ClientsService);
  private dateUtils = inject(Dates);
  private datatables = inject(Datatables);
  private settingsService = inject(SettingsService);
  externalNationalIdService = inject(ExternalNationalIdService);
  private personalDataViewService = inject(PersonalDataViewService);
  private systemService = inject(SystemService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private readonly addressTypeValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return { required: true };
    }
    return this.resolveAddressTypeId(value) ? null : { invalidAddressType: true };
  };

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();

  /** Client Data and Template */
  clientDataAndTemplate: any;
  /** Edit Client Form */
  editClientForm: FormGroup;
  /** Production Personal Data address form shown only when productionMode is enabled. */
  personalDataAddressForm: FormGroup | null = null;
  /** Production Personal Data table row forms keyed by table/row. */
  personalDataTableForms: Record<string, FormGroup> = {};
  /** Number of new editable Data Table rows shown for a section. */
  newDatatableRowCounts: Record<string, number> = {};
  /** Production Personal Data identifier forms keyed by identifier id. */
  identifierForms: Record<string, FormGroup> = {};

  /** Office Options */
  officeOptions: any;
  /** Staff Options */
  staffOptions: any;
  /** Legal Form Options */
  legalFormOptions: any;
  /** Client Type Options */
  clientTypeOptions: any;
  /** Client Classification Options */
  clientClassificationTypeOptions: any;
  /** Business Line Options */
  businessLineOptions: any;
  /** Constitution Options */
  constitutionOptions: any;
  /** Gender Options */
  genderOptions: any;
  legalFormId = LegalFormId.PERSON;
  /** Production mode flag. */
  productionMode = environment.productionMode === true;
  /** Client address template/options. */
  clientAddressTemplate: any = null;
  /** Client identifier template/options. */
  clientIdentifierTemplate: any = null;
  /** Address record edited from the WEB-1161 edit section. */
  editableAddress: any = null;
  /** Existing WEB-1161 Data Table sections loaded for edit. */
  productionViewModel: PersonalDataViewModel | null = null;
  /** True when optional WEB-1161 edit data is still loading. */
  loadingProductionEditData = false;
  /** True while the Edit Client save request chain is in flight. */
  saving = false;
  readonly personDatatableSectionConfigs = PERSON_PERSONAL_DATA_DATATABLES;
  readonly entityDatatableSectionConfigs = ENTITY_PERSONAL_DATA_DATATABLES;

  /** Expose enum to template */
  readonly LegalFormId = LegalFormId;

  get clientAddressLocationEnabled(): boolean {
    return environment.enableClientAddressLocation;
  }

  /**
   * Fetches client template data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ActivatedRoute} route ActivatedRoute
   * @param {Router} router Router
   * @param {ClientsService} clientsService Clients Service
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientDataAndTemplate: any }) => {
      this.clientDataAndTemplate = data.clientDataAndTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createEditClientForm();
    this.setOptions();
    this.buildDependencies();
    this.legalFormId = LegalFormId.PERSON;
    this.editClientForm.patchValue({
      officeId: this.clientDataAndTemplate.officeId,
      staffId: this.clientDataAndTemplate.staffId,
      legalFormId: this.clientDataAndTemplate.legalForm && this.clientDataAndTemplate.legalForm.id,
      accountNo: this.clientDataAndTemplate.accountNo,
      externalId: this.clientDataAndTemplate.externalId,
      genderId: this.clientDataAndTemplate.gender && this.clientDataAndTemplate.gender.id,
      isStaff: this.clientDataAndTemplate.isStaff,
      active: this.clientDataAndTemplate.active,
      mobileNo: this.clientDataAndTemplate.mobileNo,
      emailAddress: this.clientDataAndTemplate.emailAddress,
      dateOfBirth: this.clientDataAndTemplate.dateOfBirth && new Date(this.clientDataAndTemplate.dateOfBirth),
      clientTypeId: this.clientDataAndTemplate.clientType && this.clientDataAndTemplate.clientType.id,
      clientClassificationId:
        this.clientDataAndTemplate.clientClassification && this.clientDataAndTemplate.clientClassification.id,
      submittedOnDate:
        this.clientDataAndTemplate.timeline.submittedOnDate &&
        new Date(this.clientDataAndTemplate.timeline.submittedOnDate),
      activationDate:
        this.clientDataAndTemplate.timeline.activatedOnDate &&
        new Date(this.clientDataAndTemplate.timeline.activatedOnDate)
    });
    if (this.clientDataAndTemplate.legalForm) {
      this.legalFormId = this.clientDataAndTemplate.legalForm.id;
    }
    this.loadProductionEditData();
    // skipInitialValue=true: avoid re-fetching data for an already-saved external ID
    this.externalNationalIdService.watchExternalId(this.editClientForm, this.genderOptions, true);
  }

  /**
   * Creates the edit client form.
   */
  createEditClientForm() {
    this.editClientForm = this.formBuilder.group({
      officeId: [{ value: '', disabled: true }],
      staffId: [''],
      legalFormId: [{ value: '', disabled: true }],
      isStaff: [false],
      active: [false],
      accountNo: [{ value: '', disabled: true }],
      externalId: [''],
      genderId: [''],
      mobileNo: [''],
      emailAddress: [
        '',
        Validators.email
      ],
      dateOfBirth: [''],
      clientTypeId: [''],
      clientClassificationId: [''],
      submittedOnDate: [
        '',
        Validators.required
      ],
      activationDate: ['']
    });
  }

  /**
   * Sets select dropdown options.
   */
  setOptions() {
    this.officeOptions = this.clientDataAndTemplate.officeOptions;
    this.staffOptions = this.clientDataAndTemplate.staffOptions;
    this.legalFormOptions = this.clientDataAndTemplate.clientLegalFormOptions;
    this.clientTypeOptions = this.clientDataAndTemplate.clientTypeOptions;
    this.clientClassificationTypeOptions = this.clientDataAndTemplate.clientClassificationOptions;
    this.businessLineOptions = this.clientDataAndTemplate.clientNonPersonMainBusinessLineOptions;
    this.constitutionOptions = this.clientDataAndTemplate.clientNonPersonConstitutionOptions;
    this.genderOptions = this.clientDataAndTemplate.genderOptions;
  }

  /**
   * Adds controls conditionally.
   */
  buildDependencies() {
    this.editClientForm
      .get('legalFormId')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((legalFormId: any) => {
        if (legalFormId === LegalFormId.PERSON) {
          this.editClientForm.removeControl('fullname');
          this.editClientForm.removeControl('clientNonPersonDetails');
          this.editClientForm.addControl(
            'firstname',
            new FormControl(this.clientDataAndTemplate.firstname, Validators.required)
          );
          this.editClientForm.addControl('middlename', new FormControl(this.clientDataAndTemplate.middlename));
          this.editClientForm.addControl(
            'lastname',
            new FormControl(this.clientDataAndTemplate.lastname, Validators.required)
          );
        } else {
          const clientNonPersonDetails = this.clientDataAndTemplate.clientNonPersonDetails || {};
          this.editClientForm.removeControl('firstname');
          this.editClientForm.removeControl('middlename');
          this.editClientForm.removeControl('lastname');
          this.editClientForm.addControl(
            'fullname',
            new FormControl(this.clientDataAndTemplate.fullname, Validators.required)
          );
          this.editClientForm.addControl(
            'clientNonPersonDetails',
            this.formBuilder.group({
              constitutionId: [
                clientNonPersonDetails.constitution && clientNonPersonDetails.constitution.id,
                Validators.required
              ],
              incorpValidityTillDate: [
                clientNonPersonDetails.incorpValidityTillDate && new Date(clientNonPersonDetails.incorpValidityTillDate)
              ],
              incorpNumber: [clientNonPersonDetails.incorpNumber],
              mainBusinessLineId: [
                clientNonPersonDetails.mainBusinessLine && clientNonPersonDetails.mainBusinessLine.id
              ],
              remarks: [clientNonPersonDetails.remarks]
            })
          );
        }
      });
  }

  getDateLabel(legalFormId: number, values: string[]): string {
    return legalFormId === LegalFormId.PERSON ? values[0] : values[1];
  }

  get productionAddressHeading(): string {
    return this.legalFormId === LegalFormId.ENTITY ? 'Tax Address' : 'Home Address';
  }

  get productionGeneralHeading(): string {
    return this.legalFormId === LegalFormId.ENTITY ? 'Legal Entity Details' : 'General Client Information';
  }

  get productionDatatableSections(): PersonalDataTableSection[] {
    return Object.values(this.productionViewModel?.datatableSections || {}).flat();
  }

  get productionDatatableSectionConfigs(): Array<{ key: string; title: string }> {
    return this.legalFormId === LegalFormId.ENTITY
      ? this.entityDatatableSectionConfigs
      : this.personDatatableSectionConfigs;
  }

  translationKey(value: string, prefix: string): string {
    return value.startsWith(`${prefix}.`) ? value : `${prefix}.${value}`;
  }

  get hasIdentifierRows(): boolean {
    return this.productionViewModel?.identifiers?.some((identifier: any) => identifier?.id) || false;
  }

  datatableSections(key: string): PersonalDataTableSection[] {
    return this.productionViewModel?.datatableSections?.[key] || [];
  }

  hasDatatableSchema(key: string): boolean {
    return this.datatableSections(key).some((section) => section.columns.length);
  }

  get isSubmitDisabled(): boolean {
    return this.saving || this.hasDirtyInvalidClientForm() || this.hasDirtyInvalidAddressForm();
  }

  datatableFormKey(section: PersonalDataTableSection, record: PersonalDataTableRecord): string {
    return `${section.sourceName}:${record.id || section.records.indexOf(record)}`;
  }

  datatableNewFormKey(section: PersonalDataTableSection, index: number): string {
    return `${section.sourceName}:new:${index}`;
  }

  datatableNewRowIndexes(section: PersonalDataTableSection): number[] {
    const count = this.newDatatableRowCounts[section.sourceName] || 0;
    return Array.from({ length: count }, (_value, index) => index);
  }

  datatableControlName(column: PersonalDataTableColumn): string {
    return this.datatables.getInputName(column);
  }

  datatableColumnLabel(column: PersonalDataTableColumn): string {
    const label = column.label || this.datatables.toDisplayLabel(column.columnName);
    return this.translateDatatableLabel(column.columnName, label);
  }

  datatableColumnValues(column: PersonalDataTableColumn): any[] {
    return column.columnValues || [];
  }

  datatableYesNoValues(column: PersonalDataTableColumn): any[] {
    return this.isDatatableBoolean(column)
      ? [
          { value: true, label: 'Yes' },
          { value: false, label: 'No' }
        ]
      : [
          { value: 'Yes', label: 'Yes' },
          { value: 'No', label: 'No' }
        ];
  }

  isDatatableYesNo(column: PersonalDataTableColumn): boolean {
    return this.isDatatableBoolean(column) || this.datatableColumnLabel(column).trim().toLowerCase() === 'yes / no';
  }

  isDatatableBoolean(column: PersonalDataTableColumn): boolean {
    return this.datatableColumnType(column) === 'BOOLEAN';
  }

  isDatatableDropdown(column: PersonalDataTableColumn): boolean {
    return this.datatableColumnType(column) === 'CODELOOKUP';
  }

  isDatatableDate(column: PersonalDataTableColumn): boolean {
    return [
      'DATE',
      'DATETIME'
    ].includes(this.datatableColumnType(column));
  }

  isDatatableNumeric(column: PersonalDataTableColumn): boolean {
    return [
      'INTEGER',
      'DECIMAL'
    ].includes(this.datatableColumnType(column));
  }

  isDatatableText(column: PersonalDataTableColumn): boolean {
    return [
      'STRING',
      'TEXT'
    ].includes(this.datatableColumnType(column));
  }

  addDatatableBlankRow(section: PersonalDataTableSection): void {
    if (!section.isMultiRow) {
      return;
    }
    const index = this.newDatatableRowCounts[section.sourceName] || 0;
    this.newDatatableRowCounts[section.sourceName] = index + 1;
    this.personalDataTableForms[this.datatableNewFormKey(section, index)] = this.buildDatatableForm(section);
  }

  identifierFormKey(identifier: any): string {
    return `${identifier.id}`;
  }

  private loadProductionEditData(): void {
    if (!this.productionMode || !this.clientDataAndTemplate?.id) {
      return;
    }
    this.loadingProductionEditData = true;
    const clientId = this.clientDataAndTemplate.id.toString();
    forkJoin({
      addressTemplate: this.clientsService.getClientAddressTemplate().pipe(catchError(() => of(null))),
      identifierTemplate: this.clientsService
        .getClientIdentifierTemplate(clientId)
        .pipe(catchError(() => of({ allowedDocumentTypes: [] }))),
      clientDatatables: this.clientsService.getClientDatatables().pipe(catchError(() => of([])))
    })
      .pipe(
        switchMap(({ addressTemplate, identifierTemplate, clientDatatables }) => {
          this.clientAddressTemplate = addressTemplate;
          this.clientIdentifierTemplate = identifierTemplate;
          const datatables = Array.isArray(clientDatatables) ? clientDatatables : [];
          return this.personalDataViewService.load(clientId, datatables, this.legalFormId === LegalFormId.ENTITY);
        }),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((viewModel) => {
        this.productionViewModel = viewModel;
        this.buildProductionAddressForm(viewModel?.addresses || []);
        this.buildIdentifierForms(viewModel);
        this.buildDatatableForms(viewModel);
        this.loadingProductionEditData = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  private buildProductionAddressForm(addresses: any[]): void {
    this.editableAddress = this.findProductionAddress(addresses);
    this.personalDataAddressForm = this.formBuilder.group({
      addressTypeId: [
        this.resolveAddressTypeId(this.editableAddress?.addressTypeId || this.editableAddress?.addressType) ||
          this.defaultAddressTypeId(),
        this.addressTypeValidator
      ],
      street: [this.editableAddress?.street || ''],
      addressLine1: [this.editableAddress?.addressLine1 || ''],
      addressLine2: [this.editableAddress?.addressLine2 || ''],
      addressLine3: [this.editableAddress?.addressLine3 || ''],
      postalCode: [this.editableAddress?.postalCode || ''],
      townVillage: [this.editableAddress?.townVillage || ''],
      city: [this.editableAddress?.city || ''],
      stateProvinceId: [this.editableAddress?.stateProvinceId || ''],
      countyDistrict: [this.editableAddress?.countyDistrict || ''],
      countryId: [this.editableAddress?.countryId || '']
    });
  }

  private buildDatatableForms(viewModel: PersonalDataViewModel | null): void {
    this.personalDataTableForms = {};
    this.newDatatableRowCounts = {};
    Object.values(viewModel?.datatableSections || {})
      .flat()
      .forEach((section) => {
        section.records.forEach((record) => {
          this.personalDataTableForms[this.datatableFormKey(section, record)] = this.buildDatatableForm(
            section,
            record
          );
        });
        if (!section.records.length && section.columns.length) {
          this.newDatatableRowCounts[section.sourceName] = 1;
          this.personalDataTableForms[this.datatableNewFormKey(section, 0)] = this.buildDatatableForm(section);
        }
      });
  }

  private buildDatatableForm(section: PersonalDataTableSection, record?: PersonalDataTableRecord): FormGroup {
    const controls = section.columns.reduce((acc: Record<string, FormControl>, column) => {
      const field = record?.fields.find((recordField) => recordField.columnName === column.columnName);
      const validators = this.isDatatableColumnRequired(column) ? [Validators.required] : [];
      acc[this.datatableControlName(column)] = new FormControl(
        this.toDatatableControlValue(column, field?.value),
        validators
      );
      return acc;
    }, {});
    return this.formBuilder.group(controls);
  }

  private buildIdentifierForms(viewModel: PersonalDataViewModel | null): void {
    this.identifierForms = {};
    (viewModel?.identifiers || []).forEach((identifier: any) => {
      if (!identifier?.id) {
        return;
      }
      this.identifierForms[this.identifierFormKey(identifier)] = this.formBuilder.group({
        documentTypeId: [identifier.documentType?.id || ''],
        documentKey: [
          identifier.documentKey || '',
          Validators.required
        ],
        description: [identifier.description || ''],
        status: [this.identifierStatusValue(identifier.status)],
        issuanceDate: [this.toDate(identifier.issuanceDate)],
        expiryDate: [this.toDate(identifier.expiryDate)]
      });
    });
  }

  private findProductionAddress(addresses: any[]): any {
    const addressTypePattern = this.legalFormId === LegalFormId.ENTITY ? /tax/i : /home/i;
    return (
      addresses.find((address) => addressTypePattern.test(address.addressType || '')) ||
      addresses.find((address) => address.isActive) ||
      addresses[0] ||
      null
    );
  }

  private defaultAddressTypeId(): any {
    const addressTypePattern = this.legalFormId === LegalFormId.ENTITY ? /tax/i : /home/i;
    const option = this.clientAddressTemplate?.addressTypeIdOptions?.find((type: any) =>
      addressTypePattern.test(type.name || '')
    );
    return option?.id || this.clientAddressTemplate?.addressTypeIdOptions?.[0]?.id || '';
  }

  /**
   * Submits the edit client form.
   */
  submit() {
    if (this.isSubmitDisabled) {
      this.editClientForm.markAllAsTouched();
      this.personalDataAddressForm?.markAllAsTouched();
      this.markDirtyDatatableFormsAsTouched();
      return;
    }
    if (this.hasDirtyInvalidDatatableForm()) {
      this.markDirtyDatatableFormsAsTouched();
      this.changeDetectorRef.markForCheck();
      return;
    }
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const editClientFormValue: any = this.editClientForm.getRawValue();
    const clientData = {
      ...editClientFormValue,
      dateOfBirth:
        editClientFormValue.dateOfBirth && this.dateUtils.formatDate(editClientFormValue.dateOfBirth, dateFormat),
      submittedOnDate:
        editClientFormValue.submittedOnDate &&
        this.dateUtils.formatDate(editClientFormValue.submittedOnDate, dateFormat),
      activationDate: this.dateUtils.formatDate(editClientFormValue.activationDate, dateFormat),
      dateFormat,
      locale
    };
    delete clientData.officeId;
    if (editClientFormValue.clientNonPersonDetails) {
      clientData.clientNonPersonDetails = {
        ...editClientFormValue.clientNonPersonDetails,
        incorpValidityTillDate:
          editClientFormValue.clientNonPersonDetails.incorpValidityTillDate &&
          this.dateUtils.formatDate(editClientFormValue.clientNonPersonDetails.incorpValidityTillDate, dateFormat),
        dateFormat,
        locale
      };
    } else {
      clientData.clientNonPersonDetails = {};
    }
    const saveOperations: Observable<any>[] = !this.productionMode || this.editClientForm.dirty ? [
            this.clientsService.updateClient(this.clientDataAndTemplate.id, clientData)
          ] : [];
    const addressSave = this.buildAddressSave();
    if (addressSave) {
      saveOperations.push(addressSave);
    }
    saveOperations.push(...this.buildIdentifierSaves());
    saveOperations.push(...this.buildDatatableSaves());

    if (!saveOperations.length) {
      this.router.navigate(['../personal-data'], { relativeTo: this.route });
      return;
    }

    this.saving = true;
    forkJoin(saveOperations)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['../personal-data'], { relativeTo: this.route });
        },
        error: () => {
          this.saving = false;
          this.loadProductionEditData();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private buildAddressSave(): Observable<any> | null {
    if (!this.productionMode || !this.personalDataAddressForm?.dirty || !this.personalDataAddressForm.valid) {
      return null;
    }
    const addressValue = this.personalDataAddressForm.getRawValue();
    const addressTypeId = this.resolveAddressTypeId(addressValue.addressTypeId);
    if (!addressTypeId) {
      return null;
    }
    const payload = normalizeAddressCoordinates(
      {
        ...addressValue,
        addressId: this.editableAddress?.addressId,
        isActive: this.editableAddress?.isActive
      },
      this.clientAddressLocationEnabled
    );
    delete payload.addressTypeId;
    if (this.editableAddress) {
      payload.addressTypeId = addressTypeId;
    }
    return this.editableAddress
      ? this.clientsService.editClientAddress(this.clientDataAndTemplate.id.toString(), addressTypeId, payload)
      : this.clientsService.createClientAddress(this.clientDataAndTemplate.id.toString(), addressTypeId, payload);
  }

  addressCodeValue(controlName: 'stateProvinceId' | 'countryId'): string {
    const value = this.personalDataAddressForm?.get(controlName)?.value;
    if (!value) {
      return '';
    }
    const optionKey = controlName === 'stateProvinceId' ? 'stateProvinceIdOptions' : 'countryIdOptions';
    const options = this.clientAddressTemplate?.[optionKey] || [];
    const option = options.find((item: any) => item?.id?.toString() === value.toString());
    return option?.name || value.toString();
  }

  private resolveAddressTypeId(addressTypeId: any): string | null {
    if (addressTypeId === null || addressTypeId === undefined || addressTypeId === '') {
      return null;
    }
    const rawAddressType = addressTypeId.toString().trim();
    const addressTypeOptions = this.clientAddressTemplate?.addressTypeIdOptions || [];
    const matchingAddressType = addressTypeOptions.find((addressType: any) => [
        addressType.id,
        addressType.name,
        addressType.value,
        addressType.code
      ].some((optionValue) => optionValue?.toString().trim().toLowerCase() === rawAddressType.toLowerCase()));
    if (matchingAddressType?.id) {
      return matchingAddressType.id.toString();
    }
    if (addressTypeOptions.length) {
      return null;
    }
    const parsedAddressTypeId = Number(rawAddressType);
    return Number.isFinite(parsedAddressTypeId) && parsedAddressTypeId > 0 ? parsedAddressTypeId.toString() : null;
  }

  private buildDatatableSaves(): Observable<any>[] {
    if (!this.productionMode) {
      return [];
    }
    const saves: Observable<any>[] = [];
    this.productionDatatableSections.forEach((section) => {
      section.records.forEach((record) => {
        const form = this.personalDataTableForms[this.datatableFormKey(section, record)];
        if (!form?.dirty || !form.valid) {
          return;
        }
        const payload = this.buildDatatablePayload(section, form);
        saves.push(
          record.id && section.isMultiRow
            ? this.systemService.editEntityDatatableEntryOneToMany(
                this.clientDataAndTemplate.id.toString(),
                record.id.toString(),
                section.sourceName,
                payload
              )
            : this.systemService.editEntityDatatableEntry(
                this.clientDataAndTemplate.id.toString(),
                section.sourceName,
                payload
              )
        );
      });

      this.datatableNewRowIndexes(section).forEach((index) => {
        const form = this.personalDataTableForms[this.datatableNewFormKey(section, index)];
        if (!form?.dirty || !form.valid || !this.hasUserEnteredDatatableValues(form)) {
          return;
        }
        saves.push(
          this.systemService.addEntityDatatableEntry(
            this.clientDataAndTemplate.id.toString(),
            section.sourceName,
            this.buildDatatablePayload(section, form)
          )
        );
      });
    });
    return saves;
  }

  private buildDatatablePayload(section: PersonalDataTableSection, form: FormGroup): any {
    const payload: any = { locale: this.settingsService.language.code };
    const formValue = form.getRawValue();
    const dateFormat = this.datatableDateFormat(section);
    let hasDateValue = false;
    section.columns.forEach((column) => {
      const controlName = this.datatableControlName(column);
      const value = formValue[controlName];
      if (this.isDatatableNumeric(column)) {
        payload[column.columnName] = value === null || value === undefined || value === '' ? null : value * 1;
      } else if (this.isDatatableDate(column)) {
        payload[column.columnName] = value ? this.dateUtils.formatDate(value, dateFormat) : null;
        hasDateValue = hasDateValue || !!value;
      } else if (this.isDatatableDropdown(column)) {
        payload[column.columnName] = this.toDatatableDropdownPayloadValue(column, value);
      } else if (this.isDatatableBoolean(column)) {
        payload[column.columnName] = this.toDatatableBooleanPayloadValue(value);
      } else {
        payload[column.columnName] = value === null || value === undefined ? '' : value.toString();
      }
    });
    if (hasDateValue) {
      payload['dateFormat'] = dateFormat;
    }
    return payload;
  }

  private buildIdentifierSaves(): Observable<any>[] {
    if (!this.productionMode) {
      return [];
    }
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    return (this.productionViewModel?.identifiers || [])
      .map((identifier: any) => {
        const form = this.identifierForms[this.identifierFormKey(identifier)];
        if (!identifier?.id || !form?.dirty || !form.valid) {
          return null;
        }
        const value = form.getRawValue();
        const payload: ClientIdentifierPayload = {
          documentTypeId: value.documentTypeId,
          documentKey: value.documentKey,
          description: value.description,
          status: value.status,
          issuanceDate: value.issuanceDate ? this.dateUtils.formatDate(value.issuanceDate, dateFormat) : null,
          expiryDate: value.expiryDate ? this.dateUtils.formatDate(value.expiryDate, dateFormat) : null,
          dateFormat,
          locale
        };
        return this.clientsService.editClientIdentifier(
          this.clientDataAndTemplate.id.toString(),
          identifier.id.toString(),
          payload
        );
      })
      .filter((save): save is Observable<any> => !!save);
  }

  private identifierStatusValue(status: any): string {
    const value = status?.value || status?.code || status || '';
    return /inactive/i.test(value) ? 'Inactive' : 'Active';
  }

  private toDate(value: any): Date | '' {
    if (!value) {
      return '';
    }
    return Array.isArray(value) ? new Date(value[0], value[1] - 1, value[2]) : new Date(value);
  }

  private toDatatableControlValue(column: PersonalDataTableColumn, value: any): any {
    if (value === null || value === undefined) {
      return '';
    }
    if (this.isDatatableDate(column)) {
      if (Array.isArray(value)) {
        return new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0, value[5] || 0);
      }
      if (this.datatables.isColumnType(column.columnDisplayType || '', 'DATETIME') && this.dateUtils.parseDatetime) {
        return this.dateUtils.parseDatetime(value);
      }
      return this.dateUtils.parseDate ? this.dateUtils.parseDate(value) : new Date(value);
    }
    if (this.isDatatableBoolean(column)) {
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        return /^(true|yes|1)$/i.test(value);
      }
    }
    if (this.isDatatableDropdown(column)) {
      return this.toDatatableDropdownControlValue(column, value);
    }
    return value;
  }

  private toDatatableDropdownControlValue(column: PersonalDataTableColumn, value: any): any {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    const options = this.datatableColumnValues(column);
    const matchedOption = options.find((option) => {
      const optionId = option.id?.toString();
      const optionValue = option.value?.toString();
      const optionName = option.name?.toString();
      const rawValue = value?.toString();
      return optionId === rawValue || optionValue === rawValue || optionName === rawValue;
    });
    return matchedOption?.id ?? value;
  }

  private toDatatableDropdownPayloadValue(column: PersonalDataTableColumn, value: any): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const matchedOption = this.datatableColumnValues(column).find(
      (option) => option.id?.toString() === value?.toString()
    );
    return matchedOption?.id ?? value;
  }

  private toDatatableBooleanPayloadValue(value: any): boolean | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    return /^(true|yes|1)$/i.test(value.toString());
  }

  private datatableDateFormat(section: PersonalDataTableSection): string {
    return section.columns.some((column) => this.datatableColumnType(column) === 'DATETIME')
      ? Dates.DEFAULT_DATETIMEFORMAT
      : Dates.DEFAULT_DATEFORMAT;
  }

  private datatableColumnType(column: PersonalDataTableColumn): string {
    const type = (column.columnDisplayType || column.columnType || '').toString().trim().toUpperCase();
    if (type === 'NUMBER') {
      return 'INTEGER';
    }
    return type;
  }

  private translateDatatableLabel(rawLabel: string, displayLabel: string): string {
    const rawKey = `labels.inputs.${rawLabel}`;
    const translatedRawLabel = this.translateService.instant(rawKey);
    if (translatedRawLabel !== rawKey) {
      return translatedRawLabel;
    }
    const displayKey = `labels.inputs.${displayLabel}`;
    const translatedDisplayLabel = this.translateService.instant(displayKey);
    return translatedDisplayLabel === displayKey ? displayLabel : translatedDisplayLabel;
  }

  private hasDirtyInvalidDatatableForm(): boolean {
    return Object.values(this.personalDataTableForms).some((form) => form.dirty && form.invalid);
  }

  private hasDirtyInvalidAddressForm(): boolean {
    return !!this.personalDataAddressForm?.dirty && this.personalDataAddressForm.invalid;
  }

  private hasDirtyInvalidClientForm(): boolean {
    return this.productionMode ? this.editClientForm.dirty && this.editClientForm.invalid : this.editClientForm.invalid;
  }

  private hasUserEnteredDatatableValues(form: FormGroup): boolean {
    return Object.values(form.getRawValue()).some((value) => value !== null && value !== undefined && value !== '');
  }

  private isDatatableColumnRequired(column: PersonalDataTableColumn): boolean {
    if (column.mandatory !== undefined) {
      return column.mandatory;
    }
    return column.isColumnNullable === false;
  }

  private markDirtyDatatableFormsAsTouched(): void {
    Object.values(this.personalDataTableForms).forEach((form) => {
      if (form.dirty) {
        form.markAllAsTouched();
      }
    });
  }
}

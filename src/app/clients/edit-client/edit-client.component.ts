/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LegalFormId } from 'app/clients/models/legal-form.enum';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';

/** Custom Services */
import { ClientsService } from '../clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { ExternalNationalIdService } from 'app/clients/services/external-national-id.service';
import { MatDivider } from '@angular/material/divider';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
    MatCheckbox
  ]
})
export class EditClientComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientsService = inject(ClientsService);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  externalNationalIdService = inject(ExternalNationalIdService);

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();

  /** Client Data and Template */
  clientDataAndTemplate: any;
  /** Edit Client Form */
  editClientForm: UntypedFormGroup;

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

  /** Expose enum to template */
  readonly LegalFormId = LegalFormId;

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
    this.route.data.subscribe((data: { clientDataAndTemplate: any }) => {
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
    this.editClientForm.get('legalFormId').valueChanges.subscribe((legalFormId: any) => {
      if (legalFormId === LegalFormId.PERSON) {
        this.editClientForm.removeControl('fullname');
        this.editClientForm.removeControl('clientNonPersonDetails');
        this.editClientForm.addControl(
          'firstname',
          new UntypedFormControl(this.clientDataAndTemplate.firstname, Validators.required)
        );
        this.editClientForm.addControl('middlename', new UntypedFormControl(this.clientDataAndTemplate.middlename));
        this.editClientForm.addControl(
          'lastname',
          new UntypedFormControl(this.clientDataAndTemplate.lastname, Validators.required)
        );
      } else {
        this.editClientForm.removeControl('firstname');
        this.editClientForm.removeControl('middlename');
        this.editClientForm.removeControl('lastname');
        this.editClientForm.addControl(
          'fullname',
          new UntypedFormControl(this.clientDataAndTemplate.fullname, Validators.required)
        );
        this.editClientForm.addControl(
          'clientNonPersonDetails',
          this.formBuilder.group({
            constitutionId: [
              this.clientDataAndTemplate.clientNonPersonDetails.constitution &&
                this.clientDataAndTemplate.clientNonPersonDetails.constitution.id,
              Validators.required
            ],
            incorpValidityTillDate: [
              this.clientDataAndTemplate.clientNonPersonDetails.incorpValidityTillDate &&
                new Date(this.clientDataAndTemplate.clientNonPersonDetails.incorpValidityTillDate)
            ],
            incorpNumber: [this.clientDataAndTemplate.clientNonPersonDetails.incorpNumber],
            mainBusinessLineId: [
              this.clientDataAndTemplate.clientNonPersonDetails.mainBusinessLine &&
                this.clientDataAndTemplate.clientNonPersonDetails.mainBusinessLine.id
            ],
            remarks: [this.clientDataAndTemplate.clientNonPersonDetails.remarks]
          })
        );
      }
    });
  }

  getDateLabel(legalFormId: number, values: string[]): string {
    return legalFormId === LegalFormId.PERSON ? values[0] : values[1];
  }

  /**
   * Submits the edit client form.
   */
  submit() {
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
    this.clientsService.updateClient(this.clientDataAndTemplate.id, clientData).subscribe(() => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}

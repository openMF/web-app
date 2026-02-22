/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { LegalFormId } from 'app/clients/models/legal-form.enum';
import { ExternalNationalIdService } from 'app/clients/services/external-national-id.service';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { MatDivider } from '@angular/material/divider';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Client Component
 */
@Component({
  selector: 'mifosx-client-general-step',
  templateUrl: './client-general-step.component.html',
  styleUrls: ['./client-general-step.component.scss'],
  providers: [ExternalNationalIdService],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
    CdkTextareaAutosize,
    MatCheckbox,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class ClientGeneralStepComponent implements OnInit, OnDestroy {
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private clientService = inject(ClientsService);
  externalNationalIdService = inject(ExternalNationalIdService);

  /** Subject to trigger unsubscription on destroy */
  private destroy$ = new Subject<void>();

  @Output() legalFormChangeEvent = new EventEmitter<{ legalForm: number }>();

  /** Expose enum to template */
  readonly LegalFormId = LegalFormId;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();

  /** Client Template */
  @Input() clientTemplate: any;
  /** Create Client Form */
  createClientForm: UntypedFormGroup;

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
  /** Saving Product Options */
  savingProductOptions: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Setting service
   * @param {ClientsService} clientService Client service
   */
  constructor() {
    this.setClientForm();
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setOptions();
    this.buildDependencies();
    this.externalNationalIdService.watchExternalId(this.createClientForm, this.genderOptions);
  }

  /**
   * Creates the client form.
   */
  setClientForm() {
    this.createClientForm = this.formBuilder.group({
      officeId: [
        '',
        Validators.required
      ],
      staffId: [''],
      legalFormId: [
        '',
        Validators.required
      ],
      isStaff: [false],
      active: [false],
      addSavings: [false],
      accountNo: [''],
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
        this.settingsService.businessDate,
        Validators.required
      ]
    });
  }

  /**
   * Sets select dropdown options.
   */
  setOptions() {
    this.officeOptions = this.clientTemplate.officeOptions;
    this.staffOptions = this.clientTemplate.staffOptions;
    this.legalFormOptions = this.clientTemplate.clientLegalFormOptions;
    this.clientTypeOptions = this.clientTemplate.clientTypeOptions;
    this.clientClassificationTypeOptions = this.clientTemplate.clientClassificationOptions;
    this.businessLineOptions = this.clientTemplate.clientNonPersonMainBusinessLineOptions;
    this.constitutionOptions = this.clientTemplate.clientNonPersonConstitutionOptions;
    this.genderOptions = this.clientTemplate.genderOptions;
    this.savingProductOptions = this.clientTemplate.savingProductOptions;
  }

  /**
   * Adds controls conditionally.
   */
  buildDependencies() {
    this.createClientForm
      .get('legalFormId')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((legalFormId: number) => {
        this.legalFormChangeEvent.emit({ legalForm: legalFormId });
        if (legalFormId === LegalFormId.PERSON) {
          this.createClientForm.removeControl('fullname');
          this.createClientForm.removeControl('clientNonPersonDetails');
          this.createClientForm.addControl(
            'firstname',
            new UntypedFormControl('', [
              Validators.required,
              Validators.pattern('(^[A-z]).*')
            ])
          );
          this.createClientForm.addControl('middlename', new UntypedFormControl('', Validators.pattern('(^[A-z]).*')));
          this.createClientForm.addControl(
            'lastname',
            new UntypedFormControl('', [
              Validators.required,
              Validators.pattern('(^[A-z]).*')
            ])
          );
        } else {
          this.createClientForm.removeControl('firstname');
          this.createClientForm.removeControl('middlename');
          this.createClientForm.removeControl('lastname');
          this.createClientForm.addControl(
            'fullname',
            new UntypedFormControl('', [
              Validators.required,
              Validators.pattern('(^[A-z]).*')
            ])
          );
          this.createClientForm.addControl(
            'clientNonPersonDetails',
            this.formBuilder.group({
              constitutionId: [
                '',
                Validators.required
              ],
              incorpValidityTillDate: [''],
              incorpNumber: [''],
              mainBusinessLineId: [''],
              remarks: ['']
            })
          );
        }
      });
    this.createClientForm.get('legalFormId').patchValue(LegalFormId.PERSON);
    this.createClientForm
      .get('active')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((active: boolean) => {
        if (active) {
          this.createClientForm.addControl('activationDate', new UntypedFormControl('', Validators.required));
        } else {
          this.createClientForm.removeControl('activationDate');
        }
      });
    this.createClientForm
      .get('addSavings')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((active: boolean) => {
        if (active) {
          this.createClientForm.addControl('savingsProductId', new UntypedFormControl('', Validators.required));
        } else {
          this.createClientForm.removeControl('savingsProductId');
        }
      });
    this.createClientForm
      .get('officeId')
      .valueChanges.pipe(
        filter((officeId: number) => !!officeId),
        switchMap((officeId: number) => this.clientService.getClientWithOfficeTemplate(officeId)),
        takeUntil(this.destroy$)
      )
      .subscribe((clientTemplate: any) => {
        this.staffOptions = clientTemplate.staffOptions;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDateLabel(legalFormId: number, values: string[]): string {
    return legalFormId === LegalFormId.PERSON ? values[0] : values[1];
  }

  /**
   * Client General Details
   */
  get clientGeneralDetails() {
    const generalDetails = this.createClientForm.value;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    for (const key in generalDetails) {
      if (generalDetails[key] === '' || key === 'addSavings') {
        delete generalDetails[key];
      }
    }
    if (generalDetails.submittedOnDate instanceof Date) {
      generalDetails.submittedOnDate = this.dateUtils.formatDate(generalDetails.submittedOnDate, dateFormat);
    }
    if (generalDetails.activationDate instanceof Date) {
      generalDetails.activationDate = this.dateUtils.formatDate(generalDetails.activationDate, dateFormat);
    }
    if (generalDetails.dateOfBirth instanceof Date) {
      generalDetails.dateOfBirth = this.dateUtils.formatDate(generalDetails.dateOfBirth, dateFormat);
    }

    if (generalDetails.clientNonPersonDetails && generalDetails.clientNonPersonDetails.incorpValidityTillDate) {
      generalDetails.clientNonPersonDetails = {
        ...generalDetails.clientNonPersonDetails,
        incorpValidityTillDate: this.dateUtils.formatDate(
          generalDetails.clientNonPersonDetails.incorpValidityTillDate,
          dateFormat
        ),
        dateFormat,
        locale
      };
    }
    return generalDetails;
  }
}

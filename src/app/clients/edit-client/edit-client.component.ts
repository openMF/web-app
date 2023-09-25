/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';

/** Custom Services */
import { ClientsService } from '../clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Edit Client Component
 */
@Component({
  selector: 'mifosx-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.scss']
})
export class EditClientComponent implements OnInit {

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
  legalFormId = 1;

  /**
   * Fetches client template data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ActivatedRoute} route ActivatedRoute
   * @param {Router} router Router
   * @param {ClientsService} clientsService Clients Service
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private clientsService: ClientsService,
              private dateUtils: Dates,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { clientDataAndTemplate: any }) => {
      this.clientDataAndTemplate = data.clientDataAndTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createEditClientForm();
    this.setOptions();
    this.buildDependencies();
    this.legalFormId = 1;
    this.editClientForm.patchValue({
      'officeId': this.clientDataAndTemplate.officeId,
      'staffId': this.clientDataAndTemplate.staffId,
      'legalFormId': this.clientDataAndTemplate.legalForm && this.clientDataAndTemplate.legalForm.id,
      'accountNo': this.clientDataAndTemplate.accountNo,
      'externalId': this.clientDataAndTemplate.externalId,
      'genderId': this.clientDataAndTemplate.gender && this.clientDataAndTemplate.gender.id,
      'isStaff': this.clientDataAndTemplate.isStaff,
      'active': this.clientDataAndTemplate.active,
      'mobileNo': this.clientDataAndTemplate.mobileNo,
      'emailAddress': this.clientDataAndTemplate.emailAddress,
      'dateOfBirth': this.clientDataAndTemplate.dateOfBirth && new Date(this.clientDataAndTemplate.dateOfBirth),
      'clientTypeId': this.clientDataAndTemplate.clientType && this.clientDataAndTemplate.clientType.id,
      'clientClassificationId': this.clientDataAndTemplate.clientClassification && this.clientDataAndTemplate.clientClassification.id,
      'submittedOnDate': this.clientDataAndTemplate.timeline.submittedOnDate && new Date(this.clientDataAndTemplate.timeline.submittedOnDate),
      'activationDate': this.clientDataAndTemplate.timeline.activatedOnDate && new Date(this.clientDataAndTemplate.timeline.activatedOnDate)
    });
    if (this.clientDataAndTemplate.legalForm) {
      this.legalFormId = this.clientDataAndTemplate.legalForm.id;
    }
  }

  /**
   * Creates the edit client form.
   */
  createEditClientForm() {
    this.editClientForm = this.formBuilder.group({
      'officeId': [{ value: '', disabled: true }],
      'staffId': [''],
      'legalFormId': [{ value: '', disabled: true }],
      'isStaff': [false],
      'active': [false],
      'accountNo': [{ value: '', disabled: true }],
      'externalId': [''],
      'genderId': [''],
      'mobileNo': [''],
      'emailAddress': ['', Validators.email],
      'dateOfBirth': [''],
      'clientTypeId': [''],
      'clientClassificationId': [''],
      'submittedOnDate': ['', Validators.required],
      'activationDate': ['']
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
      if (legalFormId === 1) {
        this.editClientForm.removeControl('fullname');
        this.editClientForm.removeControl('clientNonPersonDetails');
        this.editClientForm.addControl('firstname', new UntypedFormControl(this.clientDataAndTemplate.firstname, Validators.required));
        this.editClientForm.addControl('middlename', new UntypedFormControl(this.clientDataAndTemplate.middlename));
        this.editClientForm.addControl('lastname', new UntypedFormControl(this.clientDataAndTemplate.lastname, Validators.required));
      } else {
        this.editClientForm.removeControl('firstname');
        this.editClientForm.removeControl('middlename');
        this.editClientForm.removeControl('lastname');
        this.editClientForm.addControl('fullname', new UntypedFormControl(this.clientDataAndTemplate.fullname, Validators.required));
        this.editClientForm.addControl('clientNonPersonDetails', this.formBuilder.group({
          'constitutionId': [this.clientDataAndTemplate.clientNonPersonDetails.constitution && this.clientDataAndTemplate.clientNonPersonDetails.constitution.id, Validators.required],
          'incorpValidityTillDate': [this.clientDataAndTemplate.clientNonPersonDetails.incorpValidityTillDate && new Date(this.clientDataAndTemplate.clientNonPersonDetails.incorpValidityTillDate)],
          'incorpNumber': [this.clientDataAndTemplate.clientNonPersonDetails.incorpNumber],
          'mainBusinessLineId': [this.clientDataAndTemplate.clientNonPersonDetails.mainBusinessLine && this.clientDataAndTemplate.clientNonPersonDetails.mainBusinessLine.id],
          'remarks': [this.clientDataAndTemplate.clientNonPersonDetails.remarks]
        }));
      }
    });
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
      dateOfBirth: editClientFormValue.dateOfBirth && this.dateUtils.formatDate(editClientFormValue.dateOfBirth, dateFormat),
      submittedOnDate: editClientFormValue.submittedOnDate && this.dateUtils.formatDate(editClientFormValue.submittedOnDate, dateFormat),
      activationDate: this.dateUtils.formatDate(editClientFormValue.activationDate, dateFormat),
      dateFormat,
      locale
    };
    delete clientData.officeId;
    if (editClientFormValue.clientNonPersonDetails) {
      clientData.clientNonPersonDetails = {
        ...editClientFormValue.clientNonPersonDetails,
        incorpValidityTillDate: editClientFormValue.clientNonPersonDetails.incorpValidityTillDate && this.dateUtils.formatDate(editClientFormValue.clientNonPersonDetails.incorpValidityTillDate, dateFormat),
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

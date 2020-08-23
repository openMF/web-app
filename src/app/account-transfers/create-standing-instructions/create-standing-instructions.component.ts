/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Create Standing Instructions
 */
@Component({
  selector: 'mifosx-create-standing-instructions',
  templateUrl: './create-standing-instructions.component.html',
  styleUrls: ['./create-standing-instructions.component.scss']
})
export class CreateStandingInstructionsComponent implements OnInit {

  /** Standing Instructions Data */
  standingIntructionsTemplate: any;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Allow Client Edit */
  allowclientedit = true;
  /** Edit Standing Instructions form. */
  createStandingInstructionsForm: FormGroup;
  /** Priority Type Data */
  priorityTypeData: any;
  /** Status Type Data */
  statusTypeData: any;
  /** Instruction Type Data  */
  instructionTypeData: any;
  /** Recurrence Type Data */
  recurrenceTypeData: any;
  /** Recurrence Frequency Type Data */
  recurrenceFrequencyTypeData: any;
  /** Transfer Type Data */
  transferTypeData: any;
  /** From Account Type Data */
  fromAccountTypeData: any;
  /** From Account Data */
  fromAccountData: any;
  /** Destination Type Data */
  destinationTypeData: { id: number; value: string; }[];
  /** To Office Type Data */
  toOfficeTypeData: any;
  /** To Client Type Data */
  toClientTypeData: any;
  /** To Account Type Data */
  toAccountTypeData: any;
  /** To Account Data */
  toAccountData: any;
  /** Account Type Id */
  accountTypeId: any;
  /** Office Id */
  officeId: any;
  /** Account Type */
  accountType: any;
  /** Client Id */
  clientId: any;

  /**
   * Retrieves the standing instructions template from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Router} router Router
   * @param {AccountTransfersService} accountTransfersService Account Transfers Service
   * @param {SettingsService} settingsService Settings Service
   * @param {DatePipe} datePipe Date Pipe
   */
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountTransfersService: AccountTransfersService,
    private settingsService: SettingsService,
    private datePipe: DatePipe) {
    this.route.data.subscribe((data: { standingIntructionsTemplate: any }) => {
      this.standingIntructionsTemplate = data.standingIntructionsTemplate;
      this.setParams();
      this.setOptions();
    });
  }

  /** Sets the value from the URL */
  setParams() {
    this.officeId = this.route.snapshot.queryParams['officeId'];
    this.accountType = this.route.snapshot.queryParams['accountType'];
    this.clientId = this.route.parent.snapshot.params['clientId'];
    switch (this.accountType) {
      case 'fromloans':
        this.accountTypeId = '1';
        break;
      case 'fromsavings':
        this.accountTypeId = '2';
        break;
      default:
        this.accountTypeId = '0';
    }
  }

  /**
   * Creates and sets the create standing instructions form.
   */
  ngOnInit() {
    this.createCreateStandingInstructionsForm();
    this.buildDependencies();
    this.createStandingInstructionsForm.patchValue({
      'applicant': this.standingIntructionsTemplate.fromClient.displayName
    });
  }

  /**
   * Creates the standing instruction form.
   */
  createCreateStandingInstructionsForm() {
    this.createStandingInstructionsForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'applicant': [{value: '', disabled: true}],
      'transferType': ['', Validators.required],
      'priority': ['', Validators.required],
      'status': ['', Validators.required],
      'fromAccountType': ['', Validators.required],
      'fromAccountId': ['', Validators.required],
      'destination': ['', Validators.required],
      'toOfficeId': ['', Validators.required],
      'toClientId': ['', Validators.required],
      'toAccountType': ['', Validators.required],
      'toAccountId': ['', Validators.required],
      'instructionType': ['', Validators.required],
      'amount': ['', Validators.required],
      'validFrom': ['', Validators.required],
      'validTill': ['', Validators.required],
      'recurrenceType': ['', Validators.required],
      'recurrenceInterval': ['', Validators.required],
      'recurrenceFrequency': ['', Validators.required],
      'recurrenceOnMonthDay': ['', Validators.required]
    });
  }

  /** Sets options value */
  setOptions() {
    this.transferTypeData = this.standingIntructionsTemplate.transferTypeOptions;
    this.priorityTypeData = this.standingIntructionsTemplate.priorityOptions;
    this.statusTypeData = this.standingIntructionsTemplate.statusOptions;
    this.fromAccountTypeData = this.standingIntructionsTemplate.fromAccountTypeOptions;
    this.fromAccountData = this.standingIntructionsTemplate.fromAccountOptions;
    this.destinationTypeData = [{ id: 1, value: 'own account' }, { id: 2, value: 'with in bank' }];
    this.toOfficeTypeData = this.standingIntructionsTemplate.toOfficeOptions;
    this.toClientTypeData = this.standingIntructionsTemplate.toClientOptions;
    this.toAccountTypeData = this.standingIntructionsTemplate.toAccountTypeOptions;
    this.toAccountData = this.standingIntructionsTemplate.toAccountOptions;
    this.instructionTypeData = this.standingIntructionsTemplate.instructionTypeOptions;
    this.recurrenceTypeData = this.standingIntructionsTemplate.recurrenceTypeOptions;
    this.recurrenceFrequencyTypeData = this.standingIntructionsTemplate.recurrenceFrequencyOptions;
  }

  /**
   * Changes the value on change of destination value
   */
  buildDependencies() {
    this.createStandingInstructionsForm.get('destination').valueChanges.subscribe((destination: any) => {
      if (destination === 1) {
        this.allowclientedit = false;
        this.createStandingInstructionsForm.patchValue({
          'toOfficeId': this.officeId,
          'toClientId': this.clientId
        });
        this.createStandingInstructionsForm.controls['toOfficeId'].disable();
        this.createStandingInstructionsForm.controls['toClientId'].disable();
        this.changeEvent();
      } else {
        this.allowclientedit = true;
        this.createStandingInstructionsForm.patchValue({
          'toOfficeId': '',
          'toClientId': ''
        });
        this.createStandingInstructionsForm.controls['toOfficeId'].enable();
        this.createStandingInstructionsForm.controls['toClientId'].enable();
      }
    });

  }

  /** Executes on change of various select options */
  changeEvent() {
    const formValue = this.refineObject(this.createStandingInstructionsForm.value);
    this.accountTransfersService.getStandingInstructionsTemplate(this.clientId, this.officeId, this.accountTypeId, formValue).subscribe((response: any) => {
      this.standingIntructionsTemplate = response;
      this.setOptions();
    });
  }

  /** Refine Object
   * Removes the object param with null or '' values
   */
  refineObject(dataObj: Object) {
    const propNames = Object.getOwnPropertyNames(dataObj);
    for (let i = 0; i < propNames.length; i++) {
      const propName = propNames[i];
      if (dataObj[propName] === null || dataObj[propName] === undefined || dataObj[propName] === '') {
        delete dataObj[propName];
      }
    }
    return dataObj;
  }

  /**
   * Submits the standing instructions form
   */
  submit() {
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const standingInstructionData = {
      ... this.createStandingInstructionsForm.value,
      dateFormat,
      locale,
      monthDayFormat: 'dd MMMM',
      fromClientId: this.clientId,
      fromOfficeId: this.officeId,
      validFrom: this.datePipe.transform(this.createStandingInstructionsForm.value.validFrom, dateFormat),
      validTill: this.datePipe.transform(this.createStandingInstructionsForm.value.validTill, dateFormat),
      recurrenceOnMonthDay: this.datePipe.transform(this.createStandingInstructionsForm.value.recurrenceOnMonthDay, 'dd MMMM'),
    };
    delete standingInstructionData['destination'];
    delete standingInstructionData['applicant'];
    this.accountTransfersService.createStandingInstructions(standingInstructionData).subscribe((response: any) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

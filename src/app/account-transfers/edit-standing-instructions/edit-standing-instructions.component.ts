/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Edit Standing Instructions
 */
@Component({
  selector: 'mifosx-edit-standing-instructions',
  templateUrl: './edit-standing-instructions.component.html',
  styleUrls: ['./edit-standing-instructions.component.scss']
})
export class EditStandingInstructionsComponent implements OnInit {

  /** Standing Instructions Data */
  standingInstructionsData: any;
  /** Standing Instructions Id */
  standingInstructionsId: any;
  /** Allow Client Edit */
  allowclientedit = false;
  /** Edit Standing Instructions form. */
  editStandingInstructionsForm: FormGroup;
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
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();

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
    this.route.data.subscribe((data: { standingInstructionsDataAndTemplate: any }) => {
      this.standingInstructionsData = data.standingInstructionsDataAndTemplate;
      this.standingInstructionsId = data.standingInstructionsDataAndTemplate.id;
      if (this.standingInstructionsData.fromClient.id === this.standingInstructionsData.toClient.id) {
        this.allowclientedit = false;
      }
      this.setOptions();
    });
  }

  /**
   * Creates and sets the edit standing instructions form.
   */
  ngOnInit() {
    this.createEditStandingInstructionsForm();
    const presentDate = new Date();
    const n = presentDate.getFullYear();
    if (this.standingInstructionsData.recurrenceOnMonthDay) {
      this.standingInstructionsData.recurrenceOnMonthDay.push(n);
    }
    this.editStandingInstructionsForm.patchValue({
      'name': this.standingInstructionsData.name,
      'applicant': this.standingInstructionsData.fromClient.displayName,
      'type': this.standingInstructionsData.transferType.value,
      'priority': this.standingInstructionsData.priority.id,
      'status': this.standingInstructionsData.status.id,
      'fromAccountType': this.standingInstructionsData.fromAccountType.value,
      'fromAccount': this.standingInstructionsData.fromAccount.productName,
      'destination': this.allowclientedit ? 'Within Bank' : 'Own Account',
      'toOffice': this.standingInstructionsData.toOffice.name,
      'toClientId': this.standingInstructionsData.toClient.displayName,
      'toAccountType': this.standingInstructionsData.toAccountType.value,
      'toAccount': this.standingInstructionsData.toAccount.productName,
      'instructionType': this.standingInstructionsData.instructionType.id,
      'amount': this.standingInstructionsData.amount,
      'validFrom': this.standingInstructionsData.validFrom && new Date(this.standingInstructionsData.validFrom),
      'validTill': this.standingInstructionsData.validTill && new Date(this.standingInstructionsData.validTill),
      'recurrenceType': this.standingInstructionsData.recurrenceType.id,
      'recurrenceInterval': this.standingInstructionsData.recurrenceInterval,
      'recurrenceFrequency': this.standingInstructionsData.recurrenceFrequency.id,
      'recurrenceOnMonthDay': this.standingInstructionsData.recurrenceOnMonthDay && new Date(this.standingInstructionsData.recurrenceOnMonthDay)
    });
  }

  /**
   * Creates the standing instructions form.
   */
  createEditStandingInstructionsForm() {
    this.editStandingInstructionsForm = this.formBuilder.group({
      'name': [{value: '', disabled: true}],
      'applicant': [{ value: '', disabled: true }],
      'type': [{ value: '', disabled: true }],
      'priority': ['', Validators.required],
      'status': ['', Validators.required],
      'fromAccountType': [{ value: '', disabled: true }],
      'fromAccount': [{ value: '', disabled: true }],
      'destination': [{ value: '', disabled: true }],
      'toOffice': [{ value: '', disabled: true }],
      'toClientId': [{ value: '', disabled: true }],
      'toAccountType': [{ value: '', disabled: true }],
      'toAccount': [{ value: '', disabled: true }],
      'instructionType': '',
      'amount': '',
      'validFrom': ['', Validators.required],
      'validTill': ['', Validators.required],
      'recurrenceType': ['', Validators.required],
      'recurrenceInterval': '',
      'recurrenceFrequency': '',
      'recurrenceOnMonthDay': ''
    });
  }

  setOptions() {
    this.priorityTypeData = this.standingInstructionsData.priorityOptions;
    this.statusTypeData = this.standingInstructionsData.statusOptions;
    this.instructionTypeData = this.standingInstructionsData.instructionTypeOptions;
    this.recurrenceTypeData = this.standingInstructionsData.recurrenceTypeOptions;
    this.recurrenceFrequencyTypeData = this.standingInstructionsData.recurrenceFrequencyOptions;
  }

  /**
   * Submits the standing instructions form
   */
  submit() {
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const standingInstructionData = {
      amount: this.editStandingInstructionsForm.value.amount,
      dateFormat,
      instructionType: this.editStandingInstructionsForm.value.instructionType,
      locale,
      monthDayFormat:	'dd MMMM',
      priority: this.editStandingInstructionsForm.value.priority,
      recurrenceFrequency:	this.editStandingInstructionsForm.value.recurrenceFrequency,
      recurrenceInterval:	this.editStandingInstructionsForm.value.recurrenceInterval,
      recurrenceOnMonthDay: this.datePipe.transform(this.editStandingInstructionsForm.value.recurrenceOnMonthDay, 'dd MMMM'),
      recurrenceType:	this.editStandingInstructionsForm.value.recurrenceType,
      status:	this.editStandingInstructionsForm.value.status,
      validFrom: this.datePipe.transform(this.editStandingInstructionsForm.value.validFrom, dateFormat),
      validTill: this.datePipe.transform(this.editStandingInstructionsForm.value.validTill, dateFormat)
    };
    this.accountTransfersService.updateStandingInstructionsData(this.standingInstructionsId, standingInstructionData).subscribe((response: any) => {
      this.router.navigate(['../view'], { relativeTo: this.route });
    });
  }

}

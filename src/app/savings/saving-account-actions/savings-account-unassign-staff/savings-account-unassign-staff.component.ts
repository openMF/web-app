/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Savings Account Unassign Staff Component
 */
@Component({
  selector: 'mifosx-savings-account-unassign-staff',
  templateUrl: './savings-account-unassign-staff.component.html',
  styleUrls: ['./savings-account-unassign-staff.component.scss']
})
export class SavingsAccountUnassignStaffComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Savings Account Unassign Staff form. */
  savingsUnassignStaffForm: UntypedFormGroup;
  /** Savings Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private savingsService: SavingsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.accountId = this.route.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the savings account unassign staff form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createSavingsUnassignStaffForm();
  }

  /**
   * Creates the savings account unassign staff form.
   */
  createSavingsUnassignStaffForm() {
    this.savingsUnassignStaffForm = this.formBuilder.group({
      'unassignedDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and unassigns staff of the saving account,
   * if successful redirects to the saving account.
   */
  submit() {
    const savingsUnassignStaffFormData = this.savingsUnassignStaffForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevUnassignmentDate: Date = this.savingsUnassignStaffForm.value.unassignedDate;
    if (savingsUnassignStaffFormData.unassignedDate instanceof Date) {
      savingsUnassignStaffFormData.unassignedDate = this.dateUtils.formatDate(prevUnassignmentDate, dateFormat);
    }
    const data = {
      ...savingsUnassignStaffFormData,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountCommand(this.accountId, 'unassignSavingsOfficer', data).subscribe(() => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }

}

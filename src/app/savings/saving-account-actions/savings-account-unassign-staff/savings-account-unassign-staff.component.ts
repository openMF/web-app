/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';

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
  savingsUnassignStaffForm: FormGroup;
  /** Savings Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private savingsService: SavingsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.accountId = this.route.parent.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the savings account unassign staff form.
   */
  ngOnInit() {
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
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevUnassignmentDate: Date = this.savingsUnassignStaffForm.value.unassignedDate;
    this.savingsUnassignStaffForm.patchValue({
      unassignedDate: this.datePipe.transform(prevUnassignmentDate, dateFormat),
    });
    const data = {
      ...this.savingsUnassignStaffForm.value,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountCommand(this.accountId, 'unassignSavingsOfficer', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

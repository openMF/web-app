/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Create closure component.
 */
@Component({
  selector: 'mifosx-create-closure',
  templateUrl: './create-closure.component.html',
  styleUrls: ['./create-closure.component.scss']
})
export class CreateClosureComponent implements OnInit {

  /** Minimum closing date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum closing date allowed. */
  maxDate = new Date();
  /** Accounting closure form. */
  accountingClosureForm: FormGroup;
  /** Office data. */
  officeData: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Creates the accounting closure form.
   */
  ngOnInit() {
    this.createAccountingClosureForm();
  }

  /**
   * Creates the accounting closure form.
   */
  createAccountingClosureForm() {
    this.accountingClosureForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'closingDate': ['', Validators.required],
      'comments': ['']
    });
  }

  /**
   * Submits the accounting closure form and creates accounting closure,
   * if successful redirects to view created closure.
   */
  submit() {
    const accountingClosure = this.accountingClosureForm.value;
    // TODO: Update once language and date settings are setup
    accountingClosure.locale = 'en';
    accountingClosure.dateFormat = 'yyyy-MM-dd';
    if (accountingClosure.closingDate instanceof Date) {
      let day = accountingClosure.closingDate.getDate();
      let month = accountingClosure.closingDate.getMonth() + 1;
      const year = accountingClosure.closingDate.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      accountingClosure.closingDate = `${year}-${month}-${day}`;
    }
    this.accountingService.createAccountingClosure(accountingClosure).subscribe((response: any) => {
      this.router.navigate(['../view', response.resourceId], { relativeTo: this.route });
    });
  }

}

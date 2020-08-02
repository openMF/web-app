/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services. */
import { OrganizationService } from '../organization.service';

/**
 * Bulk Loan Reassignment component.
 */
@Component({
  selector: 'mifosx-bulk-loan-reassignmnet',
  templateUrl: './bulk-loan-reassignmnet.component.html',
  styleUrls: ['./bulk-loan-reassignmnet.component.scss']
})
export class BulkLoanReassignmnetComponent implements OnInit {

  /** Bulk Loan form. */
  bulkLoanForm: FormGroup;
  /** Office data. */
  offices: any;
  /** To Loan Officers. */
  toLoanOfficers: any[];
  /** From Loan Offices. */
  fromLoanOfficers: any[];
  /** Office Template. */
  officeTemplate: any;
  /** Officer Template. */
  officerTemplate: any;
  /** Loans. */
  loans: any[] = new Array();
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * Get Office data from `resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private organizationSevice: OrganizationService,
              private datePipe: DatePipe,
              private router: Router) {
    this.route.data.subscribe((data: { offices: any} ) => {
      this.offices = data.offices;
    });
  }

  ngOnInit() {
    this.setBulkLoanForm();
  }

  /**
   * Set Bulk Loan Form.
   */
  setBulkLoanForm() {
    this.bulkLoanForm = this.formBuilder.group({
      'assignmentDate': [new Date(), Validators.required],
      'toLoanOfficerId': ['', Validators.required]
    });
  }

  /**
   * Get Office template.
   * @param officeId Office Id.
   */
  getOffice(officeId: string) {
    this.organizationSevice.getOfficeTemplate(officeId).subscribe((response: any) => {
      this.officeTemplate = response;
      this.fromLoanOfficers = this.officeTemplate.loanOfficerOptions;
      this.bulkLoanForm.addControl('fromLoanOfficerId', new FormControl('', Validators.required));
    });
  }

  /**
   * Get From Officers.
   * @param officerId Office Id.
   */
  getFromOfficers(officerId: any) {
    this.toLoanOfficers = this.fromLoanOfficers.filter((officer: any) => officer.id !== officerId );
    console.log(this.toLoanOfficers);
    this.organizationSevice.getOfficerTemplate(officerId, this.officeTemplate.id).subscribe((response: any) => {
      this.officerTemplate = response;
    });
  }

  /**
   * Get all loans.
   * @param event Mat Checkbox Event.
   * @param loanId Loan Id.
   */
  getLoans(event: any, loanId: any) {
    const isChecked = event.checked;
    if (isChecked) {
      this.loans.push(loanId);
    } else {
      const index = this.loans.indexOf(loanId, 0);
      this.loans.splice(index, 1);
    }
  }

  /**
   * Submits bulk loan reassignment form.
   */
  submit() {
    const dateFormat = 'yyyy-MM-dd';
    const assignmentDate = this.bulkLoanForm.value.assignmentDate;
    this.bulkLoanForm.patchValue({
      assignmentDate: this.datePipe.transform(assignmentDate, dateFormat)
    });
    const bulkForm = this.bulkLoanForm.value;
    bulkForm.locale = 'en';
    bulkForm.dateFormat = dateFormat;
    bulkForm.loans = this.loans;
    this.organizationSevice.createLoanReassignment(bulkForm).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Imports */
import { LoanService } from './loan.service';

/**
 * Assign Loan Officer Component
 */
@Component({
  selector: 'mifosx-assign-loan-officer',
  templateUrl: './assign-loan-officer.component.html',
  styleUrls: ['./assign-loan-officer.component.scss']
})
export class AssignLoanOfficerComponent implements OnInit {

  /** Loan Id */
  loanId: number;
  /** Loan Officers data */
  loanOfficers: any;
  /** Assign Loan Officer form */
  assignLoanOfficerForm: FormGroup;
  /** Existing Loan Officer Id */
  fromLoanOfficerId: any;
  /** Minimum date loan officer assignment allowed. */
  minDate = new Date(1900, 0, 1);
  /** Maximum date loan officer assignment allowed. */
  maxDate = new Date();

  /**
   * Retrieves the loan data.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {Router} router Router.
   * @param {ActivatedRoute} route Activated Route.
   * @param {LoanService} loanService Loan Service.
   */
  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private loanService: LoanService) {
    this.route.data.subscribe((data: {
      loanOfficers: any
      }) => {
        this.fromLoanOfficerId = data.loanOfficers['loanOfficerId'];
        this.loanOfficers = data.loanOfficers['loanOfficerOptions'];
    });
  }

  /**
   * Gets Loan Id form url params and gets loan officers.
   * Creates assign loan officer form.
   */
  ngOnInit() {
    this.createAssignLoanOfficerForm();
    this.route.params.subscribe(
      params => {
        this.loanId = params['loanId'];
      }
    );
  }

  /**
   * Creates assign loan officer form
   */
  createAssignLoanOfficerForm() {
    this.assignLoanOfficerForm = this.formBuilder.group({
      'loanOfficer': ['', Validators.required],
      'assignmentDate': ['', Validators.required]
    });
  }

  /**
   * Submits the assign loan officer form and assigns loan officer to the loan with id `loanid`,
   * If successful redirects to clients component.
   */
  submit() {
    const data: any = {};
    const formData = this.assignLoanOfficerForm.value;
    data.toLoanOfficerId = formData.loanOfficer;
    data.assignmentDate = this.getDate(formData.assignmentDate);
    data.dateFormat = 'yyyy-MM-dd';
    data.locale = 'en';
    data.fromLoanOfficerId = this.fromLoanOfficerId ||  '';
    this.loanService.assignLoanOfficer(this.loanId, data)
      .subscribe(
        ((response: any) => {
          this.router.navigate(['clients']);
        })
      );
  }

  /**
   * Gets the date from the passed timestamp.
   *
   * TODO: Update once language and date settings are setup.
   *
   * @param {any} timestamp Timestamp from which date is to be extracted.
   */
  private getDate(timestamp: any) {
    let day = timestamp.getDate();
    let month = timestamp.getMonth() + 1;
    const year = timestamp.getFullYear();
    if (day < 10) {
      day = `0${day}`;
    }
    if (month < 10) {
      month = `0${month}`;
    }
    return `${year}-${month}-${day}`;
  }
}

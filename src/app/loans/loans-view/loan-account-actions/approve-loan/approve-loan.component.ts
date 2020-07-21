/** Angular Imports. */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';

/**
 * Approve Loan component.
 */
@Component({
  selector: 'mifosx-approve-loan',
  templateUrl: './approve-loan.component.html',
  styleUrls: ['./approve-loan.component.scss']
})
export class ApproveLoanComponent implements OnInit {

  /** Approve Loan form. */
  approveLoanForm: FormGroup;
  /** Loan data. */
  loanData: any = new Object();
  /** Association Data */
  associationData: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Loan Id */
  loanId: any;

  /**
   * Retrieve data from `Resolver`.
   * @param formBuilder Form Builder.
   * @param route Activated Route.
   * @param datePipe Date Pipe.
   * @param loanService Loan Service.
   * @param router Router.
   */
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private loanService: LoansService,
    private router: Router) {
    this.route.data.subscribe((data: { actionButtonData: any }) => {
      this.loanData = data.actionButtonData;
    });
    this.loanId = this.route.parent.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.setApproveLoanForm();
    this.loanService.getApproveAssociationsDetails(this.loanId).subscribe((response: any) => {
      this.associationData = response;
      this.approveLoanForm.patchValue({
        'expectedDisbursementDate': new Date(response.timeline.expectedDisbursementDate)
      });
    });
  }

  /**
   * Set Approve Loan form.
   */
  setApproveLoanForm() {
    this.approveLoanForm = this.formBuilder.group({
      'approvedOnDate': [this.loanData.approvalDate && new Date(this.loanData.approvalDate), Validators.required],
      'expectedDisbursementDate': [''],
      'approvedLoanAmount': [this.loanData.approvalAmount, Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits Approve form.
   */
  submit() {
    const dateFormat = 'dd MMMM yyyy';
    const local = 'en';
    const approvedOnDate = this.approveLoanForm.value.approvedOnDate;
    const expectedDisbursementDate = this.approveLoanForm.value.expectedDisbursementDate;
    this.approveLoanForm.patchValue({
      approvedOnDate: this.datePipe.transform(approvedOnDate, dateFormat),
      expectedDisbursementDate: this.datePipe.transform(expectedDisbursementDate, dateFormat)
    });
    const approveLoanFormData = {
      ... this.approveLoanForm.value,
      dateFormat,
      local
    };
    this.loanService.loanActionButtons(this.loanId, 'approve', approveLoanFormData).subscribe((response: any) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

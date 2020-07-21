/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
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
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Approved amount. */
  approvedAmount: any;
  /** Disbursement details. */
  disbursementDetails: any[] = new Array();
  /** Disbursement count. */
  disbursementCount = 0;
  /** Total Amount. */
  total = 0;
  /** Mat table column fields. */
  displayedColumns: string[] = ['title', 'disbursementDate', 'amount', 'action'];
  /** Data source. */
  dataSource: any;

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
    this.route.data.subscribe((data: { loanData: any, loanTemplate: any}) => {
      this.loanData.loanData = data.loanData;
      this.loanData.template = data.loanTemplate;
      this.approvedAmount = this.loanData.template.approvalAmount;
    });
  }

  ngOnInit() {
    this.setApproveLoanForm();
    this.setTransactionAmount();
    this.setTotalAmount();
  }

  /**
   * Value changes in Approved Loan Amount.
   */
  setTransactionAmount() {
    this.approveLoanForm.get('approvedLoanAmount').valueChanges.pipe(distinctUntilChanged()).subscribe((value: any) => {
      this.approveLoanForm.get('approvedLoanAmount').setValue(value);
    });
  }

  /**
   * Set Total Amount on change.
   */
  setTotalAmount() {
     for (let i = 0; i < this.disbursementCount; i++) {
      try {
        const principalId = 'disPrincipal' + i;
        console.log(this.approveLoanForm.get(principalId).touched);
        this.approveLoanForm.get(principalId).valueChanges.pipe(distinctUntilChanged()).subscribe((value: any) => {
          console.log(value);
          let total = 0;
          for (let index = 0; index < this.disbursementCount; index++) {
            const subId = 'disPrincipal' + index;
            if (subId !== principalId) {
              total += parseInt(this.approveLoanForm.get(subId).value, 10);
            }
          }
          this.total = total + parseInt(value, 10);
        });
      } catch (ex) { }
    }
  }

  /**
   * Set Approve Loan form.
   */
  setApproveLoanForm() {
    this.approveLoanForm = this.formBuilder.group({
      'approvedOnDate': [this.loanData.template.approvalDate && new Date(this.loanData.template.approvalDate), Validators.required],
      'expectedDisbursementDate': [this.loanData.loanData.timeline.expectedDisbursementDate && new Date(this.loanData.loanData.timeline.expectedDisbursementDate), Validators.required],
      'approvedLoanAmount': [this.loanData.template.approvalAmount, Validators.required],
      'note': ['']
    });
    let count = 0;
    if (this.loanData.loanData.disbursementDetails !== undefined) {
      for (const disbursement of this.loanData.loanData.disbursementDetails) {
        const dateControlID = 'disDate' + count;
        const principalControlID = 'disPrincipal' + count;
        this.disbursementDetails.push({'id': disbursement.id, 'expectedDisbursementDate': new Date(disbursement.expectedDisbursementDate), 'principal': disbursement.principal});
        this.approveLoanForm.addControl(dateControlID, new FormControl(new Date(disbursement.expectedDisbursementDate)));
        this.approveLoanForm.addControl(principalControlID, new FormControl(disbursement.principal));
        this.total += parseInt(disbursement.principal, 10);
        count += 1;
      }
      this.disbursementCount = this.disbursementDetails.length;
    } else {
      this.disbursementCount = 0;
    }
    this.dataSource = new Array(this.disbursementCount);
  }

  /**
   * Add new Tranche.
   */
  addTranche() {
    this.disbursementCount = this.disbursementCount + 1;
    const dateId = 'disDate' + (this.disbursementCount - 1);
    const principalId = 'disPrincipal' + (this.disbursementCount - 1);
    this.approveLoanForm.addControl(principalId, new FormControl({value: '', disabled: false}));
    this.approveLoanForm.addControl(dateId, new FormControl({value: '', disabled: false}));
    this.setTotalAmount();
  }

  /**
   * Remove Tranche.
   * @param id Disbursement Id.
   */
  removeTranche(id: any= -1) {
    if (id !== -1) {
      this.disbursementDetails = this.disbursementDetails.filter((disbursement: any) => disbursement.id !== id);
    }
    this.disbursementCount = this.disbursementCount - 1;
    const dateId = 'disDate' + this.disbursementCount;
    const principalId = 'disPrincipal' + this.disbursementCount;
    this.approveLoanForm.removeControl(dateId);
    this.approveLoanForm.removeControl(principalId);
  }

  /**
   * Submits Approve form.
   */
  submit() {
    const dateFormat = 'dd MMMM yyyy';
    const approvedOnDate = this.approveLoanForm.value.approvedOnDate;
    const expectedDisbursementDate = this.approveLoanForm.value.expectedDisbursementDate;
    this.approveLoanForm.patchValue({
      approvedOnDate: this.datePipe.transform(approvedOnDate, dateFormat),
      expectedDisbursementDate: this.datePipe.transform(expectedDisbursementDate, dateFormat)
    });
    const approveLoanForm = this.approveLoanForm.value;
    if (this.disbursementDetails.length !== 0) {
      for (let i = 0; i < this.disbursementCount; i++) {
        const dateId = 'disDate' + i;
        const principalId = 'disPrincipal' + i;
        const date = this.approveLoanForm.get(dateId).value;
        const principal = this.approveLoanForm.get(principalId).value;
        if (this.disbursementDetails.length > i) {
          this.disbursementDetails[i].expectedDisbursementDate = this.datePipe.transform(date, dateFormat);
          this.disbursementDetails[i].principal = principal;
        } else {
          this.disbursementDetails.push({'principal': principal, 'expectedDisbursementDate': this.datePipe.transform(date, dateFormat)});
        }
        delete approveLoanForm[dateId];
        delete approveLoanForm[principalId];
      }
    }
    approveLoanForm.locale = 'en';
    approveLoanForm.dateFormat = dateFormat;
    approveLoanForm.disbursementData = this.disbursementDetails;
    this.loanService.approveLoan(this.loanData.loanData.id, approveLoanForm).subscribe((response: any) => {
      this.router.navigate(['../'], {relativeTo: this.route});
    });
  }

}

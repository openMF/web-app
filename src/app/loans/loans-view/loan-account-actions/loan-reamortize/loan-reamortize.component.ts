import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';

@Component({
  selector: 'mifosx-loan-reamortize',
  templateUrl: './loan-reamortize.component.html',
  styleUrls: ['./loan-reamortize.component.scss']
})
export class LoanReamortizeComponent implements OnInit {
  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** ReAmortize Loan Form */
  reamortizeLoanForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoansService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit(): void {
    this.createReAmortizeLoanForm();
  }

  createReAmortizeLoanForm() {
    this.reamortizeLoanForm = this.formBuilder.group({
      note: '',
      externalId: ''
    });
  }

  submit(): void {
    const data = this.reamortizeLoanForm.value;
    this.loanService.submitLoanActionButton(this.loanId, data, 'reAmortize').subscribe((response: any) => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }
}

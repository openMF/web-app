import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';
import { CodeValue } from 'app/shared/models/general.model';
import { OptionData } from 'app/shared/models/option-data.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-reamortize',
  templateUrl: './loan-reamortize.component.html',
  styleUrls: ['./loan-reamortize.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class LoanReamortizeComponent implements OnInit {
  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** ReAmortize Loan Form */
  reamortizeLoanForm: UntypedFormGroup;
  reAmortizationReasonOptions: CodeValue[] = [];
  reAmortizationInterestHandlingOptions: OptionData[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoansService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit(): void {
    this.reAmortizationReasonOptions = this.dataObject?.reAmortizationReasonOptions || [];
    this.reAmortizationInterestHandlingOptions = this.dataObject?.reAmortizationInterestHandlingOptions || [];

    this.createReAmortizeLoanForm();
  }

  createReAmortizeLoanForm() {
    this.reamortizeLoanForm = this.formBuilder.group({
      reAmortizationInterestHandling: [
        this.reAmortizationInterestHandlingOptions[0] || null
      ],
      reasonCodeValueId: null,
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

  trackByInterestHandlingOption(index: number, option: OptionData): string | number {
    return option.id ?? index;
  }

  trackByReasonOption(index: number, option: CodeValue): string | number {
    return option.id ?? index;
  }
}

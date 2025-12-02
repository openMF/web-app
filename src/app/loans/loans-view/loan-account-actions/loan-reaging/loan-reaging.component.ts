import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { RepaymentSchedule } from 'app/loans/models/loan-account.model';
import { SettingsService } from 'app/settings/settings.service';
import { OptionData } from 'app/shared/models/option-data.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ReAgePreviewDialogComponent } from './re-age-preview-dialog/re-age-preview-dialog.component';
import { InputAmountComponent } from 'app/shared/input-amount/input-amount.component';
import { LoanTransactionTemplate } from 'app/loans/models/loan-transaction-type.model';

@Component({
  selector: 'mifosx-loan-reaging',
  templateUrl: './loan-reaging.component.html',
  styleUrls: ['./loan-reaging.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent
  ]
})
export class LoanReagingComponent implements OnInit {
  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Repayment Loan Form */
  reagingLoanForm: UntypedFormGroup;

  reAgeReasonOptions: any[] = [];
  periodFrequencyOptions: OptionData[] = [];
  reAgeInterestHandlingOptions: OptionData[] = [];

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  loanTransactionData: LoanTransactionTemplate | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private loanService: LoansService,
    private dateUtils: Dates,
    private dialog: MatDialog
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit(): void {
    this.loanTransactionData = this.dataObject;

    this.maxDate = this.settingsService.maxFutureDate;

    this.reAgeReasonOptions = this.dataObject.reAgeReasonOptions;
    this.reAgeInterestHandlingOptions = this.dataObject.reAgeInterestHandlingOptions;
    this.periodFrequencyOptions = this.dataObject.periodFrequencyOptions;
    this.createReagingLoanForm();
  }

  createReagingLoanForm() {
    this.reagingLoanForm = this.formBuilder.group({
      numberOfInstallments: [
        1,
        Validators.required
      ],
      startDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      frequencyNumber: [
        1,
        Validators.required
      ],
      frequencyType: [
        ,
        Validators.required
      ],
      reAgeInterestHandling: [
        this.reAgeInterestHandlingOptions[0]
      ],
      transactionAmount: [
        this.loanTransactionData.amount,
        [Validators.max(this.loanTransactionData.amount)]
      ],
      note: '',
      externalId: '',
      reasonCodeValueId: null
    });
  }

  private prepareReagingData() {
    const reagingLoanFormData = { ...this.reagingLoanForm.value };
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const startDate: Date = this.reagingLoanForm.value.startDate;
    if (reagingLoanFormData.startDate instanceof Date) {
      reagingLoanFormData.startDate = this.dateUtils.formatDate(startDate, dateFormat);
    }
    if (reagingLoanFormData.reAgeInterestHandling && typeof reagingLoanFormData.reAgeInterestHandling === 'object') {
      reagingLoanFormData.reAgeInterestHandling = reagingLoanFormData.reAgeInterestHandling.id;
    }
    return {
      ...reagingLoanFormData,
      dateFormat,
      locale
    };
  }

  preview(): void {
    if (this.reagingLoanForm.invalid) {
      return;
    }
    const data = this.prepareReagingData();

    this.loanService.getReAgePreview(this.loanId, data).subscribe({
      next: (response: RepaymentSchedule) => {
        const currencyCode = response.currency?.code || this.loanTransactionData.currency.code;

        if (!currencyCode) {
          console.error('Currency code is not available in API response or loan details');
          return;
        }

        this.dialog.open(ReAgePreviewDialogComponent, {
          data: {
            repaymentSchedule: response,
            currencyCode: currencyCode
          },
          width: '95%',
          maxWidth: '1400px',
          height: '90vh'
        });
      },
      error: (error) => {
        console.error('Error loading re-age preview:', error);
      }
    });
  }

  submit(): void {
    if (this.reagingLoanForm.invalid) {
      return;
    }
    const data = this.prepareReagingData();
    this.loanService.submitLoanActionButton(this.loanId, data, 'reAge').subscribe({
      next: (response: any) => {
        this.router.navigate(['../../transactions'], { relativeTo: this.route });
      },
      error: (error) => {
        console.error('Error submitting re-age:', error);
      }
    });
  }
}

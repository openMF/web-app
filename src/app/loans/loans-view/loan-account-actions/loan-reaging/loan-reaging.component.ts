import { Component, Input, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { OptionData } from 'app/shared/models/option-data.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-reaging',
  templateUrl: './loan-reaging.component.html',
  styleUrls: ['./loan-reaging.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class LoanReagingComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private settingsService = inject(SettingsService);
  private loanService = inject(LoansService);
  private dateUtils = inject(Dates);

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

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit(): void {
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
      note: '',
      externalId: '',
      reasonCodeValueId: null
    });
  }

  submit(): void {
    const reagingLoanFormData = this.reagingLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const startDate: Date = this.reagingLoanForm.value.startDate;
    if (reagingLoanFormData.startDate instanceof Date) {
      reagingLoanFormData.startDate = this.dateUtils.formatDate(startDate, dateFormat);
    }
    const data = {
      ...reagingLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.submitLoanActionButton(this.loanId, data, 'reAge').subscribe((response: any) => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }
}

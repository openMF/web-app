import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { DropdownOptions } from 'app/core/utils/dropdownOptions';
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
  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Repayment Loan Form */
  reagingLoanForm: UntypedFormGroup;

  frequencyOptions: OptionData[] = [];

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private dropdownOptions: DropdownOptions,
    private loanService: LoansService,
    private dateUtils: Dates
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
    this.frequencyOptions = this.dropdownOptions.retrievePeriodFrequencyTypeOptions(false);
  }

  ngOnInit(): void {
    this.maxDate = this.settingsService.maxFutureDate;
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
      note: '',
      externalId: ''
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

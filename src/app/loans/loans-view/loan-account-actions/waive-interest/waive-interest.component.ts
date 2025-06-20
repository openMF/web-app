/** Angular Imports. */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Waive Interest component.
 */
@Component({
  selector: 'mifosx-waive-interest',
  templateUrl: './waive-interest.component.html',
  styleUrls: ['./waive-interest.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    CdkTextareaAutosize
  ]
})
export class WaiveInterestComponent implements OnInit {
  @Input() dataObject: any;

  /** Loan Interest form. */
  loanInterestForm: UntypedFormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  currency: Currency;

  /**
   * Get data from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {Router} router Router.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private loanService: LoansService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setLoanInterestForm();
    if (this.dataObject.currency) {
      this.currency = this.dataObject.currency;
    }
  }

  /**
   * Set Loan Interest form.
   */
  setLoanInterestForm() {
    this.loanInterestForm = this.formBuilder.group({
      transactionAmount: [
        this.dataObject.amount,
        Validators.required
      ],
      transactionDate: [
        this.dataObject.date && new Date(this.dataObject.date),
        Validators.required
      ],
      note: ['']
    });
  }

  /**
   * Submits loan interest form.
   */
  submit() {
    const loanInterestFormData = this.loanInterestForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate = this.loanInterestForm.value.transactionDate;
    if (loanInterestFormData.transactionDate instanceof Date) {
      loanInterestFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...loanInterestFormData,
      dateFormat,
      locale
    };
    data['transactionAmount'] = data['transactionAmount'] * 1;
    const loanId = this.route.snapshot.params['loanId'];
    this.loanService.submitLoanActionButton(loanId, data, 'waiveinterest').subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}

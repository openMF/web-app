import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from '@fineract/client';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'mifosx-disburse-to-savings-account',
  templateUrl: './disburse-to-savings-account.component.html',
  styleUrls: ['./disburse-to-savings-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    CdkTextareaAutosize,
    FormatNumberPipe,
    MatIcon
  ]
})
export class DisburseToSavingsAccountComponent implements OnInit {
  @Input() dataObject: any;

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Disbursement Loan form. */
  disbursementForm: UntypedFormGroup;
  currency: Currency;

  /**
   * Get data from `Resolver`.
   * @param {FormBuilder} formBuilder FormBuilder.
   * @param {ActivatedRoute} route ActivatedRoute.
   * @param {Router} router Router.
   * @param {LoansService} loanService Loan Service.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private loanService: LoansService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setDisbursementToSavingsForm();
    if (this.dataObject.currency) {
      this.currency = this.dataObject.currency;
    }

    // Get delinquency data for available disbursement amount with over applied
    const loanId = this.route.snapshot.params['loanId'];
    this.loanService.retrieveLoan(loanId).subscribe((delinquencyData: any) => {
      // Check if the field is at root level
      if (delinquencyData.availableDisbursementAmountWithOverApplied !== undefined) {
        this.dataObject.availableDisbursementAmountWithOverApplied =
          delinquencyData.availableDisbursementAmountWithOverApplied;
      }
      // Also check if it's in delinquent object
      if (delinquencyData.delinquent) {
        this.dataObject.delinquent = delinquencyData.delinquent;
      }
    });
  }

  /**
   * Set Disbursement Loan form.
   */
  setDisbursementToSavingsForm() {
    this.disbursementForm = this.formBuilder.group({
      actualDisbursementDate: [
        new Date(),
        Validators.required
      ],
      transactionAmount: [
        this.dataObject.amount,
        Validators.required
      ],
      note: ['']
    });
    if (this.dataObject.fixedEmiAmount) {
      this.disbursementForm.addControl(
        'fixedEmiAmount',
        new UntypedFormControl(this.dataObject.fixedEmiAmount, [Validators.required])
      );
    }
  }

  /**
   * Submit Disburse Form.
   */
  submit() {
    const disbursementLoanFormData = this.disbursementForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActualDisbursementDate: Date = this.disbursementForm.value.actualDisbursementDate;
    if (disbursementLoanFormData.actualDisbursementDate instanceof Date) {
      disbursementLoanFormData.actualDisbursementDate = this.dateUtils.formatDate(
        prevActualDisbursementDate,
        dateFormat
      );
    }
    const data = {
      ...disbursementLoanFormData,
      dateFormat,
      locale
    };
    const loanId = this.route.snapshot.params['loanId'];
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.loanService
      .stateTransitions({ loanId: Number(loanId), command: 'disbursetosavings', postLoansLoanIdRequest: data })
      .subscribe((response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
      });
  }
}

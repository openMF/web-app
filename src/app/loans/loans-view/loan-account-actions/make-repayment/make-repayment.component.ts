/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { Currency } from 'app/shared/models/general.model';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf, NgFor } from '@angular/common';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';

/**
 * Loan Make Repayment Component
 */
@Component({
  selector: 'mifosx-make-repayment',
  templateUrl: './make-repayment.component.html',
  styleUrls: ['./make-repayment.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgIf,
    MatError,
    InputAmountComponent,
    MatSelect,
    NgFor,
    MatOption,
    MatSlideToggle,
    CdkTextareaAutosize,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    FormatNumberPipe,
    NgxTranslatePipe
  ]
})
export class MakeRepaymentComponent implements OnInit {
  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Payment Type Options */
  paymentTypes: any;
  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Repayment Loan Form */
  repaymentLoanForm: UntypedFormGroup;
  currency: Currency | null = null;

  command: string | null = null;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the repayment loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.command = this.dataObject.type.code.split('.')[1];
    this.maxDate = this.settingsService.businessDate;
    this.createRepaymentLoanForm();
    this.setRepaymentLoanDetails();
    if (this.dataObject.currency) {
      this.currency = this.dataObject.currency;
    }
  }

  /**
   * Creates the create close form.
   */
  createRepaymentLoanForm() {
    this.repaymentLoanForm = this.formBuilder.group({
      transactionDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      externalId: '',
      paymentTypeId: '',
      note: ''
    });

    if (this.isCapitalizedIncome()) {
      this.repaymentLoanForm.addControl(
        'transactionAmount',
        new UntypedFormControl('', [
          Validators.required,
          Validators.min(0.001),
          Validators.max(this.dataObject.amount)])
      );
    } else {
      this.repaymentLoanForm.addControl(
        'transactionAmount',
        new UntypedFormControl('', [
          Validators.required,
          Validators.min(0.001)])
      );
    }
  }

  setRepaymentLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.repaymentLoanForm.patchValue({
      transactionAmount: this.dataObject.amount
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.repaymentLoanForm.addControl('accountNumber', new UntypedFormControl(''));
      this.repaymentLoanForm.addControl('checkNumber', new UntypedFormControl(''));
      this.repaymentLoanForm.addControl('routingCode', new UntypedFormControl(''));
      this.repaymentLoanForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.repaymentLoanForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.repaymentLoanForm.removeControl('accountNumber');
      this.repaymentLoanForm.removeControl('checkNumber');
      this.repaymentLoanForm.removeControl('routingCode');
      this.repaymentLoanForm.removeControl('receiptNumber');
      this.repaymentLoanForm.removeControl('bankNumber');
    }
  }

  showDetails(): boolean {
    return !this.isCapitalizedIncome();
  }

  isCapitalizedIncome(): boolean {
    return [
      'capitalizedIncome',
      'capitalizedIncomeAdjustment'
    ].includes(this.command);
  }

  /** Submits the repayment form */
  submit() {
    const repaymentLoanFormData = this.repaymentLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.repaymentLoanForm.value.transactionDate;
    if (repaymentLoanFormData.transactionDate instanceof Date) {
      repaymentLoanFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...repaymentLoanFormData,
      dateFormat,
      locale
    };
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.loanService.submitLoanActionButton(this.loanId, data, this.command).subscribe((response: any) => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }
}

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

/**
 * Disburse Loan Option
 */
@Component({
  selector: 'mifosx-disburse',
  templateUrl: './disburse.component.html',
  styleUrls: ['./disburse.component.scss'],
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
    NgxTranslatePipe
  ]
})
export class DisburseComponent implements OnInit {
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
  /** Disbursement Loan Form */
  disbursementLoanForm: UntypedFormGroup;
  currency: Currency;

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
   * Creates the disbursement loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.createDisbursementLoanForm();
    this.setDisbursementLoanDetails();
    if (this.dataObject.currency) {
      this.currency = this.dataObject.currency;
    }
  }

  /**
   * Creates the disbursement loan form.
   */
  createDisbursementLoanForm() {
    this.disbursementLoanForm = this.formBuilder.group({
      actualDisbursementDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      transactionAmount: [
        '',
        Validators.required
      ],
      externalId: '',
      paymentTypeId: '',
      note: ''
    });
  }

  setDisbursementLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.disbursementLoanForm.patchValue({
      transactionAmount: this.dataObject.amount
      // actualDisbursementDate: new Date(this.dataObject.date)
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.disbursementLoanForm.addControl('accountNumber', new UntypedFormControl(''));
      this.disbursementLoanForm.addControl('checkNumber', new UntypedFormControl(''));
      this.disbursementLoanForm.addControl('routingCode', new UntypedFormControl(''));
      this.disbursementLoanForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.disbursementLoanForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.disbursementLoanForm.removeControl('accountNumber');
      this.disbursementLoanForm.removeControl('checkNumber');
      this.disbursementLoanForm.removeControl('routingCode');
      this.disbursementLoanForm.removeControl('receiptNumber');
      this.disbursementLoanForm.removeControl('bankNumber');
    }
  }

  /** Submits the disbursement form */
  submit() {
    const disbursementLoanFormData = this.disbursementLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActualDisbursementDate: Date = this.disbursementLoanForm.value.actualDisbursementDate;
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
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.loanService.loanActionButtons(this.loanId, 'disburse', data).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}

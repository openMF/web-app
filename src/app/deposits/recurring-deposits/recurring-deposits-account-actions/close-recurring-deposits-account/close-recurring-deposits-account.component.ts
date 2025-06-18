/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf, NgFor } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Close Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-close-recurring-deposits-account',
  templateUrl: './close-recurring-deposits-account.component.html',
  styleUrls: ['./close-recurring-deposits-account.component.scss'],
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
    MatSelect,
    NgFor,
    MatOption,
    MatButton,
    CdkTextareaAutosize,
    MatCardActions,
    RouterLink,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class CloseRecurringDepositsAccountComponent implements OnInit {
  /** Maturity Amount */
  maturityAmount: any;
  /** On Account Closure Options */
  onAccountClosureOptions: any;
  /** Payment Types */
  paymentTypes: any;
  /** Title */
  title: string;
  /** Account Id */
  accountId: string;
  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Close Recurring Deposit Account form. */
  closeRecurringDepositForm: UntypedFormGroup;

  /**
   * Retrieves action details template data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private recurringDepositsService: RecurringDepositsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { recurringDepositsAccountActionData: any }) => {
      this.maturityAmount = data.recurringDepositsAccountActionData.maturityAmount;
      this.onAccountClosureOptions = data.recurringDepositsAccountActionData.onAccountClosureOptions;
      this.paymentTypes = data.recurringDepositsAccountActionData.paymentTypeOptions;
      if (data.recurringDepositsAccountActionData.maturityAmount) {
        this.title = 'Recurring Deposit Closure on Maturity';
      } else {
        this.title = 'Recurring Deposit Closure';
      }
    });
    this.accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createcloseRecurringDepositForm();
  }

  /**
   * Creates the close form.
   */
  createcloseRecurringDepositForm() {
    this.closeRecurringDepositForm = this.formBuilder.group({
      closedOnDate: [
        new Date(),
        Validators.required
      ],
      maturityAmount: [{ value: this.maturityAmount, disabled: true }],
      onAccountClosureId: [
        '',
        Validators.required
      ],
      paymentTypeId: [
        '',
        Validators.required
      ],
      accountNumber: '',
      chequeNumber: '',
      routingCode: '',
      receiptNumber: '',
      bankNumber: '',
      note: ''
    });
  }

  /**
   * Toggles the display of payment details
   */
  toggleDisplay() {
    this.showPaymentDetails = !this.showPaymentDetails;
  }

  /**
   * Submits the close recurring deposit form
   */
  submit() {
    const closeRecurringDepositFormData = this.closeRecurringDepositForm.value;
    const closedOnDate = this.closeRecurringDepositForm.value.closedOnDate;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    if (closeRecurringDepositFormData.closedOnDate instanceof Date) {
      closeRecurringDepositFormData.closedOnDate = this.dateUtils.formatDate(closedOnDate, dateFormat);
    }
    const data = {
      ...closeRecurringDepositFormData,
      dateFormat,
      locale
    };
    this.recurringDepositsService
      .executeRecurringDepositsAccountCommand(this.accountId, 'close', data)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}

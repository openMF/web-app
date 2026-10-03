/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../../loan-account-actions/loan-account-actions-base.component';
import {
  adjustmentReopensLoan,
  canAdjustLoanTransaction,
  canAdjustWorkingCapitalTransaction,
  canAdjustWorkingCapitalTransactionByDelta
} from '../../loan-transaction-adjust.helper';
import { REOPEN_LOAN_WARNING_KEY } from '../../loan-transaction-reversal.helper';

/** Shape of the adjust transaction form. */
interface AdjustTransactionForm {
  transactionDate: FormControl<Date | null>;
  transactionAmount: FormControl<number | null>;
  externalId: FormControl<string | null>;
  reversalExternalId: FormControl<string | null>;
  note: FormControl<string | null>;
  paymentTypeId: FormControl<number | null>;
  accountNumber: FormControl<number | null>;
  checkNumber: FormControl<number | null>;
  routingCode: FormControl<string | null>;
  receiptNumber: FormControl<string | null>;
  bankNumber: FormControl<string | null>;
}

/**
 * Smallest amount the adjustment accepts. A zero amount is a valid body for the
 * adjust command, but it means reverse only: the original transaction is
 * reversed and no replacement is created. That is what the Reverse action does,
 * so it is kept out of this form. The bound matches the six decimals the shared
 * amount validator allows.
 */
const MIN_ADJUSTMENT_AMOUNT = 0.000001;

/** Value of the `adjustMode` route data that switches the form to the delta based adjustment. */
const DELTA_ADJUST_MODE = 'delta';

/**
 * Rejects a zero difference. The backend refuses it because it changes
 * nothing; cancelling the amount exactly is how a reversal is requested.
 * @param control The signed difference control
 */
function nonZeroAmount(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return value !== null && value !== '' && Number(value) === 0 ? { zeroAmount: true } : null;
}

/** Payment detail controls, shown and cleared as a single block. */
const PAYMENT_DETAIL_CONTROLS = [
  'accountNumber',
  'checkNumber',
  'routingCode',
  'receiptNumber',
  'bankNumber'
] as const;

/**
 * Adjust Transaction component.
 *
 * The adjust command reverses the original transaction and creates a
 * replacement of the same type with the submitted date, amount and payment
 * details. The backend validates the body against a strict parameter
 * whitelist, so the payload is assembled field by field. Working Capital posts
 * the same command on its own resource: it nests the payment details in a
 * `paymentDetails` object and does not accept an external id, which it lifts
 * from the original transaction onto the replacement instead.
 *
 * The same form also serves the Working Capital delta based adjustment, picked
 * by the `adjustMode` route data. The amount is then the signed difference
 * rather than the corrected total: the backend adds it to the existing amount,
 * reverses only when the result is zero, and rejects a zero difference or a
 * decrease larger than the amount.
 */
@Component({
  selector: 'mifosx-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrls: ['./edit-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    MatSlideToggle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTransactionComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  private loansService = inject(LoansService);

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Smallest amount accepted by the form, bound to the amount input so the hint is shown. */
  minAmount = MIN_ADJUSTMENT_AMOUNT;
  /** True when the route posts the delta based adjustment, where the amount is the signed difference. */
  readonly isDeltaMode: boolean;
  /** Label of the amount field, which names the corrected total or the difference depending on the mode. */
  readonly amountLabel: string;
  /** Amount of the transaction being adjusted; the difference is applied on top of it. */
  originalAmount = 0;
  /** Loans account transaction form. */
  editTransactionForm: FormGroup<AdjustTransactionForm>;
  /** loans account transaction payment options. */
  paymentTypeOptions: {
    id: number;
    name: string;
    description: string;
    isCashPayment: boolean;
    position: number;
  }[];
  /** Flag to enable payment details fields. */
  showPaymentDetails = false;
  /** True when the loan is closed or overpaid, so the adjustment reopens it. */
  willReopenLoan = false;
  /** Translation key of the reopening caution, shown above the form. */
  readonly reopenWarningKey = REOPEN_LOAN_WARNING_KEY;
  /** loan account's Id */
  loanAccountId: string;
  /** Transaction Template */
  transactionTemplateData: any;
  currency: Currency;

  /**
   * Retrieves the Loan Account transaction template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loansService Loans Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    super();
    this.isDeltaMode = this.route.snapshot.data?.['adjustMode'] === DELTA_ADJUST_MODE;
    this.amountLabel = this.isDeltaMode ? 'Adjustment Amount' : 'Transaction Amount';
    this.route.parent?.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { loanDetailsAssociationData?: any }) => {
        this.willReopenLoan = adjustmentReopensLoan(data.loanDetailsAssociationData?.status);
      });
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { loansAccountTransactionTemplate: any }) => {
        this.transactionTemplateData = data.loansAccountTransactionTemplate;
        if (data.loansAccountTransactionTemplate.currency) {
          this.currency = data.loansAccountTransactionTemplate.currency;
        }
        this.paymentTypeOptions = this.transactionTemplateData.paymentTypeOptions;
      });
    this.loanAccountId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the Loan account transaction form when component loads.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    const template = this.transactionTemplateData;
    // Working Capital names the fields after the transaction and nests the
    // payment type in the payment detail, where Term Loan flattens them.
    this.originalAmount = Number(this.isWorkingCapital ? template?.transactionAmount : template?.amount) || 0;
    if (this.isDeltaMode) {
      // The largest decrease is the one that cancels the amount; anything
      // beyond it is an overshoot the backend rejects.
      this.minAmount = -this.originalAmount;
    }
    this.createEditTransactionForm();
    // The backend rejects a positive amount on reverse-only types, and rejects
    // the command outright on the rest, so the form is never reachable for them
    // even when the route is opened directly.
    if (!this.isAdjustable()) {
      this.gotoTransactionList();
      return;
    }
    // The external id identifies the replacement transaction the adjustment
    // creates, not the one being adjusted, so it is left empty: re-sending the
    // original id collides with the row that stays in the ledger as reversed.
    const date = this.isWorkingCapital ? template.transactionDate : template.date;
    this.editTransactionForm.patchValue({
      transactionDate: date && new Date(date),
      // The difference starts empty: prefilling the current amount would
      // double the transaction, where the corrected total starts from it.
      transactionAmount: this.isDeltaMode ? null : this.originalAmount,
      paymentTypeId: this.isWorkingCapital
        ? (template.paymentDetailData?.paymentType?.id ?? null)
        : template.paymentTypeId
    });
  }

  /** True when the loaded transaction accepts the adjust command with a new amount. */
  private isAdjustable(): boolean {
    const template = this.transactionTemplateData;
    if (!template?.type) {
      return false;
    }
    const alreadyReversed = template.manuallyReversed || template.reversed;
    if (this.isDeltaMode) {
      return this.isWorkingCapital && canAdjustWorkingCapitalTransactionByDelta(template.type, alreadyReversed);
    }
    return this.isWorkingCapital
      ? canAdjustWorkingCapitalTransaction(template.type, alreadyReversed)
      : canAdjustLoanTransaction(template.type, alreadyReversed);
  }

  /**
   * The corrected total must be positive, since zero means reverse only. The
   * signed difference must not be zero, which changes nothing, and must not
   * decrease the amount below zero, which the backend rejects as an overshoot.
   */
  private amountValidators(): ValidatorFn[] {
    return this.isDeltaMode ? [
          Validators.required,
          nonZeroAmount,
          Validators.min(-this.originalAmount)
        ] : [
          Validators.required,
          Validators.min(MIN_ADJUSTMENT_AMOUNT)
        ];
  }

  /** Amount the replacement will carry once the difference is applied. */
  get resultingAmount(): number {
    return this.originalAmount + Number(this.editTransactionForm.controls.transactionAmount.value ?? 0);
  }

  /** True when the difference cancels the amount exactly, so the backend reverses without creating a replacement. */
  get reversesWithoutReplacement(): boolean {
    const control = this.editTransactionForm.controls.transactionAmount;
    return control.value !== null && control.valid && this.resultingAmount === 0;
  }

  /**
   * Method to create the Loan Account Transaction Form.
   */
  createEditTransactionForm() {
    this.editTransactionForm = this.formBuilder.group<AdjustTransactionForm>({
      transactionDate: new FormControl<Date | null>(null, Validators.required),
      transactionAmount: new FormControl<number | null>(null, this.amountValidators()),
      externalId: new FormControl<string | null>(null),
      reversalExternalId: new FormControl<string | null>(null, Validators.maxLength(100)),
      note: new FormControl<string | null>(null, Validators.maxLength(1000)),
      paymentTypeId: new FormControl<number | null>(null),
      accountNumber: new FormControl<number | null>(null),
      checkNumber: new FormControl<number | null>(null),
      routingCode: new FormControl<string | null>(null),
      receiptNumber: new FormControl<string | null>(null),
      bankNumber: new FormControl<string | null>(null)
    });
  }

  /**
   * Method to show or hide the payment detail fields. Collapsing the section
   * clears them so a value typed and then hidden never reaches the payload.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (!this.showPaymentDetails) {
      PAYMENT_DETAIL_CONTROLS.forEach((controlName) => this.editTransactionForm.controls[controlName].reset(null));
    }
  }

  /**
   * Method to submit the transaction details.
   */
  submit() {
    const formValue = this.editTransactionForm.getRawValue();
    const dateFormat = this.settingsService.dateFormat;
    const payload: { [key: string]: any } = {
      transactionDate: this.dateUtils.formatDate(formValue.transactionDate, dateFormat),
      transactionAmount: Number(formValue.transactionAmount),
      dateFormat,
      locale: this.settingsService.language.code
    };
    const optionalFields: { [key: string]: string | number | null } = {
      reversalExternalId: formValue.reversalExternalId,
      note: formValue.note
    };
    // The external id names the replacement transaction. Term Loan accepts it
    // on its adjust command; Working Capital only on the delta based one, and
    // otherwise lifts the original id onto the replacement.
    if (this.isLoanProduct || this.isDeltaMode) {
      optionalFields.externalId = formValue.externalId;
    }
    const paymentDetails: { [key: string]: string | number | null } = {
      paymentTypeId: formValue.paymentTypeId,
      accountNumber: formValue.accountNumber,
      checkNumber: formValue.checkNumber,
      routingCode: formValue.routingCode,
      receiptNumber: formValue.receiptNumber,
      bankNumber: formValue.bankNumber
    };
    Object.assign(payload, this.filledIn(optionalFields));
    // Working Capital nests the payment details in one object, which is left
    // out entirely when nothing is filled in; Term Loan takes them flat.
    if (this.isWorkingCapital) {
      const filledInPaymentDetails = this.filledIn(paymentDetails);
      if (Object.keys(filledInPaymentDetails).length > 0) {
        payload.paymentDetails = filledInPaymentDetails;
      }
    } else {
      Object.assign(payload, this.filledIn(paymentDetails));
    }
    const command = this.isDeltaMode ? 'adjust-by-delta' : 'adjust';
    const request = this.isWorkingCapital
      ? this.loansService.applyWorkingCapitalLoanActionCommand(
          this.loanAccountId,
          payload,
          command,
          this.transactionTemplateData.id
        )
      : this.loansService.executeLoansAccountTransactionsCommand(
          this.loanAccountId,
          command,
          payload,
          this.transactionTemplateData.id
        );
    request.subscribe(() => this.gotoTransactionList());
  }

  /**
   * Keeps the fields that carry a value, trimmed. An empty optional is dropped
   * rather than sent as a blank string, because the backend parses every
   * parameter present in the body.
   * @param fields Optional fields as read from the form
   */
  private filledIn(fields: { [key: string]: string | number | null }): { [key: string]: string | number } {
    const filledIn: { [key: string]: string | number } = {};
    Object.entries(fields).forEach(
      ([
        controlName,
        value
      ]) => {
        const trimmedValue = typeof value === 'string' ? value.trim() : value;
        if (trimmedValue !== null && trimmedValue !== undefined && trimmedValue !== '') {
          filledIn[controlName] = trimmedValue;
        }
      }
    );
    return filledIn;
  }

  /**
   * Returns to the loan's transaction list. Going back to the transaction
   * detail would stay inside the same parent route, so the loan resolver would
   * not re-run; the list sits under the loan route, which is re-activated and
   * therefore refetches the account, the schedule and the transactions the
   * adjustment rewrote. It is also where both the reversed original and its
   * replacement are visible.
   */
  private gotoTransactionList(): void {
    this.router.navigate(
      [
        '../',
        '../'
      ],
      {
        queryParams: {
          productType: this.loanProductService.productType.value
        },
        relativeTo: this.route
      }
    );
  }
}

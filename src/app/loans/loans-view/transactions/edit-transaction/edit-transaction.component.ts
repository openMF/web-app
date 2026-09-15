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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../../loan-account-actions/loan-account-actions-base.component';
import { adjustmentReopensLoan, canAdjustLoanTransaction } from '../../loan-transaction-adjust.helper';
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
 * whitelist, so the payload is assembled field by field.
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
    this.editTransactionForm.patchValue({
      transactionDate: this.transactionTemplateData.date && new Date(this.transactionTemplateData.date),
      transactionAmount: this.transactionTemplateData.amount,
      paymentTypeId: this.transactionTemplateData.paymentTypeId
    });
  }

  /** True when the loaded transaction accepts the adjust command with a new amount. */
  private isAdjustable(): boolean {
    return (
      !!this.transactionTemplateData?.type &&
      canAdjustLoanTransaction(
        this.transactionTemplateData.type,
        this.transactionTemplateData.manuallyReversed || this.transactionTemplateData.reversed
      )
    );
  }

  /**
   * Method to create the Loan Account Transaction Form.
   */
  createEditTransactionForm() {
    this.editTransactionForm = this.formBuilder.group<AdjustTransactionForm>({
      transactionDate: new FormControl<Date | null>(null, Validators.required),
      transactionAmount: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(MIN_ADJUSTMENT_AMOUNT)
      ]),
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
      externalId: formValue.externalId,
      reversalExternalId: formValue.reversalExternalId,
      note: formValue.note,
      paymentTypeId: formValue.paymentTypeId,
      accountNumber: formValue.accountNumber,
      checkNumber: formValue.checkNumber,
      routingCode: formValue.routingCode,
      receiptNumber: formValue.receiptNumber,
      bankNumber: formValue.bankNumber
    };
    // An empty optional is dropped rather than sent as a blank string, because
    // the backend parses every parameter present in the body.
    Object.entries(optionalFields).forEach(
      ([
        controlName,
        value
      ]) => {
        const trimmedValue = typeof value === 'string' ? value.trim() : value;
        if (trimmedValue !== null && trimmedValue !== undefined && trimmedValue !== '') {
          payload[controlName] = trimmedValue;
        }
      }
    );
    this.loansService
      .executeLoansAccountTransactionsCommand(this.loanAccountId, 'adjust', payload, this.transactionTemplateData.id)
      .subscribe(() => this.gotoTransactionList());
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

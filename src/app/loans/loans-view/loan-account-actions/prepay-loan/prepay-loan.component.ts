/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Loan Prepay Loan Option
 */
@Component({
  selector: 'mifosx-prepay-loan',
  templateUrl: './prepay-loan.component.html',
  styleUrls: ['./prepay-loan.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    MatSlideToggle,
    CdkTextareaAutosize,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrepayLoanComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private static readonly EARLY_TERMINATION_COMMANDS: Record<string, string> = {
    'Contract Termination': 'contractTermination',
    'Loan Withdrawal': 'loanWithdrawal'
  };

  private static readonly SUBMIT_PERMISSIONS: Record<string, string> = {
    contractTermination: 'CONTRACT_TERMINATION_LOAN',
    loanWithdrawal: 'LOAN_WITHDRAWAL_LOAN'
  };

  private readonly destroyRef = inject(DestroyRef);
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);
  private cdr = inject(ChangeDetectorRef);

  /** Payment Types */
  paymentTypes: any;
  /** Principal Portion */
  principalPortion: any;
  /** Interest Portion */
  interestPortion: any;
  /** Show Payment Details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Prepay Loan form. */
  prepayLoanForm: UntypedFormGroup;

  prepayData: any;
  currency: Currency | null = null;
  /** Backend command of the early termination action, or null for a normal prepayment. */
  earlyTerminationCommand: string | null = null;
  maturityDate: Date | null = null;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    super();
  }

  /**
   * Creates the prepay loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.prepayData = this.dataObject;
    this.earlyTerminationCommand =
      PrepayLoanComponent.EARLY_TERMINATION_COMMANDS[this.dataObject['actionName']] ?? null;
    this.maxDate = this.settingsService.businessDate;
    this.createprepayLoanForm();
    if (this.isEarlyTermination) {
      this.setEarlyTerminationDetails();
    } else {
      this.setPrepayLoanDetails();
    }
    if (this.dataObject.currency) {
      this.currency = this.dataObject.currency;
    }
  }

  get isEarlyTermination(): boolean {
    return !!this.earlyTerminationCommand;
  }

  get submitPermission(): string {
    return PrepayLoanComponent.SUBMIT_PERMISSIONS[this.earlyTerminationCommand] ?? 'REPAYMENT_LOAN';
  }

  /**
   * Creates the prepay loan form.
   */
  createprepayLoanForm() {
    if (this.isEarlyTermination) {
      this.prepayLoanForm = this.formBuilder.group({
        transactionDate: [
          this.settingsService.businessDate,
          Validators.required
        ],
        externalId: [''],
        note: ['']
      });
    } else {
      this.prepayLoanForm = this.formBuilder.group({
        transactionDate: [
          new Date(),
          Validators.required
        ],
        transactionAmount: [
          '',
          Validators.required
        ],
        externalId: [''],
        paymentTypeId: [''],
        note: ['']
      });
    }
  }

  /**
   * Sets the value in the prepay loan form
   */
  setPrepayLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.prepayLoanForm.patchValue({
      transactionAmount: this.dataObject.amount
    });
    this.prepayLoanForm
      .get('transactionDate')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((transactionDate: string) => {
        const prepayDate = this.dateUtils.formatDate(transactionDate, this.settingsService.dateFormat);

        this.loanService.getLoanPrepayLoanActionTemplate(this.loanId, prepayDate).subscribe((response: any) => {
          this.prepayData = response;
          this.prepayLoanForm.patchValue({
            transactionAmount: this.prepayData.amount
          });
        });
      });
  }

  /**
   * Bounds the early termination date and keeps the payoff preview in step with it.
   */
  setEarlyTerminationDetails() {
    this.minDate = this.settingsService.businessDate;
    this.maxDate = this.settingsService.maxFutureDate;

    this.loanService.getLoanAccountDetails(this.loanId).subscribe((loanDetails: any) => {
      const actualMaturityDate = loanDetails?.timeline?.actualMaturityDate;
      if (actualMaturityDate) {
        this.maturityDate = this.dateUtils.parseDate(actualMaturityDate);
        const lastAllowedDate = new Date(
          this.maturityDate.getFullYear(),
          this.maturityDate.getMonth(),
          this.maturityDate.getDate() - 1
        );
        // terminating on the business date stays allowed even after maturity: the backend applies the
        // maturity bound to future dates only
        this.maxDate = this.dateUtils.isBefore(lastAllowedDate, this.minDate) ? this.minDate : lastAllowedDate;
        this.cdr.markForCheck();
      }
    });

    this.prepayLoanForm
      .get('transactionDate')
      .valueChanges.pipe(
        // an unreadable typed date arrives as null, and quoting that would silently fall back to the business date
        filter((date): date is Date => date instanceof Date && !isNaN(date.getTime())),
        map((date) => this.dateUtils.formatDate(date, this.settingsService.dateFormat)),
        distinctUntilChanged(),
        switchMap((terminationDate) =>
          this.loanService.getLoanEarlyTerminationTemplate(this.loanId, this.earlyTerminationCommand, terminationDate)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: any) => {
        this.prepayData = response;
        this.cdr.markForCheck();
      });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.prepayLoanForm.addControl('accountNumber', new UntypedFormControl(''));
      this.prepayLoanForm.addControl('checkNumber', new UntypedFormControl(''));
      this.prepayLoanForm.addControl('routingCode', new UntypedFormControl(''));
      this.prepayLoanForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.prepayLoanForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.prepayLoanForm.removeControl('accountNumber');
      this.prepayLoanForm.removeControl('checkNumber');
      this.prepayLoanForm.removeControl('routingCode');
      this.prepayLoanForm.removeControl('receiptNumber');
      this.prepayLoanForm.removeControl('bankNumber');
    }
  }

  /**
   * Submits the prepay loan form
   */
  submitRepayment() {
    const prepayLoanFormData = this.prepayLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.prepayLoanForm.value.transactionDate;
    if (prepayLoanFormData.transactionDate instanceof Date) {
      prepayLoanFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...prepayLoanFormData,
      dateFormat,
      locale
    };
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.loanService.submitLoanActionButton(this.loanId, data, 'repayment').subscribe((response: any) => {
      this.router.navigate(['../../general'], {
        queryParams: {
          productType: this.loanProductService.productType.value
        },
        relativeTo: this.route
      });
    });
  }

  submitEarlyTermination() {
    const earlyTerminationFormData = this.prepayLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.prepayLoanForm.value.transactionDate;
    if (earlyTerminationFormData.transactionDate instanceof Date) {
      earlyTerminationFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...earlyTerminationFormData,
      dateFormat,
      locale
    };
    this.loanService.loanActionButtons(this.loanId, this.earlyTerminationCommand, data).subscribe((response: any) => {
      this.gotoLoanDefaultView();
    });
  }

  submit() {
    if (this.isEarlyTermination) {
      this.submitEarlyTermination();
    } else {
      this.submitRepayment();
    }
  }
}

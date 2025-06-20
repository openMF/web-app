import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { SystemService } from 'app/system/system.service';
import { MatCard, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { InputAmountComponent } from '../../../shared/input-amount/input-amount.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

type TransactionCommandType = 'holdamount' | 'blockaccount' | 'blockdeposit' | 'blockwithdrawal';

interface TransactionType {
  holdamount: boolean;
  blockaccount: boolean;
  blockdeposit: boolean;
  blockwithdrawal: boolean;
}

@Component({
  selector: 'mifosx-manage-savings-account',
  templateUrl: './manage-savings-account.component.html',
  styleUrls: ['./manage-savings-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardTitle,
    InputAmountComponent
  ]
})
export class ManageSavingsAccountComponent implements OnInit {
  @Input() currency: Currency;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Manage Savings Account form. */
  manageSavingsAccountForm: UntypedFormGroup;
  /** Savings Account Id */
  savingAccountId: string;
  transactionCommand: TransactionCommandType;

  reasonOptions: any = [];

  transactionType: TransactionType = {
    holdamount: false,
    blockaccount: false,
    blockdeposit: false,
    blockwithdrawal: false
  };

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private savingsService: SavingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router,
    private systemService: SystemService,
    private settingsService: SettingsService
  ) {
    this.transactionCommand = this.route.snapshot.params['name'].toLowerCase().replaceAll(' ', '');
    this.transactionType[this.transactionCommand] = true;
    this.savingAccountId = this.route.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the post interest savings form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createManageSavingsAccountForm();
    if (
      this.transactionType.holdamount ||
      this.transactionType.blockaccount ||
      this.transactionType.blockdeposit ||
      this.transactionType.blockwithdrawal
    ) {
      this.getCodeValues();
    }
  }

  getCodeValues() {
    let codeName = 'SavingsTransactionFreezeReasons'; // Default Hold Amount
    if (this.transactionType.blockaccount) {
      codeName = 'SavingsAccountBlockReasons';
    } else if (this.transactionType.blockdeposit) {
      codeName = 'CreditTransactionFreezeReasons';
    } else if (this.transactionType.blockwithdrawal) {
      codeName = 'DebitTransactionFreezeReasons';
    }

    this.systemService.getCodes().subscribe((codes: any) => {
      codes.some((code: any) => {
        if (code.name === codeName) {
          this.systemService.getCodeValues(code.id).subscribe((codeValues: any) => {
            this.reasonOptions = codeValues;
            return true;
          });
        }
        return false;
      });
    });
  }

  /**
   * Creates the manage savings account form.
   */
  createManageSavingsAccountForm() {
    if (this.transactionType.holdamount) {
      this.manageSavingsAccountForm = this.formBuilder.group({
        reasonForBlock: [
          '',
          Validators.required
        ],
        transactionDate: [
          '',
          Validators.required
        ],
        transactionAmount: [
          0.0,
          Validators.required
        ]
      });
    } else {
      this.manageSavingsAccountForm = this.formBuilder.group({
        reasonForBlock: [
          '',
          Validators.required
        ]
      });
    }
  }

  submit() {
    let command = '';
    let payload: { transactionAmount?: number; [key: string]: any } = {};

    if (this.transactionType.holdamount) {
      const manageSavingsAccountFormData = this.manageSavingsAccountForm.value;
      const locale = this.settingsService.language.code;
      const dateFormat = this.settingsService.dateFormat;
      const prevTransactionDate: Date = this.manageSavingsAccountForm.value.transactionDate;
      if (manageSavingsAccountFormData.transactionDate instanceof Date) {
        manageSavingsAccountFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
      }
      payload = {
        ...manageSavingsAccountFormData,
        dateFormat,
        locale
      };
      command = 'holdAmount';
      payload['transactionAmount'] = payload['transactionAmount'] * 1;

      this.savingsService
        .executeSavingsAccountTransactionsCommand(this.savingAccountId, command, payload)
        .subscribe((response: any) => {
          this.router.navigate(['../../transactions'], { relativeTo: this.route });
        });
    } else {
      payload = {
        ...this.manageSavingsAccountForm.value
      };
      command = 'block';
      if (this.transactionType.blockdeposit) {
        command = 'blockCredit';
      } else if (this.transactionType.blockwithdrawal) {
        command = 'blockDebit';
      }

      this.savingsService
        .executeSavingsAccountCommand(this.savingAccountId, command, payload)
        .subscribe((response: any) => {
          this.router.navigate(['../../transactions'], { relativeTo: this.route });
        });
    }
  }
}

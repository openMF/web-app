import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';

@Component({
  selector: 'mifosx-manage-savings-account',
  templateUrl: './manage-savings-account.component.html',
  styleUrls: ['./manage-savings-account.component.scss']
})
export class ManageSavingsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Manage Savings Account form. */
  manageSavingsAccountForm: UntypedFormGroup;
  /** Savings Account Id */
  savingAccountId: string;
  transactionCommand: string;

  reasonOptions: any = [];

  transactionType: {
    holdamount: boolean,
    blockaccount: boolean
  } = {
      holdamount: false, blockaccount: false
    };

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private savingsService: SavingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router,
    private systemService: SystemService,
    private settingsService: SettingsService) {
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
    if (this.transactionType.holdamount || this.transactionType.blockaccount) {
      this.getCodeValues();
    }
  }

  getCodeValues() {
    let codeName = 'SavingsTransactionFreezeReasons'; // Default Hold Amount
    if (this.transactionType.blockaccount) {
      codeName = 'SavingsAccountBlockReasons';
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
        'reasonForBlock': ['', Validators.required],
        'transactionDate': ['', Validators.required],
        'transactionAmount': [0.0, Validators.required]
      });
    } else {
      this.manageSavingsAccountForm = this.formBuilder.group({
        'reasonForBlock': ['', Validators.required]
      });
    }
  }

  submit() {
    let command = '';
    let payload = {};

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

      this.savingsService.executeSavingsAccountTransactionsCommand(this.savingAccountId, command, payload).subscribe((response: any) => {
        this.router.navigate(['../../transactions'], { relativeTo: this.route });
      });
    } else {
      payload = {
        ... this.manageSavingsAccountForm.value
      };
      command = 'block';

      this.savingsService.executeSavingsAccountCommand(this.savingAccountId, command, payload).subscribe((response: any) => {
        this.router.navigate(['../../transactions'], { relativeTo: this.route });
      });
    }
  }

}

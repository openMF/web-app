/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { FixedDepositsService } from '../../fixed-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Premature Close Fixed Deposits Account Component
 */
@Component({
  selector: 'mifosx-premature-close-fixed-deposits-account',
  templateUrl: './premature-close-fixed-deposits-account.component.html',
  styleUrls: ['./premature-close-fixed-deposits-account.component.scss']
})
export class PrematureCloseFixedDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Premature Close FD Account form. */
  prematureCloseAccountForm: UntypedFormGroup;
  /** Savings Account Data */
  savingsAccountsData: any;
  /** On account Closure Options */
  onAccountClosureOptions: any;
  /** Fixed Deposits Account Id */
  accountId: any;
  /** Form submission event */
  isSubmitted = false;


  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private fixedDepositsService: FixedDepositsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService) {
    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
  }

  /**
   * Creates the premature close fd account form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createPrematureCloseAccountForm();
    this.buildDependencies();
  }

  /**
   * Creates the premature close fd account form.
   */
  createPrematureCloseAccountForm() {
    this.prematureCloseAccountForm = this.formBuilder.group({
      'closedOnDate': ['', Validators.required]
    });
  }

  /**
   * Subscribes to value changes of parent control.
   */
  buildDependencies() {
    this.prematureCloseAccountForm.get('closedOnDate').valueChanges.subscribe((value: Date) => {
      if (!this.isSubmitted) {
        this.calculatePrematureAmount(value);
      }
    });
  }

  /**
   * Calculates prematue amount based on closed on date.
   * @param {Date} date Premature Close Date
   */
  calculatePrematureAmount(date: Date) {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const data = {
      closedOnDate: this.dateUtils.formatDate(date, dateFormat),
      dateFormat,
      locale
    };
    this.fixedDepositsService.executeFixedDepositsAccountCommand(this.accountId, 'calculatePrematureAmount', data)
      .subscribe((response: any) => {
        this.savingsAccountsData = response.savingsAccounts;
        this.onAccountClosureOptions = response.onAccountClosureOptions;
        this.prematureCloseAccountForm.addControl('maturityAmount', new UntypedFormControl({ value: '', disabled: true }));
        this.prematureCloseAccountForm.addControl('onAccountClosureId', new UntypedFormControl('', Validators.required));
        this.prematureCloseAccountForm.addControl('note', new UntypedFormControl(''));
        this.prematureCloseAccountForm.get('maturityAmount').patchValue(response.maturityAmount);
        this.addTransferDetails();
      });

  }

  /**
   * Subscribes to value changes of `onAccountClosureId` adds and removes transfer details accordingly.
   */
  addTransferDetails() {
    this.prematureCloseAccountForm.get('onAccountClosureId').valueChanges.subscribe((id: any) => {
      if (id === 200) {
        this.prematureCloseAccountForm.addControl('toSavingsAccountId', new UntypedFormControl('', Validators.required));
        this.prematureCloseAccountForm.addControl('transferDescription', new UntypedFormControl(''));
      } else {
        this.prematureCloseAccountForm.removeControl('toSavingsAccountId');
        this.prematureCloseAccountForm.removeControl('transferDescription');
      }
    });
  }

  /**
   * Submits the form and premature closes the fd account,
   * if successful redirects to the fd account.
   */
  submit() {
    const prematureCloseAccountFormData = this.prematureCloseAccountForm.value;
    this.isSubmitted = true;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevClosedDate: Date = this.prematureCloseAccountForm.value.closedOnDate;
    if (prematureCloseAccountFormData.closedOnDate instanceof Date) {
      prematureCloseAccountFormData.closedOnDate = this.dateUtils.formatDate(prevClosedDate, dateFormat);
    }
    const data = {
      ...prematureCloseAccountFormData,
      dateFormat,
      locale
    };
    this.fixedDepositsService.executeFixedDepositsAccountCommand(this.accountId, 'prematureClose', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

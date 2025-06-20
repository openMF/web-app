/** Angular Imports */
import { Component, OnChanges, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Shares Account Terms Step
 */
@Component({
  selector: 'mifosx-shares-account-terms-step',
  templateUrl: './shares-account-terms-step.component.html',
  styleUrls: ['./shares-account-terms-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    CurrencyPipe
  ]
})
export class SharesAccountTermsStepComponent implements OnChanges, OnInit {
  /** Shares Account and Product Template */
  @Input() sharesAccountProductTemplate: any;
  /** [Optional] Shares Account Template */
  @Input() sharesAccountTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Shares Account Terms Form */
  sharesAccountTermsForm: UntypedFormGroup;
  /** Minimum Active Period Frequency Type Data */
  minimumActivePeriodFrequencyTypeData: any;
  /** Lockin Period Frequency Type Data */
  lockinPeriodFrequencyTypeData: any;
  /** Savings Accounts Data */
  savingsAccountsData: any;
  /** For Edit Shares Account Form */
  isSavingsPatched = false;

  currency: Currency | null = null;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService
  ) {
    this.createSharesAccountTermsForm();
  }

  ngOnChanges() {
    if (this.sharesAccountProductTemplate) {
      this.currency = this.sharesAccountProductTemplate.currency;
      this.sharesAccountTermsForm.patchValue({
        currencyCode: this.sharesAccountProductTemplate.currency.code,
        decimal: this.sharesAccountProductTemplate.currency.decimalPlaces,
        currencyMultiple: this.sharesAccountProductTemplate.currency.inMultiplesOf,
        unitPrice: this.sharesAccountProductTemplate.currentMarketPrice,
        savingsAccountId: ''
      });
      this.setOptions();
      if (this.sharesAccountTemplate) {
        if (!this.isSavingsPatched && this.sharesAccountTemplate.savingsAccountId) {
          this.sharesAccountTermsForm.get('savingsAccountId').patchValue(this.sharesAccountTemplate.savingsAccountId);
          this.isSavingsPatched = true;
        }
      }
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    if (this.sharesAccountTemplate) {
      this.sharesAccountTermsForm.patchValue({
        requestedShares: this.sharesAccountTemplate.summary.totalPendingForApprovalShares,
        minimumActivePeriod: this.sharesAccountTemplate.minimumActivePeriod,
        minimumActivePeriodFrequencyType:
          this.sharesAccountTemplate.minimumActivePeriod && this.sharesAccountTemplate.minimumActivePeriodTypeEnum.id,
        lockinPeriodFrequency: this.sharesAccountTemplate.lockinPeriod,
        lockinPeriodFrequencyType:
          this.sharesAccountTemplate.lockinPeriod && this.sharesAccountTemplate.lockPeriodTypeEnum.id,
        applicationDate:
          this.sharesAccountTemplate.purchasedShares[0].purchasedDate &&
          new Date(this.sharesAccountTemplate.purchasedShares[0].purchasedDate),
        allowDividendCalculationForInactiveClients:
          this.sharesAccountTemplate.allowDividendCalculationForInactiveClients
      });
    }
  }

  /**
   * Creates shares account terms form.
   */
  createSharesAccountTermsForm() {
    this.sharesAccountTermsForm = this.formBuilder.group({
      currencyCode: [{ value: '', disabled: true }],
      decimal: [{ value: '', disabled: true }],
      requestedShares: [
        '',
        Validators.required
      ],
      unitPrice: [{ value: '', disabled: true }],
      currencyMultiple: [{ value: '', disabled: true }],
      savingsAccountId: [
        '',
        Validators.required
      ],
      minimumActivePeriod: [''],
      minimumActivePeriodFrequencyType: [''],
      lockinPeriodFrequency: [''],
      lockinPeriodFrequencyType: [''],
      applicationDate: [
        '',
        Validators.required
      ],
      allowDividendCalculationForInactiveClients: [false]
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.minimumActivePeriodFrequencyTypeData =
      this.sharesAccountProductTemplate.minimumActivePeriodFrequencyTypeOptions;
    this.lockinPeriodFrequencyTypeData = this.sharesAccountProductTemplate.lockinPeriodFrequencyTypeOptions;
    this.savingsAccountsData = this.sharesAccountProductTemplate.clientSavingsAccounts;
  }

  /**
   * Returns shares account terms form value.
   */
  get sharesAccountTerms() {
    return this.sharesAccountTermsForm.value;
  }

  calculateCurrenValue(): number {
    if (this.sharesAccountTermsForm.value.requestedShares && this.sharesAccountProductTemplate.currentMarketPrice) {
      return this.sharesAccountProductTemplate.currentMarketPrice * this.sharesAccountTermsForm.value.requestedShares;
    }
    return 0;
  }
}

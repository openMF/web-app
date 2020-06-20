/** Angular Imports */
import { Component, OnChanges, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/**
 * Shares Account Terms Step
 */
@Component({
  selector: 'mifosx-shares-account-terms-step',
  templateUrl: './shares-account-terms-step.component.html',
  styleUrls: ['./shares-account-terms-step.component.scss']
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
  sharesAccountTermsForm: FormGroup;
  /** Minimum Active Period Frequency Type Data */
  minimumActivePeriodFrequencyTypeData: any;
  /** Lockin Period Frequency Type Data */
  lockinPeriodFrequencyTypeData: any;
  /** Savings Accounts Data */
  savingsAccountsData: any;
  /** For Edit Shares Account Form */
  isSavingsPatched = false;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   */
  constructor(private formBuilder: FormBuilder) {
    this.createSharesAccountTermsForm();
  }

  ngOnChanges() {
    if (this.sharesAccountProductTemplate) {
      this.sharesAccountTermsForm.patchValue({
        'currencyCode': this.sharesAccountProductTemplate.currency.code,
        'decimal': this.sharesAccountProductTemplate.currency.decimalPlaces,
        'currencyMultiple': this.sharesAccountProductTemplate.currency.inMultiplesOf,
        'unitPrice': this.sharesAccountProductTemplate.currentMarketPrice,
        'savingsAccountId': ''
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
    if (this.sharesAccountTemplate) {
      this.sharesAccountTermsForm.patchValue({
        'requestedShares': this.sharesAccountTemplate.summary.totalPendingForApprovalShares,
        'minimumActivePeriod': this.sharesAccountTemplate.minimumActivePeriod,
        'minimumActivePeriodFrequencyType': this.sharesAccountTemplate.minimumActivePeriod && this.sharesAccountTemplate.minimumActivePeriodTypeEnum.id,
        'lockinPeriodFrequency': this.sharesAccountTemplate.lockinPeriod,
        'lockinPeriodFrequencyType': this.sharesAccountTemplate.lockinPeriod && this.sharesAccountTemplate.lockPeriodTypeEnum.id,
        'applicationDate': this.sharesAccountTemplate.purchasedShares[0].purchasedDate && new Date(this.sharesAccountTemplate.purchasedShares[0].purchasedDate),
        'allowDividendCalculationForInactiveClients': this.sharesAccountTemplate.allowDividendCalculationForInactiveClients
      });
    }
  }

  /**
   * Creates shares account terms form.
   */
  createSharesAccountTermsForm() {
    this.sharesAccountTermsForm = this.formBuilder.group({
      'currencyCode': [{value: '', disabled: true}],
      'decimal': [{value: '',  disabled: true}],
      'requestedShares': ['', Validators.required],
      'unitPrice': [{value: '',  disabled: true}],
      'currencyMultiple': [{value: '', disabled: true}],
      'savingsAccountId': ['', Validators.required],
      'minimumActivePeriod': [''],
      'minimumActivePeriodFrequencyType': [''],
      'lockinPeriodFrequency': [''],
      'lockinPeriodFrequencyType': [''],
      'applicationDate': ['', Validators.required],
      'allowDividendCalculationForInactiveClients': [false]
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.minimumActivePeriodFrequencyTypeData = this.sharesAccountProductTemplate.minimumActivePeriodFrequencyTypeOptions;
    this.lockinPeriodFrequencyTypeData = this.sharesAccountProductTemplate.lockinPeriodFrequencyTypeOptions;
    this.savingsAccountsData = this.sharesAccountProductTemplate.clientSavingsAccounts;
  }

  /**
   * Returns shares account terms form value.
   */
  get sharesAccountTerms() {
    return this.sharesAccountTermsForm.value;
  }

}

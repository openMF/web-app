/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';


/**
 * Edit Charge component.
 */
@Component({
  selector: 'mifosx-edit-charge',
  templateUrl: './edit-charge.component.html',
  styleUrls: ['./edit-charge.component.scss']
})
export class EditChargeComponent implements OnInit {

  /** Selected Data. */
  chargeData: any;
  /** Charge form. */
  chargeForm: FormGroup;
  /** Select Income. */
  selectedIncome: any;
  /** Select Time Type. */
  selectedTime: any;
  /** Select Currency Type. */
  selectedCurrency: any;
  /** Select Calculation Type. */
  selectedCalculation: any;
  /** Charge Time Type options. */
  chargeTimeTypeOptions: any;
  /** Charge Calculation Type options. */
  chargeCalculationTypeOptions: any;
  /** Show Penalty. */
  showPenalty = true;
  /** Add Fee Frequency. */
  addFeeFrequency = true;
  /** Show GL Accounts. */
  showGLAccount = false;
  /** Charge Payment Mode. */
  chargePaymentMode = false;
  /** Show Fee Options. */
  showFeeOptions = false;
  showCapitalized = false;
  isCapitalized = false;

  incomeOrAssetAccountOptions: any = [];

  /**
   * Retrieves the charge data from `resolve`.
   * @param {ProductsService} productsService Products Service.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private productsService: ProductsService,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { chargesTemplate: any }) => {
      this.chargeData = data.chargesTemplate;
    });
  }

  ngOnInit() {
    this.editChargeForm();
    this.incomeOrAssetAccountOptions = this.chargeData.assetAccountOptions;
    this.chargeData.incomeOrLiabilityAccountOptions.incomeAccountOptions.forEach((account: any) => {
      this.incomeOrAssetAccountOptions.push(account);
    });
  }

  /**
   * Edit Charge form.
   */
  editChargeForm() {
    this.showFeeOptions = (this.chargeData.feeInterval && this.chargeData.feeInterval > 0);
    this.chargeForm = this.formBuilder.group({
      'name': [this.chargeData.name, Validators.required],
      'chargeAppliesTo': [{ value: this.chargeData.chargeAppliesTo.id, disabled: true }, Validators.required],
      'currencyCode': [this.chargeData.currency.code, Validators.required],
      'amount': [this.chargeData.amount, Validators.required],
      'active': [this.chargeData.active],
      'penalty': [this.chargeData.penalty],
      'chargeTimeType': [this.chargeData.chargeTimeType.id, Validators.required],
      'chargeCalculationType': [this.chargeData.chargeCalculationType.id, Validators.required],
    });
    switch (this.chargeData.chargeAppliesTo.value) {
      case 'Loan': {
        this.chargeTimeTypeOptions = this.chargeData.loanChargeTimeTypeOptions;
        this.chargeCalculationTypeOptions = this.chargeData.loanChargeCalculationTypeOptions;
        this.addFeeFrequency = true;
        this.chargePaymentMode = true;
        this.chargeForm.addControl('chargePaymentMode', this.formBuilder.control(this.chargeData.chargePaymentMode.id, Validators.required));
        if (this.showFeeOptions) {
          this.getFeeFrequency(this.showFeeOptions);
          this.chargeForm.patchValue({
            'feeInterval': this.chargeData.feeInterval,
            'feeFrequency': this.chargeData.feeFrequency.id
          });
        }
        this.chargeForm.addControl('thirdpartyTransfer', new FormControl(this.chargeData.thirdpartyTransfer, Validators.required));
        this.chargeForm.addControl('dueOnPrepay', new FormControl(this.chargeData.dueOnPrepay, Validators.required));
        this.evalThirdParty(this.chargeData.thirdpartyTransfer);

        this.showCapitalized = (this.chargeData.chargeAppliesTo.id === 1 && this.chargeData.chargeTimeType.id === 1);
        this.evalCapitalized(this.showCapitalized);
        break;
      }
      case 'Savings': {
        this.chargeTimeTypeOptions = this.chargeData.savingsChargeTimeTypeOptions;
        this.chargeCalculationTypeOptions = this.chargeData.savingsChargeCalculationTypeOptions;
        this.addFeeFrequency = false;
        break;
      }
      case 'Shares': {
        this.chargeTimeTypeOptions = this.chargeData.shareChargeTimeTypeOptions;
        this.chargeCalculationTypeOptions = this.chargeData.shareChargeCalculationTypeOptions;
        this.addFeeFrequency = false;
        this.showGLAccount = false;
        this.showPenalty = false;
        break;
      }
      default: {
        this.chargeCalculationTypeOptions = this.chargeData.clientChargeCalculationTypeOptions;
        this.chargeTimeTypeOptions = this.chargeData.clientChargeTimeTypeOptions;
        this.showGLAccount = true;
        this.addFeeFrequency = false;
        this.chargeForm.addControl('incomeAccountId', this.formBuilder.control(this.chargeData.incomeOrLiabilityAccount.id, Validators.required));
        break;
      }
    }
    if (this.chargeData.taxGroup) {
      this.chargeForm.addControl('taxGroupId', this.formBuilder.control({ value: this.chargeData.taxGroup.id, disabled: true }, Validators.required));
    } else {
      this.chargeForm.addControl('taxGroupId', this.formBuilder.control({ value: '', disabled: true }));
    }

    this.chargeForm.get('chargeTimeType').valueChanges.subscribe((chargeTimeType) => {
      this.showCapitalized = (chargeTimeType === 1);
      this.evalCapitalized(this.showCapitalized);
    });

  }

  evalCapitalized(showCapitalized: boolean) {
    if (showCapitalized) {
      this.chargeForm.addControl('capitalized', new FormControl(this.chargeData.capitalized ? this.chargeData.capitalized : false));
      this.chargeForm.addControl('collectedAtDisburse', new FormControl(this.chargeData.collectedAtDisburse ? this.chargeData.collectedAtDisburse : false));
      this.chargeForm.addControl('includeFeeInOutstanding', new FormControl(this.chargeData.includeFeeInOutstanding ? this.chargeData.includeFeeInOutstanding : false));
    } else {
      this.chargeForm.removeControl('capitalized');
      this.chargeForm.removeControl('collectedAtDisburse');
      this.chargeForm.removeControl('includeFeeInOutstanding');
    }
  }

  evalThirdParty(isThirdParty: boolean) {
    if (isThirdParty) {
      this.chargeForm.addControl('incomeAccountId', this.formBuilder.control(this.chargeData.incomeOrLiabilityAccount.id, Validators.required));
    } else {
      this.chargeForm.removeControl('incomeAccountId');
    }
  }

  /**
   * Get Add Fee Frequency value.
   */
  getFeeFrequency(isChecked: boolean) {
    this.showFeeOptions = isChecked;
    if (isChecked) {
      this.chargeForm.addControl('feeInterval', this.formBuilder.control('', Validators.required));
      this.chargeForm.addControl('feeFrequency', this.formBuilder.control('', Validators.required));
    } else {
      this.chargeForm.removeControl('feeInterval');
      this.chargeForm.removeControl('feeFrequency');
    }
  }

  /**
   * Submits Edit Charge form.
   */
  submit() {
    const chargeData = this.chargeForm.getRawValue();
    const locale = this.settingsService.language.code;
    chargeData.chargePaymentMode = this.chargeData.chargePaymentMode.id;
    if (chargeData.taxGroupId === '') {
      delete chargeData.taxGroupId;
    }
    const data = {
      ...chargeData,
      locale
    };
    this.productsService.updateCharge(this.chargeData.id.toString(), data)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}

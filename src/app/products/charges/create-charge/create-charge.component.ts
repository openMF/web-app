/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Create charge component.
 */
@Component({
  selector: 'mifosx-create-charge',
  templateUrl: './create-charge.component.html',
  styleUrls: ['./create-charge.component.scss']
})
export class CreateChargeComponent implements OnInit {

  /** Charge form. */
  chargeForm: FormGroup;
  /** Charges template data. */
  chargesTemplateData: any;
  /** Charge time type data. */
  chargeTimeTypeData: any;
  /** Charge calculation type data. */
  chargeCalculationTypeData: any = '';
  /** Income and liability account data */
  incomeAndLiabilityAccountData: any;
  /** Minimum due date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum due date allowed. */
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  /** Repeat every label */
  repeatEveryLabel: string;
  /** Currency decimal places */
  currencyDecimalPlaces: number;

  /**
   * Retrieves the charges template data and income and liability account data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(private formBuilder: FormBuilder,
              private productsService: ProductsService,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe) {
    this.route.data.subscribe((data: { chargesTemplate: any }) => {
      this.chargesTemplateData = data.chargesTemplate;
      this.incomeAndLiabilityAccountData = data.chargesTemplate.incomeOrLiabilityAccountOptions.incomeAccountOptions
        .concat(data.chargesTemplate.incomeOrLiabilityAccountOptions.liabilityAccountOptions);
    });
  }

  /**
   * Creates and sets the charge form.
   */
  ngOnInit() {
    this.createChargeForm();
    this.setChargeForm();
    this.setConditionalControls();
  }

  /**
   * Creates the charge form.
   */
  createChargeForm() {
    this.chargeForm = this.formBuilder.group({
      'chargeAppliesTo': ['', Validators.required],
      'name': ['', Validators.required],
      'currencyCode': ['', Validators.required],
      'chargeTimeType': ['', Validators.required],
      'chargeCalculationType': ['', Validators.required],
      'amount': ['', [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d+)?\\s*$')]],
      'active': [false],
      'penalty': [false],
      'taxGroupId': ['']
    });
  }

  /**
   * Sets the charge calculation type and charge time type data
   */
  setChargeForm() {
    this.chargeForm.get('chargeAppliesTo').valueChanges.subscribe((chargeAppliesTo) => {
      switch (chargeAppliesTo) {
        case 1:
          this.chargeCalculationTypeData = this.chargesTemplateData.loanChargeCalculationTypeOptions;
          this.chargeTimeTypeData = this.chargesTemplateData.loanChargeTimeTypeOptions;
          break;
        case 2:
          this.chargeCalculationTypeData = this.chargesTemplateData.savingsChargeCalculationTypeOptions;
          this.chargeTimeTypeData = this.chargesTemplateData.savingsChargeTimeTypeOptions;
          break;
        case 3:
          this.chargeCalculationTypeData = this.chargesTemplateData.clientChargeCalculationTypeOptions;
          this.chargeTimeTypeData = this.chargesTemplateData.clientChargeTimeTypeOptions;
          break;
        case 4:
          this.chargeCalculationTypeData = this.chargesTemplateData.shareChargeCalculationTypeOptions;
          this.chargeTimeTypeData = this.chargesTemplateData.shareChargeTimeTypeOptions;
          break;
      }
    });
  }

  /**
   * @returns {any} Filtered charge calculation type data.
   */
  filteredChargeCalculationType(): any {
    return this.chargeCalculationTypeData.filter((chargeCalculationType: any) => {
      if (this.chargeForm.get('chargeTimeType').value === 12 && (chargeCalculationType.id === 3 || chargeCalculationType.id === 4)) {
        return false;
      }
      if (this.chargeForm.get('chargeTimeType').value !== 12 && chargeCalculationType.id === 5) {
        return false;
      }
      if (this.chargeForm.get('chargeAppliesTo').value === 2) {
        if (!(this.chargeForm.get('chargeTimeType').value === 5 || this.chargeForm.get('chargeTimeType').value === 16) && chargeCalculationType.id === 2) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Sets the conditional controls of the user form
   */
  setConditionalControls() {
    this.chargeForm.get('chargeAppliesTo').valueChanges.subscribe((chargeAppliesTo) => {
      this.chargeForm.get('penalty').enable();
      switch (chargeAppliesTo) {
        case 1: // Loan
          this.chargeForm.addControl('chargePaymentMode', new FormControl('', Validators.required));
          this.chargeForm.removeControl('incomeAccountId');
          break;
        case 2: // Savings
          this.chargeForm.removeControl('chargePaymentMode');
          this.chargeForm.removeControl('incomeAccountId');
          break;
        case 3: // Client
          this.chargeForm.removeControl('chargePaymentMode');
          this.chargeForm.addControl('incomeAccountId', new FormControl(''));
          break;
        case 4: // Shares
          this.chargeForm.removeControl('chargePaymentMode');
          this.chargeForm.removeControl('incomeAccountId');
          this.chargeForm.get('penalty').setValue(false);
          this.chargeForm.get('penalty').disable();
          break;
      }
      this.chargeForm.get('chargeCalculationType').reset();
      this.chargeForm.get('chargeTimeType').reset();
    });
    this.chargeForm.get('chargeTimeType').valueChanges.subscribe((chargeTimeType) => {
      this.chargeForm.removeControl('feeFrequency');
      this.chargeForm.removeControl('feeInterval');
      this.chargeForm.removeControl('feeOnMonthDay');
      this.chargeForm.removeControl('addFeeFrequency');
      if (this.chargeForm.get('chargeAppliesTo').value !== 4) {
        this.chargeForm.get('penalty').enable();
      }
      switch (chargeTimeType) {
        case 6: // Annual Fee
          this.chargeForm.addControl('feeOnMonthDay', new FormControl('', Validators.required));
          break;
        case 7: // Monthly Fee
          this.chargeForm.addControl('feeOnMonthDay', new FormControl(''));
          this.chargeForm.addControl('feeInterval', new FormControl('', [Validators.required, Validators.min(1), Validators.max(12), Validators.pattern('^[1-9]\\d*$')]));
          this.repeatEveryLabel = 'Months';
          break;
        case 9: // Overdue Fee
          this.chargeForm.get('penalty').setValue(true);
          this.chargeForm.get('penalty').disable();
          this.chargeForm.addControl('addFeeFrequency', new FormControl(false));
          this.chargeForm.get('addFeeFrequency').valueChanges.subscribe((addFeeFrequency) => {
            if (addFeeFrequency) {
              this.chargeForm.addControl('feeFrequency', new FormControl('', Validators.required));
              this.chargeForm.addControl('feeInterval', new FormControl('', [Validators.required, Validators.pattern('^[1-9]\\d*$')]));
            } else {
              this.chargeForm.removeControl('feeFrequency');
              this.chargeForm.removeControl('feeInterval');
            }
          });
          break;
        case 11: // Weekly Fee
          this.chargeForm.addControl('feeInterval', new FormControl('', [Validators.required, Validators.pattern('^[1-9]\\d*$')]));
          this.repeatEveryLabel = 'Weeks';
          break;
      }
    });
    this.chargeForm.get('currencyCode').valueChanges.subscribe((currencyCode) => {
      this.currencyDecimalPlaces = this.chargesTemplateData.currencyOptions.find((currency: any) => currency.code === currencyCode).decimalPlaces;
      if (this.currencyDecimalPlaces === 0) {
        this.chargeForm.get('amount').setValidators([Validators.required, Validators.pattern('^[1-9]\\d*$')]);
      } else {
        this.chargeForm.get('amount').setValidators([Validators.required, Validators.pattern(`^\\s*(?=.*[1-9])\\d*(\\.\\d{1,${this.currencyDecimalPlaces}})?\\s*$`)]);
      }
    });
  }

  /**
   * Submits the charge form and creates charge,
   * if successful redirects to charges.
   */
  submit() {
    const prevFeeOnMonthDay: Date = this.chargeForm.value.feeOnMonthDay;
    const monthDayFormat = 'dd MMM';
    this.chargeForm.patchValue({
      feeOnMonthDay: this.datePipe.transform(prevFeeOnMonthDay, monthDayFormat)
    });
    const charge = this.chargeForm.getRawValue();
    // TODO: Update once language and date settings are setup
    charge.locale = 'en';
    charge.monthDayFormat = monthDayFormat;
    delete charge.addFeeFrequency;
    if (!charge.taxGroupId) {
      delete charge.taxGroupId;
    }
    this.productsService.createCharge(charge).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}

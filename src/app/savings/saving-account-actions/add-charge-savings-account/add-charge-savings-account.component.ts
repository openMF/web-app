/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { SavingsService } from '../../savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Add Savings Charge component.
 */
@Component({
  selector: 'mifosx-add-charge-savings-account',
  templateUrl: './add-charge-savings-account.component.html',
  styleUrls: ['./add-charge-savings-account.component.scss']
})
export class AddChargeSavingsAccountComponent implements OnInit {

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add Savings Charge form. */
  savingsChargeForm: UntypedFormGroup;
  /** savings charge options. */
  savingsChargeOptions: any;
  /** savings Id of the savings account. */
  savingAccountId: string;
  /** charge details */
  chargeDetails: any;

  /**
   * Retrieves charge template data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SavingsService} savingsService Savings Service
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private savingsService: SavingsService,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { savingsAccountActionData: any }) => {
      this.savingsChargeOptions = data.savingsAccountActionData.chargeOptions;
    });
    this.savingAccountId = this.route.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the Savings Charge form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createSavingsChargeForm();
    this.buildDependencies();
  }

  buildDependencies() {
    this.savingsChargeForm.controls.chargeId.valueChanges.subscribe(chargeId => {
      this.savingsService.getChargeTemplate(chargeId).subscribe((data: any) => {
        this.chargeDetails = data;
        const chargeTimeType = data.chargeTimeType.id;
        if (data.chargeTimeType.value === 'Withdrawal Fee' || data.chargeTimeType.value === 'Saving No Activity Fee') {
          this.chargeDetails.dueDateNotRequired = true;
        }
        if (data.chargeTimeType.value === 'Annual Fee' || data.chargeTimeType.value === 'Monthly Fee') {
          this.chargeDetails.chargeTimeTypeAnnualOrMonth = true;
        }
        if (!this.chargeDetails.dueDateNotRequired && !this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
          this.savingsChargeForm.addControl('dueDate', new UntypedFormControl('', Validators.required));
        } else {
          this.savingsChargeForm.removeControl('dueDate');
        }
        if (!this.chargeDetails.dueDateNotRequired && this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
          this.savingsChargeForm.addControl('feeOnMonthDay', new UntypedFormControl('', Validators.required));
        } else {
          this.savingsChargeForm.removeControl('feeOnMonthDay');
        }
        if (chargeTimeType.value === 'Monthly Fee') {
          this.savingsChargeForm.addControl('feeInterval', new UntypedFormControl(data.feeInterval, Validators.required));
        } else {
          this.savingsChargeForm.removeControl('feeInterval');
        }
        this.savingsChargeForm.patchValue({
          'amount': data.amount,
          'chargeCalculationType': data.chargeCalculationType.id,
          'chargeTimeType': data.chargeTimeType.id
        });
      });
    });
  }

  /**
   * Creates the Savings Charge form.
   */
  createSavingsChargeForm() {
    this.savingsChargeForm = this.formBuilder.group({
      'chargeId': ['', Validators.required],
      'amount': ['', Validators.required],
      'chargeCalculationType': [{ value: '', disabled: true }],
      'chargeTimeType': [{ value: '', disabled: true }]
    });
  }

  /**
   * Submits savings charge.
   */
  submit() {
    const savingsCharge = this.savingsChargeForm.value;
    savingsCharge.locale = this.settingsService.language.code;
    if (!savingsCharge.feeInterval) {
      savingsCharge.feeInterval = this.chargeDetails.feeInterval;
    }
    if (this.chargeDetails.dueDateNotRequired !== true) {
      if (this.chargeDetails.chargeTimeTypeAnnualOrMonth === true) {
        const monthDayFormat = 'MMMM-dd'; // TODO: Update once language and date settings are setup
        savingsCharge.monthDayFormat = monthDayFormat;
        if (savingsCharge.feeOnMonthDay) {
          const prevDate = this.savingsChargeForm.value.feeOnMonthDay;
          savingsCharge.feeOnMonthDay = this.dateUtils.formatDate(prevDate, monthDayFormat);
        }
      } else {
        const dateFormat = this.settingsService.dateFormat;
        savingsCharge.dateFormat = dateFormat;
        if (savingsCharge.dueDate) {
          const prevDate = this.savingsChargeForm.value.dueDate;
          savingsCharge.dueDate = this.dateUtils.formatDate(prevDate, dateFormat);
        }
      }
    }
    this.savingsService.createSavingsCharge(this.savingAccountId, 'charges', savingsCharge).subscribe( () => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }

}

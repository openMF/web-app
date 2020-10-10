/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Add Recurring Deposits Charge component.
 * Recurring deposits endpoint is not supported so using Savings endpoint.
 */
@Component({
  selector: 'mifosx-add-charge-recurring-deposits-account',
  templateUrl: './add-charge-recurring-deposits-account.component.html',
  styleUrls: ['./add-charge-recurring-deposits-account.component.scss']
})
export class AddChargeRecurringDepositsAccountComponent implements OnInit {

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add Recurring Deposits Charge form. */
  recurringDepositsChargeForm: FormGroup;
  /** savings charge options. */
  savingsChargeOptions: any;
  /** savings Id of the savings account. */
  recurringDepositAccountId: string;
  /** charge details */
  chargeDetails: any;

  /**
   * Retrieves charge template data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {DatePipe} datePipe Date Pipe
   * @param {SavingsService} savingsService Savings Service
   */
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private savingsService: SavingsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { recurringDepositsAccountActionData: any }) => {
      this.savingsChargeOptions = data.recurringDepositsAccountActionData.chargeOptions;
    });
    this.recurringDepositAccountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
  }

  /**
   * Creates the Recurring Deposits Charge form.
   */
  ngOnInit() {
    this.createRecurringDepositsChargeForm();
    this.buildDependencies();
  }

  buildDependencies() {
    this.recurringDepositsChargeForm.controls.chargeId.valueChanges.subscribe(chargeId => {
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
          this.recurringDepositsChargeForm.addControl('dueDate', new FormControl('', Validators.required));
        } else {
          this.recurringDepositsChargeForm.removeControl('dueDate');
        }
        if (!this.chargeDetails.dueDateNotRequired && this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
          this.recurringDepositsChargeForm.addControl('feeOnMonthDay', new FormControl('', Validators.required));
        } else {
          this.recurringDepositsChargeForm.removeControl('feeOnMonthDay');
        }
        if (chargeTimeType.value === 'Monthly Fee') {
          this.recurringDepositsChargeForm.addControl('feeInterval', new FormControl(data.feeInterval, Validators.required));
        } else {
          this.recurringDepositsChargeForm.removeControl('feeInterval');
        }
        this.recurringDepositsChargeForm.patchValue({
          'amount': data.amount,
          'chargeCalculationType': data.chargeCalculationType.id,
          'chargeTimeType': data.chargeTimeType.id
        });
      });
    });
  }

  /**
   * Creates the Recurring Deposits Charge form.
   */
  createRecurringDepositsChargeForm() {
    this.recurringDepositsChargeForm = this.formBuilder.group({
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
    const savingsCharge = this.recurringDepositsChargeForm.value;
    savingsCharge.locale = this.settingsService.language.code;
    if (!savingsCharge.feeInterval) {
      savingsCharge.feeInterval = this.chargeDetails.feeInterval;
    }
    if (this.chargeDetails.dueDateNotRequired !== true) {
      if (this.chargeDetails.chargeTimeTypeAnnualOrMonth === true) {
        const monthDayFormat = 'MMMM-dd'; // TODO: Update once language and date settings are setup
        savingsCharge.monthDayFormat = monthDayFormat;
        if (savingsCharge.feeOnMonthDay) {
          const prevDate = this.recurringDepositsChargeForm.value.feeOnMonthDay;
          savingsCharge.feeOnMonthDay = this.datePipe.transform(prevDate, monthDayFormat);
        }
      } else {
        const dateFormat = this.settingsService.dateFormat;
        savingsCharge.dateFormat = dateFormat;
        if (savingsCharge.dueDate) {
          const prevDate = this.recurringDepositsChargeForm.value.dueDate;
          savingsCharge.dueDate = this.datePipe.transform(prevDate, dateFormat);
        }
      }
    }
    this.savingsService.createSavingsCharge(this.recurringDepositAccountId, 'charges', savingsCharge).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

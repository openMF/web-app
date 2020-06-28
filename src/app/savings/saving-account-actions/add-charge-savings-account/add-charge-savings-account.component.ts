/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { SavingsService } from '../../savings.service';

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
  savingsChargeForm: FormGroup;
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
   * @param {DatePipe} datePipe Date Pipe
   * @param {SavingsService} savingsService Savings Service
   */
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private savingsService: SavingsService
  ) {
    this.route.data.subscribe((data: { savingsAccountActionData: any }) => {
      this.savingsChargeOptions = data.savingsAccountActionData.chargeOptions;
    });
    this.savingAccountId = this.route.parent.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the Savings Charge form.
   */
  ngOnInit() {
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
          this.savingsChargeForm.addControl('dueDate', new FormControl('', Validators.required));
        } else {
          this.savingsChargeForm.removeControl('dueDate');
        }
        if (!this.chargeDetails.dueDateNotRequired && this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
          this.savingsChargeForm.addControl('feeOnMonthDay', new FormControl('', Validators.required));
        } else {
          this.savingsChargeForm.removeControl('feeOnMonthDay');
        }
        if (chargeTimeType.value === 'Monthly Fee') {
          this.savingsChargeForm.addControl('feeInterval', new FormControl(data.feeInterval, Validators.required));
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
    savingsCharge.locale = 'en';
    if (!savingsCharge.feeInterval) {
      savingsCharge.feeInterval = this.chargeDetails.feeInterval;
    }
    if (this.chargeDetails.dueDateNotRequired !== true) {
      if (this.chargeDetails.chargeTimeTypeAnnualOrMonth === true) {
        const monthDayFormat = 'MMMM-dd'; // TODO: Update once language and date settings are setup
        savingsCharge.monthDayFormat = monthDayFormat;
        if (savingsCharge.feeOnMonthDay) {
          const prevDate = this.savingsChargeForm.value.feeOnMonthDay;
          savingsCharge.feeOnMonthDay = this.datePipe.transform(prevDate, monthDayFormat);
        }
      } else {
        const dateFormat = 'yyyy-MM-dd';
        savingsCharge.dateFormat = dateFormat;
        if (savingsCharge.dueDate) {
          const prevDate = this.savingsChargeForm.value.dueDate;
          savingsCharge.dueDate = this.datePipe.transform(prevDate, dateFormat);
        }
      }
    }
    this.savingsService.createSavingsCharge(this.savingAccountId, 'charges', savingsCharge).subscribe( () => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

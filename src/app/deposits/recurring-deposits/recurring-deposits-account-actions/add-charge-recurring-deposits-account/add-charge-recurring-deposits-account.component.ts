/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Add Recurring Deposits Charge component.
 * Recurring deposits endpoint is not supported so using Savings endpoint.
 */
@Component({
  selector: 'mifosx-add-charge-recurring-deposits-account',
  templateUrl: './add-charge-recurring-deposits-account.component.html',
  styleUrls: ['./add-charge-recurring-deposits-account.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    NgIf,
    MatError,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatCardActions,
    MatButton,
    RouterLink,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class AddChargeRecurringDepositsAccountComponent implements OnInit {
  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add Recurring Deposits Charge form. */
  recurringDepositsChargeForm: UntypedFormGroup;
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
   * @param {Dates} dateUtils Date Utils
   * @param {SavingsService} savingsService Savings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
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
    this.maxDate = this.settingsService.businessDate;
    this.createRecurringDepositsChargeForm();
    this.buildDependencies();
  }

  buildDependencies() {
    this.recurringDepositsChargeForm.controls.chargeId.valueChanges.subscribe((chargeId) => {
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
          this.recurringDepositsChargeForm.addControl('dueDate', new UntypedFormControl('', Validators.required));
        } else {
          this.recurringDepositsChargeForm.removeControl('dueDate');
        }
        if (!this.chargeDetails.dueDateNotRequired && this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
          this.recurringDepositsChargeForm.addControl('feeOnMonthDay', new UntypedFormControl('', Validators.required));
        } else {
          this.recurringDepositsChargeForm.removeControl('feeOnMonthDay');
        }
        if (chargeTimeType.value === 'Monthly Fee') {
          this.recurringDepositsChargeForm.addControl(
            'feeInterval',
            new UntypedFormControl(data.feeInterval, Validators.required)
          );
        } else {
          this.recurringDepositsChargeForm.removeControl('feeInterval');
        }
        this.recurringDepositsChargeForm.patchValue({
          amount: data.amount,
          chargeCalculationType: data.chargeCalculationType.id,
          chargeTimeType: data.chargeTimeType.id
        });
      });
    });
  }

  /**
   * Creates the Recurring Deposits Charge form.
   */
  createRecurringDepositsChargeForm() {
    this.recurringDepositsChargeForm = this.formBuilder.group({
      chargeId: [
        '',
        Validators.required
      ],
      amount: [
        '',
        Validators.required
      ],
      chargeCalculationType: [{ value: '', disabled: true }],
      chargeTimeType: [{ value: '', disabled: true }]
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
          savingsCharge.feeOnMonthDay = this.dateUtils.formatDate(prevDate, monthDayFormat);
        }
      } else {
        const dateFormat = this.settingsService.dateFormat;
        savingsCharge.dateFormat = dateFormat;
        if (savingsCharge.dueDate) {
          const prevDate = this.recurringDepositsChargeForm.value.dueDate;
          savingsCharge.dueDate = this.dateUtils.formatDate(prevDate, dateFormat);
        }
      }
    }
    this.savingsService.createSavingsCharge(this.recurringDepositAccountId, 'charges', savingsCharge).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }
}

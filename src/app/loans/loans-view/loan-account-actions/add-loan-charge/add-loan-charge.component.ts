/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { LoansService } from '../../../loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Create Add Loan Charge component.
 */
@Component({
  selector: 'mifosx-add-loan-charge',
  templateUrl: './add-loan-charge.component.html',
  styleUrls: ['./add-loan-charge.component.scss']
})
export class AddLoanChargeComponent implements OnInit {

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add Loan Charge form. */
  loanChargeForm: UntypedFormGroup;
  /** loan charge options. */
  loanChargeOptions: {
    id: number;
    name: string;
    amount: number;
    currency: {
      name: string;
    };
    chargeCalculationType: {
      value: any;
    };
    chargeTimeType: {
      id: number;
      value: any;
    };
  }[];
  /** loan Id of the loan account. */
  loanId: string;

  /**
   * Retrieves the loan charge template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private loansService: LoansService,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { actionButtonData: any }) => {
      this.loanChargeOptions = data.actionButtonData.chargeOptions;
    });
    this.loanId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the Loan Charge form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.createLoanChargeForm();
    this.loanChargeForm.controls.chargeId.valueChanges.subscribe(chargeId => {
      const chargeDetails = this.loanChargeOptions.find(option => {
        return option.id === chargeId;
      });
      if (chargeDetails.chargeTimeType.id === 2) {
        this.loanChargeForm.addControl('dueDate', new UntypedFormControl('', Validators.required));
      } else {
        this.loanChargeForm.removeControl('dueDate');
      }
      this.loanChargeForm.patchValue({
        'amount': chargeDetails.amount,
        'chargeCalculation': chargeDetails.chargeCalculationType.value,
        'chargeTime': chargeDetails.chargeTimeType.value
      });
    });
  }

  /**
   * Creates the Loan Charge form.
   */
  createLoanChargeForm() {
    this.loanChargeForm = this.formBuilder.group({
      'chargeId': ['', Validators.required],
      'amount': ['', Validators.required],
      'chargeCalculation': [{ value: '', disabled: true }],
      'chargeTime': [{ value: '', disabled: true }]
    });
  }

  submit() {
    const loanChargeFormData = this.loanChargeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevDueDate: Date = this.loanChargeForm.value.dueDate;
    if (loanChargeFormData.dueDate instanceof Date) {
      loanChargeFormData.dueDate = this.dateUtils.formatDate(prevDueDate, dateFormat);
    }
    const data = {
      ...loanChargeFormData,
      dateFormat,
      locale
    };
    this.loansService.createLoanCharge(this.loanId, 'charges', data).subscribe(res => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}

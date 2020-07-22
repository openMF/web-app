/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { LoansService } from '../../../loans.service';

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
  loanChargeForm: FormGroup;
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
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe,
              private loansService: LoansService) {
    this.route.data.subscribe((data: { actionButtonData: any }) => {
      this.loanChargeOptions = data.actionButtonData.chargeOptions;
    });
    this.loanId = this.route.parent.snapshot.params['loanId'];
  }

  /**
   * Creates the Loan Charge form.
   */
  ngOnInit() {
    this.createLoanChargeForm();
    this.loanChargeForm.controls.chargeId.valueChanges.subscribe(chargeId => {
      const chargeDetails = this.loanChargeOptions.find(option => {
        return option.id === chargeId;
      });
      if (chargeDetails.chargeTimeType.id === 2) {
        this.loanChargeForm.addControl('dueDate', new FormControl('', Validators.required));
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
    const prevDueDate: Date = this.loanChargeForm.value.dueDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.loanChargeForm.patchValue({
      dueDate: this.datePipe.transform(prevDueDate, dateFormat)
    });
    const loanCharge = this.loanChargeForm.value;
    loanCharge.locale = 'en';
    loanCharge.dateFormat = dateFormat;
    this.loansService.createLoanCharge(this.loanId, 'charges', loanCharge).subscribe(res => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }
}

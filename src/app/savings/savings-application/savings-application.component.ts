/** Angular imports */
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';

/** Custom imports */
import {SavingsService} from '../savings.service';

/**
 * Creates the savings application component
 */
@Component({
  selector: 'mifosx-savings-application',
  templateUrl: './savings-application.component.html',
  styleUrls: ['./savings-application.component.scss']
})
export class SavingsApplicationComponent implements OnInit {

  /** Savings application form. */
  savingsApplicationForm: FormGroup;
  /** Field officer. */
  fieldOfficer: string;
  /** Date on which form was submited */
  submittedOn: Date;
  /** External id */
  externalId: string;
  /** Product */
  product: string;
  /** Currency */
  currency: any;
  /** Nominal annual interest */
  nominalAnnualInterest: any;
  /** Currency in multiples of */
  currencyInMultiplesOf: any;
  /** Interest calculated using */
  interestCalculatedUsing: any;
  /** Minimum opening balance */
  minimumOpeningBalance: any;
  /** Apply withdrawal fee for transfers */
  applyWithdrawalFeeForTransfers: boolean;
  /** Is overdraft allowed */
  isOverdraftAllowed: boolean;
  /** Enforce minimum balance */
  enforceMinimumBalancw: boolean;
  /** charges */
  charges: any;
  /** Decimal places */
  decimalPlaces: any;
  /** Interest posting period */
  interestPostingPeriod: any;
  /** Days in year */
  daysInYear: any;
  /** Lock-in period */
  lockinPeriod: any;
  /** Minimum balance */
  minimumBalance: any;

constructor(private formBuilder: FormBuilder,
            private savingsService: SavingsService,
            private location: Location
              ) {}

createSavingsApplicationForm() {
  this.savingsApplicationForm = this.formBuilder.group({
    product: ['', Validators.required],
    submittedOn: ['', Validators.required],
    nominalAnnualInterest: ['', Validators.required],
    interestCalculatedUsing: ['', Validators.required],
    interestCompoundingPeriod: ['', Validators.required],
    interestPostingPeriod: ['', Validators.required],
    daysInYear: ['', Validators.required],
    fieldOfficer: ['' ],
    externalId: ['' ],
    currency: ['' ],
    currencyInMultiplesOf: ['' ],
    mimimumOpeningBalance: ['' ],
    applyWithdrawalFeeForTransfers: [false ],
    isOverdraftAllowed: [false ],
    enforceMinimumBalance: [false ],
    charges: ['' ],
    decimalPlaces: ['' ],
    lockinPeriod: ['' ],
    minimumBalance: ['' ],
  });
}

ngOnInit() {
this.createSavingsApplicationForm();
  }

submit() {
  const savingsAccount = this.savingsApplicationForm.value;
  this.savingsService.createSavingsAccount(savingsAccount)
  .subscribe((response: any) => {
  this.location.back();
     });
  }

}

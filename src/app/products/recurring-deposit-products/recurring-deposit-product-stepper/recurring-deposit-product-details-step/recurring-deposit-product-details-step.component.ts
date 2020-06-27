import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-recurring-deposit-product-details-step',
  templateUrl: './recurring-deposit-product-details-step.component.html',
  styleUrls: ['./recurring-deposit-product-details-step.component.scss']
})
export class RecurringDepositProductDetailsStepComponent implements OnInit {

  recurringDepositProductDetailsForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createrecurringDepositProductDetailsForm();
  }

  ngOnInit() {
  }

  createrecurringDepositProductDetailsForm() {
    this.recurringDepositProductDetailsForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'shortName': ['', Validators.required],
      'description': ['']
    });
  }

  get recurringDepositProductDetails() {
    return this.recurringDepositProductDetailsForm.value;
  }

}

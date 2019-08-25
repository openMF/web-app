import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-fixed-deposit-product-details-step',
  templateUrl: './fixed-deposit-product-details-step.component.html',
  styleUrls: ['./fixed-deposit-product-details-step.component.scss']
})
export class FixedDepositProductDetailsStepComponent implements OnInit {

  fixedDepositProductDetailsForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createFixedDepositProductDetailsForm();
  }

  ngOnInit() {
  }

  createFixedDepositProductDetailsForm() {
    this.fixedDepositProductDetailsForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'shortName': ['', Validators.required],
      'description': ['']
    });
  }

  get fixedDepositProductDetails() {
    return this.fixedDepositProductDetailsForm.value;
  }

}

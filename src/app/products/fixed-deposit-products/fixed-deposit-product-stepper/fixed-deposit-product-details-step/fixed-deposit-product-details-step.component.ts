import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-fixed-deposit-product-details-step',
  templateUrl: './fixed-deposit-product-details-step.component.html',
  styleUrls: ['./fixed-deposit-product-details-step.component.scss']
})
export class FixedDepositProductDetailsStepComponent implements OnInit {

  @Input() fixedDepositProductsTemplate: any;

  fixedDepositProductDetailsForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createFixedDepositProductDetailsForm();
  }

  ngOnInit() {
    if (!(this.fixedDepositProductsTemplate === undefined) && this.fixedDepositProductsTemplate.id) {
      this.fixedDepositProductDetailsForm.patchValue({
        'name': this.fixedDepositProductsTemplate.name,
        'shortName': this.fixedDepositProductsTemplate.shortName,
        'description': this.fixedDepositProductsTemplate.description,
      });
    }
  }

  createFixedDepositProductDetailsForm() {
    this.fixedDepositProductDetailsForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'shortName': ['', Validators.required],
      'description': ['', Validators.required]
    });
  }

  get fixedDepositProductDetails() {
    return this.fixedDepositProductDetailsForm.value;
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-recurring-deposit-product-details-step',
  templateUrl: './recurring-deposit-product-details-step.component.html',
  styleUrls: ['./recurring-deposit-product-details-step.component.scss']
})
export class RecurringDepositProductDetailsStepComponent implements OnInit {

  @Input() recurringDepositProductsTemplate: any;

  recurringDepositProductDetailsForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createrecurringDepositProductDetailsForm();
  }

  ngOnInit() {
    if (!(this.recurringDepositProductsTemplate === undefined) && this.recurringDepositProductsTemplate.id) {
      this.recurringDepositProductDetailsForm.patchValue({
        'name': this.recurringDepositProductsTemplate.name,
        'shortName': this.recurringDepositProductsTemplate.shortName,
        'description': this.recurringDepositProductsTemplate.description,
      });
    }
  }

  createrecurringDepositProductDetailsForm() {
    this.recurringDepositProductDetailsForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'shortName': ['', Validators.required],
      'description': ['', Validators.required]
    });
  }

  get recurringDepositProductDetails() {
    return this.recurringDepositProductDetailsForm.value;
  }

}

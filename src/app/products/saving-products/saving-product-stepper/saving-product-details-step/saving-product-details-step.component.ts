import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-saving-product-details-step',
  templateUrl: './saving-product-details-step.component.html',
  styleUrls: ['./saving-product-details-step.component.scss']
})
export class SavingProductDetailsStepComponent implements OnInit {

  savingProductDetailsForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createSavingProductDetailsForm();
  }

  ngOnInit() {
  }

  createSavingProductDetailsForm() {
    this.savingProductDetailsForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'shortName': ['', Validators.required],
      'description': ['']
    });
  }

  get savingProductDetails() {
    return this.savingProductDetailsForm.value;
  }

}

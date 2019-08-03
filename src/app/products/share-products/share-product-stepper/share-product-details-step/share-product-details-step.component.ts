import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-share-product-details-step',
  templateUrl: './share-product-details-step.component.html',
  styleUrls: ['./share-product-details-step.component.scss']
})
export class ShareProductDetailsStepComponent implements OnInit {

  shareProductDetailsForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createShareProductDetailsForm();
  }

  ngOnInit() {
  }

  createShareProductDetailsForm() {
    this.shareProductDetailsForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'shortName': ['', Validators.required],
      'description': ['']
    });
  }

  get shareProductDetails() {
    return this.shareProductDetailsForm.value;
  }

}

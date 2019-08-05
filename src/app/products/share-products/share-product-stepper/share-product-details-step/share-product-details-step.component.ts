import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-share-product-details-step',
  templateUrl: './share-product-details-step.component.html',
  styleUrls: ['./share-product-details-step.component.scss']
})
export class ShareProductDetailsStepComponent implements OnInit {

  @Input() shareProductsTemplate: any;

  shareProductDetailsForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createShareProductDetailsForm();
  }

  ngOnInit() {
    if (this.shareProductsTemplate) {
      this.shareProductDetailsForm.patchValue({
        'name': this.shareProductsTemplate.name,
        'shortName': this.shareProductsTemplate.shortName,
        'description': this.shareProductsTemplate.description
      });
    }
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

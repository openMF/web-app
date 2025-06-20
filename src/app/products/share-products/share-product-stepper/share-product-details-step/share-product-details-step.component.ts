import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-share-product-details-step',
  templateUrl: './share-product-details-step.component.html',
  styleUrls: ['./share-product-details-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class ShareProductDetailsStepComponent implements OnInit {
  @Input() shareProductsTemplate: any;

  shareProductDetailsForm: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createShareProductDetailsForm();
  }

  ngOnInit() {
    if (this.shareProductsTemplate) {
      this.shareProductDetailsForm.patchValue({
        name: this.shareProductsTemplate.name,
        shortName: this.shareProductsTemplate.shortName,
        description: this.shareProductsTemplate.description
      });
    }
  }

  createShareProductDetailsForm() {
    this.shareProductDetailsForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ],
      shortName: [
        '',
        Validators.required
      ],
      description: [
        '',
        Validators.required
      ]
    });
  }

  get shareProductDetails() {
    return this.shareProductDetailsForm.value;
  }
}

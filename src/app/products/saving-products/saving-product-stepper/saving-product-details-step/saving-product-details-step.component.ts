import { Component, OnInit, Input, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-saving-product-details-step',
  templateUrl: './saving-product-details-step.component.html',
  styleUrls: ['./saving-product-details-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    CdkTextareaAutosize,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class SavingProductDetailsStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  @Input() savingProductsTemplate: any;

  savingProductDetailsForm: UntypedFormGroup;

  constructor() {
    this.createSavingProductDetailsForm();
  }

  ngOnInit() {
    if (this.savingProductsTemplate) {
      this.savingProductDetailsForm.patchValue({
        name: this.savingProductsTemplate.name,
        shortName: this.savingProductsTemplate.shortName,
        description: this.savingProductsTemplate.description
      });
    }
  }

  createSavingProductDetailsForm() {
    this.savingProductDetailsForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ],
      shortName: [
        '',
        Validators.required
      ],
      description: ['']
    });
  }

  get savingProductDetails() {
    return this.savingProductDetailsForm.value;
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-share-product-details-step',
  templateUrl: './share-product-details-step.component.html',
  styleUrls: ['./share-product-details-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatTooltip,
    MatError,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    TranslatePipe,
    NgxTranslatePipe
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

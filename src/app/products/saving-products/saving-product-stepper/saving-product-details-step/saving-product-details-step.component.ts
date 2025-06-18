import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-saving-product-details-step',
  templateUrl: './saving-product-details-step.component.html',
  styleUrls: ['./saving-product-details-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatTooltip,
    MatError,
    CdkTextareaAutosize,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class SavingProductDetailsStepComponent implements OnInit {
  @Input() savingProductsTemplate: any;

  savingProductDetailsForm: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) {
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

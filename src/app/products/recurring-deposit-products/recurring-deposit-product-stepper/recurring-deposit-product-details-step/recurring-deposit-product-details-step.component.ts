import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { NgIf } from '@angular/common';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-recurring-deposit-product-details-step',
  templateUrl: './recurring-deposit-product-details-step.component.html',
  styleUrls: ['./recurring-deposit-product-details-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatTooltip,
    NgIf,
    MatError,
    CdkTextareaAutosize,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    NgxTranslatePipe
  ]
})
export class RecurringDepositProductDetailsStepComponent implements OnInit {
  @Input() recurringDepositProductsTemplate: any;

  recurringDepositProductDetailsForm: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createrecurringDepositProductDetailsForm();
  }

  ngOnInit() {
    if (!(this.recurringDepositProductsTemplate === undefined) && this.recurringDepositProductsTemplate.id) {
      this.recurringDepositProductDetailsForm.patchValue({
        name: this.recurringDepositProductsTemplate.name,
        shortName: this.recurringDepositProductsTemplate.shortName,
        description: this.recurringDepositProductsTemplate.description
      });
    }
  }

  createrecurringDepositProductDetailsForm() {
    this.recurringDepositProductDetailsForm = this.formBuilder.group({
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

  get recurringDepositProductDetails() {
    return this.recurringDepositProductDetailsForm.value;
  }
}

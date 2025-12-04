import { Component, OnInit, Input, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-share-product-terms-step',
  templateUrl: './share-product-terms-step.component.html',
  styleUrls: ['./share-product-terms-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatHint,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class ShareProductTermsStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  @Input() shareProductsTemplate: any;

  shareProductTermsForm: UntypedFormGroup;

  constructor() {
    this.createShareProductTermsForm();
  }

  ngOnInit() {
    combineLatest([
      this.shareProductTermsForm.get('sharesIssued').valueChanges,
      this.shareProductTermsForm.get('unitPrice').valueChanges
    ]).subscribe(
      ([
        sharesIssued,
        unitPrice
      ]: number[]) => {
        this.shareProductTermsForm.get('shareCapital').setValue(sharesIssued * unitPrice);
      }
    );

    if (this.shareProductsTemplate) {
      this.shareProductTermsForm.patchValue({
        totalShares: this.shareProductsTemplate.totalShares,
        sharesIssued: this.shareProductsTemplate.totalSharesIssued,
        unitPrice: this.shareProductsTemplate.unitPrice,
        shareCapital: this.shareProductsTemplate.shareCapital
      });
    }
  }

  createShareProductTermsForm() {
    this.shareProductTermsForm = this.formBuilder.group({
      totalShares: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      sharesIssued: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      unitPrice: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      shareCapital: ['']
    });
  }

  get shareProductTerms() {
    return this.shareProductTermsForm.value;
  }
}

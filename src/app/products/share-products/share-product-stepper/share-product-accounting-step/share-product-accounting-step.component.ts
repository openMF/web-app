import { Component, OnInit, Input } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { NgFor, NgIf } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { GlAccountSelectorComponent } from '../../../../shared/accounting/gl-account-selector/gl-account-selector.component';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-share-product-accounting-step',
  templateUrl: './share-product-accounting-step.component.html',
  styleUrls: ['./share-product-accounting-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatRadioGroup,
    NgFor,
    MatRadioButton,
    MatDivider,
    NgIf,
    GlAccountSelectorComponent,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ShareProductAccountingStepComponent implements OnInit {
  @Input() shareProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() shareProductFormValid: boolean;

  shareProductAccountingForm: UntypedFormGroup;

  assetAccountData: any;
  incomeAccountData: any;
  equityAccountData: any;
  liabilityAccountData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createShareProductAccountingForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.assetAccountData = this.shareProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
    this.incomeAccountData = this.shareProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
    this.equityAccountData = this.shareProductsTemplate.accountingMappingOptions.equityAccountOptions || [];
    this.liabilityAccountData = this.shareProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];

    if (this.shareProductsTemplate.accountingRule) {
      this.shareProductAccountingForm.patchValue({
        accountingRule: this.shareProductsTemplate.accountingRule.id
      });

      if (this.shareProductsTemplate.accountingRule.id === 2) {
        this.shareProductAccountingForm.patchValue({
          shareReferenceId: this.shareProductsTemplate.accountingMappings.shareReferenceId.id,
          shareSuspenseId: this.shareProductsTemplate.accountingMappings.shareSuspenseId.id,
          shareEquityId: this.shareProductsTemplate.accountingMappings.shareEquityId.id,
          incomeFromFeeAccountId: this.shareProductsTemplate.accountingMappings.incomeFromFeeAccountId.id
        });
      }
    }
  }

  createShareProductAccountingForm() {
    this.shareProductAccountingForm = this.formBuilder.group({
      accountingRule: [1]
    });
  }

  setConditionalControls() {
    this.shareProductAccountingForm.get('accountingRule').valueChanges.subscribe((accountingRule: any) => {
      if (accountingRule === 2) {
        this.shareProductAccountingForm.addControl('shareReferenceId', new UntypedFormControl('', Validators.required));
        this.shareProductAccountingForm.addControl('shareSuspenseId', new UntypedFormControl('', Validators.required));
        this.shareProductAccountingForm.addControl('shareEquityId', new UntypedFormControl('', Validators.required));
        this.shareProductAccountingForm.addControl(
          'incomeFromFeeAccountId',
          new UntypedFormControl('', Validators.required)
        );
      } else {
        this.shareProductAccountingForm.removeControl('shareReferenceId');
        this.shareProductAccountingForm.removeControl('shareSuspenseId');
        this.shareProductAccountingForm.removeControl('shareEquityId');
        this.shareProductAccountingForm.removeControl('incomeFromFeeAccountId');
      }
    });
  }

  get shareProductAccounting() {
    return this.shareProductAccountingForm.value;
  }
}

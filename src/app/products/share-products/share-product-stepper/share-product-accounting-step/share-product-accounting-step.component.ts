import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'mifosx-share-product-accounting-step',
  templateUrl: './share-product-accounting-step.component.html',
  styleUrls: ['./share-product-accounting-step.component.scss']
})
export class ShareProductAccountingStepComponent implements OnInit {

  @Input() shareProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() shareProductFormValid: boolean;

  shareProductAccountingForm: FormGroup;

  assetAccountData: any;
  incomeAccountData: any;
  equityAccountData: any;
  liabilityAccountData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createShareProductAccountingForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.assetAccountData = this.shareProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
    this.incomeAccountData = this.shareProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
    this.equityAccountData = this.shareProductsTemplate.accountingMappingOptions.equityAccountOptions || [];
    this.liabilityAccountData = this.shareProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];
  }

  createShareProductAccountingForm() {
    this.shareProductAccountingForm = this.formBuilder.group({
      'accountingRule': [1]
    });
  }

  setConditionalControls() {
    this.shareProductAccountingForm.get('accountingRule').valueChanges
      .subscribe((accountingRule: any) => {
        if (accountingRule === 2) {
          this.shareProductAccountingForm.addControl('shareReferenceId', new FormControl('', Validators.required));
          this.shareProductAccountingForm.addControl('shareSuspenseId', new FormControl('', Validators.required));
          this.shareProductAccountingForm.addControl('shareEquityId', new FormControl('', Validators.required));
          this.shareProductAccountingForm.addControl('incomeFromFeeAccountId', new FormControl('', Validators.required));
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

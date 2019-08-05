import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'mifosx-share-product-terms-step',
  templateUrl: './share-product-terms-step.component.html',
  styleUrls: ['./share-product-terms-step.component.scss']
})
export class ShareProductTermsStepComponent implements OnInit {

  @Input() shareProductsTemplate: any;

  shareProductTermsForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createShareProductTermsForm();
  }

  ngOnInit() {
    combineLatest([
      this.shareProductTermsForm.get('sharesIssued').valueChanges,
      this.shareProductTermsForm.get('unitPrice').valueChanges
    ]).subscribe(([sharesIssued, unitPrice]: number[]) => {
      this.shareProductTermsForm.get('shareCapital').setValue(sharesIssued * unitPrice);
    });

    if (this.shareProductsTemplate) {
      this.shareProductTermsForm.patchValue({
        'totalShares': this.shareProductsTemplate.totalShares,
        'sharesIssued': this.shareProductsTemplate.totalSharesIssued,
        'unitPrice': this.shareProductsTemplate.unitPrice,
        'shareCapital': this.shareProductsTemplate.shareCapital
      });
    }
  }

  createShareProductTermsForm() {
    this.shareProductTermsForm = this.formBuilder.group({
      'totalShares': ['', Validators.required],
      'sharesIssued': ['', Validators.required],
      'unitPrice': ['', Validators.required],
      'shareCapital': ['']
    });
  }

  get shareProductTerms() {
    return this.shareProductTermsForm.value;
  }

}

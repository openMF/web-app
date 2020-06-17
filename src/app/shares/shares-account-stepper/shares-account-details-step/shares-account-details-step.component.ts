/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';

/**
 * Shares Account Details Step
 */
@Component({
  selector: 'mifosx-shares-account-details-step',
  templateUrl: './shares-account-details-step.component.html',
  styleUrls: ['./shares-account-details-step.component.scss']
})
export class SharesAccountDetailsStepComponent implements OnInit {

  /** Shares Account Template */
  @Input() sharesAccountTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Product Data */
  productData: any;
  /** Shares Account Details Form */
  sharesAccountDetailsForm: FormGroup;

  /** Shares Account Template with product data  */
  @Output() sharesAccountProductTemplate = new EventEmitter();

  /**
   * Sets share account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SharesService} sharesService Shares Service.
   */
  constructor(private formBuilder: FormBuilder,
              private sharesService: SharesService) {
    this.createSharesAccountDetailsForm();
  }

  ngOnInit() {
    this.buildDependencies();
    if (this.sharesAccountTemplate) {
      this.productData = this.sharesAccountTemplate.productOptions;
      if (this.sharesAccountTemplate.productId) {
        this.sharesAccountDetailsForm.patchValue({
          'productId': this.sharesAccountTemplate.productId,
          'submittedDate': this.sharesAccountTemplate.timeline.submittedOnDate && new Date(this.sharesAccountTemplate.timeline.submittedOnDate),
          'externalId': this.sharesAccountTemplate.externalId
        });
      }
    }
  }

  /**
   * Creates shares account details form.
   */
  createSharesAccountDetailsForm() {
    this.sharesAccountDetailsForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'submittedDate': ['', Validators.required],
      'externalId': ['']
    });
  }

  /**
   * Fetches shares account product template on productId value changes
   */
  buildDependencies() {
    const clientId = this.sharesAccountTemplate.clientId;
    this.sharesAccountDetailsForm.get('productId').valueChanges.subscribe((productId: string) => {
      this.sharesService.getSharesAccountTemplate(clientId, productId).subscribe((response: any) => {
        this.sharesAccountProductTemplate.emit(response);
      });
    });
  }

  /**
   * Returns shares account form value.
   */
  get sharesAccountDetails() {
    return this.sharesAccountDetailsForm.value;
  }

}

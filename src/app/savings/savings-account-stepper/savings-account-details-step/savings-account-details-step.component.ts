/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';

/**
 * Savings Account Details Step
 */
@Component({
  selector: 'mifosx-savings-account-details-step',
  templateUrl: './savings-account-details-step.component.html',
  styleUrls: ['./savings-account-details-step.component.scss']
})
export class SavingsAccountDetailsStepComponent implements OnInit {

  /** Savings Account Template */
  @Input() savingsAccountTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Product Data */
  productData: any;
  /** Field Officer Data */
  fieldOfficerData: any;
  /** Savings Account Details Form */
  savingsAccountDetailsForm: FormGroup;

  /** Savings Account Template with product data  */
  @Output() savingsAccountProductTemplate = new EventEmitter();

  /**
   * Sets share account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SavingsService} savingsService Savings Service.
   */
  constructor(private formBuilder: FormBuilder,
              private savingsService: SavingsService) {
    this.createSavingsAccountDetailsForm();
  }

  ngOnInit() {
    this.buildDependencies();
    if (this.savingsAccountTemplate) {
      this.productData = this.savingsAccountTemplate.productOptions;
    }
  }

  /**
   * Creates savings account details form.
   */
  createSavingsAccountDetailsForm() {
    this.savingsAccountDetailsForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'submittedOnDate': ['', Validators.required],
      'fieldOfficerId': [''],
      'externalId': ['']
    });
  }

  /**
   * Fetches savings account product template on productId value changes
   */
  buildDependencies() {
    const clientId = this.savingsAccountTemplate.clientId;
    this.savingsAccountDetailsForm.get('productId').valueChanges.subscribe((productId: string) => {
      this.savingsService.getSavingsAccountTemplate(clientId, productId).subscribe((response: any) => {
        this.savingsAccountProductTemplate.emit(response);
        this.savingsAccountDetailsForm.get('fieldOfficerId').patchValue('');
        this.fieldOfficerData = response.fieldOfficerOptions;
      });
    });
  }

  /**
   * Returns savings account form value.
   */
  get savingsAccountDetails() {
    return this.savingsAccountDetailsForm.value;
  }

}

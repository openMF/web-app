/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { DatePipe } from '@angular/common';

/**
 * Recurring Deposits Account Details Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-details-step',
  templateUrl: './recurring-deposits-account-details-step.component.html',
  styleUrls: ['./recurring-deposits-account-details-step.component.scss']
})
export class RecurringDepositsAccountDetailsStepComponent implements OnInit {

  /** Recurring Deposits Account Template */
  @Input() recurringDepositsAccountTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Product Data */
  productData: any;
  /** Field Officer Data */
  fieldOfficerData: any;
  /** For edit recurring deposits form */
  isFieldOfficerPatched = false;
  /** Recurring Deposits Account Details Form */
  recurringDepositAccountDetailsForm: FormGroup;

  /** Recurring Deposits Account Template with product data  */
  @Output() recurringDepositsAccountProductTemplate = new EventEmitter();

  /**
   * Sets recurring deposits account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {RecurringDepositsService} recurringDepositsService Recurring Deposits Service.
   */
  constructor(private formBuilder: FormBuilder,
    private recurringDepositsService: RecurringDepositsService,
    private datePipe: DatePipe) {
    this.createRecurringDepositsAccountDetailsForm();
  }

  ngOnInit() {
    this.buildDependencies();
    if (this.recurringDepositsAccountTemplate) {
      this.productData = this.recurringDepositsAccountTemplate.productOptions;
      if (this.recurringDepositsAccountTemplate.depositProductId) {
        this.recurringDepositAccountDetailsForm.patchValue({
          'productId': this.recurringDepositsAccountTemplate.depositProductId,
          'submittedOnDate': this.recurringDepositsAccountTemplate.timeline.submittedOnDate && new Date(this.recurringDepositsAccountTemplate.timeline.submittedOnDate),
        });
      }
    }
  }

  /**
   * Creates recurring deposits account details form.
   */
  createRecurringDepositsAccountDetailsForm() {
    this.recurringDepositAccountDetailsForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'submittedOnDate': ['', Validators.required],
      'fieldOfficerId': ['']
    });
  }

  /**
   * Fetches recurring deposits account product template on productId value changes
   */
  buildDependencies() {
    const clientId = this.recurringDepositsAccountTemplate.clientId;
    this.recurringDepositAccountDetailsForm.get('productId').valueChanges.subscribe((productId: string) => {
      this.recurringDepositsService.getRecurringDepositsAccountTemplate(clientId, productId).subscribe((response: any) => {
        this.recurringDepositsAccountProductTemplate.emit(response);
        this.fieldOfficerData = response.fieldOfficerOptions;
        if (!this.isFieldOfficerPatched && this.recurringDepositsAccountTemplate.fieldOfficerId) {
          this.recurringDepositAccountDetailsForm.get('fieldOfficerId').patchValue(this.recurringDepositsAccountTemplate.fieldOfficerId);
          this.isFieldOfficerPatched = true;
        } else {
          this.recurringDepositAccountDetailsForm.get('fieldOfficerId').patchValue('');
        }
      });
    });
  }

  /**
   * Returns recurring deposits account details form value.
   */
  get recurringDepositAccountDetails() {
    return this.recurringDepositAccountDetailsForm.value;
  }
}

/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Services */
import { FixedDepositsService } from '../../fixed-deposits.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Fixed Deposits Account Details Step
 */
@Component({
  selector: 'mifosx-fixed-deposit-account-details-step',
  templateUrl: './fixed-deposit-account-details-step.component.html',
  styleUrls: ['./fixed-deposit-account-details-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class FixedDepositAccountDetailsStepComponent implements OnInit {
  /** Fixed Deposits Account Template */
  @Input() fixedDepositsAccountTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Product Data */
  productData: any;
  /** Field Officer Data */
  fieldOfficerData: any;
  /** For edit savings form */
  isFieldOfficerPatched = false;
  /** Fixed Deposits Account Details Form */
  fixedDepositAccountDetailsForm: UntypedFormGroup;

  isProductSelected = false;

  /** Fixed Deposits Account Template with product data  */
  @Output() fixedDepositsAccountProductTemplate = new EventEmitter();

  /**
   * Sets fixed deposits account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits Service.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private fixedDepositsService: FixedDepositsService,
    private settingsService: SettingsService
  ) {
    this.createFixedDepositsAccountDetailsForm();
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.buildDependencies();
    if (this.fixedDepositsAccountTemplate) {
      this.productData = this.fixedDepositsAccountTemplate.productOptions;
      if (this.fixedDepositsAccountTemplate.depositProductId) {
        this.fixedDepositAccountDetailsForm.patchValue({
          productId: this.fixedDepositsAccountTemplate.depositProductId,
          submittedOnDate:
            this.fixedDepositsAccountTemplate.timeline.submittedOnDate &&
            new Date(this.fixedDepositsAccountTemplate.timeline.submittedOnDate),
          externalId: this.fixedDepositsAccountTemplate.externalId || ''
        });
      }
    }
  }

  /**
   * Creates fixed deposits account details form.
   */
  createFixedDepositsAccountDetailsForm() {
    this.fixedDepositAccountDetailsForm = this.formBuilder.group({
      productId: [
        '',
        Validators.required
      ],
      submittedOnDate: [
        '',
        Validators.required
      ],
      fieldOfficerId: [''],
      externalId: ['']
    });
  }

  /**
   * Fetches fixed deposits account product template on productId value changes
   */
  buildDependencies() {
    const clientId = this.fixedDepositsAccountTemplate.clientId;
    this.fixedDepositAccountDetailsForm.get('productId').valueChanges.subscribe((productId: string) => {
      this.fixedDepositsService.getFixedDepositsAccountTemplate(clientId, productId).subscribe((response: any) => {
        this.fixedDepositsAccountProductTemplate.emit(response);
        this.isProductSelected = true;
        this.fieldOfficerData = response.fieldOfficerOptions;
        if (!this.isFieldOfficerPatched && this.fixedDepositsAccountTemplate.fieldOfficerId) {
          this.fixedDepositAccountDetailsForm
            .get('fieldOfficerId')
            .patchValue(this.fixedDepositsAccountTemplate.fieldOfficerId);
          this.isFieldOfficerPatched = true;
        } else {
          this.fixedDepositAccountDetailsForm.get('fieldOfficerId').patchValue('');
        }
      });
    });
  }

  /**
   * Returns fixed deposits account details form value.
   */
  get fixedDepositAccountDetails() {
    const fixedDepositAccountDetails = this.fixedDepositAccountDetailsForm.value;
    for (const key in fixedDepositAccountDetails) {
      if (fixedDepositAccountDetails[key] === '') {
        delete fixedDepositAccountDetails[key];
      }
    }
    return fixedDepositAccountDetails;
  }
}

/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Recurring Deposits Account Details Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-details-step',
  templateUrl: './recurring-deposits-account-details-step.component.html',
  styleUrls: ['./recurring-deposits-account-details-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    MatError,
    NgIf,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatTooltip,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    TranslatePipe,
    NgxTranslatePipe
  ]
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
  recurringDepositAccountDetailsForm: UntypedFormGroup;

  isProductSelected = false;

  /** Recurring Deposits Account Template with product data  */
  @Output() recurringDepositsAccountProductTemplate = new EventEmitter();

  /**
   * Sets recurring deposits account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {RecurringDepositsService} recurringDepositsService Recurring Deposits Service.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private recurringDepositsService: RecurringDepositsService,
    private settingsService: SettingsService
  ) {
    this.createRecurringDepositsAccountDetailsForm();
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.buildDependencies();
    if (this.recurringDepositsAccountTemplate) {
      this.productData = this.recurringDepositsAccountTemplate.productOptions;
      if (this.recurringDepositsAccountTemplate.depositProductId) {
        this.recurringDepositAccountDetailsForm.patchValue({
          productId: this.recurringDepositsAccountTemplate.depositProductId,
          submittedOnDate:
            this.recurringDepositsAccountTemplate.timeline.submittedOnDate &&
            new Date(this.recurringDepositsAccountTemplate.timeline.submittedOnDate),
          externalId: this.recurringDepositsAccountTemplate.externalId
        });
      }
    }
  }

  /**
   * Creates recurring deposits account details form.
   */
  createRecurringDepositsAccountDetailsForm() {
    this.recurringDepositAccountDetailsForm = this.formBuilder.group({
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
   * Fetches recurring deposits account product template on productId value changes
   */
  buildDependencies() {
    const clientId = this.recurringDepositsAccountTemplate.clientId;
    this.recurringDepositAccountDetailsForm.get('productId').valueChanges.subscribe((productId: string) => {
      this.recurringDepositsService
        .getRecurringDepositsAccountTemplate(clientId, productId)
        .subscribe((response: any) => {
          this.recurringDepositsAccountProductTemplate.emit(response);
          this.fieldOfficerData = response.fieldOfficerOptions;
          this.isProductSelected = true;
          if (!this.isFieldOfficerPatched && this.recurringDepositsAccountTemplate.fieldOfficerId) {
            this.recurringDepositAccountDetailsForm
              .get('fieldOfficerId')
              .patchValue(this.recurringDepositsAccountTemplate.fieldOfficerId);
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

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { SavingsChargesService } from '@fineract/client';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Apply Annual Fees Component
 */
@Component({
  selector: 'mifosx-apply-annual-fees-savings-account',
  templateUrl: './apply-annual-fees-savings-account.component.html',
  styleUrls: ['./apply-annual-fees-savings-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class ApplyAnnualFeesSavingsAccountComponent implements OnInit {
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Apply annual fees form. */
  applyAnnualFeesForm: UntypedFormGroup;
  /** Savings Account Id */
  accountId: any;
  /** Annual Fees charge Id */
  chargeId: any;
  /** Savings Account Data */
  savingsAccountData: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsChargesService} savingsChargesService Savings Charges Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private savingsChargeService: SavingsChargesService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.accountId = this.route.snapshot.params['savingAccountId'];
    this.route.data.subscribe((data: { savingsAccountActionData: any }) => {
      this.savingsAccountData = data.savingsAccountActionData;
    });
  }

  /**
   * Creates the apply annual fees form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createApplyAnnualFeesForm();
    this.applyCharge();
  }

  /**
   * Creates the apply annual fees form.
   */
  createApplyAnnualFeesForm() {
    this.applyAnnualFeesForm = this.formBuilder.group({
      dueDate: [
        '',
        Validators.required
      ],
      amount: ['']
    });
  }

  /**
   * Retireves apply annual fees charge for ID and amount.
   */
  applyCharge() {
    const charges: any[] = this.savingsAccountData.charges;
    charges.forEach((charge: any) => {
      if (charge.name === 'Annual fee - INR') {
        this.chargeId = charge.id;
        this.applyAnnualFeesForm.get('amount').patchValue(charge.amount);
      }
    });
  }

  /**
   * Submits the form and applies the annual fees,
   * if successful redirects to the saving account.
   */
  submit() {
    const applyAnnualFeesFormData = this.applyAnnualFeesForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevApprovedOnDate: Date = this.applyAnnualFeesForm.value.dueDate;
    if (applyAnnualFeesFormData.dueDate instanceof Date) {
      applyAnnualFeesFormData.dueDate = this.dateUtils.formatDate(prevApprovedOnDate, dateFormat);
    }
    const data = {
      ...applyAnnualFeesFormData,
      dateFormat,
      locale
    };
    this.savingsChargeService
      .addSavingsAccountCharge({
        savingsAccountId: this.accountId,
        postSavingsAccountsSavingsAccountIdChargesRequest: {
          ...data,
          chargeId: this.chargeId
        }
      })
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}

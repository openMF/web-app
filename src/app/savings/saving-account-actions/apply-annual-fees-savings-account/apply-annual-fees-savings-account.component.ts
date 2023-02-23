/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Apply Annual Fees Component
 */
@Component({
  selector: 'mifosx-apply-annual-fees-savings-account',
  templateUrl: './apply-annual-fees-savings-account.component.html',
  styleUrls: ['./apply-annual-fees-savings-account.component.scss']
})
export class ApplyAnnualFeesSavingsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Apply annual fees form. */
  applyAnnualFeesForm: FormGroup;
  /** Savings Account Id */
  accountId: any;
  /** Annual Fees charge Id */
  chargeId: any;
  /** Savings Account Data */
  savingsAccountData: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: FormBuilder,
              private savingsService: SavingsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
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
      'dueDate': ['', Validators.required],
      'amount': ['']
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
    this.savingsService.executeSavingsAccountChargesCommand(this.accountId, 'paycharge', data, this.chargeId).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

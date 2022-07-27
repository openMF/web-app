/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Activate Savings Account Component
 */
@Component({
  selector: 'mifosx-activate-savings-account',
  templateUrl: './activate-savings-account.component.html',
  styleUrls: ['./activate-savings-account.component.scss']
})
export class ActivateSavingsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Activate Savings Account form. */
  activateSavingsAccountForm: FormGroup;
  /** Savings Account Id */
  accountId: any;

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
    this.accountId = this.route.parent.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the activate savings form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createActivateSavingsAccountForm();
  }

  /**
   * Creates the activate savings account form.
   */
  createActivateSavingsAccountForm() {
    this.activateSavingsAccountForm = this.formBuilder.group({
      'activatedOnDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and activates the saving account,
   * if successful redirects to the saving account.
   */
  submit() {
    const activateSavingsAccountFormData = this.activateSavingsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActivatedOnDate: Date = this.activateSavingsAccountForm.value.activatedOnDate;
    if (activateSavingsAccountFormData.activatedOnDate instanceof Date) {
      activateSavingsAccountFormData.activatedOnDate = this.dateUtils.formatDate(prevActivatedOnDate, dateFormat);
    }
    const data = {
      ...activateSavingsAccountFormData,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountCommand(this.accountId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

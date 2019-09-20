/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/**
 * Edit Account Number Preference Component.
 */
@Component({
  selector: 'mifosx-edit-account-number-preference',
  templateUrl: './edit-account-number-preference.component.html',
  styleUrls: ['./edit-account-number-preference.component.scss']
})
export class EditAccountNumberPreferenceComponent implements OnInit {

  /** Account Number Preference Form */
  accountNumberPreferenceForm: FormGroup;
  /** Account Number Preference Data */
  accountNumberPreferenceData: any;
  /** Account Number Preferences Template Data */
  accountNumberPreferencesTemplateData: any;
  /** Prefix Type Data */
  prefixTypeData: any[];

  /**
   * Retrieves the account number preference and account number preferences template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private systemService: SystemService,
              private router: Router) {
    this.route.data.subscribe((data: { accountNumberPreference: any, accountNumberPreferencesTemplate: any }) => {
      this.accountNumberPreferenceData = data.accountNumberPreference;
      this.accountNumberPreferencesTemplateData = data.accountNumberPreferencesTemplate;
    });
  }

  /**
   * Sets Prefix type data.
   * Creates and sets account number preference form.
   */
  ngOnInit() {
    this.prefixTypeData = this.accountNumberPreferencesTemplateData.prefixTypeOptions[this.accountNumberPreferenceData.accountType.code];
    this.createAccountNumberPreferenceForm();
  }

  /**
   * Creates and sets the edit account number preference form.
   */
  createAccountNumberPreferenceForm() {
    this.accountNumberPreferenceForm = this.formBuilder.group({
      'accountType': [{ value: this.accountNumberPreferenceData.accountType.id, disabled: true }, Validators.required],
      'prefixType': [this.accountNumberPreferenceData.prefixType ? this.accountNumberPreferenceData.prefixType.id : 0]
    });
  }

  /**
   * Submits the account number preference form and updates the account number preference,
   * if successful redirects to view account number preference.
   */
  submit() {
    const accountNumberPreferenceValue = this.accountNumberPreferenceForm.value;
    if (accountNumberPreferenceValue.prefixType === '') {
      accountNumberPreferenceValue.prefixType = undefined;
    }
    this.systemService.updateAccountNumberPreference(this.accountNumberPreferenceData.id, accountNumberPreferenceValue)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}

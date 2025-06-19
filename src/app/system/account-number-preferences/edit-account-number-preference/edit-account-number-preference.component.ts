/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SystemService } from 'app/system/system.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Edit Account Number Preference Component.
 */
@Component({
  selector: 'mifosx-edit-account-number-preference',
  templateUrl: './edit-account-number-preference.component.html',
  styleUrls: ['./edit-account-number-preference.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    NgIf,
    MatError,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class EditAccountNumberPreferenceComponent implements OnInit {
  /** Account Number Preference Form */
  accountNumberPreferenceForm: UntypedFormGroup;
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
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private systemService: SystemService,
    private router: Router
  ) {
    this.route.data.subscribe((data: { accountNumberPreference: any; accountNumberPreferencesTemplate: any }) => {
      this.accountNumberPreferenceData = data.accountNumberPreference;
      this.accountNumberPreferencesTemplateData = data.accountNumberPreferencesTemplate;
    });
  }

  /**
   * Sets Prefix type data.
   * Creates and sets account number preference form.
   */
  ngOnInit() {
    this.prefixTypeData =
      this.accountNumberPreferencesTemplateData.prefixTypeOptions[this.accountNumberPreferenceData.accountType.code];
    this.createAccountNumberPreferenceForm();
  }

  /**
   * Creates and sets the edit account number preference form.
   */
  createAccountNumberPreferenceForm() {
    this.accountNumberPreferenceForm = this.formBuilder.group({
      accountType: [
        { value: this.accountNumberPreferenceData.accountType.id, disabled: true },
        Validators.required
      ],
      prefixType: [this.accountNumberPreferenceData.prefixType ? this.accountNumberPreferenceData.prefixType.id : 0]
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
    this.systemService
      .updateAccountNumberPreference(this.accountNumberPreferenceData.id, accountNumberPreferenceValue)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}

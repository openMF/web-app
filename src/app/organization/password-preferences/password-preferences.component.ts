/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatIconModule } from '@angular/material/icon';

/**
 * Password preferences component.
 */
@Component({
  selector: 'mifosx-password-preferences',
  templateUrl: './password-preferences.component.html',
  styleUrls: ['./password-preferences.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconModule
  ]
})
export class PasswordPreferencesComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private organizationService = inject(OrganizationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Password preferences form. */
  passwordPreferencesForm: UntypedFormGroup;
  /** Password preferences data. */
  passwordPreferencesData: any;
  /** Password policy cards */
  passwordPolicies = [
    {
      id: 1,
      key: 'basic',
      titleKey: 'labels.heading.Basic',
      descriptionKey: 'labels.heading.Basic Password Description'
    },
    {
      id: 2,
      key: 'standard',
      titleKey: 'labels.heading.Standard',
      descriptionKey: 'labels.heading.Standard Password Description',
      recommended: true
    },
    {
      id: 3,
      key: 'strong',
      titleKey: 'labels.heading.Strong',
      descriptionKey: 'labels.heading.Strong Password Description'
    }
  ];

  /**
   * Retrieves the password preferences data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor() {
    this.route.data.subscribe((data: { passwordPreferencesTemplate: any }) => {
      this.passwordPreferencesData = data.passwordPreferencesTemplate;
    });
  }

  /**
   * Creates and sets the password preferences form.
   */
  ngOnInit() {
    this.createPasswordPreferencesForm();
    this.setPasswordPreferencesForm();
  }

  /**
   * Creates the password preferences form.
   */
  createPasswordPreferencesForm() {
    this.passwordPreferencesForm = this.formBuilder.group({
      validationPolicyId: ['']
    });
  }

  /**
   * Sets the password preferences form.
   */
  setPasswordPreferencesForm() {
    let selectedPolicyId = 2;
    for (const passwordPreference of this.passwordPreferencesData) {
      if (passwordPreference.active === true) {
        selectedPolicyId = passwordPreference.id;
      }
      const policyIndex = this.passwordPolicies.findIndex((p) => p.id === passwordPreference.id);
      if (policyIndex !== -1) {
        this.passwordPolicies[policyIndex].description = passwordPreference.description;
      }
    }
    this.passwordPreferencesForm.get('validationPolicyId').setValue(selectedPolicyId);
  }

  /**
   * Selects a password policy card.
   */
  selectPolicy(policyId: number) {
    this.passwordPreferencesForm.patchValue({ validationPolicyId: policyId });
    this.passwordPreferencesForm.markAsDirty();
  }

  /**
   * Checks if a policy is selected.
   */
  isSelected(policyId: number): boolean {
    return this.passwordPreferencesForm.get('validationPolicyId')?.value === policyId;
  }

  /**
   * Submits the password preferences form and updates password preferences,
   * if successful redirects to organization view.
   */
  submit() {
    const passwordPreferences = this.passwordPreferencesForm.value;
    this.organizationService.updatePasswordPreferences(passwordPreferences).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}

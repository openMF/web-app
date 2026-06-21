/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Password preferences component.
 */
@Component({
  selector: 'mifosx-password-preferences',
  templateUrl: './password-preferences.component.html',
  styleUrls: ['./password-preferences.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatRadioGroup,
    MatRadioButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordPreferencesComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private organizationService = inject(OrganizationService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Password preferences form. */
  passwordPreferencesForm: FormGroup;
  /** Password preferences data. */
  passwordPreferencesData: any;

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { passwordPreferencesTemplate: any }) => {
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
    for (const passwordPreference of this.passwordPreferencesData) {
      if (passwordPreference.active) {
        this.passwordPreferencesForm.get('validationPolicyId').setValue(passwordPreference.id);
      }
    }
  }

  /**
   * TrackBy function for ngFor optimization.
   * @param index Index of the item.
   * @param item Password preference item.
   * @returns Unique identifier for the item.
   */
  trackByPasswordPreference(index: number, item: any): any {
    return item.id || index;
  }

  /**
   * Gets the password preference label based on ID.
   * @param preference Password preference object.
   * @returns Translation key for the password preference label.
   */
  getPasswordLabel(preference: any): string {
    // Map based on ID to ensure robustness
    const labelMap: { [key: number]: string } = {
      1: 'labels.inputs.Basic',
      2: 'labels.inputs.Standard',
      3: 'labels.inputs.Strong'
    };
    return labelMap[preference.id] || 'labels.inputs.Unknown';
  }

  /**
   * Submits the password preferences form and updates password preferences,
   * if successful redirects to organization view.
   */
  submit() {
    const passwordPreferences = this.passwordPreferencesForm.value;
    this.organizationService
      .updatePasswordPreferences(passwordPreferences)
      .pipe(take(1))
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}

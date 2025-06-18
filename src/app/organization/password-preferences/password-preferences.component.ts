/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { NgFor } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Password preferences component.
 */
@Component({
  selector: 'mifosx-password-preferences',
  templateUrl: './password-preferences.component.html',
  styleUrls: ['./password-preferences.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatRadioGroup,
    NgFor,
    MatRadioButton,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class PasswordPreferencesComponent implements OnInit {
  /** Password preferences form. */
  passwordPreferencesForm: UntypedFormGroup;
  /** Password preferences data. */
  passwordPreferencesData: any;

  /**
   * Retrieves the password preferences data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
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
    for (const passwordPreference of this.passwordPreferencesData) {
      if (passwordPreference.active === true) {
        this.passwordPreferencesForm.get('validationPolicyId').setValue(passwordPreference.id);
      }
    }
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

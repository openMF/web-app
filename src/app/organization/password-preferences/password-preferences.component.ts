/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Password preferences component.
 */
@Component({
  selector: 'mifosx-password-preferences',
  templateUrl: './password-preferences.component.html',
  styleUrls: ['./password-preferences.component.scss']
})
export class PasswordPreferencesComponent implements OnInit {

  /** Password preferences form. */
  passwordPreferencesForm: FormGroup;
  /** Password preferences data. */
  passwordPreferencesData: any;

  /**
   * Retrieves the password preferences data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { passwordPreferencesTemplate: any}) => {
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
      'validationPolicyId': ['']
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

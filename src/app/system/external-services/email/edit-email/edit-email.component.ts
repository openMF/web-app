/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/**
 * Edit Email Configuration Component.
 */
@Component({
  selector: 'mifosx-edit-email',
  templateUrl: './edit-email.component.html',
  styleUrls: ['./edit-email.component.scss']
})
export class EditEmailComponent implements OnInit {

  /** Password input field type. */
  passwordInputType: string;
  /** Email Configuration data */
  emailConfigurationData: any;
  /** Email Configuration Form */
  emailConfigurationForm: UntypedFormGroup;

  /**
   * Retrieves the Email configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { emailConfiguration: any }) => {
      this.emailConfigurationData = data.emailConfiguration;
    });
  }

  /**
   * Creates Email configuration form.
   */
  ngOnInit() {
    this.setEmailConfigurationForm();
    this.passwordInputType = 'password';
  }

  /**
   * Creates Email configuration form.
   */
  setEmailConfigurationForm() {
    this.emailConfigurationForm = this.formBuilder.group({
      'username': [this.emailConfigurationData[0].value, Validators.required],
      'password': [this.emailConfigurationData[1].value, Validators.required],
      'host': [this.emailConfigurationData[2].value, Validators.required],
      'port': [this.emailConfigurationData[3].value, Validators.required],
      'useTLS': [this.emailConfigurationData[4].value, Validators.required],
      'fromEmail': [this.emailConfigurationData[5].value, Validators.required],
      'fromName': [this.emailConfigurationData[6].value, Validators.required]
    });
  }

  /**
   * Submits the Email configuration and updates the Email configuration,
   * if successful redirects to view Email configuration.
   */
  submit() {
    this.systemService
      .updateExternalConfiguration('SMTP', this.emailConfigurationForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}

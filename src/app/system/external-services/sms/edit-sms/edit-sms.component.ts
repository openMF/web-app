/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { SystemService } from 'app/system/system.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit SMS Configuration Component.
 */
@Component({
  selector: 'mifosx-edit-sms',
  templateUrl: './edit-sms.component.html',
  styleUrls: ['./edit-sms.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class EditSMSComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private systemService = inject(SystemService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** SMS Configuration data */
  smsConfigurationData: any;
  /** SMS Configuration Form */
  smsConfigurationForm: UntypedFormGroup;

  /**
   * Retrieves the SMS configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor() {
    this.route.data.subscribe((data: { smsConfiguration: any }) => {
      this.smsConfigurationData = data.smsConfiguration;
    });
  }

  /**
   * Creates SMS configuration form.
   */
  ngOnInit() {
    this.setSMSConfigurationForm();
  }

  /**
   * Creates SMS configuration form.
   */
  setSMSConfigurationForm() {
    this.smsConfigurationForm = this.formBuilder.group({
      host_name: [
        this.smsConfigurationData[0].value,
        Validators.required
      ],
      port_number: [
        this.smsConfigurationData[1].value,
        Validators.required
      ],
      end_point: [
        this.smsConfigurationData[2].value,
        Validators.required
      ],
      tenant_app_key: [
        this.smsConfigurationData[3].value,
        Validators.required
      ]
    });
  }

  /**
   * Submits the SMS configuration and updates the SMS configuration,
   * if successful redirects to view SMS configuration.
   */
  submit() {
    this.systemService
      .updateExternalConfiguration('SMS', this.smsConfigurationForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}

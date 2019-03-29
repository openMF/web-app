/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/**
 * Edit SMS Configuration Component.
 */
@Component({
  selector: 'mifosx-edit-sms',
  templateUrl: './edit-sms.component.html',
  styleUrls: ['./edit-sms.component.scss']
})
export class EditSMSComponent implements OnInit {

  /** SMS Configuration data */
  smsConfigurationData: any;
  /** SMS Configuration Form */
  smsConfigurationForm: FormGroup;

  /**
   * Retrieves the SMS configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router) {
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
      'host_name': [this.smsConfigurationData[0].value, Validators.required],
      'port_number': [this.smsConfigurationData[1].value, Validators.required],
      'end_point': [this.smsConfigurationData[2].value, Validators.required],
      'tenant_app_key': [this.smsConfigurationData[3].value, Validators.required]
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

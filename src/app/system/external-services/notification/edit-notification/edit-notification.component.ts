/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/**
 * Edit Notification Configuration Component.
 */
@Component({
  selector: 'mifosx-edit-notification',
  templateUrl: './edit-notification.component.html',
  styleUrls: ['./edit-notification.component.scss']
})
export class EditNotificationComponent implements OnInit {

  /** Notification Configuration data */
  notificationConfigurationData: any;
  /** Notification Configuration Form */
  notificationConfigurationForm: FormGroup;

  /**
   * Retrieves the Notification configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { notificationConfiguration: any }) => {
      this.notificationConfigurationData = data.notificationConfiguration;
    });
  }

  /**
   * Creates Notification configuration form.
   */
  ngOnInit() {
    this.setNotificationConfigurationForm();
  }

  /**
   * Creates Notification configuration form.
   */
  setNotificationConfigurationForm() {
    this.notificationConfigurationForm = this.formBuilder.group({
      'server_key': [this.notificationConfigurationData[0].value, Validators.required],
      'gcm_end_point': [this.notificationConfigurationData[1].value, Validators.required],
      'fcm_end_point': [this.notificationConfigurationData[2].value, Validators.required]
    });
  }

  /**
   * Submits the Notification configuration and updates the Notification configuration,
   * if successful redirects to view Notification configuration.
   */
  submit() {
    this.systemService
      .updateExternalConfiguration('NOTIFICATION', this.notificationConfigurationForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}

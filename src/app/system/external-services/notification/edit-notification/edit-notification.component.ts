/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { SystemService } from 'app/system/system.service';
import { buildExternalServiceUpdate, MASKED_EXTERNAL_SERVICE_PROPERTIES } from '../../external-service-update';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Notification Configuration Component.
 */
@Component({
  selector: 'mifosx-edit-notification',
  templateUrl: './edit-notification.component.html',
  styleUrls: ['./edit-notification.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditNotificationComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private systemService = inject(SystemService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Notification Configuration data */
  notificationConfigurationData: any;
  /** Notification Configuration Form */
  notificationConfigurationForm: UntypedFormGroup;
  /** Notification Configuration form value as loaded. */
  initialNotificationConfiguration: Record<string, unknown>;

  /**
   * Retrieves the Notification configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor() {
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
      /** Fineract returns the server key masked, so it starts empty and blank means keep it. */
      server_key: [''],
      gcm_end_point: [
        this.notificationConfigurationData[1].value,
        Validators.required
      ],
      fcm_end_point: [
        this.notificationConfigurationData[2].value,
        Validators.required
      ]
    });
    this.initialNotificationConfiguration = this.notificationConfigurationForm.value;
  }

  /**
   * Submits the Notification configuration and updates the Notification configuration,
   * if successful redirects to view Notification configuration.
   */
  submit() {
    const notificationConfiguration = buildExternalServiceUpdate(
      this.initialNotificationConfiguration,
      this.notificationConfigurationForm.value,
      MASKED_EXTERNAL_SERVICE_PROPERTIES.NOTIFICATION
    );
    if (Object.keys(notificationConfiguration).length === 0) {
      this.router.navigate(['../'], { relativeTo: this.route });
      return;
    }
    this.systemService
      .updateExternalConfiguration('NOTIFICATION', notificationConfiguration)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Services */
import { SystemService } from '../../../system.service';

/**
 * Edit Configuration Component
 */
@Component({
  selector: 'mifosx-edit-configuration',
  templateUrl: './edit-configuration.component.html',
  styleUrls: ['./edit-configuration.component.scss']
})
export class EditConfigurationComponent implements OnInit {

  /** Minimum transaction date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum transaction date allowed. */
  maxDate = new Date();

  /** Global Configuration form. */
  configurationForm: FormGroup;
  /** Configuration. */
  configuration: any;

  /**
   * Retrieves the configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {SettingsService} settingsService Setting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
              private settingsService: SettingsService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { configuration: any }) => {
      this.configuration = data.configuration;
    });
  }

  /**
   * Creates and sets the configuration form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createConfigurationForm();
  }

  /**
   * Creates and sets the global configuration form.
   */
  createConfigurationForm() {
    this.configurationForm = this.formBuilder.group({
      'name': [{ value: this.configuration.name, disabled: true }, Validators.required],
      'description': [{ value: this.configuration.description, disabled: true }],
      'value': [this.configuration.value],
      'stringValue': [this.configuration.stringValue],
      'dateValue': [this.configuration.dateValue]
    });
  }

  /**
   * Submits the global configuration form and updates global configuration,
   * if successful redirects to view all global configurations.
   */
  submit() {
    if (this.configurationForm.value.value != null || this.configurationForm.value.stringValue != null || this.configurationForm.value.dateValue != null) {
      const payload = {
        ...this.configurationForm.value
      };
      if (this.configurationForm.value.dateValue != null) {
        payload.locale = this.settingsService.language.code;
        payload.dateFormat = this.settingsService.dateFormat;
      } else {
        delete payload.dateValue;
      }

      this.systemService
        .updateConfiguration(this.configuration.id, payload)
        .subscribe((response: any) => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
    }
  }

}

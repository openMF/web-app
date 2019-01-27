/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Edit Configuration Component
 */
@Component({
  selector: 'mifosx-edit-configuration',
  templateUrl: './edit-configuration.component.html',
  styleUrls: ['./edit-configuration.component.scss']
})
export class EditConfigurationComponent implements OnInit {

  /** Global Configuration form. */
  configurationForm: FormGroup;
  /** Configuration. */
  configuration: any;

  /**
   * Retrieves the configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
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
    this.createConfigurationForm();
  }

  /**
   * Creates and sets the global configuration form.
   */
  createConfigurationForm() {
    this.configurationForm = this.formBuilder.group({
      'name': [{ value: this.configuration.name, disabled: true }, Validators.required],
      'value': [this.configuration.value, Validators.required]
    });
  }

  /**
   * Submits the global configuration form and updates global configuration,
   * if successful redirects to view all global configurations.
   */
  submit() {
    this.systemService
      .updateConfiguration(this.configuration.id, this.configurationForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }

}

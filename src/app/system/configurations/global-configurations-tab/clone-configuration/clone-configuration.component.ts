import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { SystemService } from 'app/system/system.service';

@Component({
  selector: 'mifosx-clone-configuration',
  templateUrl: './clone-configuration.component.html',
  styleUrls: ['./clone-configuration.component.scss']
})
export class CloneConfigurationComponent implements OnInit {
  /** Global Configuration form. */
  configurationForm: FormGroup;
  /** Configuration. */
  configuration: any;

  listCountries: any = [];
  listCountriesSliced: any = [];
  configId: number;
  /**
   * Retrieves the configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor (
    private formBuilder: FormBuilder,
    private systemService: SystemService,
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService
  ) {
    this.route.data.subscribe((data: { configuration: any }) => {
      this.configuration = data.configuration;
      this.configId = this.configuration?.id;
    });
    this.getCountries();
  }

  /**
   * Creates and sets the configuration form.
   */
  ngOnInit () {
    this.createConfigurationForm();
  }

  /**
   * Creates and sets the global configuration form.
   */
  createConfigurationForm () {
    this.configurationForm = this.formBuilder.group({
      value: ['', Validators.required],
      countryId: [null, Validators.required],
      globalConfigId: [this.configId]
    });
  }

  getCountries () {
    this.organizationService.getCountries().subscribe(res => {
      this.listCountries = res;
      this.listCountriesSliced = this.listCountries;
    });
  }

    /*** filters the dropdown based on the search criteria */
  public isFiltered (country: any) {
    return this.listCountriesSliced.find(item => item.id === country.id);
  }
  /**
   * Submits the global configuration form and updates global configuration,
   * if successful redirects to view all global configurations.
   */
  submit () {
    this.systemService
      .cloneConfiguration(this.configuration.id, this.configurationForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}

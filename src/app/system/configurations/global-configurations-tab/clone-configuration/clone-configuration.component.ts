import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { SystemService } from 'app/system/system.service';

@Component({
  selector: 'mifosx-clone-configuration',
  templateUrl: './clone-configuration.component.html',
  styleUrls: ['./clone-configuration.component.scss']
})
export class CloneConfigurationComponent implements OnInit {

  private readonly configLevels: Record<string, any> = {
    "payment-channel": "payment-channel-ou-level"
  };

  /** Global Configuration form. */
  configurationForm: UntypedFormGroup;
  /** Configuration. */
  configuration: any;

  listCountries: any = [];
  listCountriesSliced: any = [];
  configId: number;
  offices: any[] = [];

  /**
   * Retrieves the configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor (
    private formBuilder: UntypedFormBuilder,
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
    let countryId = null;
    // Set the initial value for countryId if cloning a configuration with an office
    if (this.configuration.officeId) {
      countryId = this.configuration.country.id;
    }
    this.configurationForm = this.formBuilder.group({
      value: ['', !this.configuration.codeId ? Validators.required : null],
      countryId: [countryId, Validators.required],
      globalConfigId: [this.configId],
      codeValueId: [this.configuration.codeValueId, this.configuration.codeId ? Validators.required : null],
      officeId: [null]
    });
    // Populate the offices dropdown if countryId has been set above
    if (countryId) {
      this.onCountryChange(countryId);
    }
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

  /**
   * Populates the offices dropdown based on the selected country.
   * @param countryId Selected country ID.
   * @returns void
   */
  onCountryChange(countryId: number) {
    const levelConfig = this.configLevels[this.configuration.name];
    if (!levelConfig) return;

    // Clear existing office selection if the country changes
    if (this.configuration.country?.id != countryId) {
      this.configurationForm.get('officeId').reset();
    }
    this.organizationService.searchOffices({countryId, levelConfig}).subscribe(res => {
      this.offices = res;
    });
  }
}

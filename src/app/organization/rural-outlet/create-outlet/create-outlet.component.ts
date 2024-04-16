import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder,  FormGroup, Validators } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { CountryTreeViewComponent } from 'app/shared/country-tree-view/country-tree-view.component';
import DataFlattner from 'app/core/utils/data-flattner';

@Component({
  selector: 'mifosx-create-outlet',
  templateUrl: './create-outlet.component.html',
  styleUrls: ['./create-outlet.component.scss'],
})
export class CreateOutletComponent implements OnInit {
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  constructor(
    private formBuilder: FormBuilder,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private dateUtils: Dates
  ) {
    this.getCountries();
  }

  listCountries: any = [];
  listCountriesSliced: any = [];
  outletForm: FormGroup;
  treeDataSource: any = [];
  selectedOffices: any = [];
  @ViewChild(CountryTreeViewComponent) countryTreeComponent: CountryTreeViewComponent;

  ngOnInit(): void {
    this.outletForm = this.formBuilder.group({
      countryId: [null, Validators.required],
      name: ['', Validators.required],
      openingDate: ['', Validators.required],
      externalId: [''],
      offices: [this.selectedOffices],
    });
  }

  getCountries() {
    this.organizationService.getCountries().subscribe((res) => {
      this.listCountries = res;
      this.listCountriesSliced = this.listCountries;
    });
  }

  public isFiltered(country: any) {
    return this.listCountriesSliced.find(item => item.id === country.id);
  }

  search(event: any) {
    const countryId = event.id;
    this.organizationService.searchCountryById(countryId).subscribe((res: any) => {
      const data = res
        .filter((x) => x.status === true)
        .map((item: any) => ({
          name: item.name,
          id: item.id,
          parentId: item.parentId,
          checked: false,
        }));
      this.treeDataSource = DataFlattner.flatToHierarchy(data);
      this.countryTreeComponent?.refreshDataSource(this.treeDataSource);
    });
  }

  getCheckedOffices(event: any) {
    this.selectedOffices = event;
  }

  submit() {
    const outletFormData = this.outletForm.value;

    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevOpenedOn: Date = this.outletForm.value.openingDate;
    if (outletFormData.openingDate instanceof Date) {
      outletFormData.openingDate = this.dateUtils.formatDate(prevOpenedOn, dateFormat);
    }

    const data = {
      ...outletFormData,
      dateFormat,
      locale,
    };
    if (this.selectedOffices && this.selectedOffices.length > 0) {
      const offices = this.selectedOffices.map((x) => {
        const officeId = {officeId: x.id};
        return officeId;
      });
      data.offices = offices;
    }

    if (!data.externalId) {
      delete data.externalId;
    }
    this.organizationService.createOutlet(data).subscribe((resp) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}

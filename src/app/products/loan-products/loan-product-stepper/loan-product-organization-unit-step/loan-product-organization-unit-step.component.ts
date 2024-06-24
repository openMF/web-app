import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

/** Custom Services */
import { ProductsService } from '../../../products.service';
import { OrganizationService } from 'app/organization/organization.service';
import { CountryTreeViewComponent } from 'app/shared/country-tree-view/country-tree-view.component';
import DataFlattner from 'app/core/utils/data-flattner';
import { Router } from '@angular/router';
import { AlertService } from 'app/core/alert/alert.service';

@Component({
  selector: 'mifosx-loan-product-organization-unit-step',
  templateUrl: './loan-product-organization-unit-step.component.html',
  styleUrls: ['./loan-product-organization-unit-step.component.scss'],
})
export class LoanProductOrganizationUnitStepComponent implements OnInit {
  @Input() loanProductsTemplate: any;
  @Input() loanProduct: any;
  @ViewChild(CountryTreeViewComponent) countryTreeComponent: CountryTreeViewComponent;

  countries: any = [];
  countriesDataSliced: any = [];
  loanProductOrganizationForm: UntypedFormGroup;
  treeDataSource: any = [];
  selectedUnits: any = [];
  data: any;
  isCountryHasActiveCurrency: boolean = false;
  countryId: any;
  countryName: any;

  // loan terms and condition templates
  enableTermsAndConditions: boolean = false;
  loanProductTemplates: any = [];

  isQualificationRequired: boolean = false;

  loanProductTemplateForm: UntypedFormGroup;

  constructor(
    private productsService: ProductsService,
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.getCountries();
  }

  ngOnInit(): void {
    this.createLoanProductOrganizationForm();

    if (this.router.url.includes('edit')) {
      this.search(this.loanProductsTemplate.countryId);
    }

    this.loanProductOrganizationForm.patchValue({
      countryId: this.loanProductsTemplate.countryId,
      officeIds: this.loanProductsTemplate.offices?.officeId,
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      installmentAmountInMultiplesOf: 1,
    });
  }

  getCountries() {
    this.productsService.getCountries().subscribe((response: any) => {
      this.countries = response;
      this.countriesDataSliced = this.countries;
    });
  }

  public isFiltered(country: any) {
    return this.countriesDataSliced.find((item) => item.id === country.id);
  }

  search(event: any) {
    if (!event.id) {
      this.countryId = this.loanProductsTemplate.countryId;
    } else {
      this.countryId = event.id;
      this.productsService.countryId = event.id;
    }
    this.organizationService.getCountry(this.countryId).subscribe((res: any) => {
      this.countryName = res.name;
      if (res.hasOwnProperty('activeCurrency') && res.activeCurrency.code) {
        this.isCountryHasActiveCurrency = true;
        this.loanProductOrganizationForm.patchValue({ currencyCode: res.activeCurrency.code });
      } else {
        this.isCountryHasActiveCurrency = false;
        this.loanProductOrganizationForm.patchValue({ currencyCode: '' });
        this.alertService.alert({
          type: 'Source Country Currency Required',
          message: `Please contact your administrator to add a currency for this country ${this.countryName}`,
        });
      }
    });

    this.organizationService.searchCountryById(this.countryId).subscribe((res: any) => {
      if (this.router.url.includes('edit')) {
        this.data = res
          .filter((x) => x.status === true)
          .map((item: any) => ({
            name: item.name,
            id: item.id,
            parentId: item.parentId,
            checked: this.loanProductsTemplate.offices.filter((c) => c.officeId === item.id)?.length > 0 ? true : false,
          }));
      } else {
        this.data = res
          .filter((x) => x.status === true)
          .map((item: any) => ({
            name: item.name,
            id: item.id,
            parentId: item.parentId,
            checked: false,
          }));
      }
      this.treeDataSource = DataFlattner.flatToHierarchy(this.data);
      this.countryTreeComponent?.deselectAllNodes();
      this.countryTreeComponent?.refreshDataSource(this.treeDataSource);
    });

    this.productsService.getLoanProductWithCountryOptions(this.countryId).subscribe((res: any) => {
      this.enableTermsAndConditions = res.configurations?.enableTermsAndConditions;
      this.productsService.enableTermsAndConditions = this.enableTermsAndConditions;
      this.isQualificationRequired = res.configurations?.isQualificationRequired;
      this.loanProductTemplates = res.loanProductTemplates;
      this.productsService.isQualificationRequired = this.isQualificationRequired;
      this.loanProductTemplateForm.patchValue({
        loanProductTemplates: this.loanProductTemplates,
        enableTermsAndConditions: this.enableTermsAndConditions,
      });
    });
  }

  getCheckedUnits(event: any) {
    this.selectedUnits = event;
  }

  createLoanProductOrganizationForm() {
    this.loanProductOrganizationForm = this.formBuilder.group({
      countryId: ['', Validators.required],
      officeIds: [this.selectedUnits],
      currencyCode: ['', Validators.required],
      digitsAfterDecimal: ['', Validators.required],
      inMultiplesOf: ['', Validators.required],
      installmentAmountInMultiplesOf: ['', Validators.required],
    });
    this.loanProductTemplateForm = this.formBuilder.group({
      loanProductTemplates: [''],
      enableTermsAndConditions: false,
    });
  }

  get loanProductOrganization() {
    const loanProductOrganizationFormData = this.loanProductOrganizationForm.value;
    if (this.selectedUnits && this.selectedUnits.length > 0) {
      const offices = this.selectedUnits.map((x) => {
        const officeId = x.id;
        return officeId;
      });
      loanProductOrganizationFormData.officeIds = offices;
    }
    return loanProductOrganizationFormData;
  }
}

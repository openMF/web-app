import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { ProductsService } from 'app/products/products.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'mifosx-saving-product-details-step',
  templateUrl: './saving-product-details-step.component.html',
  styleUrls: ['./saving-product-details-step.component.scss'],
})
export class SavingProductDetailsStepComponent implements OnInit {
  @Input() savingProductsTemplate: any;

  countriesData: any;
  loanProductsData: any;
  isLinkedToLoanProduct: boolean = false;

  savingProductDetailsForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private productsService: ProductsService
  ) {
    this.createSavingProductDetailsForm();
    this.getCountries();
    this.getLoanProducts();
  }

  ngOnInit() {
    if (this.savingProductsTemplate) {
      this.isLinkedToLoanProduct = !!this.savingProductsTemplate.loanProductId;
      this.savingProductDetailsForm.patchValue({
        name: this.savingProductsTemplate.name,
        shortName: this.savingProductsTemplate.shortName,
        description: this.savingProductsTemplate.description,
        countryId: this.savingProductsTemplate.countryId,
        savingsLoanProductId: this.savingProductsTemplate.loanProductId,
      });
    } else {
      let countryId = JSON.parse(sessionStorage.getItem('selectedCountry'))?.id;
      if (countryId) {
        this.savingProductDetailsForm.patchValue({
          countryId: countryId,
        });
      }
    }
  }

  createSavingProductDetailsForm() {
    this.savingProductDetailsForm = this.formBuilder.group({
      name: ['', Validators.required],
      shortName: ['', Validators.required],
      description: [''],
      countryId: [''],
      savingsLoanProductId: [''],
    });
  }

  get savingProductDetails() {
    return this.savingProductDetailsForm.value;
  }

  getCountries() {
    this.organizationService.getCountries().subscribe((response: any) => {
      this.countriesData = response;
    });
  }

  getLoanProducts() {
    let countryId = JSON.parse(sessionStorage.getItem('selectedCountry'))?.id;
    let loanProductsObs: Observable<any>;
    if (countryId) {
      loanProductsObs = this.productsService.getLoanProductWithCountryId(countryId);
    } else {
      loanProductsObs = this.productsService.getLoanProducts();
    }

    loanProductsObs.subscribe((data: any) => {
      this.loanProductsData = data;
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';


import { OrganizationService } from 'app/organization/organization.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'mifosx-create-currencies',
  templateUrl: './create-currencies.component.html',
  styleUrls: ['./create-currencies.component.scss']
})
export class CreateCurrenciesComponent implements OnInit {

  /** Currency form. */
  currencyForm: FormGroup;
  currencyTemplateData: any;

  countries: any = [];
  countriesDataSliced: any = [];
  currencyDataSliced: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
      this.route.data.subscribe((data: { currencies: any }) => {
        this.currencyTemplateData = data.currencies;
        this.currencyDataSliced = this.currencyTemplateData.currencyOptions;
      });
      this.getCountries();
  }

  ngOnInit(): void {
    this.createCurrencyForm();
  }

  createCurrencyForm() {
    this.currencyForm = this.formBuilder.group({
      active: [false],
      countryId: ['', Validators.required],
      currencyCode: ['', Validators.required]
    });
  }

  submit() {
    const currencyFormData = this.currencyForm.value;
    this.organizationService.createCurrencies(currencyFormData).subscribe((resp) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

  getCountries() {
    this.organizationService.getCountries().subscribe((response: any) => {
      this.countries = response;
      this.countriesDataSliced = this.countries;
    });
  }

  isFiltered(country: any) {
    return this.countriesDataSliced.find((item) => item.id === country.id);
  }

  isCurrencyFiltered(currency: any) {
    return this.currencyDataSliced.find((item) => item.code === currency.code);
  }

}

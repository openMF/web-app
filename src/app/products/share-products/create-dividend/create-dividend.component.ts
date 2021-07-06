/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services. */
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';


/**
 * Create Dividend component.
 */
@Component({
  selector: 'mifosx-create-dividend',
  templateUrl: './create-dividend.component.html',
  styleUrls: ['./create-dividend.component.scss']
})
export class CreateDividendComponent implements OnInit {

  /** Create Dividend Form. */
  createDividendForm: FormGroup;
  /** Share Product data. */
  shareProductData: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * Get Share Product data from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {DatePipe} datePipe Date Pipe to format date.
   * @param {ProductsService} productsService Products Service.
   * @param {Router} router Router.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private productService: ProductsService,
              private router: Router,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { shareProduct: any }) => {
      this.shareProductData = data.shareProduct;
    });
  }

  ngOnInit() {
    this.setDividendForm();
  }

  /**
   * Sets Create Dividend from.
   */
  setDividendForm() {
    this.createDividendForm = this.formBuilder.group({
      'dividendPeriodStartDate': ['', Validators.required],
      'dividendPeriodEndDate': ['', Validators.required],
      'dividendAmount': ['', Validators.required]
    });
  }

  /**
   * Submits Create Dividend form.
   */
  submit() {
    const dateFormat = this.settingsService.dateFormat;
    const startDate = this.createDividendForm.value.dividendPeriodStartDate;
    const endDate = this.createDividendForm.value.dividendPeriodEndDate;
    this.createDividendForm.patchValue({
      'dividendPeriodStartDate': this.datePipe.transform(startDate, dateFormat),
      'dividendPeriodEndDate': this.datePipe.transform(endDate, dateFormat)
    });
    const dividendForm = this.createDividendForm.value;
    dividendForm.locale = this.settingsService.language.code;
    dividendForm.dateFormat = dateFormat;
    this.productService.createDividend(this.shareProductData.id, dividendForm).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}

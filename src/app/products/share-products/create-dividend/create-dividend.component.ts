/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

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
  createDividendForm: UntypedFormGroup;
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
   * @param {Dates} dateUtils Date Utils to format date.
   * @param {ProductsService} productsService Products Service.
   * @param {Router} router Router.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private dateUtils: Dates,
              private productService: ProductsService,
              private router: Router,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { shareProduct: any }) => {
      this.shareProductData = data.shareProduct;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const createDividendFormData = this.createDividendForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevStartDate: Date = this.createDividendForm.value.dividendPeriodStartDate;
    const prevEndDate: Date = this.createDividendForm.value.dividendPeriodEndDate;
    if (createDividendFormData.dividendPeriodStartDate instanceof Date) {
      createDividendFormData.dividendPeriodStartDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    if (createDividendFormData.dividendPeriodEndDate instanceof Date) {
      createDividendFormData.dividendPeriodEndDate = this.dateUtils.formatDate(prevEndDate, dateFormat);
    }
    const data = {
      ...createDividendFormData,
      dateFormat,
      locale
    };
    this.productService.createDividend(this.shareProductData.id, data).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}

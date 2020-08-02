/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services. */
import { ProductsService } from 'app/products/products.service';

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
   * @param {Router} router Router.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private productService: ProductsService,
              private router: Router) {
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
    const dateFormat = 'yyyy-MM-dd';
    const startDate = this.createDividendForm.value.dividendPeriodStartDate;
    const endDate = this.createDividendForm.value.dividendPeriodEndDate;
    this.createDividendForm.patchValue({
      'dividendPeriodStartDate': this.datePipe.transform(startDate, dateFormat),
      'dividendPeriodEndDate': this.datePipe.transform(endDate, dateFormat)
    });
    const dividendForm = this.createDividendForm.value;
    dividendForm.locale = 'en';
    dividendForm.dateFormat = dateFormat;
    this.productService.createDividend(this.shareProductData.id, dividendForm).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}

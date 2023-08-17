/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';
import { ProductsService } from 'app/products/products.service';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-loan-product-details-step',
  templateUrl: './loan-product-details-step.component.html',
  styleUrls: ['./loan-product-details-step.component.scss']
})
export class LoanProductDetailsStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;
  @Output() loanType = new EventEmitter();

  loanProductDetailsForm: FormGroup;

  loanId: any;

  minDate = new Date(2000, 0, 1);
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

  loanTypes: any = [];

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {Dates} dateUtils Date Utils.
   * @param {SettingsService} settingsService Settings Service.
   */

  constructor(private formBuilder: FormBuilder,
              private dateUtils: Dates,
              private settingsService: SettingsService,
              private productService: ProductsService) {
    this.createLoanProductDetailsForm();
    this.getLoanTypes();
  }

  ngOnInit() {

    this.loanProductDetailsForm.patchValue({
      'name': this.loanProductsTemplate.name,
      'shortName': this.loanProductsTemplate.shortName,
      'description': this.loanProductsTemplate.description,
      'startDate': this.loanProductsTemplate.startDate && new Date(this.loanProductsTemplate.startDate),
      'closeDate': this.loanProductsTemplate.closeDate && new Date(this.loanProductsTemplate.closeDate),
      'includeInBorrowerCycle': this.loanProductsTemplate.includeInBorrowerCycle,
      'loanTypeId': this.loanProductsTemplate.loanType?.id
    });
  }

  createLoanProductDetailsForm() {
    this.loanProductDetailsForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'shortName': ['', Validators.required],
      'description': [''],
      'startDate': [''],
      'closeDate': [''],
      'includeInBorrowerCycle': [false],
      'loanTypeId': ['', Validators.required]
    });
  }

  get loanProductDetails() {
    const loanProductDetailsFormData = this.loanProductDetailsForm.value;
    const prevStartDate: Date = this.loanProductDetailsForm.value.startDate;
    const prevCloseDate: Date = this.loanProductDetailsForm.value.closeDate;
    const dateFormat = this.settingsService.dateFormat;
    if (loanProductDetailsFormData.startDate instanceof Date) {
      loanProductDetailsFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat) || '';
    }
    if (loanProductDetailsFormData.closeDate instanceof Date) {
      loanProductDetailsFormData.closeDate = this.dateUtils.formatDate(prevCloseDate, dateFormat) || '';
    }
    return loanProductDetailsFormData;
  }

  selected(event: any, id: any) {
    this.productService.loanId = id;

  }

  getLoanTypes() {
    this.productService.getLoanTypes().subscribe((res) => {
      this.loanTypes = res;
    });
  }

}

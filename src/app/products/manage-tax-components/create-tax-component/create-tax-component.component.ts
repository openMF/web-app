/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
/** Custom Services */
import { ProductsService } from '../../../products/products.service';
import { DatePipe } from '@angular/common';

/**
 * View tax Component component.
 */
@Component({
  selector: 'mifosx-create-tax-component',
  templateUrl: './create-tax-component.component.html',
  styleUrls: ['./create-tax-component.component.scss']
})
export class CreateTaxComponentComponent implements OnInit {

  taxComponentForm: FormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

  /** tax Component Data. */
  accountData: any;

  /** Account type data. */
  accountTypeData: any;

  chartOfAccountsData: any;

  /**
   * Retrieves the tax Component data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private router: Router,
    private datePipe: DatePipe ) {

  }

  ngOnInit() {
    this.createTaxComponentForm();
    this.setTaxComponentForm();
    this.route.data.subscribe((data: { taxComponentTemplate: any }) => {
      this.chartOfAccountsData = data.taxComponentTemplate.glAccountOptions;
      this.accountTypeData = data.taxComponentTemplate.glAccountTypeOptions;
    });
  }

  /**
   * Creates the Office Form
   */
  createTaxComponentForm() {
    this.taxComponentForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'percentage': ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      'accountType': [''],
      'accountName': ['', ],
      'startDate': ['', ]
    });
  }

  /**
   * Sets gl account form for selected account type.
   */
  setTaxComponentForm() {
    this.taxComponentForm.get('accountType').valueChanges.subscribe(accountTypeId => {
      switch (accountTypeId) {
        case 1: this.accountData = this.chartOfAccountsData.assetAccountOptions;
        break;
        case 2: this.accountData = this.chartOfAccountsData.liabilityAccountOptions;
        break;
        case 3: this.accountData = this.chartOfAccountsData.equityAccountOptions;
        break;
        case 4: this.accountData = this.chartOfAccountsData.incomeAccountOptions;
        break;
        case 5: this.accountData = this.chartOfAccountsData.expenseAccountOptions;
        break;
      }
    });

  }
  /**
   * Submits the office form and creates office.
   * if successful redirects to offices
   */
  submit() {
    const prevStartDate: Date = this.taxComponentForm.value.startDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.taxComponentForm.patchValue({
      startDate: this.datePipe.transform(prevStartDate, dateFormat)
    });
    const taxComponent = {
      ...this.taxComponentForm.value,
      locale: 'en',
      dateFormat: dateFormat,
      creditAccountType: this.taxComponentForm.value.accountType,
      creditAcountId: this.taxComponentForm.value.accountName
    };
    delete taxComponent.accountType;
    delete taxComponent.accountName;

    this.productsService.createTaxComponent(taxComponent).subscribe(response => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}

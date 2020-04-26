/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Create Tax Component component.
 */
@Component({
  selector: 'mifosx-create-tax-component',
  templateUrl: './create-tax-component.component.html',
  styleUrls: ['./create-tax-component.component.scss']
})
export class CreateTaxComponentComponent implements OnInit {

  /** Minimum start date allowed. */
  minDate = new Date();
  /** Maximum start date allowed. */
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
  /** Tax Component form. */
  taxComponentForm: FormGroup;
  /** Tax Component template data. */
  taxComponentTemplateData: any;
  /** Credit Account Type data. */
  creditAccountTypeData: any;
  /** Credit Account data. */
  creditAccountData: any;
  /** Debit Account Type data. */
  debitAccountTypeData: any;
  /** Debit Account data. */
  debitAccountData: any;

  /**
   * Retrieves the tax Component template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(private formBuilder: FormBuilder,
              private productsService: ProductsService,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe) {
    this.route.data.subscribe(( data: { taxComponentTemplate: any }) => {
      this.taxComponentTemplateData = data.taxComponentTemplate;
    });
  }

  /**
   * Creates the tax Component form
   */
  ngOnInit() {
    this.createTaxComponentForm();
    this.setConditionalControls();
  }

  /**
   * Creates the tax Component form
   */
  createTaxComponentForm() {
    this.creditAccountTypeData = this.debitAccountTypeData = this.taxComponentTemplateData.glAccountTypeOptions;
    this.taxComponentForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'percentage': ['', [Validators.required, Validators.pattern('^(0*[1-9][0-9]*(\\.[0-9]+)?|0+\\.[0-9]*[1-9][0-9]*)$'), Validators.max(100)]],
      'creditAccountType': [''],
      'debitAccountType': [''],
      'startDate': ['', Validators.required],
    });
  }

  /**
   * Sets the conditional controls of the tax Component form
   */
  setConditionalControls() {
    this.taxComponentForm.get('debitAccountType').valueChanges.subscribe(debitAccountTypeId => {
      this.debitAccountData = this.getAccountsData(debitAccountTypeId);
      this.taxComponentForm.addControl('debitAcountId', new FormControl('', Validators.required));
    });
    this.taxComponentForm.get('creditAccountType').valueChanges.subscribe(creditAccountTypeId => {
      this.creditAccountData = this.getAccountsData(creditAccountTypeId);
      this.taxComponentForm.addControl('creditAcountId', new FormControl('', Validators.required));
    });
  }

  /**
   * @param {number} accountTypeId Account type ID of account type.
   * @returns {any} Accounts data
   */
  getAccountsData(accountTypeId: number) {
    switch (accountTypeId) {
      case 1:
        return this.taxComponentTemplateData.glAccountOptions.assetAccountOptions;
      case 2:
        return this.taxComponentTemplateData.glAccountOptions.liabilityAccountOptions;
      case 3:
        return this.taxComponentTemplateData.glAccountOptions.equityAccountOptions;
      case 4:
        return this.taxComponentTemplateData.glAccountOptions.incomeAccountOptions;
      case 5:
        return this.taxComponentTemplateData.glAccountOptions.expenseAccountOptions;
    }
  }

  /**
   * Submits the tax Component form and creates the tax Component,
   * if successful redirects to Tax Components.
   */
  submit() {
    const prevStartDate: Date = this.taxComponentForm.value.startDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.taxComponentForm.patchValue({
      startDate: this.datePipe.transform(prevStartDate, dateFormat)
    });
    const taxComponent = this.taxComponentForm.value;
    taxComponent.locale = 'en';
    taxComponent.dateFormat = dateFormat;
    this.productsService.createTaxComponent(taxComponent).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }
}

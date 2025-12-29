/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { ProductsService } from '../../products.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { GlAccountSelectorComponent } from '../../../shared/accounting/gl-account-selector/gl-account-selector.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Tax Component component.
 */
@Component({
  selector: 'mifosx-create-tax-component',
  templateUrl: './create-tax-component.component.html',
  styleUrls: ['./create-tax-component.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    GlAccountSelectorComponent
  ]
})
export class CreateTaxComponentComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);

  /** Minimum start date allowed. */
  minDate = new Date();
  /** Maximum start date allowed. */
  maxDate = new Date();
  /** Tax Component form. */
  taxComponentForm: UntypedFormGroup;
  /** Tax Component template data. */
  taxComponentTemplateData: any;
  /** Credit Account Type data. */
  creditAccountTypeData: any;
  /** Credit Account data. */
  creditAccountData: any[] = [];

  /**
   * Retrieves the tax Component template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils to format date.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor() {
    this.route.data.subscribe((data: { taxComponentTemplate: any }) => {
      this.taxComponentTemplateData = data.taxComponentTemplate;
    });
  }

  /**
   * Creates the tax Component form
   */
  ngOnInit() {
    this.minDate = this.settingsService.minAllowedDate;
    this.maxDate = this.settingsService.maxAllowedDate;
    this.createTaxComponentForm();
    this.setConditionalControls();
    const initialCreditAccountType = this.taxComponentForm.get('creditAccountType')?.value;
    if (initialCreditAccountType) {
      this.creditAccountData = this.getAccountsData(initialCreditAccountType);
      if (this.creditAccountData.length > 0) {
        this.taxComponentForm.get('creditAccountId').setValidators([Validators.required]);
        this.taxComponentForm.get('creditAccountId').updateValueAndValidity();
      }
    }
  }

  /**
   * Creates the tax Component form
   */
  createTaxComponentForm() {
    this.creditAccountTypeData = this.taxComponentTemplateData.glAccountTypeOptions;
    this.taxComponentForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ],
      percentage: [
        '',
        [
          Validators.required,
          Validators.pattern('^(0*[1-9][0-9]*(\\.[0-9]+)?|0+\\.[0-9]*[1-9][0-9]*)$'),
          Validators.max(100)
        ]
      ],
      creditAccountType: [''],
      creditAccountId: [''],
      startDate: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Sets the conditional controls of the tax Component form
   */
  setConditionalControls() {
    const creditAccountIdControl = this.taxComponentForm.get('creditAccountId');

    this.taxComponentForm.get('creditAccountType').valueChanges.subscribe((creditAccountTypeId) => {
      this.creditAccountData = this.getAccountsData(creditAccountTypeId);

      if (creditAccountTypeId && this.creditAccountData.length > 0) {
        creditAccountIdControl.setValidators([Validators.required]);
        creditAccountIdControl.updateValueAndValidity();
      } else {
        creditAccountIdControl.clearValidators();
        creditAccountIdControl.setValue('');
        creditAccountIdControl.updateValueAndValidity();
        this.creditAccountData = [];
      }
    });
  }

  /**
   * @param {number} accountTypeId Account type ID of account type.
   * @returns {any} Accounts data
   */
  getAccountsData(accountTypeId: number) {
    switch (accountTypeId) {
      case 1:
        return this.taxComponentTemplateData.glAccountOptions.assetAccountOptions || [];
      case 2:
        return this.taxComponentTemplateData.glAccountOptions.liabilityAccountOptions || [];
      case 3:
        return this.taxComponentTemplateData.glAccountOptions.equityAccountOptions || [];
      case 4:
        return this.taxComponentTemplateData.glAccountOptions.incomeAccountOptions || [];
      case 5:
        return this.taxComponentTemplateData.glAccountOptions.expenseAccountOptions || [];
      default:
        return [];
    }
  }

  getCreditAccountIdControl(): UntypedFormControl {
    return this.taxComponentForm.get('creditAccountId') as UntypedFormControl;
  }

  /**
   * Submits the tax Component form and creates the tax Component,
   * if successful redirects to Tax Components.
   */
  submit() {
    const formValues = this.taxComponentForm.getRawValue();
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;

    if (formValues.creditAccountType && !formValues.creditAccountId) {
      this.taxComponentForm.get('creditAccountId').markAsTouched();
      return;
    }

    let formattedStartDate: any = formValues.startDate;
    if (formValues.startDate instanceof Date) {
      formattedStartDate = this.dateUtils.formatDate(formValues.startDate, dateFormat);
    }

    const data: any = {
      name: formValues.name,
      percentage: formValues.percentage,
      startDate: formattedStartDate,
      dateFormat,
      locale
    };
    if (formValues.creditAccountType && formValues.creditAccountId) {
      data.creditAccountType = formValues.creditAccountType;
      data.creditAcountId = formValues.creditAccountId;
    }

    this.productsService.createTaxComponent(data).subscribe((response: any) => {
      this.router.navigate(
        [
          '../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}

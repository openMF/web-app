/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/** Custom Validators */
import { oneOfTheFieldsIsRequiredValidator } from '../one-of-the-fields-is-required.validator';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatCheckbox } from '@angular/material/checkbox';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create accounting rule component.
 */
@Component({
  selector: 'mifosx-create-rule',
  templateUrl: './create-rule.component.html',
  styleUrls: ['./create-rule.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatRadioGroup,
    MatRadioButton,
    MatCheckbox,
    CdkTextareaAutosize
  ]
})
export class CreateRuleComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private accountingService = inject(AccountingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);

  /** Accounting rule form. */
  accountingRuleForm: UntypedFormGroup;
  /** Office data. */
  officeData: any;
  /** GL Account data. */
  glAccountData: any;
  /** Debit tag data. */
  debitTagData: any;
  /** Credit tag data. */
  creditTagData: any;

  constructor() {
    this.route.data.subscribe((data: { accountingRulesTemplate: any }) => {
      this.officeData = data.accountingRulesTemplate.allowedOffices;
      this.glAccountData = data.accountingRulesTemplate.allowedAccounts;
      this.debitTagData = data.accountingRulesTemplate.allowedDebitTagOptions;
      this.creditTagData = data.accountingRulesTemplate.allowedCreditTagOptions;
    });
  }

  /**
   * Creates and sets accounting rules form.
   */
  ngOnInit() {
    this.createAccountingRuleForm();
    this.setAccountingRulesForm();
  }

  /**
   * Creates accounting rule form.
   */
  createAccountingRuleForm() {
    this.accountingRuleForm = this.formBuilder.group(
      {
        name: [
          '',
          Validators.required
        ],
        officeId: [
          '',
          Validators.required
        ],
        debitRuleType: ['fixedAccount'],
        accountToDebit: [''],
        debitTags: [''],
        allowMultipleDebitEntries: [''],
        creditRuleType: ['fixedAccount'],
        accountToCredit: [''],
        creditTags: [''],
        allowMultipleCreditEntries: [''],
        description: ['']
      },
      { validator: oneOfTheFieldsIsRequiredValidator }
    );
  }

  /**
   * Sets accounting rule form for selected accounting rule type.
   */
  setAccountingRulesForm() {
    this.accountingRuleForm.get('debitRuleType').valueChanges.subscribe((debitRuleType: string) => {
      if (debitRuleType === 'fixedAccount') {
        this.accountingRuleForm.get('debitTags').reset();
        this.accountingRuleForm.get('allowMultipleDebitEntries').reset();
      } else {
        this.accountingRuleForm.get('accountToDebit').reset();
        this.accountingRuleForm.get('allowMultipleDebitEntries').setValue(false);
      }
    });
    this.accountingRuleForm.get('creditRuleType').valueChanges.subscribe((creditRuleType: string) => {
      if (creditRuleType === 'fixedAccount') {
        this.accountingRuleForm.get('creditTags').reset();
        this.accountingRuleForm.get('allowMultipleCreditEntries').reset();
      } else {
        this.accountingRuleForm.get('accountToCredit').reset();
        this.accountingRuleForm.get('allowMultipleCreditEntries').setValue(false);
      }
    });
  }

  /**
   * Submits the accounting rule form and creates accounting rule,
   * if successful redirects to view created rule.
   */
  submit() {
    const accountingRule = this.accountingRuleForm.value;
    if (accountingRule.debitRuleType === 'fixedAccount') {
      delete accountingRule.debitTags;
      delete accountingRule.allowMultipleDebitEntries;
    } else {
      delete accountingRule.accountToDebit;
    }
    if (accountingRule.creditRuleType === 'fixedAccount') {
      delete accountingRule.creditTags;
      delete accountingRule.allowMultipleCreditEntries;
    } else {
      delete accountingRule.accountToCredit;
    }
    delete accountingRule.debitRuleType;
    delete accountingRule.creditRuleType;
    this.accountingService.createAccountingRule(accountingRule).subscribe({
      next: (response: any) => {
        this.router.navigate(
          [
            '../view',
            response.resourceId
          ],
          { relativeTo: this.route }
        );
      },
      error: (err) => {
        const duplicateMsg = this.translateService.instant('errors.accountingRule.duplicateName');
        if (
          err?.error?.defaultUserMessage?.includes('Duplicate entry') ||
          (typeof err?.error?.message === 'string' && err.error.message.includes('Duplicate entry')) ||
          (typeof err?.error === 'string' && err.error.includes('Duplicate entry'))
        ) {
          this.snackBar.open(duplicateMsg, 'Close', {
            duration: 7000,
            verticalPosition: 'top',
            horizontalPosition: 'right',
            panelClass: 'custom-snackbar-top-right'
          });
        } else {
          this.snackBar.open(
            err?.error?.defaultUserMessage || err?.error?.message || 'An error occurred. Please try again.',
            'Close',
            {
              duration: 7000,
              verticalPosition: 'top',
              horizontalPosition: 'right',
              panelClass: 'custom-snackbar-top-right'
            }
          );
        }
      }
    });
  }
}

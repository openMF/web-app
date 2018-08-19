/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/** Custom Validators */
import { oneOfTheFieldsIsRequiredValidator } from '../one-of-the-fields-is-required.validator';

/**
 * Create accounting rule component.
 */
@Component({
  selector: 'mifosx-create-rule',
  templateUrl: './create-rule.component.html',
  styleUrls: ['./create-rule.component.scss']
})
export class CreateRuleComponent implements OnInit {

  /** Accounting rule form. */
  accountingRuleForm: FormGroup;
  /** Office data. */
  officeData: any;
  /** GL Account data. */
  glAccountData: any;
  /** Debit tag data. */
  debitTagData: any;
  /** Credit tag data. */
  creditTagData: any;

  /**
   * Retrieves the offices, gl accounts, debit tags and credit tags data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router) {
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
    this.accountingRuleForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'officeId': ['', Validators.required],
      'debitRuleType': ['fixedAccount'],
      'accountToDebit': [''],
      'debitTags': [''],
      'allowMultipleDebitEntries': [''],
      'creditRuleType': ['fixedAccount'],
      'accountToCredit': [''],
      'creditTags': [''],
      'allowMultipleCreditEntries': [''],
      'description': ['']
    }, { validator: oneOfTheFieldsIsRequiredValidator });
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
    this.accountingService.createAccountingRule(accountingRule).subscribe((response: any) => {
      this.router.navigate(['../view', response.resourceId], { relativeTo: this.route });
    });
  }

}

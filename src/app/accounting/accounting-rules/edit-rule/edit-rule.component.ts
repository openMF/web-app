/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/** Custom Validators */
import { oneOfTheFieldsIsRequiredValidator } from '../one-of-the-fields-is-required.validator';

/**
 * Edit accounting rule component.
 */
@Component({
  selector: 'mifosx-edit-rule',
  templateUrl: './edit-rule.component.html',
  styleUrls: ['./edit-rule.component.scss']
})
export class EditRuleComponent implements OnInit {

  /** Accounting rule form. */
  accountingRuleForm: FormGroup;
  /** Accounting rule. */
  accountingRule: any;
  /** Office data. */
  officeData: any;
  /** GL Account data. */
  glAccountData: any;
  /** Debit tag data. */
  debitTagData: any;
  /** Credit tag data. */
  creditTagData: any;

  /**
   * Retrieves the offices, gl accounts, debit tags, credit tags and accounting rule data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: {
        accountingRulesTemplate: any,
        accountingRule: any
      }) => {
        this.officeData = data.accountingRulesTemplate.allowedOffices;
        this.glAccountData = data.accountingRulesTemplate.allowedAccounts;
        this.debitTagData = data.accountingRulesTemplate.allowedDebitTagOptions;
        this.creditTagData = data.accountingRulesTemplate.allowedCreditTagOptions;
        this.accountingRule = data.accountingRule;
      });
  }

  /**
   * Creates and sets accounting rule form.
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
      'name': [this.accountingRule.name, Validators.required],
      'officeId': [this.accountingRule.officeId, Validators.required],
      'debitRuleType': [''],
      'accountToDebit': [''],
      'debitTags': [''],
      'allowMultipleDebitEntries': [''],
      'creditRuleType': [''],
      'accountToCredit': [''],
      'creditTags': [''],
      'allowMultipleCreditEntries': [''],
      'description': [this.accountingRule.description]
    }, { validator: oneOfTheFieldsIsRequiredValidator });
  }

  /**
   * Sets accounting rule form for selected accounting rule type.
   */
  setAccountingRulesForm() {
    this.accountingRuleForm.get('debitRuleType').valueChanges.subscribe(debitRuleType => {
      if (debitRuleType === 'fixedAccount') {
        this.accountingRuleForm.get('debitTags').reset();
        this.accountingRuleForm.get('allowMultipleDebitEntries').reset();
      } else {
        this.accountingRuleForm.get('accountToDebit').reset();
        this.accountingRuleForm.get('allowMultipleDebitEntries').setValue(false);
      }
    });
    this.accountingRuleForm.get('creditRuleType').valueChanges.subscribe(creditRuleType => {
      if (creditRuleType === 'fixedAccount') {
        this.accountingRuleForm.get('creditTags').reset();
        this.accountingRuleForm.get('allowMultipleCreditEntries').reset();
      } else {
        this.accountingRuleForm.get('accountToCredit').reset();
        this.accountingRuleForm.get('allowMultipleCreditEntries').setValue(false);
      }
    });

    if (this.accountingRule.debitAccounts) {
      this.accountingRuleForm.get('debitRuleType').setValue('fixedAccount');
      this.accountingRuleForm.get('accountToDebit').setValue(this.accountingRule.debitAccounts[0].id);
    } else {
      this.accountingRuleForm.get('debitRuleType').setValue('listOfAccounts');
      this.accountingRuleForm.get('debitTags').setValue(this.accountingRule.debitTags.map((debitTag: any) => debitTag.tag.id));
      this.accountingRuleForm.get('allowMultipleDebitEntries').setValue(this.accountingRule.allowMultipleDebitEntries);
    }

    if (this.accountingRule.creditAccounts) {
      this.accountingRuleForm.get('creditRuleType').setValue('fixedAccount');
      this.accountingRuleForm.get('accountToCredit').setValue(this.accountingRule.creditAccounts[0].id);
    } else {
      this.accountingRuleForm.get('creditRuleType').setValue('listOfAccounts');
      this.accountingRuleForm.get('creditTags').setValue(this.accountingRule.creditTags.map((creditTag: any) => creditTag.tag.id));
      this.accountingRuleForm.get('allowMultipleCreditEntries').setValue(this.accountingRule.allowMultipleCreditEntries);
    }
  }

  /**
   * Submits the accounting rule form and updates accounting rule,
   * if successful redirects to view updated rule.
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
    this.accountingService.updateAccountingRule(this.accountingRule.id, accountingRule).subscribe((response: any) => {
      this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}

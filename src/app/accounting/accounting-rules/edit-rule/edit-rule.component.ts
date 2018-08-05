import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AccountingService } from '../../accounting.service';

const oneOfTheFieldsIsRequiredValidator: ValidatorFn = (accountingRuleForm: FormGroup): ValidationErrors | null => {
  const accountToDebit = accountingRuleForm.controls.accountToDebit.value;
  const debitTags = accountingRuleForm.controls.debitTags.value;
  const accountToCredit = accountingRuleForm.controls.accountToCredit.value;
  const creditTags = accountingRuleForm.controls.creditTags.value;
  return ((accountToDebit || debitTags) && (accountToCredit || creditTags)) ? null : { 'error': true };
};

@Component({
  selector: 'mifosx-edit-rule',
  templateUrl: './edit-rule.component.html',
  styleUrls: ['./edit-rule.component.scss']
})
export class EditRuleComponent implements OnInit {

  accountingRuleForm: FormGroup;
  accountingRule: any;
  officeData: any;
  glAccountData: any;
  debitTagData: any;
  creditTagData: any;

  constructor(private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private router: Router) {
    this.route.data.subscribe((data: { accountingRule: any }) => {
      this.accountingRule = data.accountingRule;
    });
  }

  ngOnInit() {
    this.createAccountingRulesForm();
    this.getAccountingRulesTemplate();
    this.setAccountingRulesForm();
  }

  createAccountingRulesForm() {
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

  setAccountingRulesForm() {
    this.accountingRuleForm.get('debitRuleType').valueChanges.subscribe(debitRuleType => {
      if (debitRuleType === 'fixedAccount') {
        this.accountingRuleForm.get('debitTags').reset();
        this.accountingRuleForm.get('allowMultipleDebitEntries').reset();
      } else {
        this.accountingRuleForm.get('allowMultipleDebitEntries').setValue(false);
      }
    });
    this.accountingRuleForm.get('creditRuleType').valueChanges.subscribe(creditRuleType => {
      if (creditRuleType === 'fixedAccount') {
        this.accountingRuleForm.get('creditTags').reset();
        this.accountingRuleForm.get('allowMultipleCreditEntries').reset();
      } else {
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

  getAccountingRulesTemplate() {
    this.accountingService.getAccountingRulesTemplate().subscribe((accountingRulesData: any) => {
      this.officeData = accountingRulesData.allowedOffices;
      this.glAccountData = accountingRulesData.allowedAccounts;
      this.debitTagData = accountingRulesData.allowedDebitTagOptions;
      this.creditTagData = accountingRulesData.allowedCreditTagOptions;
    });
  }

  submit() {
    const accountingRule = this.accountingRuleForm.value;
    delete accountingRule.debitRuleType;
    delete accountingRule.creditRuleType;
    this.accountingService.updateAccountingRule(this.accountingRule.id, accountingRule).subscribe((response: any) => {
      this.router.navigate(['/accounting/accounting-rules/view', response.resourceId]);
    });
  }

}

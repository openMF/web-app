import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';

import { AccountingService } from '../../accounting.service';

const oneOfTheFieldsIsRequiredValidator: ValidatorFn = (accountingRuleForm: FormGroup): ValidationErrors | null => {
  const accountToDebit = accountingRuleForm.controls.accountToDebit.value;
  const debitTags = accountingRuleForm.controls.debitTags.value;
  const accountToCredit = accountingRuleForm.controls.accountToCredit.value;
  const creditTags = accountingRuleForm.controls.creditTags.value;
  return ((accountToDebit || debitTags) && (accountToCredit || creditTags)) ? null : { 'error': true };
};

@Component({
  selector: 'mifosx-create-rule',
  templateUrl: './create-rule.component.html',
  styleUrls: ['./create-rule.component.scss']
})
export class CreateRuleComponent implements OnInit {

  accountingRuleForm: FormGroup;
  officeData: any;
  glAccountData: any;
  debitTagData: any;
  creditTagData: any;

  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService) { }

  ngOnInit() {
    this.createAccountingRulesForm();
    this.getAccountingRulesTemplate();
    this.setAccountingRulesForm();
  }

  createAccountingRulesForm() {
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
    this.accountingService.createAccountingRule(accountingRule).subscribe((response: any) => {
      console.log(response);
    });
  }

}

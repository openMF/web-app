import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountingService } from '../accounting.service';

@Component({
  selector: 'mifosx-frequent-postings',
  templateUrl: './frequent-postings.component.html',
  styleUrls: ['./frequent-postings.component.scss']
})
export class FrequentPostingsComponent implements OnInit {

  // TODO: Validations
  // https://github.com/openMF/incubator-fineract/blob/master/fineract-provider/src/main/java/org/apache/fineract/accounting/journalentry/exception/JournalEntryInvalidException.java

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  frequentPostingsForm: FormGroup;
  officeData: any;
  accountingRuleData: any;
  currencyData: any;
  paymentTypeData: any;
  debitAccountData: any;
  creditAccountData: any;

  allowMultipleCreditEntries: boolean;
  allowMultipleDebitEntries: boolean;

  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private router: Router) { }

  ngOnInit() {
    this.createFrequentPostingsForm();
    this.setAffectedGLEntryForm();
    this.getOffices();
    this.getAccountingRules();
    this.getCurrencies();
    this.getPaymentTypes();
  }

  createFrequentPostingsForm() {
    this.frequentPostingsForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'accountingRule': ['', Validators.required],
      'currencyCode': ['', Validators.required],
      'debits': this.formBuilder.array([]),
      'credits': this.formBuilder.array([]),
      'referenceNumber': [''],
      'transactionDate': ['', Validators.required],
      'paymentTypeId': [''],
      'accountNumber': [''],
      'checkNumber': [''],
      'routingCode': [''],
      'receiptNumber': [''],
      'bankNumber': [''],
      'comments': ['']
    });
  }

  setAffectedGLEntryForm() {
    this.frequentPostingsForm.get('accountingRule').valueChanges.subscribe(accountingRule => {
      const debits = this.frequentPostingsForm.get('debits') as FormArray;
      const credits = this.frequentPostingsForm.get('credits') as FormArray;
      while (debits.length) {
        debits.removeAt(0);
      }
      while (credits.length) {
        credits.removeAt(0);
      }
      this.allowMultipleDebitEntries = accountingRule.allowMultipleDebitEntries;
      this.allowMultipleCreditEntries = accountingRule.allowMultipleCreditEntries;
      this.debitAccountData = accountingRule.debitAccounts;
      this.creditAccountData = accountingRule.creditAccounts;
      this.addAffectedGLEntry(debits);
      this.addAffectedGLEntry(credits);
    });
  }

  createAffectedGLEntryForm(): FormGroup {
    return this.formBuilder.group({
      'glAccountId': ['', Validators.required],
      'amount': ['', Validators.required]
    });
  }

  getFormArrayData(type: string): FormArray {
    return <FormArray>this.frequentPostingsForm.get(type);
  }

  addAffectedGLEntry(affectedGLEntryFormArray: FormArray) {
    affectedGLEntryFormArray.push(this.createAffectedGLEntryForm());
  }

  removeAffectedGLEntry(affectedGLEntryFormArray: FormArray, index: number) {
    affectedGLEntryFormArray.removeAt(index);
  }

  getOffices() {
    this.accountingService.getOffices().subscribe(officeData => {
      this.officeData = officeData;
    });
  }

  getAccountingRules() {
    this.accountingService.getAccountingRules().subscribe(accountingRuleData => {
      this.accountingRuleData = accountingRuleData;
    });
  }

  getCurrencies() {
    this.accountingService.getCurrencies().subscribe(currencyData => {
      this.currencyData = currencyData.selectedCurrencyOptions;
    });
  }

  getPaymentTypes() {
    this.accountingService.getPaymentTypes().subscribe(paymentTypeData => {
      this.paymentTypeData = paymentTypeData;
    });
  }

  submit() {
    const journalEntry = this.frequentPostingsForm.value;
    journalEntry.accountingRule = journalEntry.accountingRule.id;
    // TODO: Update once language and date settings are setup
    journalEntry.locale = 'en';
    journalEntry.dateFormat = 'dd MMMM yyyy';
    journalEntry.transactionDate = '20 July 2018';
    this.accountingService.createJournalEntry(journalEntry).subscribe(response => {
      this.router.navigate(['/accounting/transactions/view', response.transactionId]);
    });
  }

}

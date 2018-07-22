import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountingService } from '../accounting.service';

@Component({
  selector: 'mifosx-create-journal-entry',
  templateUrl: './create-journal-entry.component.html',
  styleUrls: ['./create-journal-entry.component.scss']
})
export class CreateJournalEntryComponent implements OnInit {

  // TODO: Validations

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  journalEntryForm: FormGroup;
  officeData: any;
  currencyData: any;
  paymentTypeData: any;
  glAccountData: any;

  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private router: Router) { }

  ngOnInit() {
    this.createJournalEntryForm();
    this.getOffices();
    this.getCurrencies();
    this.getPaymentTypes();
    this.getGlAccounts();
  }

  createJournalEntryForm() {
    this.journalEntryForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'currencyCode': ['', Validators.required],
      'debits': this.formBuilder.array([this.createAffectedGLEntryForm()]),
      'credits': this.formBuilder.array([this.createAffectedGLEntryForm()]),
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

  createAffectedGLEntryForm(): FormGroup {
    return this.formBuilder.group({
      'glAccountId': ['', Validators.required],
      'amount': ['', Validators.required]
    });
  }

  getFormArrayData(type: string): FormArray {
    return <FormArray>this.journalEntryForm.get(type);
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

  getGlAccounts() {
    this.accountingService.getGlAccounts().subscribe(glAccountData => {
      this.glAccountData = glAccountData;
    });
  }

  submit() {
    const journalEntry = this.journalEntryForm.value;
    // TODO: Update once language and date settings are setup
    journalEntry.locale = 'en';
    journalEntry.dateFormat = 'dd MMMM yyyy';
    journalEntry.transactionDate = '20 July 2018';
    this.accountingService.createJournalEntry(journalEntry).subscribe(response => {
      this.router.navigate(['/accounting/transactions/view', response.transactionId]);
    });
  }

}

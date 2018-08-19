/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Frequent Postings component.
 */
@Component({
  selector: 'mifosx-frequent-postings',
  templateUrl: './frequent-postings.component.html',
  styleUrls: ['./frequent-postings.component.scss']
})
export class FrequentPostingsComponent implements OnInit {

  /** Minimum transaction date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum transaction date allowed. */
  maxDate = new Date();
  /** Frequent postings form. */
  frequentPostingsForm: FormGroup;
  /** Office data. */
  officeData: any;
  /** Accounting rule data. */
  accountingRuleData: any;
  /** Currency data. */
  currencyData: any;
  /** Payment type data. */
  paymentTypeData: any;
  /** Debit account data. */
  debitAccountData: any;
  /** Credit account data. */
  creditAccountData: any;
  /** True if multiple credit entries are allowed. */
  allowMultipleCreditEntries: boolean;
  /** True if multiple debit entries are allowed. */
  allowMultipleDebitEntries: boolean;

  /**
   * Retrieves the offices, accounting rules, currencies and payment types data from `resolve`.
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
        offices: any,
        accountingRules: any,
        currencies: any,
        paymentTypes: any
      }) => {
        this.officeData = data.offices;
        this.accountingRuleData = data.accountingRules;
        this.currencyData = data.currencies.selectedCurrencyOptions;
        this.paymentTypeData = data.paymentTypes;
      });
  }

  /**
   * Creates the frequent postings form and sets the affected gl entry form array.
   */
  ngOnInit() {
    this.createFrequentPostingsForm();
    this.setAffectedGLEntryForm();
  }

  /**
   * Creates the frequent postings form.
   */
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

  /**
   * Sets the affected gl entry form array.
   */
  setAffectedGLEntryForm() {
    this.frequentPostingsForm.get('accountingRule').valueChanges.subscribe(accountingRule => {
      while (this.debits.length) {
        this.debits.removeAt(0);
      }
      while (this.credits.length) {
        this.credits.removeAt(0);
      }
      this.allowMultipleDebitEntries = accountingRule.allowMultipleDebitEntries;
      this.allowMultipleCreditEntries = accountingRule.allowMultipleCreditEntries;
      this.debitAccountData = accountingRule.debitAccounts;
      this.creditAccountData = accountingRule.creditAccounts;
      this.addAffectedGLEntry(this.debits);
      this.addAffectedGLEntry(this.credits);
    });
  }

  /**
   * Creates the affected gl entry form.
   * @returns {FormGroup} Affected gl entry form.
   */
  createAffectedGLEntryForm(): FormGroup {
    return this.formBuilder.group({
      'glAccountId': ['', Validators.required],
      'amount': ['', Validators.required]
    });
  }

  /**
   * Gets the affected gl entry (debits) form array.
   * @returns {FormArray} Debits form array.
   */
  get debits(): FormArray {
    return this.frequentPostingsForm.get('debits') as FormArray;
  }

  /**
   * Gets the affected gl entry (credits) form array.
   * @returns {FormArray} Credits form array.
   */
  get credits(): FormArray {
    return this.frequentPostingsForm.get('credits') as FormArray;
  }

  /**
   * Adds the affected gl entry form to given affected gl entry form array.
   * @param {FormArray} affectedGLEntryFormArray Given affected gl entry form array (debit/credit).
   */
  addAffectedGLEntry(affectedGLEntryFormArray: FormArray) {
    affectedGLEntryFormArray.push(this.createAffectedGLEntryForm());
  }

  /**
   * Removes the affected gl entry form from given affected gl entry form array at given index.
   * @param {FormArray} affectedGLEntryFormArray Given affected gl entry form array (debit/credit).
   * @param {number} index Array index from where affected gl entry form needs to be removed.
   */
  removeAffectedGLEntry(affectedGLEntryFormArray: FormArray, index: number) {
    affectedGLEntryFormArray.removeAt(index);
  }

  /**
   * Submits the frequent postings form and creates journal entry,
   * if successful redirects to view created transaction.
   */
  submit() {
    const journalEntry = this.frequentPostingsForm.value;
    journalEntry.accountingRule = journalEntry.accountingRule.id;
    // TODO: Update once language and date settings are setup
    journalEntry.locale = 'en';
    journalEntry.dateFormat = 'yyyy-MM-dd';
    if (journalEntry.transactionDate instanceof Date) {
      let day = journalEntry.transactionDate.getDate();
      let month = journalEntry.transactionDate.getMonth() + 1;
      const year = journalEntry.transactionDate.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      journalEntry.transactionDate = `${year}-${month}-${day}`;
    }
    this.accountingService.createJournalEntry(journalEntry).subscribe(response => {
      this.router.navigate(['../transactions/view', response.transactionId], { relativeTo: this.route });
    });
  }

}

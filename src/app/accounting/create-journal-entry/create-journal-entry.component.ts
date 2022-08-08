/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../accounting.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
/**
 * Create Journal Entry component.
 */
@Component({
  selector: 'mifosx-create-journal-entry',
  templateUrl: './create-journal-entry.component.html',
  styleUrls: ['./create-journal-entry.component.scss']
})
export class CreateJournalEntryComponent implements OnInit {

  /** Minimum transaction date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum transaction date allowed. */
  maxDate = new Date();
  /** Journal entry form. */
  journalEntryForm: FormGroup;
  /** Office data. */
  officeData: any;
  /** Currency data. */
  currencyData: any;
  /** Payment type data. */
  paymentTypeData: any;
  /** Gl Account data. */
  glAccountData: any;

  /**
   * Retrieves the offices, currencies, payment types and gl accounts data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
    private accountingService: AccountingService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router) {
    this.route.data.subscribe((data: {
      offices: any,
      currencies: any,
      paymentTypes: any,
      glAccounts: any
    }) => {
      this.officeData = data.offices;
      this.currencyData = data.currencies.selectedCurrencyOptions;
      this.paymentTypeData = data.paymentTypes;
      this.glAccountData = data.glAccounts;
    });
  }

  /**
   * Creates the journal entry form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createJournalEntryForm();
  }

  /**
   * Creates the journal entry form.
   */
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
    return this.journalEntryForm.get('debits') as FormArray;
  }

  /**
   * Gets the affected gl entry (credits) form array.
   * @returns {FormArray} Credits form array.
   */
  get credits(): FormArray {
    return this.journalEntryForm.get('credits') as FormArray;
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
   * Submits the journal entries form and creates journal entry,
   * if successful redirects to view created transaction.
   */
  submit() {
    const journalEntry = this.journalEntryForm.value;
    // TODO: Update once language and date settings are setup
    journalEntry.locale = this.settingsService.language.code;
    journalEntry.dateFormat = this.settingsService.dateFormat;
    if (journalEntry.transactionDate) {
      journalEntry.transactionDate = this.dateUtils.formatDate(journalEntry.transactionDate, this.settingsService.dateFormat);
    }
    this.accountingService.createJournalEntry(journalEntry).subscribe(response => {
      this.router.navigate(['../transactions/view', response.transactionId], { relativeTo: this.route });
    });
  }

}

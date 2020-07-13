/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';

/** Custom Services */
import { AccountingService } from '../accounting.service';
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

import { NextStepDialogComponent } from '../../configuration-wizard/next-step-dialog/next-step-dialog.component';

/**
 * Create Journal Entry component.
 */
@Component({
  selector: 'mifosx-create-journal-entry',
  templateUrl: './create-journal-entry.component.html',
  styleUrls: ['./create-journal-entry.component.scss']
})
export class CreateJournalEntryComponent implements OnInit, AfterViewInit {

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

  @ViewChild('createJournalFormRef') createJournalFormRef: ElementRef<any>;
  @ViewChild('templateCreateJournalFormRef') templateCreateJournalFormRef: TemplateRef<any>;

  /**
   * Retrieves the offices, currencies, payment types and gl accounts data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
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

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showCreateJournalEntries === true) {
      setTimeout(() => {
        this.showPopover(this.templateCreateJournalFormRef, this.createJournalFormRef.nativeElement, 'top', true);
      });
    }
  }

  nextStep() {
    this.configurationWizardService.showCreateJournalEntries = false;
    this.openNextStepDialog();
  }

  previousStep() {
    this.router.navigate(['/accounting']);
  }

  openNextStepDialog() {
    const nextStepDialogRef = this.dialog.open( NextStepDialogComponent, {
      data: {
        nextStepName: 'Setup Products',
        previousStepName: 'Accounting',
        stepPercentage: 74
      },
    });
    nextStepDialogRef.afterClosed().subscribe((response: { nextStep: boolean }) => {
    if (response.nextStep) {
      this.configurationWizardService.showCreateJournalEntries = false;
      this.configurationWizardService.showCharges = true;
      this.router.navigate(['/products']);
      } else {
      this.configurationWizardService.showCreateJournalEntries = false;
      this.router.navigate(['/home']);
      }
    });
  }
}

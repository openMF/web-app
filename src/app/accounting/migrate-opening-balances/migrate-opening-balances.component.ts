/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/** Custom Validators */
import { onlyOneOfTheFieldsIsRequiredValidator } from './only-one-of-the-fields-is-required.validator';

/**
 * Migrate opening balances component.
 */
@Component({
  selector: 'mifosx-migrate-opening-balances',
  templateUrl: './migrate-opening-balances.component.html',
  styleUrls: ['./migrate-opening-balances.component.scss']
})
export class MigrateOpeningBalancesComponent implements OnInit {

  /** Minimum opening balances date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum opening balances date allowed. */
  maxDate = new Date();
  /** Opening balances form. */
  openingBalancesForm: FormGroup;
  /** Opening balances data. */
  openingBalancesData: any;
  /** Office data. */
  officeData: any;
  /** Currency data. */
  currencyData: any;
  /** Sum total of debits. */
  debitsSum = 0;
  /** Sum total of credits. */
  creditsSum = 0;

  /**
   * Retrieves the offices and currencies from `resolve`.
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
        currencies: any
      }) => {
        this.officeData = data.offices;
        this.currencyData = data.currencies.selectedCurrencyOptions;
      });
  }

  /**
   * Creates the opening balances form. (initially retrieves gl accounts on the basis of specified office)
   */
  ngOnInit() {
    this.createOpeningBalancesForm();
  }

  /**
   * Creates the opening balances form.
   */
  createOpeningBalancesForm() {
    this.openingBalancesForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'currencyCode': ['', Validators.required],
      'transactionDate': ['', Validators.required],
      'glAccountEntries': this.formBuilder.array([])
    });
  }

  /**
   * Creates the gl account entry form.
   * @param glAccount GL Account for which form is returned.
   * @returns {FormGroup} GL Account entry form.
   */
  createGLAccountEntryForm(glAccount: any): FormGroup {
    return this.formBuilder.group({
      'glAccountId': [glAccount.glAccountId],
      'debit': [null],
      'credit': [null]
    }, { validator: onlyOneOfTheFieldsIsRequiredValidator });
  }

  /**
   * Gets the gl account entries form array.
   * @returns {FormArray} GL Account entries form array.
   */
  get glAccountEntries(): FormArray {
    return this.openingBalancesForm.get('glAccountEntries') as FormArray;
  }

  /**
   * Retrieves gl accounts on the basis of specified office.
   */
  retrieveOpeningBalances() {
    this.accountingService.retrieveOpeningBalances(this.openingBalancesForm.value.officeId)
      .subscribe((openingBalancesData: any) => {
        const entry = this.openingBalancesForm.get('glAccountEntries') as FormArray;

        openingBalancesData.glAccounts = openingBalancesData.assetAccountOpeningBalances
          .concat(openingBalancesData.liabityAccountOpeningBalances,
                  openingBalancesData.equityAccountOpeningBalances,
                  openingBalancesData.incomeAccountOpeningBalances,
                  openingBalancesData.expenseAccountOpeningBalances);

        openingBalancesData.glAccounts.forEach((glAccount: any) => {
            entry.push(this.createGLAccountEntryForm(glAccount));
          });

        this.openingBalancesData = openingBalancesData;

        entry.valueChanges.subscribe(() => {
          this.debitsSum = 0;
          this.creditsSum = 0;
          entry.controls.forEach(value => {
            this.debitsSum += value.value.debit;
            this.creditsSum += value.value.credit;
          });
        });
      });
  }

  /**
   * Submits the opening balances form and defines opening balances,
   * if successful redirects to view created transaction.
   */
  submit() {
    const openingBalances = this.openingBalancesForm.value;
    // TODO: Update once language and date settings are setup
    openingBalances.locale = 'en';
    openingBalances.dateFormat = 'yyyy-MM-dd';
    if (openingBalances.transactionDate instanceof Date) {
      let day = openingBalances.transactionDate.getDate();
      let month = openingBalances.transactionDate.getMonth() + 1;
      const year = openingBalances.transactionDate.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      openingBalances.transactionDate = `${year}-${month}-${day}`;
    }
    openingBalances.debits = [];
    openingBalances.credits = [];
    this.openingBalancesForm.value.glAccountEntries.forEach((entry: any) => {
      if (entry.debit) {
        openingBalances.debits.push({ glAccountId: entry.glAccountId, amount: entry.debit });
      }
      if (entry.credit) {
        openingBalances.credits.push({ glAccountId: entry.glAccountId, amount: entry.credit });
      }
    });
    delete openingBalances.glAccountEntries;
    this.accountingService.defineOpeningBalances(openingBalances).subscribe((response: any) => {
      this.router.navigate(['/accounting/journal-entries/transactions/view', response.transactionId]);
    });
  }

}

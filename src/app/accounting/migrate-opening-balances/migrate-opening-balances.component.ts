import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';

import { AccountingService } from '../accounting.service';

const onlyOneOfTheFieldsIsRequiredValidator: ValidatorFn = (glAccountEntriesForm: FormGroup): ValidationErrors | null => {
  const debit = glAccountEntriesForm.controls.debit.value;
  const credit = glAccountEntriesForm.controls.credit.value;
  return ((debit || credit) && !(debit && credit)) ? null : { 'error': true };
};

@Component({
  selector: 'mifosx-migrate-opening-balances',
  templateUrl: './migrate-opening-balances.component.html',
  styleUrls: ['./migrate-opening-balances.component.scss']
})
export class MigrateOpeningBalancesComponent implements OnInit {

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  openingBalancesForm: FormGroup;
  openingBalancesData: any;
  officeData: any;
  currencyData: any;

  debitsSum = 0;
  creditsSum = 0;

  constructor(private accountingService: AccountingService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.createOpeningBalancesForm();
    this.getOffices();
    this.getCurrencies();
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

  createOpeningBalancesForm() {
    this.openingBalancesForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'currencyCode': ['', Validators.required],
      'transactionDate': ['', Validators.required],
      'glAccountEntries': this.formBuilder.array([])
    });
  }

  createGLAccountEntryForm(glAccount: any): FormGroup {
    return this.formBuilder.group({
      'glAccountId': [glAccount.glAccountId],
      'debit': [null],
      'credit': [null]
    }, { validator: onlyOneOfTheFieldsIsRequiredValidator });
  }

  getFormArrayData(type: string): FormArray {
    return <FormArray>this.openingBalancesForm.get(type);
  }

  retrieveOpeningBalances() {
    this.accountingService.retrieveOpeningBalances(this.openingBalancesForm.value.officeId)
      .subscribe((openingBalancesData: any) => {
        const entry = this.openingBalancesForm.get('glAccountEntries') as FormArray;
        openingBalancesData.glAccounts = openingBalancesData.assetAccountOpeningBalances
          .concat(openingBalancesData.liabityAccountOpeningBalances, openingBalancesData.equityAccountOpeningBalances, openingBalancesData.incomeAccountOpeningBalances, openingBalancesData.expenseAccountOpeningBalances);
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

  submit() {
    // TODO: Validate
    if (this.openingBalancesForm.status !== 'INVALID') {
      const openingBalances = this.openingBalancesForm.value;
      // TODO: Update once language and date settings are setup
      openingBalances.locale = 'en';
      openingBalances.dateFormat = 'dd MMMM yyyy';
      openingBalances.transactionDate = '07 August 2018';
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
      this.accountingService.defineOpeningBalances(openingBalances)
        .subscribe((response: any) => {
          console.log(response);
        });
    } else {
      console.log('Errors exist in form!');
    }
  }

}

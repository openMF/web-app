/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';

/** Custom Dialogs */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Manage Currencies component.
 */
@Component({
  selector: 'mifosx-manage-currencies',
  templateUrl: './manage-currencies.component.html',
  styleUrls: ['./manage-currencies.component.scss']
})
export class ManageCurrenciesComponent implements OnInit {

  /** Selected Currencies data. */
  selectedCurrencies: any[];
  /** Currency options data */
  currencyData: any;
  /** Currency form */
  currencyForm: any;

  /** Currency form reference */
  @ViewChild('formRef', { static: true }) formRef: any;

  /**
   * Retrieves the currency data from `resolve`.
   * @param {ActivatedRoute} route Activated Route
   * @param {FormBuilder} formBuilder Form Builder
   * @param {OrganizationService} organizationservice Organization Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private organizationservice: OrganizationService,
              public dialog: MatDialog) {
    this.route.parent.data.subscribe(( data: { currencies: any }) => {
      this.selectedCurrencies = data.currencies.selectedCurrencyOptions;
      this.currencyData = data.currencies.currencyOptions;
    });
  }

  ngOnInit() {
    this.createCurrencyForm();
  }

  /**
   * Creates the currency form.
   */
  createCurrencyForm() {
    this.currencyForm = this.formBuilder.group({
      'currency': ['', Validators.required]
    });
  }

  /**
   * Adds a new currency to the list.
   */
  addCurrency() {
    const newCurrency = this.currencyForm.value.currency;
    const selectedCurrencyCodes: any[] = this.selectedCurrencies.map(currency => currency.code);
    if (!selectedCurrencyCodes.includes(newCurrency.code)) {
      selectedCurrencyCodes.push(newCurrency.code);
      this.organizationservice.updateCurrencies(selectedCurrencyCodes)
        .subscribe((response: any) => {
          this.selectedCurrencies.push(newCurrency);
          this.formRef.resetForm();
        });
    }
  }

  /**
   * Deletes Currency
   * @param {string} currencyCode Currency Code
   * @param {number} index Index
   */
  deleteCurrency(currencyCode: string, index: number) {
    const selectedCurrencyCodes: any[] = this.selectedCurrencies.map(currency => currency.code);
    selectedCurrencyCodes.splice(index, 1);
    const deleteCurrencyDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `currency: ${currencyCode}` }
    });
    deleteCurrencyDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationservice.updateCurrencies(selectedCurrencyCodes)
          .subscribe(() => {
            this.selectedCurrencies.splice(index, 1);
            this.formRef.resetForm();
          });
      }
    });
  }

}

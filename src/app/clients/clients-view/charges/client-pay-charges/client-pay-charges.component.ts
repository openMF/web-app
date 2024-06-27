/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services. */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { MatomoTracker } from "@ngx-matomo/tracker";

/**
 * Client Pay Charge component.
 */
@Component({
  selector: 'mifosx-client-pay-charges',
  templateUrl: './client-pay-charges.component.html',
  styleUrls: ['./client-pay-charges.component.scss']
})
export class ClientPayChargesComponent implements OnInit {

  /** Transaction Form. */
  transactionForm: any;
  /** Transaction Data. */
  transactionData: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);

    /**
     * Retrieves the charge data from `resolve`.
     * @param {ClientService} clientService Products Service.
     * @param {FormBuilder} formBuilder Form Builder.
     * @param {ActivatedRoute} route Activated Route.
     * @param {Router} router Router for navigation.
     * @param {SettingsService} settingsService Setting service
     * @param {MatomoTracker} matomoTracker Matomo tracker service
     */
  constructor(
    private clientsService: ClientsService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService,
    private matomoTracker: MatomoTracker
  ) {
    this.route.data.subscribe((data: { transactionData: any }) => {
      this.transactionData = data.transactionData;
    });
  }

  ngOnInit() {
    //set Matomo page info
    let title = document.title;
    this.matomoTracker.setDocumentTitle(`${title}`);

    this.setTransactionForm();
  }

  /**
   * Set Transaction Form.
   */
  setTransactionForm() {
    this.transactionForm = this.formBuilder.group({
      'amount': [this.transactionData.amount, Validators.required],
      'transactionDate': [new Date(), Validators.required]
    });
  }

  /**
   * Submits Transaction form.
   */
  submit() {
    const transactionFormData = this.transactionForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate = this.transactionForm.value.transactionDate;
    if (transactionFormData.transactionDate instanceof Date) {
      transactionFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...transactionFormData,
      dateFormat,
      locale
    };

     //Track Matomo event for paying client charges
     this.matomoTracker.trackEvent('clients', 'payCharges', this.transactionData.id);

    this.clientsService.payClientCharge(this.transactionData.clientId, this.transactionData.id, data).subscribe(() => {
      this.router.navigate(['../../..', 'general'], { relativeTo: this.route });
    });
  }

}

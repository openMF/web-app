/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services. */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

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
     */
  constructor(
    private clientsService: ClientsService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { transactionData: any }) => {
      this.transactionData = data.transactionData;
    });
  }

  ngOnInit() {
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
    this.clientsService.payClientCharge(this.transactionData.clientId, this.transactionData.id, data).subscribe(() => {
      this.router.navigate(['../../..', 'general'], { relativeTo: this.route });
    });
  }

}

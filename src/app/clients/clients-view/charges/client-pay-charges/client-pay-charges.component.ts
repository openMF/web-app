/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services. */
import { ClientsService } from 'app/clients/clients.service';

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
     */
  constructor(
    private clientsService: ClientsService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe
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
    const transactionDate = this.transactionForm.value.transactionDate;
    const dateFormat = 'yyyy-MM-dd';
    this.transactionForm.patchValue({
      transactionDate: this.datePipe.transform(transactionDate, dateFormat)
    });
    const transactions = this.transactionForm.value;
    transactions.locale = 'en';
    transactions.dateFormat = dateFormat;
    this.clientsService.payClientCharge(this.transactionData.clientId, this.transactionData.id, transactions).subscribe(() => {
      this.router.navigate(['../', 'general']);
    });
  }

}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Withdraw Client Component
 */
@Component({
  selector: 'mifosx-withdraw-client',
  templateUrl: './withdraw-client.component.html',
  styleUrls: ['./withdraw-client.component.scss']
})
export class WithdrawClientComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Withdraw Client form. */
  withdrawClientForm: FormGroup;
  /** Client Data */
  withdrawalData: any;
  /** Client Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private clientsService: ClientsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.withdrawalData = data.clientActionData.narrations;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.createWithdrawClientForm();
  }

  /**
   * Creates the withdraw client form.
   */
  createWithdrawClientForm() {
    this.withdrawClientForm = this.formBuilder.group({
      'withdrawalDate': ['', Validators.required],
      'withdrawalReasonId': ['', Validators.required]
    });
  }

  /**
   * Submits the form and withdraws the client.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevWithdrawalDate: Date = this.withdrawClientForm.value.withdrawalDate;
    this.withdrawClientForm.patchValue({
      withdrawalDate: this.datePipe.transform(prevWithdrawalDate, dateFormat),
    });
    const data = {
      ...this.withdrawClientForm.value,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'withdraw', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

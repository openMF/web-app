/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

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
  withdrawClientForm: UntypedFormGroup;
  /** Client Data */
  withdrawalData: any;
  /** Client Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private clientsService: ClientsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.withdrawalData = data.clientActionData.narrations;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const withdrawClientFormData = this.withdrawClientForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevWithdrawalDate: Date = this.withdrawClientForm.value.withdrawalDate;
    if (withdrawClientFormData.withdrawalDate instanceof Date) {
      withdrawClientFormData.withdrawalDate = this.dateUtils.formatDate(prevWithdrawalDate, dateFormat);
    }
    const data = {
      ...withdrawClientFormData,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'withdraw', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

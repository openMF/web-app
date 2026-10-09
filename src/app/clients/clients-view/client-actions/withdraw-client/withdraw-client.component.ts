/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { ClientActionNotifierService } from '../client-action-notifier.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Withdraw Client Component
 */
@Component({
  selector: 'mifosx-withdraw-client',
  templateUrl: './withdraw-client.component.html',
  styleUrls: ['./withdraw-client.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawClientComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly dateUtils = inject(Dates);
  private readonly route = inject(ActivatedRoute);
  private readonly settingsService = inject(SettingsService);
  private readonly notifier = inject(ClientActionNotifierService);
  private destroyRef = inject(DestroyRef);

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
   * constructor
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientActionData: any }) => {
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
      withdrawalDate: [
        '',
        Validators.required
      ],
      withdrawalReasonId: [
        '',
        Validators.required
      ]
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
    this.clientsService.executeClientCommand(this.clientId, 'withdraw', data).subscribe({
      next: () => this.notifier.notifyAndNavigate('clients.actions.withdraw.success', this.route),
      error: () => this.notifier.notify('clients.actions.withdraw.failure')
    });
  }
}

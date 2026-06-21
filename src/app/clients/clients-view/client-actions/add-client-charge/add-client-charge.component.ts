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
import { FormGroup, FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { ClientActionNotifierService } from '../client-action-notifier.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Add Clients Charge component.
 */
@Component({
  selector: 'mifosx-add-client-charge',
  templateUrl: './add-client-charge.component.html',
  styleUrls: ['./add-client-charge.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddClientChargeComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly dateUtils = inject(Dates);
  private readonly clientsService = inject(ClientsService);
  private readonly settingsService = inject(SettingsService);
  private readonly notifier = inject(ClientActionNotifierService);
  private destroyRef = inject(DestroyRef);

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add Clients Charge form. */
  clientChargeForm: FormGroup;
  /** clients charge options. */
  clientChargeOptions: any;
  /** clients Id */
  clientId: string;
  /** charge details */
  chargeDetails: any;

  /**
   * Retrieves charge template data from `resolve`
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientActionData: any }) => {
      this.clientChargeOptions = data.clientActionData.chargeOptions;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.createClientsChargeForm();
    this.buildDependencies();
  }

  /**
   * Subscribe to form controls value changes
   */
  buildDependencies() {
    this.clientChargeForm.controls.chargeId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((chargeId) => {
        this.clientsService.getChargeAndTemplate(chargeId).subscribe((data: any) => {
          this.chargeDetails = data;
          const chargeTimeType = data.chargeTimeType.id;
          if (
            data.chargeTimeType.value === 'Withdrawal Fee' ||
            data.chargeTimeType.value === 'Saving No Activity Fee'
          ) {
            this.chargeDetails.dueDateNotRequired = true;
          }
          if (data.chargeTimeType.value === 'Annual Fee' || data.chargeTimeType.value === 'Monthly Fee') {
            this.chargeDetails.chargeTimeTypeAnnualOrMonth = true;
          }
          if (!this.chargeDetails.dueDateNotRequired && !this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
            this.clientChargeForm.addControl('dueDate', new FormControl('', Validators.required));
          } else {
            this.clientChargeForm.removeControl('dueDate');
          }
          if (!this.chargeDetails.dueDateNotRequired && this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
            this.clientChargeForm.addControl('feeOnMonthDay', new FormControl('', Validators.required));
          } else {
            this.clientChargeForm.removeControl('feeOnMonthDay');
          }
          if (chargeTimeType.value === 'Monthly Fee') {
            this.clientChargeForm.addControl('feeInterval', new FormControl(data.feeInterval, Validators.required));
          } else {
            this.clientChargeForm.removeControl('feeInterval');
          }
          this.clientChargeForm.patchValue({
            amount: data.amount,
            chargeCalculationType: data.chargeCalculationType.id,
            chargeTimeType: data.chargeTimeType.id
          });
        });
      });
  }

  /**
   * Creates the Clients Charge form.
   */
  createClientsChargeForm() {
    this.clientChargeForm = this.formBuilder.group({
      chargeId: [
        '',
        Validators.required
      ],
      amount: [
        '',
        Validators.required
      ],
      chargeCalculationType: [{ value: '', disabled: true }],
      chargeTimeType: [{ value: '', disabled: true }]
    });
  }

  /**
   * Submits Client charge.
   */
  submit() {
    const clientCharge = this.clientChargeForm.value;
    clientCharge.locale = this.settingsService.language.code;
    if (!clientCharge.feeInterval) {
      clientCharge.feeInterval = this.chargeDetails.feeInterval;
    }
    if (this.chargeDetails.dueDateNotRequired !== true) {
      if (this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
        const monthDayFormat = 'MMMM-dd'; // TODO: Update once language and date settings are setup
        clientCharge.monthDayFormat = monthDayFormat;
        if (clientCharge.feeOnMonthDay) {
          const prevDate = this.clientChargeForm.value.feeOnMonthDay;
          clientCharge.feeOnMonthDay = this.dateUtils.formatDate(prevDate, monthDayFormat);
        }
      } else {
        const dateFormat = this.settingsService.dateFormat;
        clientCharge.dateFormat = dateFormat;
        if (clientCharge.dueDate) {
          const prevDate = this.clientChargeForm.value.dueDate;
          clientCharge.dueDate = this.dateUtils.formatDate(prevDate, dateFormat);
        }
      }
    }
    this.clientsService.createClientCharge(this.clientId, clientCharge).subscribe({
      next: () => this.notifier.notifyAndNavigate('clients.actions.addCharge.success', this.route),
      error: () => this.notifier.notify('clients.actions.addCharge.failure')
    });
  }
}

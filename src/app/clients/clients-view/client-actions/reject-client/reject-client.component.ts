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
 * Reject Client Component
 */
@Component({
  selector: 'mifosx-reject-client',
  templateUrl: './reject-client.component.html',
  styleUrls: ['./reject-client.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RejectClientComponent implements OnInit {
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
  /** Reject Share Account form. */
  rejectClientForm: FormGroup;
  /** Client Data */
  rejectionData: any;
  /** Client Id */
  clientId: any;

  /**
   * constructor
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientActionData: any }) => {
      this.rejectionData = data.clientActionData.narrations;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createRejectClientForm();
  }

  /**
   * Creates the reject client form.
   */
  createRejectClientForm() {
    this.rejectClientForm = this.formBuilder.group({
      rejectionDate: [
        '',
        Validators.required
      ],
      rejectionReasonId: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits the form and rejects the client.
   */
  submit() {
    const rejectClientFormData = this.rejectClientForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevRejectedDate: Date = this.rejectClientForm.value.rejectionDate;
    if (rejectClientFormData.rejectionDate instanceof Date) {
      rejectClientFormData.rejectionDate = this.dateUtils.formatDate(prevRejectedDate, dateFormat);
    }
    const data = {
      ...rejectClientFormData,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'reject', data).subscribe({
      next: () => this.notifier.notifyAndNavigate('clients.actions.reject.success', this.route),
      error: () => this.notifier.notify('clients.actions.reject.failure')
    });
  }
}

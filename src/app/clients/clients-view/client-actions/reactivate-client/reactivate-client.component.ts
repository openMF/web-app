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
 * Reactivate Client Component
 */
@Component({
  selector: 'mifosx-reactivate-client',
  templateUrl: './reactivate-client.component.html',
  styleUrls: ['./reactivate-client.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReactivateClientComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly dateUtils = inject(Dates);
  private readonly route = inject(ActivatedRoute);
  private readonly settingsService = inject(SettingsService);
  private readonly notifier = inject(ClientActionNotifierService);

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Reactivate client form. */
  reactivateClientForm: FormGroup;
  /** Client Account Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {clientsService} clientsService Clients Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {SettingsService} settingsService Setting service
   */
  constructor() {
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  /**
   * Creates the reactivate client form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createReactivateClientForm();
  }

  /**
   * Creates the reactivate client form.
   */
  createReactivateClientForm() {
    this.reactivateClientForm = this.formBuilder.group({
      reactivationDate: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits the form and reactivates the client,
   * if successful redirects to the client.
   */
  submit() {
    const reactivateClientFormData = this.reactivateClientForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevReactivationDate: Date = this.reactivateClientForm.value.reactivationDate;
    if (reactivateClientFormData.reactivationDate instanceof Date) {
      reactivateClientFormData.reactivationDate = this.dateUtils.formatDate(prevReactivationDate, dateFormat);
    }
    const data = {
      ...reactivateClientFormData,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'reactivate', data).subscribe({
      next: () => this.notifier.notifyAndNavigate('clients.actions.reactivate.success', this.route),
      error: () => this.notifier.notify('clients.actions.reactivate.failure')
    });
  }
}

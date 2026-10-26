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
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Transfer Client Component
 */
@Component({
  selector: 'mifosx-transfer-client',
  templateUrl: './transfer-client.component.html',
  styleUrls: ['./transfer-client.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferClientComponent implements OnInit {
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
  /** Transfer Client form. */
  transferClientForm: FormGroup;
  /** Client Data */
  officeData: any;
  /** Client Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {SettingsService} settingsService Setting service
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientActionData: any }) => {
      this.officeData = data.clientActionData;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createTransferClientForm();
  }

  /**
   * Creates the transfer client form.
   */
  createTransferClientForm() {
    this.transferClientForm = this.formBuilder.group({
      destinationOfficeId: [
        '',
        Validators.required
      ],
      transferDate: [
        '',
        Validators.required
      ],
      note: ['']
    });
  }

  /**
   * Submits the form and transfers the client.
   */
  submit() {
    const transferClientFormData = this.transferClientForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransferDate: Date = this.transferClientForm.value.transferDate;
    if (transferClientFormData.transferDate instanceof Date) {
      transferClientFormData.transferDate = this.dateUtils.formatDate(prevTransferDate, dateFormat);
    }
    const data = {
      ...transferClientFormData,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'proposeTransfer', data).subscribe({
      next: () => this.notifier.notifyAndNavigate('clients.actions.transfer.success', this.route),
      error: () => this.notifier.notify('clients.actions.transfer.failure')
    });
  }
}

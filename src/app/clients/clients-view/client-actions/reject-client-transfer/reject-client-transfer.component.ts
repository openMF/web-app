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
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { ClientActionNotifierService } from '../client-action-notifier.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Reject Client Transfer Component
 */
@Component({
  selector: 'mifosx-reject-client-transfer',
  templateUrl: './reject-client-transfer.component.html',
  styleUrls: ['./reject-client-transfer.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RejectClientTransferComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly settingsService = inject(SettingsService);
  private readonly dateUtils = inject(Dates);
  private readonly route = inject(ActivatedRoute);
  private readonly notifier = inject(ClientActionNotifierService);
  private destroyRef = inject(DestroyRef);

  /** Reject Client Transfer form. */
  rejectClientTransferForm: FormGroup;
  /** Client Id */
  clientId: any;
  /** Transfer Date */
  transferDate: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientActionData: any }) => {
      this.transferDate = data.clientActionData;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.createRejectClientTransferForm();
  }

  /**
   * Creates the reject client transfer form.
   */
  createRejectClientTransferForm() {
    this.rejectClientTransferForm = this.formBuilder.group({
      transferDate: { value: new Date(this.transferDate), disabled: true },
      note: ['']
    });
  }

  /**
   * Submits the form and reject the transfer of client
   * if successful redirects to the client.
   */
  submit() {
    const rejectClientTransferFormData = this.rejectClientTransferForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransferDate: Date = this.rejectClientTransferForm.value.transferDate;
    if (rejectClientTransferFormData.transferDate instanceof Date) {
      rejectClientTransferFormData.transferDate = this.dateUtils.formatDate(prevTransferDate, dateFormat);
    }
    const data = {
      ...rejectClientTransferFormData
    };
    this.clientsService.executeClientCommand(this.clientId, 'rejectTransfer', data).subscribe(() => {
      this.notifier.notifyAndNavigate('clients.actions.rejectTransfer.success', this.route);
    });
  }
}

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
 * Accept Client Transfer Component
 */
@Component({
  selector: 'mifosx-accept-client-transfer',
  templateUrl: './accept-client-transfer.component.html',
  styleUrls: ['./accept-client-transfer.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcceptClientTransferComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly settingsService = inject(SettingsService);
  private readonly dateUtils = inject(Dates);
  private readonly route = inject(ActivatedRoute);
  private readonly notifier = inject(ClientActionNotifierService);
  private destroyRef = inject(DestroyRef);

  /** Accept Client Transfer form. */
  acceptClientTransferForm: FormGroup;
  /** Client Id */
  clientId: any;
  /** Transfer Date */
  transferDate: any;

  /**
   * constructor
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientActionData: any }) => {
      this.transferDate = data.clientActionData;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  /**
   * Creates the accept client transfer form.
   */
  ngOnInit() {
    this.createAcceptClientTransferForm();
  }

  /**
   * Creates the accept client transfer form.
   */
  createAcceptClientTransferForm() {
    this.acceptClientTransferForm = this.formBuilder.group({
      transferDate: { value: new Date(this.transferDate), disabled: true },
      note: ['']
    });
  }

  /**
   * Submits the form and accept the transfer of client
   * if successful redirects to the client.
   */
  submit() {
    const acceptClientTransferFormData = this.acceptClientTransferForm.value;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransferDate: Date = this.acceptClientTransferForm.value.transferDate;
    if (acceptClientTransferFormData.transferDate instanceof Date) {
      acceptClientTransferFormData.transferDate = this.dateUtils.formatDate(prevTransferDate, dateFormat);
    }
    const data = {
      ...acceptClientTransferFormData
    };
    this.clientsService.executeClientCommand(this.clientId, 'acceptTransfer', data).subscribe({
      next: () => this.notifier.notifyAndNavigate('clients.actions.acceptTransfer.success', this.route),
      error: () => this.notifier.notify('clients.actions.acceptTransfer.failure')
    });
  }
}

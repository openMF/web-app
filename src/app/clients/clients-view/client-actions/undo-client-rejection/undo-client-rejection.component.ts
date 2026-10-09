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
 * Undo Client Rejection Component
 */
@Component({
  selector: 'mifosx-undo-client-rejection',
  templateUrl: './undo-client-rejection.component.html',
  styleUrls: ['./undo-client-rejection.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UndoClientRejectionComponent implements OnInit {
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
  /** Undo Client Rejection form. */
  undoClientRejectionForm: FormGroup;
  /** Client Id */
  clientId: any;

  /**
   * constructor
   */
  constructor() {
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  /**
   * Creates the undo client rejection form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createUndoClientRejectionForm();
  }

  /**
   * Creates the undo client rejection form.
   */
  createUndoClientRejectionForm() {
    this.undoClientRejectionForm = this.formBuilder.group({
      reopenedDate: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits the form and undo client rejection,
   * if successful redirects to the client.
   */
  submit() {
    const undoClientRejectionFormData = this.undoClientRejectionForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevReopenedDate: Date = this.undoClientRejectionForm.value.reopenedDate;
    if (undoClientRejectionFormData.reopenedDate instanceof Date) {
      undoClientRejectionFormData.reopenedDate = this.dateUtils.formatDate(prevReopenedDate, dateFormat);
    }
    const data = {
      ...undoClientRejectionFormData,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'undoRejection', data).subscribe({
      next: () => this.notifier.notifyAndNavigate('clients.actions.undoRejection.success', this.route),
      error: () => this.notifier.notify('clients.actions.undoRejection.failure')
    });
  }
}

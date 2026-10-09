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
import { ClientActionNotifierService } from '../client-action-notifier.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Clients Assign Staff Component
 */
@Component({
  selector: 'mifosx-client-assign-staff',
  templateUrl: './client-assign-staff.component.html',
  styleUrls: ['./client-assign-staff.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientAssignStaffComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly notifier = inject(ClientActionNotifierService);
  private destroyRef = inject(DestroyRef);

  /** Client Assign Staff form. */
  clientAssignStaffForm: FormGroup;
  /** Staff Data */
  staffData: any;
  /** Client Data */
  clientData: any;

  /**
   * Fetches Client Action Data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientActionData: any }) => {
      this.clientData = data.clientActionData;
    });
  }

  /**
   * Creates the client assign staff form.
   */
  ngOnInit() {
    this.staffData = this.clientData.staffOptions;
    this.createClientAssignStaffForm();
  }

  /**
   * Creates the client assign staff form.
   */
  createClientAssignStaffForm() {
    this.clientAssignStaffForm = this.formBuilder.group({
      staffId: ['']
    });
  }

  /**
   * Submits the form and assigns staff for the client.
   */
  submit() {
    this.clientsService
      .executeClientCommand(this.clientData.id, 'assignStaff', this.clientAssignStaffForm.value)
      .subscribe({
        next: () => this.notifier.notifyAndNavigate('clients.actions.assignStaff.success', this.route),
        error: () => this.notifier.notify('clients.actions.assignStaff.failure')
      });
  }
}

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subject, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, timeout, catchError } from 'rxjs/operators';
import { ClientsService } from '../clients.service';
import { environment } from '../../../environments/environment';

/** Timeout for external API calls in milliseconds */
const EXTERNAL_API_TIMEOUT_MS = 10_000;

export interface ExternalIdLookupState {
  loading: boolean;
  message: string;
  error: boolean;
  fieldsDisabled: boolean;
}

/**
 * Shared service that encapsulates all External National ID lookup logic.
 * Used by both client-general-step (create) and edit-client components.
 */
@Injectable({
  providedIn: 'root'
})
export class ExternalNationalIdService {
  private clientsService = inject(ClientsService);

  /** Whether the external National ID feature is enabled */
  readonly enabled: boolean = environment.externalNationalId.enabled;
  /** The regex pattern to validate external IDs */
  readonly regex: string = environment.externalNationalId.regex;

  /**
   * Initializes the external National ID watcher on a form's externalId control.
   * Uses switchMap to auto-cancel previous in-flight requests when user types again.
   *
   * @param form The reactive form containing the 'externalId' control
   * @param destroy$ Subject that triggers teardown (component's destroy lifecycle)
   * @param onStateChange Callback invoked whenever the lookup state changes
   */
  watchExternalId(
    form: UntypedFormGroup,
    destroy$: Subject<void>,
    onStateChange: (state: ExternalIdLookupState) => void
  ): void {
    if (!this.enabled || !this.regex) {
      return;
    }

    const pattern = new RegExp(this.regex);

    form
      .get('externalId')
      .valueChanges.pipe(
        takeUntil(destroy$),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((externalId: string) => {
          // Clear previous messages
          onStateChange({ loading: false, message: '', error: false, fieldsDisabled: false });

          if (!externalId || !pattern.test(externalId)) {
            return EMPTY;
          }

          // Valid regex match — call the external API
          onStateChange({ loading: true, message: '', error: false, fieldsDisabled: false });

          return this.clientsService.lookupExternalNationalId(externalId).pipe(
            timeout(EXTERNAL_API_TIMEOUT_MS),
            catchError(() => {
              onStateChange({
                loading: false,
                message: 'labels.inputs.External ID lookup failed',
                error: true,
                fieldsDisabled: false
              });
              return EMPTY;
            })
          );
        })
      )
      .subscribe((response: any) => {
        if (response.developerMessage === 'client.externalid.valid') {
          this.fillFormFromResponse(form, response);
          onStateChange({ loading: false, message: '', error: false, fieldsDisabled: true });
        } else if (response.developerMessage === 'client.externalid.notfound') {
          onStateChange({
            loading: false,
            message: 'labels.inputs.External ID not found',
            error: true,
            fieldsDisabled: false
          });
        } else {
          onStateChange({
            loading: false,
            message: 'labels.inputs.External ID invalid',
            error: true,
            fieldsDisabled: false
          });
        }
      });
  }

  /**
   * Checks whether an existing external ID matches the configured regex pattern.
   * Used when editing a client that already has a valid external ID.
   */
  isValidExternalId(externalId: string): boolean {
    if (!this.enabled || !this.regex || !externalId) {
      return false;
    }
    return new RegExp(this.regex).test(externalId);
  }

  /**
   * Fills form fields with data from the external National ID API response.
   */
  private fillFormFromResponse(form: UntypedFormGroup, response: any): void {
    let dateOfBirth: Date | null = null;
    if (response.dateOfBirth && response.dateFormat) {
      const parts = response.dateOfBirth.split('/');
      if (parts.length === 3) {
        dateOfBirth = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    }

    form.patchValue({
      firstname: response.firstname || '',
      middlename: response.middlename || '',
      lastname: response.lastname || '',
      dateOfBirth: dateOfBirth,
      genderId: response.genderId || ''
    });
  }
}

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject, Injectable, OnDestroy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from 'environments/environment';
import { ClientsService } from '../clients.service';
import {
  EXTERNAL_ID_STATUS_KEYS,
  EXTERNAL_GENDER_MAP,
  PERSON_FIELD_NAMES,
  type PersonFieldName,
  type ExternalIdStatusKey
} from './external-national-id.constants';

/** Response shape from the external National ID API */
export interface ExternalNationalIdResponse {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  dateOfBirth?: string;
  dateFormat?: string;
  genderId?: number;
  developerMessage?: string;
}

/** Fineract gender option (from client template) */
export interface GenderOption {
  id: number;
  name: string;
  active?: boolean;
  mandatory?: boolean;
}

/**
 * Shared service for External National ID System integration.
 *
 * Provided at the component level (not `providedIn: 'root'`) so each component
 * gets its own instance with independent lifecycle. The service's `ngOnDestroy`
 * is called when the host component is destroyed, cleaning up subscriptions.
 *
 * When enabled, watches the externalId form control:
 * - Validates input against configured regex (e.g. CURP)
 * - Calls external API to lookup client data
 * - Auto-fills firstname, middlename, lastname, dateOfBirth, genderId
 * - Disables those fields so users cannot modify API-provided values
 */
@Injectable()
export class ExternalNationalIdService implements OnDestroy {
  /** Whether the feature is enabled via env var */
  readonly enabled: boolean;

  /**
   * Compiled regex pattern for external ID validation.
   * Compiled once in the constructor to avoid repeated `new RegExp()` calls (CWE-1333 mitigation).
   * Null if regex is not configured or is invalid.
   */
  private readonly pattern: RegExp | null;

  /** Status message key for the template to display */
  statusMessageKey: ExternalIdStatusKey = EXTERNAL_ID_STATUS_KEYS.EMPTY;

  /** Whether a lookup is currently in progress */
  isLoading = false;

  private destroy$ = new Subject<void>();

  private clientsService = inject(ClientsService);

  constructor() {
    this.enabled = environment.enableExternalNationalIdSystem === true;

    const regexStr = environment.externalNationalIdRegex;
    if (regexStr) {
      try {
        this.pattern = new RegExp(regexStr);
      } catch {
        console.warn('[ExternalNationalId] Invalid regex pattern:', regexStr);
        this.pattern = null;
      }
    } else {
      this.pattern = null;
    }
  }

  /**
   * Validates an external ID against the compiled regex pattern.
   */
  isValidExternalId(value: string): boolean {
    if (!value || !this.pattern) {
      return false;
    }
    return this.pattern.test(value.trim());
  }

  /**
   * Start watching the externalId form control for changes.
   * When a valid ID is entered, calls the external API and fills form fields.
   *
   * @param form The reactive form containing externalId and person fields
   * @param genderOptions Array of gender options from the Fineract template
   * @param skipInitialValue If true, skips lookup for the current form value (used in edit mode
   *                         to avoid re-fetching data for an already-saved external ID)
   */
  watchExternalId(form: UntypedFormGroup, genderOptions: GenderOption[], skipInitialValue = false): void {
    if (!this.enabled) {
      return;
    }

    const externalIdCtrl = form.get('externalId');
    if (!externalIdCtrl) {
      return;
    }

    // In edit mode, if the client already has a valid external ID, lock the fields
    // without making an API call
    if (skipInitialValue && externalIdCtrl.value && this.isValidExternalId(externalIdCtrl.value)) {
      this.disablePersonFields(form);
      return;
    }

    externalIdCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((value: string) => {
          if (!value || !this.isValidExternalId(value)) {
            // Re-enable fields if ID is cleared or invalid
            this.enablePersonFields(form);
            if (value && value.length > 3 && !this.isValidExternalId(value)) {
              this.statusMessageKey = EXTERNAL_ID_STATUS_KEYS.INVALID_FORMAT;
            } else {
              this.statusMessageKey = EXTERNAL_ID_STATUS_KEYS.EMPTY;
            }
            return false;
          }
          return true;
        }),
        switchMap((value: string) => {
          this.isLoading = true;
          this.statusMessageKey = EXTERNAL_ID_STATUS_KEYS.LOADING;
          return this.clientsService.lookupExternalNationalId(value).pipe(
            timeout(10000),
            catchError((error) => {
              this.isLoading = false;
              if (error.name === 'TimeoutError') {
                this.statusMessageKey = EXTERNAL_ID_STATUS_KEYS.TIMEOUT;
              } else if (error.status === 404) {
                this.statusMessageKey = EXTERNAL_ID_STATUS_KEYS.NOT_FOUND;
              } else {
                this.statusMessageKey = EXTERNAL_ID_STATUS_KEYS.FAILED;
              }
              this.enablePersonFields(form);
              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((response: ExternalNationalIdResponse | null) => {
        this.isLoading = false;
        if (response) {
          this.fillFormFromResponse(form, response, genderOptions);
        }
      });
  }

  /**
   * Fill form fields from the external API response and disable them.
   * Guards each control access to handle the case where the legal form changes
   * while a lookup is in-flight (e.g. controls removed by buildDependencies).
   */
  private fillFormFromResponse(
    form: UntypedFormGroup,
    response: ExternalNationalIdResponse,
    genderOptions: GenderOption[]
  ): void {
    const devMessage = response.developerMessage || '';

    if (devMessage === 'client.externalid.notfound') {
      this.statusMessageKey = EXTERNAL_ID_STATUS_KEYS.NOT_FOUND;
      this.enablePersonFields(form);
      return;
    }

    if (devMessage === 'client.externalid.invalid') {
      this.statusMessageKey = EXTERNAL_ID_STATUS_KEYS.INVALID_FORMAT;
      this.enablePersonFields(form);
      return;
    }

    // Valid response — fill and disable fields
    this.statusMessageKey = EXTERNAL_ID_STATUS_KEYS.SUCCESS;

    const firstnameCtrl = form.get('firstname');
    const middlenameCtrl = form.get('middlename');
    const lastnameCtrl = form.get('lastname');
    const dobCtrl = form.get('dateOfBirth');
    const genderCtrl = form.get('genderId');

    // Guard: if person-specific controls were removed (legal form changed to Entity
    // while lookup was in-flight), skip those fields gracefully
    if (firstnameCtrl && response.firstname) {
      firstnameCtrl.setValue(response.firstname);
      firstnameCtrl.disable();
    }

    if (middlenameCtrl && response.middlename) {
      middlenameCtrl.setValue(response.middlename);
      middlenameCtrl.disable();
    }

    if (lastnameCtrl && response.lastname) {
      lastnameCtrl.setValue(response.lastname);
      lastnameCtrl.disable();
    }

    if (dobCtrl && response.dateOfBirth) {
      const parsedDate = this.parseDate(response.dateOfBirth, response.dateFormat);
      if (parsedDate) {
        dobCtrl.setValue(parsedDate);
        dobCtrl.disable();
      }
    }

    if (genderCtrl && response.genderId != null) {
      const genderName = EXTERNAL_GENDER_MAP[response.genderId];
      const matchedGender = genderName
        ? genderOptions?.find((g: GenderOption) => g.name?.toLowerCase() === genderName.toLowerCase())
        : null;
      if (matchedGender) {
        genderCtrl.setValue(matchedGender.id);
        genderCtrl.disable();
      }
    }
  }

  /**
   * Parse a date string using the provided format.
   * Validates the parsed result against the expected format to catch mismatches.
   *
   * @param dateStr The date string from the API (e.g. "15/03/1990")
   * @param dateFormat The format hint from the API (e.g. "dd/MM/yyyy")
   * @returns A valid Date object or null if parsing fails
   */
  parseDate(dateStr: string, dateFormat?: string): Date | null {
    if (!dateStr) {
      return null;
    }

    const format = dateFormat || 'dd/MM/yyyy';
    const parts = dateStr.split('/');

    if (format === 'dd/MM/yyyy' && parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      // Validate ranges before constructing
      if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
        return null;
      }

      const date = new Date(year, month, day);

      // Verify the date components match (catches invalid dates like Feb 30)
      if (isNaN(date.getTime()) || date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
        return null;
      }
      return date;
    }

    // Fallback: try native parsing
    const fallback = new Date(dateStr);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  /**
   * Re-enable person fields so they can be edited manually.
   */
  enablePersonFields(form: UntypedFormGroup): void {
    for (const field of PERSON_FIELD_NAMES) {
      form.get(field)?.enable();
    }
  }

  /**
   * Disable person fields (used in edit mode to lock fields for existing external IDs).
   */
  private disablePersonFields(form: UntypedFormGroup): void {
    for (const field of PERSON_FIELD_NAMES) {
      form.get(field)?.disable();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

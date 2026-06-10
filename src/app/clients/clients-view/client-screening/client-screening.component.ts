/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelDescription,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { catchError, finalize, of } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ClientsService } from '../../clients.service';
import {
  ClientAddressRecord,
  ClientScreeningResult,
  ScreenableClient
} from '../../models/client-screening.model';
import { ClientScreeningService } from '../../services/client-screening.service';

/**
 * Read-only compliance screening widget for the selected client view.
 *
 * The component exposes two explicit user interactions:
 * - screen the visible client identity/name information
 * - screen the client's collected address information
 *
 * Results are not persisted. They are held in memory only for the current page
 * session and exist purely to support operator review.
 */
@Component({
  selector: 'mifosx-client-screening',
  templateUrl: './client-screening.component.html',
  styleUrls: ['./client-screening.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatIcon,
    MatProgressSpinner,
    MatChipsModule,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientScreeningComponent implements OnChanges {
  private clientsService = inject(ClientsService);
  readonly screeningService = inject(ClientScreeningService);

  @Input() clientViewData: ScreenableClient;

  readonly idleResult: ClientScreeningResult = {
    type: 'name',
    status: 'idle',
    matches: []
  };

  nameScreeningResult: ClientScreeningResult = { ...this.idleResult, type: 'name' };
  addressScreeningResult: ClientScreeningResult = { ...this.idleResult, type: 'address' };

  /**
   * Local cache of the fetched client addresses.
   * Since there is no persistence layer for this feature, this avoids duplicate
   * address fetches within the same client session while keeping the workflow
   * explicitly user-triggered.
   */
  private clientAddresses: ClientAddressRecord[] | null = null;

  isNameLoading = false;
  isAddressLoading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientViewData'] && !changes['clientViewData'].firstChange) {
      this.resetScreeningState();
    }
  }

  /**
   * Indicates whether Yente screening is configured for the current deployment.
   */
  get isEnabled(): boolean {
    return this.screeningService.enabled;
  }

  /**
   * Runs the name screening request using the visible client identity data.
   */
  runNameScreening() {
    if (!this.clientViewData?.id || this.isNameLoading) {
      return;
    }

    this.isNameLoading = true;
    this.nameScreeningResult = {
      type: 'name',
      status: 'loading',
      matches: []
    };

    this.screeningService
      .screenClientName(this.clientViewData)
      .pipe(
        catchError((error) => {
          this.nameScreeningResult = this.buildErrorResult('name', error?.message);
          return of(null);
        }),
        finalize(() => {
          this.isNameLoading = false;
        })
      )
      .subscribe((result) => {
        if (result) {
          this.nameScreeningResult = result;
        }
      });
  }

  /**
   * Runs the address screening request.
   * Address data is only fetched when the user explicitly requests the check.
   */
  runAddressScreening() {
    if (!this.clientViewData?.id || this.isAddressLoading) {
      return;
    }

    this.isAddressLoading = true;
    this.addressScreeningResult = {
      type: 'address',
      status: 'loading',
      matches: []
    };

    const executeScreening = (addresses: ClientAddressRecord[]) =>
      this.screeningService.screenClientAddress(this.clientViewData, addresses).pipe(
        catchError((error) => {
          this.addressScreeningResult =
            error?.message === 'errors.clientScreeningMissingAddress'
              ? this.buildUnavailableAddressResult()
              : this.buildErrorResult('address', error?.message);
          return of(null);
        }),
        finalize(() => {
          this.isAddressLoading = false;
        })
      );

    if (this.clientAddresses) {
      executeScreening(this.clientAddresses).subscribe((result) => {
        if (result) {
          this.addressScreeningResult = result;
        }
      });
      return;
    }

    this.clientsService
      .getClientAddressData(String(this.clientViewData.id))
      .pipe(
        catchError(() => {
          this.addressScreeningResult = this.buildErrorResult('address', 'errors.clientScreeningAddressLookupFailed');
          this.isAddressLoading = false;
          return of(null);
        })
      )
      .subscribe((addresses: ClientAddressRecord[] | null) => {
        if (!addresses) {
          return;
        }

        this.clientAddresses = addresses;
        executeScreening(addresses).subscribe((result) => {
          if (result) {
            this.addressScreeningResult = result;
          }
        });
      });
  }

  /**
   * Returns the translation key for each UI state.
   */
  statusLabelKey(status: ClientScreeningResult['status']): string {
    const labelMap: Record<ClientScreeningResult['status'], string> = {
      idle: 'labels.inputs.Not Screened',
      loading: 'labels.inputs.Screening In Progress',
      clear: 'labels.inputs.Clear',
      'possible-match': 'labels.inputs.Possible Match',
      match: 'labels.inputs.Match',
      error: 'labels.inputs.Screening Error',
      unavailable: 'labels.inputs.Unavailable'
    };

    return labelMap[status];
  }

  /**
   * Returns true when a result should render its matches list.
   */
  shouldShowMatches(result: ClientScreeningResult): boolean {
    return (result.status === 'match' || result.status === 'possible-match') && result.matches.length > 0;
  }

  private buildErrorResult(type: 'name' | 'address', errorMessageKey?: string): ClientScreeningResult {
    return {
      type,
      status: 'error',
      matches: [],
      errorMessageKey: errorMessageKey || 'errors.clientScreeningRequestFailed'
    };
  }

  private buildUnavailableAddressResult(): ClientScreeningResult {
    return {
      type: 'address',
      status: 'unavailable',
      matches: [],
      errorMessageKey: 'errors.clientScreeningMissingAddress'
    };
  }

  private resetScreeningState() {
    this.clientAddresses = null;
    this.isNameLoading = false;
    this.isAddressLoading = false;
    this.nameScreeningResult = { ...this.idleResult, type: 'name' };
    this.addressScreeningResult = { ...this.idleResult, type: 'address' };
  }
}

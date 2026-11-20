/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { isoDate } from 'app/products/saving-products/product-editor/interest-rate.model';
import { AccountManagementApi } from './account-management-api.service';
import { AccountManagementAccess } from './account-management-access.service';
import { positiveId } from './account-management.state';
import {
  ISR_CAPABILITIES,
  IsrCapabilities,
  IsrPeriod,
  IsrEligibility,
  IsrSources,
  IsrPreview,
  IsrCalculation,
  IsrHistoryEntry,
  IsrAuditEntry,
  IsrReconciliation,
  IsrContractError
} from './consolidated-isr.model';

const money = [
  'observedLedgerBalance',
  'nativePostedInterest',
  'nativeWithheldTax',
  'taxableBase',
  'calculatedIsr',
  'actualWithheldAmount',
  'amount',
  'runningBalance'
];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const ISR_PAGE_SIZE = 25;
/** BE-11 validation limit (not exposed in /template). Dates remain subject to backend business-date validation. */
export const ISR_MAX_INCLUSIVE_DAYS = 367;
export function validIsrPeriod(period: IsrPeriod, today: string): boolean {
  return (
    !!period &&
    isoDate(period.from) &&
    isoDate(period.through) &&
    period.from >= '1900-01-01' &&
    period.from <= period.through &&
    period.through <= today &&
    (Date.parse(period.through) - Date.parse(period.from)) / 86400000 < ISR_MAX_INCLUSIVE_DAYS
  );
}
function contract(condition: unknown): asserts condition {
  if (!condition) throw new IsrContractError('Incompatible consolidated ISR response');
}

@Injectable({ providedIn: 'root' })
export class ConsolidatedIsrService {
  private readonly api = inject(AccountManagementApi);
  private readonly access = inject(AccountManagementAccess);
  private readonly settings = inject(SettingsService);
  private tenant(): string {
    return this.settings.tenantIdentifier || environment.fineractPlatformTenantId;
  }
  private get<T>(path: string, parameters: Record<string, string | number> = {}, exactFields: readonly string[] = []) {
    const tenant = this.tenant();
    const server = this.settings.server;
    return this.api.get<T>(path, parameters, exactFields).pipe(
      map((data) => {
        contract(tenant === this.tenant() && server === this.settings.server);
        return data;
      })
    );
  }
  private readonly root = '/savings/consolidated-isr';
  private authorize(permission: string): void {
    if (!this.access.has(permission)) throw new HttpErrorResponse({ status: 403 });
  }
  private client(client: number, permission: string): string {
    this.authorize(permission);
    return this.api.client(this.root, client);
  }
  private period(period: IsrPeriod): Record<string, string> {
    // Future bounds are checked against the selected local day by the UI and the backend business date.
    if (!validIsrPeriod(period, '9999-12-31')) throw new Error('Invalid diagnostic period');
    return { from: period.from, through: period.through };
  }
  private calculationPath(client: number, id: string, permission: string): string {
    const path = this.client(client, permission);
    if (!uuid.test(id)) throw new Error('Invalid calculation identifier');
    return path + '/calculations/' + id;
  }
  private page(after: number, limit: number): Record<string, number> {
    if (!Number.isSafeInteger(after) || after < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new Error('Invalid pagination');
    return { after, limit };
  }
  template() {
    this.authorize('READ_CONSOLIDATED_ISR_ELIGIBILITY');
    return this.get<IsrCapabilities>(this.root + '/template').pipe(
      map((data) => {
        contract(data && ISR_CAPABILITIES.some((key) => typeof data[key] === 'boolean'));
        contract(ISR_CAPABILITIES.every((key) => data[key] === undefined || typeof data[key] === 'boolean'));
        contract(data.blockers === undefined || Array.isArray(data.blockers));
        return data;
      })
    );
  }
  eligibility(client: number, period: IsrPeriod) {
    return this.get<IsrEligibility>(
      this.client(client, 'READ_CONSOLIDATED_ISR_ELIGIBILITY') + '/eligibility',
      this.period(period)
    ).pipe(
      map((data) => {
        contract(
          data?.clientId === client && data.profile?.clientId === client && data.profile.tenant === this.tenant()
        );
        contract(data.period?.from === period.from && data.period?.through === period.through);
        contract(
          Array.isArray(data.accounts) && typeof data.populationComplete === 'boolean' && Array.isArray(data.blockers)
        );
        data.accounts.forEach((account) =>
          contract(
            positiveId(account.accountId) &&
              positiveId(account.productId) &&
              typeof account.eligible === 'boolean' &&
              typeof account.structurallySupported === 'boolean' &&
              Array.isArray(account.reasons)
          )
        );
        return data;
      })
    );
  }
  private sources(data: IsrSources, client: number): IsrSources {
    contract(
      data &&
        Array.isArray(data.accounts) &&
        Array.isArray(data.transactions) &&
        Array.isArray(data.taxDetails) &&
        Array.isArray(data.observations) &&
        Array.isArray(data.reasons) &&
        typeof data.complete === 'boolean'
    );
    data.observations.forEach((row) => {
      contract(row && typeof row === 'object' && !Array.isArray(row));
      contract(typeof row.currency === 'string' && /^[A-Z]{3}$/.test(row.currency));
      contract(Number.isInteger(row.currencyDigits) && row.currencyDigits >= 0 && row.currencyDigits <= 6);
      contract(Number.isSafeInteger(row.accountCount) && row.accountCount >= 0);
      for (const amount of [
        row.observedLedgerBalance,
        row.nativePostedInterest,
        row.nativeWithheldTax
      ]) contract(amount == null || (typeof amount === 'string' && /^-?\d+(?:\.\d+)?$/.test(amount)));
    });
    const accounts = new Set<number>();
    data.accounts.forEach((row) => {
      contract(
        row.clientId === client &&
          positiveId(row.accountId) &&
          !accounts.has(row.accountId) &&
          Array.isArray(row.reasons)
      );
      accounts.add(row.accountId);
    });
    // In incomplete captures transaction identities can exceed the truncated account population.
    if (data.complete) data.transactions.forEach((row) => contract(accounts.has(row.accountId)));
    return data;
  }
  accounts(client: number, period: IsrPeriod) {
    return this.get<IsrSources>(
      this.client(client, 'READ_CONSOLIDATED_ISR') + '/accounts',
      this.period(period),
      money
    ).pipe(map((data) => this.sources(data, client)));
  }
  private previewResult(data: IsrPreview, client: number): IsrPreview {
    contract(
      data?.clientId === client &&
        data.profile?.clientId === client &&
        data.profile.tenant === this.tenant() &&
        Array.isArray(data.blockers) &&
        typeof data.state === 'string' &&
        data.taxPeriod &&
        isoDate(data.taxPeriod.from) &&
        isoDate(data.taxPeriod.through)
    );
    if (data.state === 'BLOCKED_PENDING_POLICY')
      contract(
        data.taxableBase == null &&
          data.calculatedIsr == null &&
          data.actualWithheldAmount == null &&
          Array.isArray(data.allocations) &&
          data.allocations.length === 0
      );
    this.sources(data.sources, client);
    return data;
  }
  preview(client: number, period: IsrPeriod) {
    return this.get<IsrPreview>(
      this.client(client, 'PREVIEW_CONSOLIDATED_ISR') + '/preview',
      this.period(period),
      money
    ).pipe(
      map((data) => {
        this.previewResult(data, client);
        contract(data.taxPeriod.from === period.from && data.taxPeriod.through === period.through);
        return data;
      })
    );
  }
  private snapshot(data: IsrCalculation, client: number, id?: string): IsrCalculation {
    contract(
      data?.clientId === client &&
        data.tenant === this.tenant() &&
        uuid.test(data.calculationId) &&
        (!id || data.calculationId === id)
    );
    this.previewResult(data.result, client);
    return data;
  }
  history(client: number, after = 0, limit = ISR_PAGE_SIZE) {
    return this.get<IsrHistoryEntry[]>(
      this.client(client, 'READ_CONSOLIDATED_ISR') + '/calculations',
      this.page(after, limit),
      money
    ).pipe(
      map((data) => {
        contract(Array.isArray(data) && data.length <= limit);
        let previous = after;
        data.forEach((entry) => {
          contract(Number.isSafeInteger(entry.sequence) && entry.sequence > previous);
          previous = entry.sequence;
          this.snapshot(entry.calculation, client);
        });
        return data;
      })
    );
  }
  calculation(client: number, id: string) {
    return this.get<IsrCalculation>(this.calculationPath(client, id, 'READ_CONSOLIDATED_ISR'), {}, money).pipe(
      map((data) => this.snapshot(data, client, id))
    );
  }
  audit(client: number, id: string, after = 0, limit = ISR_PAGE_SIZE) {
    return this.get<IsrAuditEntry[]>(
      this.calculationPath(client, id, 'READ_CONSOLIDATED_ISR_AUDIT') + '/audit',
      this.page(after, limit)
    ).pipe(
      map((data) => {
        contract(Array.isArray(data) && data.length <= limit);
        let previous = after;
        data.forEach((entry) => {
          contract(Number.isSafeInteger(entry.id) && entry.id > previous);
          previous = entry.id;
        });
        return data;
      })
    );
  }
  reconciliation(client: number, id: string) {
    return this.get<IsrReconciliation>(
      this.calculationPath(client, id, 'RECONCILE_CONSOLIDATED_ISR') + '/reconciliation'
    ).pipe(
      map((data) => {
        contract(
          data?.calculationId === id &&
            Array.isArray(data.blockers) &&
            typeof data.accountingVerified === 'boolean' &&
            typeof data.financialRetryAllowed === 'boolean'
        );
        return data;
      })
    );
  }
}

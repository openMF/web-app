/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { AccountManagementApi } from './account-management-api.service';
import {
  Arrangement,
  PlannedCapabilities,
  Contribution,
  Eligibility,
  Pocket,
  NativeSnapshot,
  PlannedAudit,
  PlannedConfiguration,
  PAGE_SIZE
} from './account-management.model';
import { positiveAmount, positiveId, validName } from './account-management.state';

@Injectable({ providedIn: 'root' })
export class PlannedAccountsService {
  private readonly api = inject(AccountManagementApi);
  private readonly root = '/savings/planned-savings';
  private client(id: number) {
    return this.api.client(this.root, id);
  }
  private arrangement(client: number, id: string) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id))
      throw new Error('Invalid arrangement identifier');
    return this.client(client) + '/arrangements/' + id;
  }
  private pocket(client: number, id: number) {
    if (!positiveId(id)) throw new Error('Invalid pocket identifier');
    return this.client(client) + '/pockets/' + id;
  }
  template() {
    return this.api.get<PlannedCapabilities>(this.root + '/template');
  }
  arrangements(client: number, afterId = '') {
    return this.api
      .get<Arrangement[]>(this.client(client) + '/arrangements', { afterId, limit: PAGE_SIZE })
      .pipe(map((rows) => rows.map((row) => this.api.owned(row, client))));
  }
  contributions(client: number, row: Arrangement, afterSequence = 0) {
    return this.api.get<Contribution[]>(this.arrangement(client, row.id) + '/contributions', {
      revision: row.revision,
      afterSequence,
      limit: PAGE_SIZE
    });
  }
  maturity(client: number, id: string) {
    return this.api.get<Eligibility>(this.arrangement(client, id) + '/maturity');
  }
  history(client: number, kind: 'arrangements' | 'pockets', id: string | number, afterId = 0) {
    const base = kind === 'arrangements' ? this.arrangement(client, String(id)) : this.pocket(client, Number(id));
    return this.api.get<PlannedAudit[]>(base + '/audit', { afterId, limit: PAGE_SIZE });
  }
  pockets(client: number, afterId = 0) {
    return this.api.get<Pocket[]>(this.client(client) + '/pockets', { afterId, limit: PAGE_SIZE }).pipe(
      map((rows) =>
        rows.map((row) => {
          this.api.owned(row, client);
          this.api.owned(row.nativeAccount, client);
          if (row.nativeAccount.savingsAccountId !== row.savingsAccountId) throw new Error('Invalid pocket identity');
          return row;
        })
      )
    );
  }
  native(client: number, account: number) {
    if (!positiveId(account)) throw new Error('Invalid native identifier');
    return this.api.get<NativeSnapshot>(this.client(client) + '/accounts/' + account).pipe(
      map((row) => {
        this.api.owned(row, client);
        if (row.savingsAccountId !== account) throw new Error('Invalid native identity');
        return row;
      })
    );
  }
  closure(client: number, account: number) {
    return this.api.get<Eligibility>(this.client(client) + '/accounts/' + account + '/closure-eligibility');
  }
  savePocket(client: number, row: Pocket, name: string) {
    if (
      row.clientId !== client ||
      !validName(name) ||
      !positiveId(row.mainSavingsAccountId) ||
      row.relationshipStatus !== 'LINKED'
    )
      throw new Error('Invalid pocket metadata');
    return this.api
      .put<Pocket>(this.pocket(client, row.savingsAccountId), {
        expectedRevision: row.revision,
        mainSavingsAccountId: row.mainSavingsAccountId,
        policyVersion: row.policyVersion,
        mainPolicyVersion: row.mainPolicyVersion,
        name
      })
      .pipe(map((result) => this.api.owned(result, client)));
  }
  saveArrangement(client: number, id: string, expectedRevision: number, configuration: PlannedConfiguration) {
    if (!positiveAmount(configuration.contributionAmount, 6)) throw new Error('Invalid contribution amount');
    // Exact numeric JSON token; never pass this amount through binary floating point.
    const body = JSON.stringify({ expectedRevision, configuration }).replace(
      /"contributionAmount":"[0-9.]+"/,
      '"contributionAmount":' + configuration.contributionAmount.replace(/^0+(?=\d)/, '')
    );
    return this.api
      .put<Arrangement>(this.arrangement(client, id), body)
      .pipe(map((row) => this.api.owned(row, client)));
  }
  linkNative(client: number, row: Arrangement, savingsAccountId: number) {
    if (!positiveId(savingsAccountId) || row.clientId !== client) throw new Error('Invalid native link');
    return this.api
      .put<Arrangement>(this.arrangement(client, row.id) + '/native-account', {
        expectedRevision: row.revision,
        savingsAccountId
      })
      .pipe(map((result) => this.api.owned(result, client)));
  }
}

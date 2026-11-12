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
  MainCapabilities,
  MainRelationships,
  MainRelationship,
  MainAudit,
  NativeSavings,
  PAGE_SIZE
} from './account-management.model';
import { positiveId } from './account-management.state';

@Injectable({ providedIn: 'root' })
export class AccountRelationshipsService {
  private readonly api = inject(AccountManagementApi);
  private readonly root = '/savings/account-relationships';
  template() {
    return this.api.get<MainCapabilities>(this.root + '/template');
  }
  main(client: number) {
    return this.api.get<MainRelationships>(this.api.client(this.root, client) + '/main').pipe(
      map((data) => {
        this.api.owned(data, client);
        if (!Array.isArray(data.relationships) || data.relationships.length > 1)
          throw new Error('Invalid relationship response');
        data.relationships.forEach((row) => this.api.owned(row, client));
        return data;
      })
    );
  }
  bind(client: number, savingsAccountId: number) {
    if (!positiveId(savingsAccountId)) throw new Error('Invalid savings identifier');
    return this.api.put<MainRelationship>(this.api.client(this.root, client) + '/main', { savingsAccountId }).pipe(
      map((data) => {
        this.api.owned(data, client);
        if (data.savingsAccountId !== savingsAccountId) throw new Error('Invalid bound account identity');
        return data;
      })
    );
  }
  audit(client: number, afterId = 0) {
    return this.api
      .get<MainAudit[]>(this.api.client(this.root, client) + '/audit', { afterId, limit: PAGE_SIZE })
      .pipe(map((data) => data.map((row) => this.api.owned(row, client))));
  }
  native(client: number, id: number) {
    if (!positiveId(id)) throw new Error('Invalid savings identifier');
    return this.api.get<NativeSavings>('/savingsaccounts/' + id).pipe(
      map((data) => {
        this.api.owned(data, client);
        if (data.id !== id) throw new Error('Invalid native account');
        return data;
      })
    );
  }
}

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
  SweepCapabilities,
  GuaranteeSource,
  GuaranteeLoan,
  Decision,
  SweepAudit,
  Allocation,
  ReleaseStatus,
  Receipt,
  Reconciliation,
  PAGE_SIZE
} from './account-management.model';
import { positiveAmount, positiveId } from './account-management.state';

@Injectable({ providedIn: 'root' })
export class GuaranteeSweepsService {
  private readonly api = inject(AccountManagementApi);
  private readonly root = '/savings/guarantee-sweeps';
  private loan(client: number, loan: number) {
    if (!positiveId(loan)) throw new Error('Invalid loan identifier');
    return this.api.client(this.root, client) + '/loans/' + loan;
  }
  template() {
    return this.api.get<SweepCapabilities>(this.root + '/template');
  }
  sources(client: number, afterId = 0) {
    return this.api.get<GuaranteeSource[]>(this.api.client(this.root, client) + '/sources', {
      afterId,
      limit: PAGE_SIZE
    });
  }
  loans(client: number, afterId = 0) {
    return this.api.get<GuaranteeLoan[]>(this.api.client(this.root, client) + '/loans', { afterId, limit: PAGE_SIZE });
  }
  nativeLoan(client: number, loan: number) {
    return this.api
      .get<{ id: number; clientId: number; currency: { code: string; decimalPlaces: number } }>('/loans/' + loan)
      .pipe(
        map((row) => {
          this.api.owned(row, client);
          if (row.id !== loan) throw new Error('Invalid native loan');
          return row;
        })
      );
  }
  preview(client: number, loan: number, savingsAccountId: number, amount: string, digits: number) {
    if (!positiveId(savingsAccountId) || !positiveAmount(amount, digits)) throw new Error('Invalid preview input');
    return this.api.get<Decision>(this.loan(client, loan) + '/preview', { savingsAccountId, amount }).pipe(
      map((data) => {
        this.api.owned(data, client);
        if (data.loanId !== loan || data.savingsAccountId !== savingsAccountId)
          throw new Error('Invalid preview scope');
        return data;
      })
    );
  }
  audit(client: number, loan: number, afterId = 0) {
    return this.api.get<SweepAudit[]>(this.loan(client, loan) + '/audit', { afterId, limit: PAGE_SIZE });
  }
  allocations(client: number, loan: number, afterId = 0) {
    return this.api.get<Allocation[]>(this.loan(client, loan) + '/allocations', { afterId, limit: PAGE_SIZE });
  }
  releaseStatus(client: number, loan: number) {
    return this.api.get<ReleaseStatus>(this.loan(client, loan) + '/release-status', { afterId: 0, limit: PAGE_SIZE });
  }
  execution(client: number, loan: number, id: string) {
    return this.api.get<Receipt>(this.loan(client, loan) + '/executions/' + encodeURIComponent(id)).pipe(
      map((data) => {
        this.api.owned(data, client);
        if (data.loanId !== loan || data.id !== id) throw new Error('Invalid execution scope');
        return data;
      })
    );
  }
  reconciliation(client: number, loan: number, id: string) {
    return this.api
      .get<Reconciliation>(this.loan(client, loan) + '/executions/' + encodeURIComponent(id) + '/reconciliation')
      .pipe(
        map((result) => {
          if (result.executionId !== id) throw new Error('Invalid reconciliation scope');
          return result;
        })
      );
  }

  // BE-09 has no verified financial success state or native writer. No application/release POST is exposed here.
}

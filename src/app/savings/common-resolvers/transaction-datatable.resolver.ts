/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Angular Imports
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

// rxjs Imports
import { Observable } from 'rxjs';

// Custom Service
import { SavingsService } from '../savings.service';

@Injectable()
export class TransactionDatatableResolver {
  private savingsService = inject(SavingsService);

  /**
   * Returns the Transactions Account's Datatable data.
   * @returns {Observable<any>}
   */

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const accountId = route.parent.parent.paramMap.get('id');
    const datatableName = route.paramMap.get('datatableName');
    return this.savingsService.getSavingsTransactionDatatable(accountId, datatableName);
  }
}

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ExternalAssetOwnerService } from '../services/external-asset-owner.service';

@Injectable({
  providedIn: 'root'
})
export class ExternalAssetOwnerJournalEntryResolver {
  private externalAssetOwnerService = inject(ExternalAssetOwnerService);

  /**
   * Returns the Loans with Association data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const transferId = route.paramMap.get('transferId') || route.parent.paramMap.get('transferId');
    return this.externalAssetOwnerService.retrieveExternalAssetOwnerTransferJournalEntries(transferId);
  }
}

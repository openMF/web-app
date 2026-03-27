/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import { AccountingService } from '../../accounting.service';

@Injectable()
export class ProvisioningEntryEntriesResolver {
  private accountingService = inject(AccountingService);

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const provisioningEntryId = route.paramMap.get('id');
    return this.accountingService.getProvisioningEntryEntries(provisioningEntryId).pipe(
      catchError((error) => {
        if (error.status === 500) {
          return of({ pageItems: [], error: true });
        }
        return throwError(() => error);
      })
    );
  }
}

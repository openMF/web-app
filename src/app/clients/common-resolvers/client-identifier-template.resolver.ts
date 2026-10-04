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

/** rxjs Imports */
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client Identifier Template resolver.
 */
@Injectable()
export class ClientIdentifierTemplateResolver {
  private clientsService = inject(ClientsService);

  /**
   * Returns the Client Identities data.
   * Falls back to an empty object when the user lacks READ_CLIENTIDENTIFIER permission.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    return this.clientsService
      .getClientIdentifierTemplate(clientId)
      .pipe(catchError((err) => (err.status === 403 ? of({}) : throwError(() => err))));
  }
}

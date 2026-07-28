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
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client Identities resolver.
 */
@Injectable()
export class ClientIdentitiesResolver {
  private clientsService = inject(ClientsService);

  /**
   * Returns the Client Identities data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    return this.clientsService.getClientIdentifiers(clientId).pipe(
      switchMap((identities: any[]) => {
        if (!identities?.length) {
          return of(identities || []);
        }

        return forkJoin(
          identities.map((identity: any) =>
            this.clientsService.getClientIdentificationDocuments(identity.id).pipe(
              map((documents: any[]) => ({
                ...identity,
                documents: documents || []
              }))
            )
          )
        );
      })
    );
  }
}

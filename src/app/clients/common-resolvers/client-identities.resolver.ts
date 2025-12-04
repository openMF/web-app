/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';

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
    let identitiesData: any;
    return this.clientsService.getClientIdentifiers(clientId).pipe(
      map((identities: any) => {
        identitiesData = identities;
        const docObservable: Observable<any>[] = [];
        identities.forEach((identity: any) => {
          docObservable.push(this.clientsService.getClientIdentificationDocuments(identity.id));
        });
        forkJoin(docObservable).subscribe((documents) => {
          documents.forEach((document, index) => {
            identitiesData[index].documents = document;
          });
        });
        return identitiesData;
      })
    );
  }
}

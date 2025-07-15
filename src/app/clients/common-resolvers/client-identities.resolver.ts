/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Services */
import { ClientIdentifierService, DocumentsService } from '@fineract/client';

/**
 * Client Identities resolver.
 */
@Injectable()
export class ClientIdentitiesResolver {
  /**
   * @param {ClientIdentifierService} clientIdentifierService Client Identifier service.
   * @param {DocumentsService} documentsService Documents service.
   */
  constructor(
    private clientIdentifierService: ClientIdentifierService,
    private documentsService: DocumentsService
  ) {}

  /**
   * Returns the Client Identities data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    let identitiesData: any;
    return this.clientIdentifierService
      .retrieveAllClientIdentifiers({
        clientId: Number(clientId)
      })
      .pipe(
        map((identities: any) => {
          identitiesData = identities;
          const docObservable: Observable<any>[] = [];
          identities.forEach((identity: any) => {
            docObservable.push(
              this.documentsService.retrieveAllDocuments({
                entityType: 'client_identifiers',
                entityId: identity.id
              })
            );
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

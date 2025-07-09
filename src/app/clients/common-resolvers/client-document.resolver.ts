/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DocumentsService } from '@fineract/client';

/**
 * Client Documents resolver.
 */
@Injectable()
export class ClientDocumentsResolver {
  /**
   * @param {DocumentsService} documentsService Documents service.
   */
  constructor(private documentsService: DocumentsService) {}

  /**
   * Returns the Client's Documents data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    return this.documentsService.retrieveAllDocuments({
      entityType: 'clients',
      entityId: Number(clientId)
    });
  }
}

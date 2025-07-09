/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientIdentifierService } from '@fineract/client';

/**
 * Client Identifier Template resolver.
 */
@Injectable()
export class ClientIdentifierTemplateResolver {
  /**
   * @param {ClientIdentifierService} clientIdentifierService Client Identifier service.
   */
  constructor(private clientIdentifierService: ClientIdentifierService) {}

  /**
   * Returns the Client Identities data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    return this.clientIdentifierService.newClientIdentifierDetails({
      clientId: Number(clientId)
    });
  }
}

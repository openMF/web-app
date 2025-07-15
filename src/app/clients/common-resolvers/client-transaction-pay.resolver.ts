/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientChargesService } from '@fineract/client';

/**
 * Client Transaction data resolver.
 */
@Injectable()
export class ClientTransactionPayResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientChargesService: ClientChargesService) {}

  /**
   * Returns the Client Transaction data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.parent.paramMap.get('clientId');
    const chargeId = route.paramMap.get('chargeId');
    return this.clientChargesService.retrieveClientCharge({
      clientId: Number(clientId),
      chargeId: Number(chargeId)
    });
  }
}

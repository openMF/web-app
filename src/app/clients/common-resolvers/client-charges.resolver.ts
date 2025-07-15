/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientChargesService } from '@fineract/client';

/**
 * Client Charges data resolver.
 */
@Injectable()
export class ClientChargesResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientChargesService: ClientChargesService) {}

  /**
   * Returns the Client Charge data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    return this.clientChargesService.retrieveAllClientCharges({
      clientId: Number(clientId),
      pendingPayment: true
    });
  }
}

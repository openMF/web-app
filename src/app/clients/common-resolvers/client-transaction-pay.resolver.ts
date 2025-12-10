/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client Transaction data resolver.
 */
@Injectable()
export class ClientTransactionPayResolver {
  private clientsService = inject(ClientsService);

  /**
   * Returns the Client Transaction data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.parent.paramMap.get('clientId');
    const chargeId = route.paramMap.get('chargeId');
    return this.clientsService.getClientTransactionPay(clientId, chargeId);
  }
}

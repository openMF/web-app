/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientChargesService } from '@fineract/client';

/**
 * Client Charge data resolver.
 */
@Injectable()
export class ClientChargeViewResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientChargesService) {}

  /**
   * Returns the Client Charge data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.parent.paramMap.get('clientId');
    const chargeId = route.paramMap.get('chargeId');
    return this.clientsService.retrieveClientCharge({ clientId: +clientId, chargeId: +chargeId });
  }
}

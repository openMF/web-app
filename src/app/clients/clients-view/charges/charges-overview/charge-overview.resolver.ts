/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SelfClientService } from '@fineract/client';

/**
 * Client Charges data resolver.
 */
@Injectable()
export class ClientChargeOverviewResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private selfClientService: SelfClientService) {}

  /**
   * Returns the Client Charge data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.params.clientId;
    return this.selfClientService.retrieveAllClientCharges1(clientId);
  }
}

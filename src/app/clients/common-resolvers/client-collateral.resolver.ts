/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientCollateralManagementService } from '@fineract/client';

/**
 * Client Charges data resolver.
 */
@Injectable()
export class ClientCollateralResolver {
  /**
   * @param {ClientsService} clientsService Clients service.
   */
  constructor(private clientCollateralService: ClientCollateralManagementService) {}

  /**
   * Returns the Client Collateral data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    return this.clientCollateralService.getClientCollateralTemplate({ clientId: +clientId });
  }
}

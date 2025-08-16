/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientCollateralManagementService } from '@fineract/client';

/**
 * Client Collateral data resolver.
 */
@Injectable()
export class ClientCollateralResolver {
  /**
   * @param {ClientCollateralManagementService} clientCollateralManagementService Collaterals service.
   */
  constructor(private clientCollateralManagementService: ClientCollateralManagementService) {}

  /**
   * Returns the Client Collateral data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = Number(route.parent.paramMap.get('clientId'));
    const clientCollateralId = Number(route.parent.paramMap.get('collateralId'));
    return this.clientCollateralManagementService.getClientCollateralData({ clientId, clientCollateralId });
  }
}

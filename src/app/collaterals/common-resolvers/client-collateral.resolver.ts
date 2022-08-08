/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CollateralsService } from '../collaterals.service';

/**
 * Client Collateral data resolver.
 */
@Injectable()
export class ClientCollateralResolver implements Resolve<Object> {

    /**
     * @param {CollateralsService} collateralsService Collaterals service.
     */
    constructor(private collateralsService: CollateralsService) { }

    /**
     * Returns the Client Collateral data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const clientId = route.parent.paramMap.get('clientId');
        const collateralId = route.parent.paramMap.get('collateralId');
        return this.collateralsService.getClientCollateral(clientId, collateralId);
    }

}

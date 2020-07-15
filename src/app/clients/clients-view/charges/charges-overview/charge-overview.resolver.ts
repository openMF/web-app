/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../../../clients.service';

/**
 * Client Charges data resolver.
 */
@Injectable()
export class ClientChargeOverviewResolver implements Resolve<Object> {

    /**
     * @param {ClientsService} ClientsService Clients service.
     */
    constructor(private clientsService: ClientsService) { }

    /**
     * Returns the Client Charge data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const clientId = route.parent.params.clientId;
        return this.clientsService.getAllClientCharges(clientId);
    }

}

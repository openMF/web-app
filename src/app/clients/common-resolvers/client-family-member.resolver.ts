/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client Family Member resolver.
 */
@Injectable()
export class ClientFamilyMemberResolver implements Resolve<Object> {

    /**
     * @param {ClientsService} ClientsService Clients service.
     */
    constructor(private clientsService: ClientsService) { }

    /**
     * Returns the Clients data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const clientId = route.parent.parent.parent.paramMap.get('clientId');
        const familyMemberId = route.parent.paramMap.get('familyMemberId');
        return this.clientsService.getClientFamilyMember(clientId, familyMemberId);
    }

}

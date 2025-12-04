/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client Family Members resolver.
 */
@Injectable()
export class ClientFamilyMembersResolver {
  private clientsService = inject(ClientsService);

  /**
   * Returns the Clients data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.paramMap.get('clientId');
    return this.clientsService.getClientFamilyMembers(clientId);
  }
}

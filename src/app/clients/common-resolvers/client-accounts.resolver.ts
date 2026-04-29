/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientService } from '@fineract/client';

/**
 * Client Accounts data resolver.
 */
@Injectable()
export class ClientAccountsResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientService) {}

  /**
   * Returns the Client Account data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    return this.clientsService.retrieveAssociatedAccounts({ clientId: Number(clientId) });
  }
}

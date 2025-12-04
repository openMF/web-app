/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client Summary resolver.
 */
@Injectable()
export class ClientSummaryResolver {
  private clientsService = inject(ClientsService);

  /**
   * Returns the Client Summary data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    return this.clientsService.getClientSummary(clientId);
  }
}

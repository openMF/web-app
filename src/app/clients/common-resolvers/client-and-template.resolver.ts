/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Clients data and template resolver.
 */
@Injectable()
export class ClientDataAndTemplateResolver {
  private clientsService = inject(ClientsService);

  /**
   * Returns the Clients data and template.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.paramMap.get('clientId');
    return this.clientsService.getClientDataAndTemplate(clientId);
  }
}

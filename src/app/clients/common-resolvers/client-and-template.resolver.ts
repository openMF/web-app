/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Clients data and template resolver.
 */
@Injectable()
export class ClientDataAndTemplateResolver implements Resolve<Object> {

  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientsService) { }

  /**
   * Returns the Clients data and template.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.paramMap.get('clientId');
    return this.clientsService.getClientDataAndTemplate(clientId);
  }

}

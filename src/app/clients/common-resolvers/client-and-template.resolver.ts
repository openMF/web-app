/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientService } from '@fineract/client';

/**
 * Clients data and template resolver.
 */
@Injectable()
export class ClientDataAndTemplateResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientService) {}

  /**
   * Returns the Clients data and template.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.paramMap.get('clientId');
    return this.clientsService.retrieveOne11({
      clientId: Number(clientId)
    });
  }
}

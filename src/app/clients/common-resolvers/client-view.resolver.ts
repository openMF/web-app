/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientService } from '@fineract/client';

/**
 * Clients data resolver.
 */
@Injectable()
export class ClientViewResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientService) {}

  /**
   * Returns the Clients data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = Number(route.paramMap.get('clientId'));
    return this.clientsService.retrieveOne11({ clientId });
  }
}

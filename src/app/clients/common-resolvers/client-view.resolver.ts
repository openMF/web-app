/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Clients data resolver.
 */
@Injectable()
export class ClientViewResolver {
  private clientsService = inject(ClientsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor() {}

  /**
   * Returns the Clients data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.paramMap.get('clientId');
    return this.clientsService.getClientData(clientId);
  }
}

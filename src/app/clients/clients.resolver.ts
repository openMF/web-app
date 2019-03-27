/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from './clients.service';

/**
 * Clients data resolver.
 */
@Injectable()
export class ClientsResolver implements Resolve<Object> {

  /**
   * @param {ClientsService} clientsService Clients service.
   */
  constructor(private clientsService: ClientsService) {}

  /**
   * Returns the Clients data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.clientsService.getClients();
  }

}

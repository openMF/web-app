/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client datatables resolver.
 */
@Injectable()
export class ClientDatatablesResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientsService) {}

  /**
   * Returns the Client datatables.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.clientsService.getClientDatatables();
  }
}

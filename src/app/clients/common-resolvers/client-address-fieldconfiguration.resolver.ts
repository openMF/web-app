/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client Address Field Configuration resolver.
 */
@Injectable()
export class ClientAddressFieldConfigurationResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientsService) {}

  /**
   * Returns the Client Address Field Configuration.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.clientsService.getAddressFieldConfiguration();
  }
}

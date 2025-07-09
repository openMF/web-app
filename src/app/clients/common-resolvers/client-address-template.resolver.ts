/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsAddressService } from '@fineract/client';

/**
 * Client Address Field Configuration resolver.
 */
@Injectable()
export class ClientAddressTemplateResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientsAddressService) {}

  /**
   * Returns the Client Address Field Configuration.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.clientsService.getAddressesTemplate();
  }
}

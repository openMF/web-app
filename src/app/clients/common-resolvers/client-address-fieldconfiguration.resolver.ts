/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsAddressService } from '@fineract/client';

/**
 * Client Address Field Configuration resolver.
 */
@Injectable()
export class ClientAddressFieldConfigurationResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsAddressService: ClientsAddressService) {}

  /**
   * Returns the Client Address Field Configuration.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.paramMap.get('clientId');
    return this.clientsAddressService.getAddresses1({
      clientid: Number(clientId)
    });
  }
}

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client Address Field Configuration resolver.
 */
@Injectable()
export class ClientAddressFieldConfigurationResolver {
  private clientsService = inject(ClientsService);

  /**
   * Returns the Client Address Field Configuration.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.clientsService.getAddressFieldConfiguration();
  }
}

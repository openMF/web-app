/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientService } from '@fineract/client';

/**
 * Grouped Client Data data resolver.
 */
@Injectable()
export class GetGroupedClientsData {
  /**
   * @param {ClientService} clientService Client service.
   */
  constructor(private clientService: ClientService) {}

  /**
   * Returns the grouped client data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.clientService.retrieveAll21();
  }
}

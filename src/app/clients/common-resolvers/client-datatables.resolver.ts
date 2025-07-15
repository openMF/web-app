/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * Client datatables resolver.
 */
@Injectable()
export class ClientDatatablesResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the Client datatables.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.dataTablesService.getDatatable({ datatable: 'm_client' });
  }
}

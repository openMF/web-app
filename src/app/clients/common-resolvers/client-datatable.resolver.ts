/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * Client datatable resolver.
 */
@Injectable()
export class ClientDatatableResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: DataTablesService) {}

  /**
   * Returns the Client datatables.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.paramMap.get('clientId');
    const datatableName = route.paramMap.get('datatableName');
    return this.clientsService.getDatatable1({ datatable: datatableName, apptableId: +clientId });
  }
}

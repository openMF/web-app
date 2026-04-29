/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * Group Datatables data resolver.
 */
@Injectable()
export class GroupDatatablesResolver {
  /**
   * @param {DataTablesService} DataTablesService Groups service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the Group's Datatables data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.dataTablesService.getDatatables();
  }
}

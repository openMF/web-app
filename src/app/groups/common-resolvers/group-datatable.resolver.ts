/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DataTablesService } from '@fineract/client';

/**
 * Group Datatable data resolver.
 */
@Injectable()
export class GroupDatatableResolver {
  /**
   * @param {DataTablesService} DataTablesService Groups service.
   */
  constructor(private dataTablesService: DataTablesService) {}

  /**
   * Returns the Group's Datatable data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.parent.parent.paramMap.get('groupId');
    const datatableName = route.paramMap.get('datatableName');
    return this.dataTablesService.getDatatables({
      apptable: 'm_group'
    });
  }
}

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '../groups.service';

/**
 * Group Datatable data resolver.
 */
@Injectable()
export class GroupDatatableResolver {
  private groupsService = inject(GroupsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {GroupsService} GroupsService Groups service.
   */
  constructor() {}

  /**
   * Returns the Group's Datatable data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.parent.parent.paramMap.get('groupId');
    const datatableName = route.paramMap.get('datatableName');
    return this.groupsService.getGroupDatatable(groupId, datatableName);
  }
}

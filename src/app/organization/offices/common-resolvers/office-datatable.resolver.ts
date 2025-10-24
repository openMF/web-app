/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Office Datatable data resolver.
 */
@Injectable()
export class OfficeDatatableResolver {
  private systemService = inject(SystemService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SystemService} systemService Products service.
   */
  constructor() {}

  /**
   * Returns the Office's Datatable data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = route.parent.parent.paramMap.get('officeId');
    const datatableName = route.paramMap.get('datatableName');
    return this.systemService.getEntityDatatable(officeId, datatableName);
  }
}

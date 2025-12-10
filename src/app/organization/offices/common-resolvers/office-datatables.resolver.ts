/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Office Datatables data resolver.
 */
@Injectable()
export class OfficeDatatablesResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the loan product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getEntityDatatables('m_office');
  }
}

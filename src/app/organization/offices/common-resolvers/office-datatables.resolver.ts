/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Office Datatables data resolver.
 */
@Injectable()
export class OfficeDatatablesResolver implements Resolve<Object> {

  /**
   * @param {SystemService} systemService Products service.
   */
  constructor(private systemService: SystemService) { }

  /**
   * Returns the loan product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getEntityDatatables('m_office');
  }

}

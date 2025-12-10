/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Code Values data resolver.
 */
@Injectable()
export class CodeValuesResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Code Values data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const codeId = route.paramMap.get('id');
    return this.systemService.getCodeValues(codeId);
  }
}

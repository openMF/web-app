/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CodesService } from '@fineract/client';

/**
 * Code data resolver.
 */
@Injectable()
export class CodeResolver {
  /**
   * @param {CodesService} codesService Codes service.
   */
  constructor(private codesService: CodesService) {}

  /**
   * Returns the Code data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.codesService.retrieveCode({ codeId: Number(id) });
  }
}

/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CodeValuesService } from '@fineract/client';

/**
 * Code Values data resolver.
 */
@Injectable()
export class CodeValuesResolver {
  /**
   * @param {CodeValuesService} codeValuesService Code Values service.
   */
  constructor(private codeValuesService: CodeValuesService) {}

  /**
   * Returns the Code Values data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const codeId = route.paramMap.get('id');
    return this.codeValuesService.retrieveAllCodeValues({ codeId: Number(codeId) });
  }
}

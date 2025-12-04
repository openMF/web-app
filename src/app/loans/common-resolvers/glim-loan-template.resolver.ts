/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * GLIM Loan template data resolver.
 */
@Injectable()
export class GLIMLoanTemplateResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the loan account template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.paramMap.get('groupId');
    return this.loansService.getGLIMLoanAccountTemplate(groupId);
  }
}

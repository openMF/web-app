/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DocumentsService } from '@fineract/client';

/**
 * Loans notes resolver.
 */
@Injectable()
export class LoanDocumentsResolver {
  /**
   * @param {DocumentsService} documentsService Documents service.
   */
  constructor(private documentsService: DocumentsService) {}

  /**
   * Returns the Loans data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    return this.documentsService.retrieveAllDocuments({ entityType: 'loans', entityId: Number(loanId) });
  }
}

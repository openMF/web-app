import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DocumentsService } from '@fineract/client';

@Injectable({
  providedIn: 'root'
})
export class SavingDocumentsResolver {
  /**
   * @param {DocumentsService} documentsService Documents service.
   */
  constructor(private documentsService: DocumentsService) {}

  /**
   * Returns the Savings data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.parent.paramMap.get('savingAccountId');
    return this.documentsService.retrieveAllDocuments({
      entityId: Number(savingAccountId),
      entityType: 'savings'
    });
  }
}

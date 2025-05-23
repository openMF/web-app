import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SavingsService } from '../savings.service';

@Injectable({
  providedIn: 'root'
})
export class SavingDocumentsResolver {
  /**
   * @param {SavingsService} savingsService Savings service.
   */
  constructor(private savingsService: SavingsService) {}

  /**
   * Returns the Savings data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.parent.paramMap.get('savingAccountId');
    return this.savingsService.getSavingsDocuments(savingAccountId);
  }
}

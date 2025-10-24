import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SavingsService } from '../savings.service';

@Injectable({
  providedIn: 'root'
})
export class SavingDocumentsResolver {
  private savingsService = inject(SavingsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SavingsService} savingsService Savings service.
   */
  constructor() {}

  /**
   * Returns the Savings data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.parent.paramMap.get('savingAccountId');
    return this.savingsService.getSavingsDocuments(savingAccountId);
  }
}

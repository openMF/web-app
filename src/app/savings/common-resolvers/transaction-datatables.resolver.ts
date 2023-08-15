// Angular Imports
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

//rxjs Imports 
import { Observable, of } from 'rxjs';

// Custom Service
import { SavingsService } from '../savings.service';

@Injectable()
export class TransactionDatatablesResolver implements Resolve<Object> {

  /**
   * 
   * @param savingsService 
   */
  constructor(private savingsService:SavingsService){}
  /**
   * 
   * @param route 
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.savingsService.getSavingsTransactionDatatables();
  }
}
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FundsService } from '@fineract/client';

@Injectable({
  providedIn: 'root'
})
export class ManageFundResolver {
  /**
   * @param {FundsService} fundsService Funds service.
   */
  constructor(private fundsService: FundsService) {}

  /**
   * Returns the manage funds data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const fundId = route.paramMap.get('id');
    return this.fundsService.retrieveFunds('body', false, { httpHeaderAccept: 'application/json' });
  }
}

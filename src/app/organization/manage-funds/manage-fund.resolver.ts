import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { OrganizationService } from '../organization.service';

@Injectable({
  providedIn: 'root'
})
export class ManageFundResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the manage funds data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const fundId = route.paramMap.get('id');
    return this.organizationService.getFund(fundId);
  }
}

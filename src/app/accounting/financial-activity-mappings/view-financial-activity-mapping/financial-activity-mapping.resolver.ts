/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { MappingFinancialActivitiesToAccountsService } from '@fineract/client';

/**
 * Financial activity mapping data resolver.
 */
@Injectable()
export class FinancialActivityMappingResolver {
  /**
   * @param {MappingFinancialActivitiesToAccountsService} mappingFinancialActivitiesToAccountsService Mapping Financial Activities to Accounts service.
   */
  constructor(private mappingFinancialActivitiesToAccountsService: MappingFinancialActivitiesToAccountsService) {}

  /**
   * Returns the financial activity mapping data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const financialActivityAccountId = route.paramMap.get('id');
    return this.mappingFinancialActivitiesToAccountsService.retreive({ mappingId: Number(financialActivityAccountId) });
  }
}

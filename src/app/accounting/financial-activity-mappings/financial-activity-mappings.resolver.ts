/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { MappingFinancialActivitiesToAccountsService } from '@fineract/client';

/**
 * Financial activity mappings data resolver.
 */
@Injectable()
export class FinancialActivityMappingsResolver {
  /**
   * @param {MappingFinancialActivitiesToAccountsService} mappingFinancialActivitiesToAccountsService Mapping service.
   */
  constructor(private mappingFinancialActivitiesToAccountsService: MappingFinancialActivitiesToAccountsService) {}

  /**
   * Returns the financial activity mappings data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.mappingFinancialActivitiesToAccountsService.retrieveAll();
  }
}

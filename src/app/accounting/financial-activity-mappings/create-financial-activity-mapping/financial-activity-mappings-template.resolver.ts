/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { MappingFinancialActivitiesToAccountsService } from '@fineract/client';

/**
 * Financial activity mappings template data resolver.
 */
@Injectable()
export class FinancialActivityMappingsTemplateResolver {
  /**
   * @param {MappingFinancialActivitiesToAccountsService} mappingFinancialActivitiesToAccountsService Mapping Financial Activities to Accounts service.
   */
  constructor(private mappingFinancialActivitiesToAccountsService: MappingFinancialActivitiesToAccountsService) {}

  /**
   * Returns the financial activity mappings template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.mappingFinancialActivitiesToAccountsService.retrieveTemplate();
  }
}

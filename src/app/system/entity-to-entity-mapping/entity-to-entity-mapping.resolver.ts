/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { FineractEntityService } from '@fineract/client';

/**
 * Entity to entity mapping data resolver.
 */
@Injectable()
export class EntityToEntityMappingResolver {
  /**
   * @param {FineractEntityService} fineractEntityService Fineract Entity Service.
   */
  constructor(private fineractEntityService: FineractEntityService) {}

  /**
   * Returns the Mapping data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.fineractEntityService.retrieveAll7();
  }
}

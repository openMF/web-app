/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Entity to entity mapping data resolver.
 */
@Injectable()
export class EntityToEntityMappingResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the Mapping data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getEntityMappings();
  }
}

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Entity to entity mapping data resolver.
 */
@Injectable()
export class EntityToEntityMappingResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Mapping data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getEntityMappings();
  }
}

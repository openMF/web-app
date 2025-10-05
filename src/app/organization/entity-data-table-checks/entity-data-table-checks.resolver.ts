/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { EntityDataTableService } from '@fineract/client';

/**
 * Entity Data Table Checks data resolver.
 */
@Injectable()
export class EntityDataTableChecksResolver {
  /**
   * @param {EntityDataTableService} entityDataTableService Entity Data Table service.
   */
  constructor(private entityDataTableService: EntityDataTableService) {}

  /**
   * Returns the Entity Data Table Checks data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.entityDataTableService.retrieveAll6();
  }
}

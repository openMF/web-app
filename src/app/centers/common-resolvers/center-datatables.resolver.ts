/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CentersService } from '../centers.service';

/**
 * center datatables resolver.
 */
@Injectable()
export class CenterDatatablesResolver {
  private centersService = inject(CentersService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {centersService} centersService centers service.
   */
  constructor() {}

  /**
   * Returns the center datatables.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.centersService.getcenterDatatables();
  }
}

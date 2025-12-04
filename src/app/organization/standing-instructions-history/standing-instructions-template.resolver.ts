/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Standing Instructions Template resolver.
 */
@Injectable()
export class StandingInstructionsTemplateResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the Standing Instruction template.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getStandingInstructionTemplate();
  }
}

/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Standing Instructions Template resolver.
 */
@Injectable()
export class StandingInstructionsTemplateResolver implements Resolve<Object> {

  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor(private organizationService: OrganizationService) {}

  /**
   * Returns the Standing Instruction template.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getStandingInstructionTemplate();
  }

}

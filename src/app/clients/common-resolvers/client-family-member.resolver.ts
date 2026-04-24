/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientFamilyMemberService } from '@fineract/client';

/**
 * Client Family Member resolver.
 */
@Injectable()
export class ClientFamilyMemberResolver {
  /**
   * @param {ClientFamilyMemberService} clientFamilyMemberService Client Family Member service.
   */
  constructor(private clientFamilyMemberService: ClientFamilyMemberService) {}

  /**
   * Returns the Clients data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.parent.paramMap.get('clientId');
    const familyMemberId = route.parent.paramMap.get('familyMemberId');
    return this.clientFamilyMemberService.getFamilyMember({
      clientId: Number(clientId),
      familyMemberId: Number(familyMemberId)
    });
  }
}

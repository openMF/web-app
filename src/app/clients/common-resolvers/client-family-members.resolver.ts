/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientFamilyMemberService } from '@fineract/client';

/**
 * Client Family Members resolver.
 */
@Injectable()
export class ClientFamilyMembersResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientFamilyMemberService: ClientFamilyMemberService) {}

  /**
   * Returns the Clients data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.paramMap.get('clientId');
    return this.clientFamilyMemberService.getFamilyMembers({
      clientId: Number(clientId)
    });
  }
}

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/** Custom Services */
import { SavingsService } from '../savings.service';
import { ClientsService } from 'app/clients/clients.service';
import { GroupsService } from 'app/groups/groups.service';
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Savings Account Actions data resolver.
 */
@Injectable()
export class SavingsAccountActionsResolver {
  private savingsService = inject(SavingsService);
  private clientsService = inject(ClientsService);
  private groupsService = inject(GroupsService);
  private organizationService = inject(OrganizationService);

  /**
   * Returns the Savings account actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const savingAccountId =
      route.paramMap.get('savingAccountId') || route.parent.parent.paramMap.get('savingAccountId');
    switch (actionName) {
      case 'Assign Staff':
        return this.savingsService.getSavingsAccountData(savingAccountId).pipe(
          switchMap((account: any) => {
            if (!account.clientId && !account.groupId) {
              return of({ ...account, fieldOfficerOptions: [] });
            }
            const entityObs = account.clientId
              ? this.clientsService.getClientData(account.clientId)
              : this.groupsService.getGroupData(account.groupId);
            return entityObs.pipe(
              switchMap((entity: any) => this.organizationService.getStaff(entity.officeId, true)),
              map((staff: any) => ({
                ...account,
                fieldOfficerOptions: staff
              }))
            );
          })
        );
      case 'Add Charge':
        return this.savingsService.getSavingsChargeTemplateResource(savingAccountId);
      case 'Withdrawal':
      case 'Deposit':
      case 'Hold Amount':
        return this.savingsService.getSavingsTransactionTemplateResource(savingAccountId);
      case 'Close':
        return forkJoin([
          this.savingsService.getSavingsTransactionTemplateResource(savingAccountId),
          this.savingsService.getSavingsAccountData(savingAccountId)
        ]);
      case 'Apply Annual Fees':
        return this.savingsService.getSavingsAccountData(savingAccountId);
      default:
        return undefined;
    }
  }
}

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';

/**
 * View Account Transfer data resolver.
 */
@Injectable()
export class ViewAccountTransferResolver {
  private accountTransfersService = inject(AccountTransfersService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {AccountTransfersService} AccountTransfersService Savings service.
   */
  constructor() {}

  /**
   * Returns the View Account Transfer data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const transferId = route.paramMap.get('transferid');
    return this.accountTransfersService.getViewAccountTransferDetails(transferId);
  }
}

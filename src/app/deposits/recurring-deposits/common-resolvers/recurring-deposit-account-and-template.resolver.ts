/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { RecurringDepositsService } from '../recurring-deposits.service';

/**
 * Recurring Deposits Account Template resolver.
 */
@Injectable()
export class RecurringDepositsAccountAndTemplateResolver {
  private recurringDepositsService = inject(RecurringDepositsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {RecurringDepositsService} recurringDepositsService Recurring Deposits service.
   */
  constructor() {}

  /**
   * Returns the Recurring Deposits Account Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const recurringDepositAccountId = route.paramMap.get('recurringDepositAccountId');
    return this.recurringDepositsService.getRecurringDepositsAccountAndTemplate(recurringDepositAccountId);
  }
}

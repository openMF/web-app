/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Provisioning entries data resolver.
 */
@Injectable()
export class ProvisioningEntriesResolver {
  private accountingService = inject(AccountingService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor() {}

  /**
   * Returns the provisioning entries data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getProvisioningEntries();
  }
}

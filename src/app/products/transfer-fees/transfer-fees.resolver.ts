/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TransferFeesService } from './transfer-fees.service';

/** Custom Models */
import { TransferFee } from './models/transfer-fee.model';

/**
 * Transfer fees resolver.
 */
@Injectable()
export class TransferFeesResolver {
  private transferFeesService = inject(TransferFeesService);

  /**
   * Returns the transfer fees data.
   * @returns {Observable<TransferFee[]>}
   */
  resolve(): Observable<TransferFee[]> {
    return this.transferFeesService.getTransferFees();
  }
}

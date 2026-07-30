/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TransferFeesService } from './transfer-fees.service';

/** Custom Models */
import { TransferFee } from './models/transfer-fee.model';

/**
 * Transfer fee resolver.
 */
@Injectable()
export class TransferFeeResolver {
  private transferFeesService = inject(TransferFeesService);

  /**
   * Returns the transfer fee data.
   * @returns {Observable<TransferFee>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<TransferFee> {
    const transferFeeId = route.parent?.paramMap.get('id') ?? route.paramMap.get('id');
    if (!transferFeeId) {
      throw new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found'
      });
    }
    return this.transferFeesService.getTransferFee(transferFeeId);
  }
}

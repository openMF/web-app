/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'chargesFilter' })
export class ChargesFilterPipe implements PipeTransform {
  transform(charges: any, chargesDataSource: any, currencyCode: string, multiDisburseLoan?: boolean): any {
    if (charges) {
      charges = charges.filter((charge: any) => {
        if (
          charge.currency.code !== currencyCode ||
          (!!multiDisburseLoan && charge.chargeTimeType.id === 12) ||
          chargesDataSource.filter((chargeData: any) => chargeData.id === charge.id).length
        ) {
          return false;
        }
        return true;
      });
    }
    return charges;
  }
}

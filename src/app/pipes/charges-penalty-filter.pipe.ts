/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'chargesPenaltyFilter' })
export class ChargesPenaltyFilterPipe implements PipeTransform {
  transform(charges: any, penalty: boolean): any {
    if (charges) {
      charges = charges.filter((charge: any) => {
        if (charge.penalty === penalty) {
          return true;
        }
        return false;
      });
    }
    return charges;
  }
}

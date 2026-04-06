/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExternalAssetOwner {
  defaultDate = '9999-12-31';

  validateStatus(item: any, status: string): boolean {
    if (item != null) {
      return item.status === status;
    }
    return false;
  }

  itemCurrentStatus(item: any): string {
    if (this.isBuyBackPending(item)) {
      return item.status + ' PENDING';
    }
    return item.status;
  }

  itemStatus(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  isPending(item: any): boolean {
    return item.status === 'PENDING';
  }

  isPendingOrCanceled(item: any): boolean {
    return item.status === 'PENDING' || item.status === 'CANCELLED' || this.isBuyBackPending(item);
  }

  isBuyBackPending(item: any): boolean {
    return item.status === 'BUYBACK' && item.effectiveTo === this.defaultDate;
  }

  canBeCancelled(item: any): boolean {
    return this.validateStatus(item, 'PENDING');
  }

  canBeSold(item: any): boolean {
    if (item == null) {
      return true;
    }
    return [
        '',
        'CANCELLED'
      ].includes(item.status) || (item.status === 'BUYBACK' && item.effectiveTo !== this.defaultDate);
  }

  canBeBuyed(item: any): boolean {
    return this.validateStatus(item, 'ACTIVE');
  }
}

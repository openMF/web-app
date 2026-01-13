/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessingStrategyService {
  advancedTransactionProcessingStrategy = new BehaviorSubject<boolean>(false);

  constructor() {}

  initialize(value: boolean) {
    this.advancedTransactionProcessingStrategy.next(value);
  }

  get isAdvancedTransactionProcessingStrategy(): boolean {
    return this.advancedTransactionProcessingStrategy.value;
  }
}

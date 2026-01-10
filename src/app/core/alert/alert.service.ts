/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, EventEmitter } from '@angular/core';

/** Custom Model */
import { Alert } from './alert.model';

/**
 * Alert service.
 */
@Injectable({
  providedIn: 'root'
})
export class AlertService {
  /** Alert event. */
  public alertEvent: EventEmitter<Alert>;

  /**
   * Initializes alert event.
   */
  constructor() {
    this.alertEvent = new EventEmitter();
  }

  /**
   * Emits an alert event.
   * @param {Alert} alertEvent Alert event.
   */
  alert(alertEvent: Alert) {
    this.alertEvent.emit(alertEvent);
  }
}

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

import { Injectable, EventEmitter } from '@angular/core';

export interface Alert {
  type: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  public alertEvent: EventEmitter<Alert>;

  constructor() {
    this.alertEvent = new EventEmitter();
  }

  alert(alertEvent: Alert) {
    this.alertEvent.emit(alertEvent);
  }

}

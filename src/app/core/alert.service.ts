import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  public alertEvent: EventEmitter<any>;

  constructor() {
    this.alertEvent = new EventEmitter();
  }

  alert(alertEvent: any) {
    this.alertEvent.emit(alertEvent);
  }

}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { interval, merge, fromEvent, Observable } from 'rxjs';
import { takeUntil, repeat, map } from 'rxjs/operators';

/**
 *  Idle timeout service used to track idle user
 */
@Injectable({
  providedIn: 'root'
})
export class IdleTimeoutService {
  // max timeout for an idle user
  readonly timeoutDelay = environment.session.timeout.idleTimeout || 300000; // 5 minutes

  // observable timeout
  readonly $onSessionTimeout: Observable<void>;

  constructor() {
    const events = [
      'mousemove',
      'keydown',
      'wheel',
      'mousedown',
      'scroll'
    ];
    const $signal = merge(...events.map((eventName) => fromEvent(document, eventName)));
    this.$onSessionTimeout = interval(this.timeoutDelay).pipe(
      takeUntil($signal),
      map((): void => undefined),
      repeat()
    );
  }
}

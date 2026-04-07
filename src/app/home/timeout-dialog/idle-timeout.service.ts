import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { fromEvent, merge, Subject, timer, Observable, Subscription } from 'rxjs';
import { switchMap, takeUntil, tap, map } from 'rxjs/operators';

/**
 *  Idle timeout service used to track idle user
 */
@Injectable({
  providedIn: 'root'
})
export class IdleTimeoutService {
  // max timeout for an idle user
  private readonly timeoutDelay = environment.session.timeout.idleTimeout || 300000;
  private timeout$ = new Subject<void>();
  private resetTimer$ = new Subject<void>();
  private active = false;
  private timerSubscription?: Subscription;
  private userActionsSubscription?: Subscription;

  // observable timeout
  readonly $onSessionTimeout: Observable<void>;

  constructor() {
    this.$onSessionTimeout = this.timeout$.asObservable();

    this.resetTimer$.subscribe(() => {
      this.timerSubscription?.unsubscribe();
      this.timerSubscription = timer(this.timeoutDelay).subscribe(() => {
        this.timeout$.next();
        this.stop();
      });
    });
  }

  start() {
    if (!this.active) {
      this.active = true;
      this.reset();

      // Subscribe to user actions only when active
      const events = [
        'mousemove',
        'keydown',
        'wheel',
        'mousedown',
        'scroll'
      ];
      const userActions$ = merge(...events.map((e) => fromEvent(document, e)));
      this.userActionsSubscription = userActions$.subscribe(() => {
        this.reset();
      });
    }
  }

  stop() {
    if (this.active) {
      this.active = false;
      this.timerSubscription?.unsubscribe();
      this.userActionsSubscription?.unsubscribe();
    }
  }

  reset() {
    if (this.active) {
      this.resetTimer$.next();
    }
  }
}

import { OverlayRef, FlexibleConnectedPositionStrategy, ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { PopoverConfig } from './popover-config';

/**
 * Reference to a popover opened via the Popover service.
 */
export class PopoverRef<T = any> {
  private afterClosedSubject = new Subject<T>();

  constructor(private overlayRef: OverlayRef,
              private positionStrategy: FlexibleConnectedPositionStrategy,
              public config: PopoverConfig) {
    if (!config.disableClose) {
      this.overlayRef.backdropClick().subscribe(() => {
        // this.close();
      });

      this.overlayRef.keydownEvents().pipe(
        filter(event => event.key === 'Escape')
      ).subscribe(() => {
        // this.close();
      });
    }
  }

  close(dialogResult?: T): void {
    this.afterClosedSubject.next(dialogResult);
    this.afterClosedSubject.complete();

    this.overlayRef.dispose();
  }

  afterClosed(): Observable<T> {
    return this.afterClosedSubject.asObservable();
  }

  positionChanges(): Observable<ConnectedOverlayPositionChange> {
    return this.positionStrategy.positionChanges;
  }
}

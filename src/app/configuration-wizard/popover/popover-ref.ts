/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { OverlayRef, FlexibleConnectedPositionStrategy, ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

/** rxjs Imports */
import { filter } from 'rxjs/operators';

/** Custom config. */
import { PopoverConfig } from './popover-config';

/** Matches the leave animation in popover.component.scss. */
const LEAVE_ANIMATION_MS = 120;

/**
 * Reference to a popover opened via the Popover service.
 */
export class PopoverRef<T = any> {
  private afterClosedSubject = new Subject<T>();
  private closing = false;

  /**
   * @param {OverlayRef} overlayRef OverlayRef.
   * @param {FlexibleConnectedPositionStrategy} positionStrategy FlexibleConnectedPositionStrategy.
   * @param {PopoverConfig} config PopoverConfig.
   */
  constructor(
    private overlayRef: OverlayRef,
    private positionStrategy: FlexibleConnectedPositionStrategy,
    public config: PopoverConfig
  ) {
    if (!config.disableClose) {
      this.overlayRef.backdropClick().subscribe(() => {
        // this.close();
      });

      this.overlayRef
        .keydownEvents()
        .pipe(filter((event) => event.key === 'Escape'))
        .subscribe(() => {
          // this.close();
        });
    }
  }

  /**
   * Close popover
   */
  close(dialogResult?: T): void {
    if (this.closing) {
      return;
    }
    this.closing = true;

    this.afterClosedSubject.next(dialogResult);
    this.afterClosedSubject.complete();

    // Its buttons must not fire a second time while the popover animates out.
    this.overlayRef.overlayElement.inert = true;
    this.overlayRef.addPanelClass('popover-leaving');
    setTimeout(() => this.overlayRef.dispose(), LEAVE_ANIMATION_MS);
  }

  /**
   * @returns {Observable<T>}
   */
  afterClosed(): Observable<T> {
    return this.afterClosedSubject.asObservable();
  }

  /**
   * @returns {Observable<ConnectedOverlayPositionChange>}
   */
  positionChanges(): Observable<ConnectedOverlayPositionChange> {
    return this.positionStrategy.positionChanges;
  }
}

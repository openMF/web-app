/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/** rxjs Imports */
import { Subscription, merge } from 'rxjs';

/** Custom Imports */
import { PopoverSpotlightComponent } from './popover-spotlight.component';

/** Space left between the target and the edge of the cut-out, in pixels. */
const TARGET_PADDING = 8;
/**
 * How long the spotlight stays up after its popover closes. A tour opens its next
 * step within this window, so the page stays dimmed from one step to the next.
 */
const NEXT_STEP_WAIT_MS = 400;
/** Matches the opacity transition in popover-spotlight.component.scss. */
const FADE_OUT_MS = 240;

/**
 * Keeps a single dimmed layer on screen across popovers, moving its cut-out to
 * each new target instead of removing and recreating the backdrop on every step.
 */
@Injectable({
  providedIn: 'root'
})
export class PopoverSpotlightService {
  private overlay = inject(Overlay);
  private scrollDispatcher = inject(ScrollDispatcher);
  private viewportRuler = inject(ViewportRuler);
  private dialog = inject(MatDialog);

  private overlayRef: OverlayRef | null = null;
  private spotlight: PopoverSpotlightComponent | null = null;
  private target: HTMLElement | null = null;
  private subscriptions = Subscription.EMPTY;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  /** Number of open popovers using the spotlight. */
  private holders = 0;

  /**
   * Moves the spotlight to the target, showing it first if needed.
   * Call before creating the popover overlay so the popover stacks above it.
   * Each call must be paired with a call to `release`.
   * @param {HTMLElement} target Element to leave undimmed.
   */
  show(target: HTMLElement): void {
    clearTimeout(this.hideTimer);
    this.holders++;
    this.target = target;

    if (!this.overlayRef) {
      this.attach();
    }
    this.spotlight.leaving.set(false);
    this.updateRect();
  }

  /**
   * Hides the spotlight, unless another popover claims it in the meantime.
   */
  release(): void {
    this.holders--;
    if (this.holders === 0) {
      this.hideTimer = setTimeout(() => this.fadeOut(), NEXT_STEP_WAIT_MS);
    }
  }

  private attach(): void {
    this.overlayRef = this.overlay.create({
      width: '100%',
      height: '100%',
      positionStrategy: this.overlay.position().global()
    });
    this.spotlight = this.overlayRef.attach(new ComponentPortal(PopoverSpotlightComponent)).instance;
    this.subscriptions = merge(this.scrollDispatcher.scrolled(0), this.viewportRuler.change(0)).subscribe(() =>
      this.updateRect()
    );
    // A dialog brings its own backdrop, so waiting for a next step would double the dimming.
    this.subscriptions.add(
      this.dialog.afterOpened.subscribe(() => {
        if (this.holders === 0) {
          clearTimeout(this.hideTimer);
          this.fadeOut();
        }
      })
    );
  }

  private updateRect(): void {
    const { top, left, width, height } = this.target.getBoundingClientRect();
    this.spotlight.rect.set({
      top: top - TARGET_PADDING,
      left: left - TARGET_PADDING,
      width: width + 2 * TARGET_PADDING,
      height: height + 2 * TARGET_PADDING
    });
  }

  private fadeOut(): void {
    this.spotlight.leaving.set(true);
    this.hideTimer = setTimeout(() => this.detach(), FADE_OUT_MS);
  }

  private detach(): void {
    this.subscriptions.unsubscribe();
    this.overlayRef.dispose();
    this.overlayRef = null;
    this.spotlight = null;
    this.target = null;
  }
}

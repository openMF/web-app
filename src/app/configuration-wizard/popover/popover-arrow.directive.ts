/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* Angular Imports */
import { Directive, Renderer2, ElementRef, HostBinding, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/* Popover Ref */
import { PopoverRef } from './popover-ref';

/**
 * Internal directive that shows the popover arrow.
 */
@Directive({ selector: '[mifosxPopoverArrow]' })
export class PopoverArrowDirective {
  private popoverRef = inject(PopoverRef);
  private cd = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  @HostBinding('style.width.px')
  @HostBinding('style.height.px')
  arrowSize: number;

  @HostBinding('style.top.px')
  offsetTop: number;

  @HostBinding('style.right.px')
  offsetRight: number;

  @HostBinding('style.bottom.px')
  offsetBottom: number;

  @HostBinding('style.left.px')
  offsetLeft: number;

  constructor() {
    this.arrowSize = this.popoverRef.config.arrowSize;

    this.popoverRef
      .positionChanges()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => {
        const { offsetX, offsetY } = p.connectionPair;

        this.offsetTop = offsetY >= 0 ? offsetY * -1 : null;
        this.offsetLeft = offsetX < 0 ? offsetX * -1 : null;
        this.offsetBottom = offsetY < 0 ? offsetY : null;
        this.offsetRight = offsetX >= 0 ? offsetX : null;

        this.cd.detectChanges();
      });
  }
}

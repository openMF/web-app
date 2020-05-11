import { Directive, Renderer2, ElementRef, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { PopoverRef } from './popover-ref';

/**
 * Internal directive that shows the popover arrow.
 */
@Directive({
  selector: '[mifosxPopoverArrow]'
})
export class PopoverArrowDirective implements OnDestroy {
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

  private subscription = new Subscription();

  constructor(private popoverRef: PopoverRef,
              private cd: ChangeDetectorRef) {
    this.arrowSize = popoverRef.config.arrowSize;

    this.subscription = popoverRef.positionChanges().subscribe(p => {
      const { offsetX, offsetY } = p.connectionPair;

      this.offsetTop = offsetY >= 0 ? offsetY * -1 : null;
      this.offsetLeft = offsetX < 0 ? offsetX * -1 : null;
      this.offsetBottom = offsetY < 0 ? offsetY : null;
      this.offsetRight = offsetX >= 0 ? offsetX : null;

      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

/** Angular Imports */
import { Directive, HostListener, Input, inject } from '@angular/core';

/** Popover Ref */
import { PopoverRef } from './popover-ref';

/**
 * Button that will close the current popover.
 */
@Directive({ selector: '[mifosxPopoverClose]' })
export class PopoverCloseDirective<T = any> {
  private popoverRef = inject<PopoverRef<T>>(PopoverRef, { optional: true });

  @Input('mifosxPopoverClose') popoverResult: T;

  @HostListener('click') onClick(): void {
    if (!this.popoverRef) {
      console.error('PopoverClose is not supported within a template');

      return;
    }

    this.popoverRef.close(this.popoverResult);
  }
}

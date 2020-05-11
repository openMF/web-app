import { Directive, HostListener, Input, Optional } from '@angular/core';

import { PopoverRef } from './popover-ref';

/**
 * Button that will close the current popover.
 */
@Directive({
  selector: '[mifosxPopoverClose]'
})
export class PopoverCloseDirective<T = any> {
  @Input('mifosxPopoverClose') popoverResult: T;

  constructor(
    @Optional() private popoverRef: PopoverRef<T>
  ) {}

  @HostListener('click') onClick(): void {
    if (!this.popoverRef) {
      console.error('PopoverClose is not supported within a template');

      return;
    }

    this.popoverRef.close(this.popoverResult);
  }
}

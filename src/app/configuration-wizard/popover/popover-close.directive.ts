/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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

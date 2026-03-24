/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({ selector: '[mifosxPositiveNumber]', standalone: true })
export class PositiveNumberDirective {
  private el = inject(ElementRef);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const inputElement = this.el.nativeElement;

    // Check if the key is ArrowUp or ArrowDown
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const currentValue = parseFloat(inputElement.value) || 0;

      if (event.key === 'ArrowDown' && currentValue <= 0) {
        // Prevent default if trying to decrement below or at 0
        event.preventDefault();
      }
    }
  }
}

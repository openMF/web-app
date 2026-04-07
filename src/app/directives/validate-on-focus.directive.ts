/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({ selector: '[mifosxValidateOnFocus]' })
export class ValidateOnFocusDirective {
  private control = inject(NgControl);
  private el = inject(ElementRef);

  @HostListener('focus')
  onFocus() {
    this.control.control?.markAsTouched();
    this.control.control?.updateValueAndValidity();
  }
}

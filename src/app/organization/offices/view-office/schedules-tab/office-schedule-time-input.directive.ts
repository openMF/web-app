/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Directive, ElementRef, forwardRef, inject, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatOfficeTimeForDisplay } from './office-schedule-time';

/** Keep exact LocalTime values in the form until the user edits the native minute input. */
@Directive({
  selector: 'input[type=time][mifosxOfficeScheduleTimeInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OfficeScheduleTimeInputDirective),
      multi: true
    }
  ],
  host: {
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()'
  }
})
export class OfficeScheduleTimeInputDirective implements ControlValueAccessor {
  private element = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private renderer = inject(Renderer2);
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.renderer.setProperty(this.element.nativeElement, 'value', formatOfficeTimeForDisplay(value));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.renderer.setProperty(this.element.nativeElement, 'disabled', disabled);
  }
}

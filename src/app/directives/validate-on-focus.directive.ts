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

import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({ selector: '[mifosxValidateOnFocus]' })
export class ValidateOnFocusDirective {
  constructor(
    private control: NgControl,
    private el: ElementRef
  ) {}

  @HostListener('focus')
  onFocus() {
    this.control.control?.markAsTouched();
    this.control.control?.updateValueAndValidity();
  }
}

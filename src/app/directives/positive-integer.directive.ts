/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({ selector: '[mifosxPositiveInteger]', standalone: true })
export class PositiveIntegerDirective {
  private el = inject(ElementRef);

  private readonly allowedKeys = new Set([
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End'
  ]);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const inputElement = this.el.nativeElement;

    // Allow control combinations (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z)
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    // Allow navigation/control keys
    if (this.allowedKeys.has(event.key)) {
      // Prevent ArrowDown from going below 0
      if (event.key === 'ArrowDown') {
        const currentValue = parseInt(inputElement.value, 10) || 0;
        if (currentValue <= 0) {
          event.preventDefault();
        }
      }
      return;
    }

    // Block decimal separators and sign characters
    if (
      event.key === '.' ||
      event.key === ',' ||
      event.key === '-' ||
      event.key === '+' ||
      event.key === 'e' ||
      event.key === 'E'
    ) {
      event.preventDefault();
      return;
    }

    // Allow only digit keys 0-9
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const inputElement = this.el.nativeElement as HTMLInputElement;
    const pastedText = event.clipboardData?.getData('text') ?? '';
    const integerOnly = pastedText.replace(/[^0-9]/g, '');
    if (!integerOnly) return;

    const start = inputElement.selectionStart ?? inputElement.value.length;
    const end = inputElement.selectionEnd ?? inputElement.value.length;
    const nextValue = inputElement.value.slice(0, start) + integerOnly + inputElement.value.slice(end);

    inputElement.value = nextValue;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

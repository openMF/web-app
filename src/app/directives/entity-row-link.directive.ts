/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Directive, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

/**
 * EntityRowLinkDirective
 *
 * Makes an entity list row keyboard-activatable and exposes it to assistive
 * technology as a link. It is applied to the same host element as [routerLink]
 * (a focusable non-anchor element such as a `<div class="list-row">`).
 *
 * Behavior:
 * - Exposes `role="link"` and `tabindex="0"` so the row is focusable in the
 *   normal tab order and announced as a link.
 * - Pressing Enter navigates to the row's existing RouterLink destination.
 * - Pressing Space navigates to the same destination and calls preventDefault()
 *   so the page does not scroll.
 * - Keyboard events originating from nested interactive controls (buttons,
 *   links, inputs inside the row) are ignored so they keep their own behavior.
 * - Mouse-click navigation is left to RouterLink; this directive only handles
 *   the keyboard, so there is no competing or duplicate navigation.
 *
 * The destination is resolved through the host element's RouterLink (`urlTree`)
 * and dispatched through `router.navigateByUrl`, which is exactly what
 * RouterLink does on click — preserving route/query params and navigation
 * options without introducing a second navigation mechanism.
 */
@Directive({
  selector: '[mifosxEntityRowLink]',
  standalone: true,
  host: {
    role: 'link',
    tabindex: '0',
    '(keydown)': 'onKeydown($event)',
    '(keyup)': 'onKeyup($event)'
  }
})
export class EntityRowLinkDirective {
  private readonly routerLink = inject(RouterLink, { optional: true });
  private readonly router = inject(Router);

  /** Activation key currently held down, guarding against key-repeat navigation. */
  private activatingKey: 'Enter' | ' ' | null = null;

  /** Handles keyboard activation of the entity row. */
  onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || !this.routerLink) {
      return;
    }

    // Do not hijack keyboard events that originate from nested interactive
    // controls inside the row; they keep their own keyboard behavior.
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter') {
      this.activate('Enter');
    } else if (event.key === ' ') {
      // Space would scroll the page by default; prevent that when activating.
      event.preventDefault();
      this.activate(' ');
    }
  }

  /** Clears the guard only when the key that activated the row is released. */
  onKeyup(event: KeyboardEvent): void {
    if (event.key === this.activatingKey) {
      this.activatingKey = null;
    }
  }

  /** Navigates to the row's existing RouterLink destination exactly once. */
  private activate(key: 'Enter' | ' '): void {
    if (this.activatingKey !== null) {
      return;
    }

    const urlTree = this.routerLink.urlTree;
    if (!urlTree) {
      return;
    }

    this.activatingKey = key;
    this.router
      .navigateByUrl(urlTree, {
        skipLocationChange: this.routerLink.skipLocationChange,
        replaceUrl: this.routerLink.replaceUrl,
        state: this.routerLink.state,
        info: this.routerLink.info
      })
      .catch((error: unknown) => {
        console.error('Entity row navigation failed:', error);
      });
  }
}

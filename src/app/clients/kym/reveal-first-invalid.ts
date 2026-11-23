/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** What can take focus inside a form control's element. */
const FOCUSABLE = 'input, textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * Scrolls the first invalid control in a KYM dialog into view and focuses it, so Save pressed with something
 * missing (such as the "here in person" box at the bottom of a long form) shows what is missing.
 *
 * The first invalid control is the first `.ng-invalid` element with no invalid element inside it, which skips the
 * form itself and any group or list wrapped around the field.
 */
export function revealFirstInvalid(root: HTMLElement): void {
  const invalid = Array.from(root.querySelectorAll<HTMLElement>('.ng-invalid:not(form)'));
  const first = invalid.find((element) => !element.querySelector('.ng-invalid'));
  if (!first) {
    return;
  }
  first.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  const focusable = first.matches(FOCUSABLE) ? first : first.querySelector<HTMLElement>(FOCUSABLE);
  focusable?.focus({ preventScroll: true });
}

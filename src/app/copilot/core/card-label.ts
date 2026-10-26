/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Prefix for the shared card-row vocabulary in the translation files. */
const LABEL_PREFIX = 'copilot.cardLabels.';

/**
 * "Loan account" becomes "loanAccount", matching the translation keys.
 * Anything that is not a letter or digit is treated as a word break.
 */
function slug(label: string): string {
  const words = label
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word.length > 0);
  if (words.length === 0) {
    return '';
  }
  return words
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

/**
 * Translate a card row label into the officer's language.
 *
 * Rows arrive from the gateway already labelled, and those labels come from the tool
 * manifest, which is written in English. Rather than teach the gateway thirteen languages,
 * the shared vocabulary lives here: "Loan account", "Approved amount" and the rest resolve
 * through `copilot.cardLabels.*`.
 *
 * A label with no entry is shown exactly as the gateway sent it. That matters, because a
 * deployment can add its own tools to the manifest, and an English row reads better than a
 * missing-translation placeholder.
 */
export function translateCardLabel(label: string, translate: (key: string) => string): string {
  const key = slug(label);
  if (!key) {
    return label;
  }
  const translated = translate(LABEL_PREFIX + key);
  return translated && translated !== LABEL_PREFIX + key ? translated : label;
}

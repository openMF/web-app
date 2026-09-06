/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Prefix for the step vocabulary in the translation files. */
const STEP_PREFIX = 'copilot.trail.steps.';

/**
 * "mifos_loan_details" and "Reading the loan account" both become "loanDetails".
 *
 * <p>The gateway may name a step either way round: `toolName` is the manifest's machine name,
 * `toolLabel` its English prose. Both reduce to the same key so a deployment that sends only
 * one of them still resolves, and the vendor prefix is dropped because "mifos" is not part of
 * what the step is.
 */
function slug(value: string): string {
  const words = value
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word.length > 0)
    .filter((word, index) => !(index === 0 && word.toLowerCase() === 'mifos'));
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
 * Name a step in the officer's language.
 *
 * <p>Steps arrive named by the gateway's tool manifest, which is written in English. Rather
 * than teach the gateway thirteen languages, the vocabulary lives here and resolves through
 * `copilot.trail.steps.*` — the same arrangement the card rows use.
 *
 * <p>Resolution order matters. The machine name is tried first because it is stable: a
 * deployment can reword a label between releases, but `mifos_loan_details` is what the
 * manifest calls the tool. The English label is the fallback, and if neither resolves the
 * label is shown exactly as the gateway sent it — a deployment can add its own tools, and an
 * English row reads better than a missing-translation placeholder.
 */
export function translateStepLabel(
  toolName: string | undefined,
  toolLabel: string | undefined,
  translate: (key: string) => string
): string {
  for (const candidate of [
    toolName,
    toolLabel
  ]) {
    const key = candidate ? STEP_PREFIX + slug(candidate) : '';
    if (!key || key === STEP_PREFIX) {
      continue;
    }
    const translated = translate(key);
    if (translated && translated !== key) {
      return translated;
    }
  }
  return (toolLabel ?? toolName ?? '').trim();
}
